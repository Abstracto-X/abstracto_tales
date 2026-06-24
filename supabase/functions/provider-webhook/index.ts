import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json, requireEnv } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST required.' }, { status: 405 });

  try {
    const expectedSecret = requireEnv('PROVIDER_WEBHOOK_SECRET');
    const suppliedSecret = req.headers.get('x-provider-signature') || req.headers.get('x-webhook-secret') || '';
    if (suppliedSecret !== expectedSecret) throw new Error('Invalid webhook secret.');

    const payload = await req.json();
    const provider = String(payload.provider || '').toLowerCase();
    const providerUserId = payload.provider_user_id ? String(payload.provider_user_id) : null;
    const providerTierId = payload.provider_tier_id ? String(payload.provider_tier_id) : null;
    const status = payload.status === 'revoked' || payload.status === 'expired' ? payload.status : 'active';
    let userId = payload.user_id ? String(payload.user_id) : null;
    if (!provider) throw new Error('provider is required.');
    if (!providerTierId && status === 'active') throw new Error('provider_tier_id is required for active grants.');

    const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));

    if (!userId && providerUserId) {
      const { data: existingConnection, error: lookupError } = await admin
        .from('provider_connections')
        .select('user_id')
        .eq('provider', provider)
        .eq('provider_user_id', providerUserId)
        .maybeSingle();
      if (lookupError) throw lookupError;
      userId = existingConnection?.user_id || null;
    }
    if (!userId) throw new Error('Webhook could not resolve a Supabase user_id. Link the provider first or include user_id.');

    let connectionId = null;
    if (providerUserId) {
      const { data: connection, error: connectionError } = await admin
        .from('provider_connections')
        .upsert({
          user_id: userId,
          provider,
          provider_user_id: providerUserId,
          provider_account_label: payload.provider_account_label || providerUserId,
          status: status === 'active' ? 'active' : status,
          metadata: payload.provider_metadata || {},
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' })
        .select()
        .single();
      if (connectionError) throw connectionError;
      connectionId = connection.id;
    }

    if (status !== 'active') {
      const query = admin
        .from('user_entitlements')
        .update({ status, valid_until: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('status', 'active');
      const { error: revokeError } = await query;
      if (revokeError) throw revokeError;
      await admin.from('entitlement_audit_log').insert({ user_id: userId, action: 'provider_webhook_revoke', source: provider, provider, details: payload });
      return json({ ok: true, provider, status });
    }

    const { data: mapping, error: mappingError } = await admin
      .from('provider_tier_mappings')
      .select('*')
      .eq('provider', provider)
      .eq('provider_tier_id', providerTierId)
      .eq('is_active', true)
      .maybeSingle();
    if (mappingError) throw mappingError;
    if (!mapping) throw new Error(`No active provider mapping for ${provider}:${providerTierId}.`);

    const validUntil = payload.valid_until ? new Date(payload.valid_until).toISOString() : null;
    const { data: entitlement, error: entitlementError } = await admin
      .from('user_entitlements')
      .insert({
        user_id: userId,
        tier_id: mapping.tier_id,
        source: provider,
        provider,
        provider_connection_id: connectionId,
        status: 'active',
        valid_until: validUntil,
        metadata: { provider_tier_id: providerTierId, raw: payload.metadata || {} },
      })
      .select()
      .single();
    if (entitlementError) throw entitlementError;

    await admin.from('entitlement_audit_log').insert({
      user_id: userId,
      action: 'provider_webhook_grant',
      source: provider,
      provider,
      entitlement_id: entitlement.id,
      details: payload,
    });

    return json({ ok: true, provider, entitlement_id: entitlement.id });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Webhook processing failed.' }, { status: 400 });
  }
});
