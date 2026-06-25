import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json, requireEnv } from '../_shared/cors.ts';
import { refreshPatreonToken, syncPatreonEntitlements } from '../_shared/patreon.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST required.' }, { status: 405 });

  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) throw new Error('Sign in before syncing provider access.');

    const body = await req.json().catch(() => ({}));
    const provider = typeof body.provider === 'string' ? body.provider.toLowerCase() : 'patreon';
    if (provider !== 'patreon') return json({ error: `Provider sync is not implemented for ${provider}.` }, { status: 400 });

    const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unable to verify the signed-in reader.');

    const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: tokenRow, error: tokenError } = await admin
      .from('provider_oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'patreon')
      .maybeSingle();
    if (tokenError) throw tokenError;
    if (!tokenRow?.refresh_token && !tokenRow?.access_token) {
      return json({ error: 'No Patreon token found. Connect Patreon first.', provider, status: 'connect_required' }, { status: 409 });
    }

    let token = {
      access_token: tokenRow.access_token,
      refresh_token: tokenRow.refresh_token,
      token_type: tokenRow.token_type || 'Bearer',
      scope: Array.isArray(tokenRow.scopes) ? tokenRow.scopes.join(' ') : '',
    };
    const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at).getTime() : 0;
    if (token.refresh_token && (!expiresAt || expiresAt < Date.now() + 5 * 60 * 1000)) {
      token = { ...token, ...(await refreshPatreonToken(token.refresh_token)) };
    }

    const result = await syncPatreonEntitlements(admin, user.id, token, 'patreon_manual_sync');
    return json({
      ok: true,
      provider,
      status: result.grants > 0 ? 'active' : 'no_matching_tier',
      grants: result.grants,
      tier_ids: result.identity.tierIds,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Provider sync failed.' }, { status: 500 });
  }
});