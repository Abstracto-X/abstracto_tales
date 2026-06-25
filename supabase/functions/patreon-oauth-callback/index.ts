import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json, requireEnv, verifyState } from '../_shared/cors.ts';
import { exchangePatreonCode, syncPatreonEntitlements } from '../_shared/patreon.ts';

const redirectWithStatus = (returnTo: string, status: string, grants = 0) => {
  const redirect = new URL(returnTo);
  redirect.hash = '#/vault';
  redirect.searchParams.set('patreon', status);
  redirect.searchParams.set('grants', String(grants));
  return Response.redirect(redirect.toString(), 302);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const state = url.searchParams.get('state');
    if (error) throw new Error(errorDescription || `Patreon OAuth failed: ${error}`);

    const code = url.searchParams.get('code');
    if (!code || !state) throw new Error('Missing Patreon callback parameters.');

    const decoded = await verifyState(state, requireEnv('PATREON_STATE_SECRET')) as { userId: string; returnTo?: string };
    if (!decoded.userId) throw new Error('OAuth state did not include a reader id.');

    const token = await exchangePatreonCode(code);
    const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));
    const result = await syncPatreonEntitlements(admin, decoded.userId, token, 'patreon_oauth_grant');

    const returnTo = decoded.returnTo || `${url.origin}/subscription.html#/vault`;
    return redirectWithStatus(returnTo, result.grants > 0 ? 'linked' : 'no_matching_tier', result.grants);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unable to process Patreon callback.' }, { status: 500 });
  }
});