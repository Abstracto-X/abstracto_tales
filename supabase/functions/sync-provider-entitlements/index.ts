import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST required.' }, { status: 405 });

  const body = await req.json().catch(() => ({}));
  const provider = typeof body.provider === 'string' ? body.provider : 'patreon';

  // Full sync should fetch provider membership state server-side, resolve
  // provider_tier_mappings, and upsert user_entitlements. The SPA can call this
  // endpoint without knowing provider-specific rules.
  return json({ ok: true, provider, status: 'not_configured' }, { status: 202 });
});
