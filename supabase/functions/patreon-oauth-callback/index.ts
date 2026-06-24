import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json, requireEnv, verifyState } from '../_shared/cors.ts';

type PatreonIncluded = {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state) throw new Error('Missing Patreon callback parameters.');

    const decoded = await verifyState(state, requireEnv('PATREON_STATE_SECRET')) as { userId: string; returnTo?: string };
    if (!decoded.userId) throw new Error('OAuth state did not include a reader id.');

    const tokenBody = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: requireEnv('PATREON_CLIENT_ID'),
      client_secret: requireEnv('PATREON_CLIENT_SECRET'),
      redirect_uri: requireEnv('PATREON_REDIRECT_URI'),
    });

    const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });
    if (!tokenRes.ok) throw new Error(`Patreon token exchange failed: ${await tokenRes.text()}`);
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('Patreon did not return an access token.');

    const identityUrl = new URL('https://www.patreon.com/api/oauth2/v2/identity');
    identityUrl.searchParams.set('include', 'memberships.currently_entitled_tiers');
    identityUrl.searchParams.set('fields[user]', 'full_name,email');
    identityUrl.searchParams.set('fields[member]', 'patron_status,currently_entitled_amount_cents');
    identityUrl.searchParams.set('fields[tier]', 'title,amount_cents');

    const identityRes = await fetch(identityUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!identityRes.ok) throw new Error(`Patreon identity lookup failed: ${await identityRes.text()}`);
    const identity = await identityRes.json();

    const patreonUserId = identity?.data?.id;
    if (!patreonUserId) throw new Error('Patreon identity response did not include a user id.');
    const attrs = identity?.data?.attributes || {};
    const included: PatreonIncluded[] = Array.isArray(identity?.included) ? identity.included : [];
    const tierIds = included.filter(item => item.type === 'tier').map(item => item.id);

    const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: connection, error: connectionError } = await admin
      .from('provider_connections')
      .upsert({
        user_id: decoded.userId,
        provider: 'patreon',
        provider_user_id: patreonUserId,
        provider_account_label: attrs.email || attrs.full_name || `Patreon ${patreonUserId}`,
        status: 'active',
        metadata: { patreon_user: attrs, tier_ids: tierIds },
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })
      .select()
      .single();
    if (connectionError) throw connectionError;

    await admin
      .from('user_entitlements')
      .update({ status: 'expired', valid_until: new Date().toISOString() })
      .eq('user_id', decoded.userId)
      .eq('provider', 'patreon')
      .eq('status', 'active');

    let grants = 0;
    if (tierIds.length) {
      const { data: mappings, error: mappingError } = await admin
        .from('provider_tier_mappings')
        .select('*')
        .eq('provider', 'patreon')
        .eq('is_active', true)
        .in('provider_tier_id', tierIds);
      if (mappingError) throw mappingError;

      for (const mapping of mappings || []) {
        const { data: entitlement, error: entitlementError } = await admin
          .from('user_entitlements')
          .insert({
            user_id: decoded.userId,
            tier_id: mapping.tier_id,
            source: 'patreon',
            provider: 'patreon',
            provider_connection_id: connection.id,
            status: 'active',
            metadata: { patreon_tier_id: mapping.provider_tier_id, patreon_tier_label: mapping.provider_tier_label },
          })
          .select()
          .single();
        if (entitlementError) throw entitlementError;
        grants++;
        await admin.from('entitlement_audit_log').insert({
          user_id: decoded.userId,
          action: 'patreon_oauth_grant',
          source: 'patreon',
          provider: 'patreon',
          entitlement_id: entitlement.id,
          details: { provider_tier_id: mapping.provider_tier_id, connection_id: connection.id },
        });
      }
    }

    const returnTo = decoded.returnTo || '/subscription.html#/access/success';
    const redirect = new URL(returnTo);
    redirect.hash = grants > 0 ? '#/access/success' : '#/access/pending';
    redirect.searchParams.set('patreon', grants > 0 ? 'linked' : 'no_matching_tier');
    return Response.redirect(redirect.toString(), 302);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unable to process Patreon callback.' }, { status: 500 });
  }
});
