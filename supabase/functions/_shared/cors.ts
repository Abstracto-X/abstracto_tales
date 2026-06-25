export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-provider-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...(init.headers || {}),
  },
});

export const requireEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const optionalEnv = (name: string, fallback = '') => Deno.env.get(name) || fallback;

const toBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
};

export const signState = async (payload: Record<string, unknown>, secret: string) => {
  const encoder = new TextEncoder();
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
  return `${body}.${toBase64Url(signature)}`;
};

export const verifyState = async (state: string, secret: string) => {
  const [body, signature] = state.split('.');
  if (!body || !signature) throw new Error('Invalid OAuth state.');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body))));
  if (expected !== signature) throw new Error('OAuth state signature mismatch.');
  const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
  if (typeof decoded?.issuedAt === 'number' && Date.now() - decoded.issuedAt > 15 * 60 * 1000) {
    throw new Error('OAuth state expired. Please start Patreon connect again.');
  }
  return decoded;
};