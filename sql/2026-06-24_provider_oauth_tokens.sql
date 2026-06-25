-- Stores provider OAuth tokens for trusted Edge Functions only.
-- Do not expose this table to browser clients; Patreon access/refresh tokens are secrets.

CREATE TABLE IF NOT EXISTS public.provider_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE SET NULL,
    provider_user_id TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    scopes TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_provider_oauth_tokens_user_provider
    ON public.provider_oauth_tokens(user_id, provider);

ALTER TABLE public.provider_oauth_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.provider_oauth_tokens FROM PUBLIC;
REVOKE ALL ON TABLE public.provider_oauth_tokens FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.provider_oauth_tokens TO service_role;

COMMENT ON TABLE public.provider_oauth_tokens IS 'Trusted Edge Function token storage for provider OAuth refresh/sync. Browser roles receive no grants.';
COMMENT ON COLUMN public.provider_oauth_tokens.access_token IS 'Secret provider access token. Service-role Edge Functions only.';
COMMENT ON COLUMN public.provider_oauth_tokens.refresh_token IS 'Secret provider refresh token. Service-role Edge Functions only.';

NOTIFY pgrst, 'reload schema';