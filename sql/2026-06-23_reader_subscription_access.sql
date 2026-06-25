-- Subscription Reader SPA access model
-- Apply in Supabase SQL editor before enabling production member-locked chapters.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.reader_access_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tier_rank INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.provider_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_account_label TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS public.provider_tier_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_tier_id TEXT NOT NULL,
    provider_tier_label TEXT,
    tier_id UUID NOT NULL REFERENCES public.reader_access_tiers(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_tier_id)
);

CREATE TABLE IF NOT EXISTS public.user_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.reader_access_tiers(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'manual',
    provider TEXT,
    provider_connection_id UUID REFERENCES public.provider_connections(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT,
    tier_id UUID NOT NULL REFERENCES public.reader_access_tiers(id) ON DELETE CASCADE,
    label TEXT,
    campaign TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    max_uses INTEGER NOT NULL DEFAULT 1,
    uses_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    entitlement_duration_days INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (max_uses > 0),
    CHECK (uses_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.access_key_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES public.access_keys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entitlement_id UUID REFERENCES public.user_entitlements(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    UNIQUE(key_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.entitlement_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    source TEXT NOT NULL,
    provider TEXT,
    entitlement_id UUID REFERENCES public.user_entitlements(id) ON DELETE SET NULL,
    access_key_id UUID REFERENCES public.access_keys(id) ON DELETE SET NULL,
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chapters
    ADD COLUMN IF NOT EXISTS required_tier_id UUID REFERENCES public.reader_access_tiers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS public_release_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS preview_text TEXT;

CREATE INDEX IF NOT EXISTS idx_reader_access_tiers_rank ON public.reader_access_tiers(tier_rank);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_status ON public.user_entitlements(user_id, status, valid_until);
CREATE INDEX IF NOT EXISTS idx_access_keys_hash ON public.access_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_access_key_redemptions_user ON public.access_key_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_required_tier ON public.chapters(required_tier_id);

ALTER TABLE public.reader_access_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_tier_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_key_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_audit_log ENABLE ROW LEVEL SECURITY;

-- Tighten table privileges for subscription tables. RLS decides row access, but
-- explicit grants avoid inheriting overly-broad Supabase project defaults.
REVOKE ALL ON TABLE public.reader_access_tiers FROM anon, authenticated;
REVOKE ALL ON TABLE public.provider_connections FROM anon, authenticated;
REVOKE ALL ON TABLE public.provider_tier_mappings FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_entitlements FROM anon, authenticated;
REVOKE ALL ON TABLE public.access_keys FROM anon, authenticated;
REVOKE ALL ON TABLE public.access_key_redemptions FROM anon, authenticated;
REVOKE ALL ON TABLE public.entitlement_audit_log FROM anon, authenticated;

-- Reader-facing tier labels are safe to expose when RLS says the tier is active.
GRANT SELECT ON TABLE public.reader_access_tiers TO anon, authenticated;

-- Authenticated readers can read their own rows through RLS; admins can manage
-- rows through the admin policies below.
GRANT SELECT ON TABLE public.provider_connections TO authenticated;
GRANT SELECT ON TABLE public.user_entitlements TO authenticated;
GRANT SELECT ON TABLE public.access_key_redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reader_access_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.provider_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.provider_tier_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_entitlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.access_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.access_key_redemptions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.entitlement_audit_log TO authenticated;

CREATE OR REPLACE FUNCTION public.has_active_entitlement(target_user_id UUID, target_tier_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT target_tier_id IS NULL OR EXISTS (
        SELECT 1
        FROM public.user_entitlements ue
        JOIN public.reader_access_tiers held ON held.id = ue.tier_id
        JOIN public.reader_access_tiers required ON required.id = target_tier_id
        WHERE ue.user_id = target_user_id
          AND ue.status = 'active'
          AND (ue.valid_from IS NULL OR ue.valid_from <= NOW())
          AND (ue.valid_until IS NULL OR ue.valid_until > NOW())
          AND held.is_active = TRUE
          AND held.tier_rank >= required.tier_rank
    );
$$;

CREATE OR REPLACE FUNCTION public.chapter_is_public(chapter_row public.chapters)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT chapter_row.is_published = TRUE
       AND (
            chapter_row.required_tier_id IS NULL
            OR (chapter_row.public_release_at IS NOT NULL AND chapter_row.public_release_at <= NOW())
       );
$$;

CREATE OR REPLACE FUNCTION public.get_chapter_catalog(target_story_id UUID)
RETURNS TABLE (
    id UUID,
    story_id UUID,
    title TEXT,
    chapter_order INTEGER,
    word_count INTEGER,
    preview_text TEXT,
    required_tier_id UUID,
    required_tier_name TEXT,
    required_tier_slug TEXT,
    required_tier_rank INTEGER,
    public_release_at TIMESTAMPTZ,
    access_state TEXT,
    can_read BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT
        c.id,
        c.story_id,
        c.title,
        c.chapter_order,
        c.word_count,
        c.preview_text,
        c.required_tier_id,
        t.name AS required_tier_name,
        t.slug AS required_tier_slug,
        t.tier_rank AS required_tier_rank,
        c.public_release_at,
        CASE
            WHEN public.chapter_is_public(c) THEN 'free'
            WHEN auth.uid() IS NULL THEN 'locked_tier'
            WHEN public.has_active_entitlement(auth.uid(), c.required_tier_id) THEN 'unlocked'
            WHEN c.public_release_at IS NOT NULL AND c.public_release_at > NOW() THEN 'early_access'
            ELSE 'locked_tier'
        END AS access_state,
        (public.chapter_is_public(c) OR public.is_admin() OR public.has_active_entitlement(auth.uid(), c.required_tier_id)) AS can_read,
        c.created_at,
        c.updated_at
    FROM public.chapters c
    LEFT JOIN public.reader_access_tiers t ON t.id = c.required_tier_id
    JOIN public.stories s ON s.id = c.story_id
    WHERE c.story_id = target_story_id
      AND c.is_published = TRUE
      AND s.is_published = TRUE
    ORDER BY c.chapter_order;
$$;

CREATE OR REPLACE FUNCTION public.get_reader_chapter(target_chapter_id UUID)
RETURNS TABLE (
    id UUID,
    story_id UUID,
    title TEXT,
    content TEXT,
    chapter_order INTEGER,
    word_count INTEGER,
    preview_text TEXT,
    required_tier_id UUID,
    required_tier_name TEXT,
    access_state TEXT,
    can_read BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.story_id,
        c.title,
        CASE WHEN (public.chapter_is_public(c) OR public.is_admin() OR public.has_active_entitlement(auth.uid(), c.required_tier_id)) THEN c.content ELSE NULL END AS content,
        c.chapter_order,
        c.word_count,
        c.preview_text,
        c.required_tier_id,
        t.name AS required_tier_name,
        CASE
            WHEN public.chapter_is_public(c) THEN 'free'
            WHEN auth.uid() IS NULL THEN 'locked_tier'
            WHEN public.has_active_entitlement(auth.uid(), c.required_tier_id) THEN 'unlocked'
            WHEN c.public_release_at IS NOT NULL AND c.public_release_at > NOW() THEN 'early_access'
            ELSE 'locked_tier'
        END AS access_state,
        (public.chapter_is_public(c) OR public.is_admin() OR public.has_active_entitlement(auth.uid(), c.required_tier_id)) AS can_read,
        c.created_at,
        c.updated_at
    FROM public.chapters c
    LEFT JOIN public.reader_access_tiers t ON t.id = c.required_tier_id
    JOIN public.stories s ON s.id = c.story_id
    WHERE c.id = target_chapter_id
      AND c.is_published = TRUE
      AND s.is_published = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_entitlements()
RETURNS TABLE (
    id UUID,
    tier_id UUID,
    tier_name TEXT,
    tier_slug TEXT,
    tier_rank INTEGER,
    source TEXT,
    provider TEXT,
    status TEXT,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT
        ue.id,
        ue.tier_id,
        t.name,
        t.slug,
        t.tier_rank,
        ue.source,
        ue.provider,
        ue.status,
        ue.valid_from,
        ue.valid_until,
        (ue.status = 'active' AND ue.valid_from <= NOW() AND (ue.valid_until IS NULL OR ue.valid_until > NOW())) AS is_active,
        ue.created_at
    FROM public.user_entitlements ue
    JOIN public.reader_access_tiers t ON t.id = ue.tier_id
    WHERE ue.user_id = auth.uid()
    ORDER BY is_active DESC, t.tier_rank DESC, ue.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.redeem_access_key(submitted_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    normalized TEXT;
    hashed TEXT;
    key_row public.access_keys%ROWTYPE;
    new_entitlement_id UUID;
    expiry TIMESTAMPTZ;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Sign in before redeeming an access key.';
    END IF;

    normalized := upper(regexp_replace(trim(submitted_code), '\s+', '', 'g'));
    hashed := encode(digest(normalized, 'sha256'), 'hex');

    SELECT * INTO key_row
    FROM public.access_keys
    WHERE key_hash = hashed
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Access key not found.';
    END IF;
    IF key_row.status <> 'active' THEN
        RAISE EXCEPTION 'Access key is not active.';
    END IF;
    IF key_row.valid_from IS NOT NULL AND key_row.valid_from > NOW() THEN
        RAISE EXCEPTION 'Access key is not active yet.';
    END IF;
    IF key_row.valid_until IS NOT NULL AND key_row.valid_until <= NOW() THEN
        RAISE EXCEPTION 'Access key has expired.';
    END IF;
    IF key_row.uses_count >= key_row.max_uses THEN
        RAISE EXCEPTION 'Access key has reached its redemption limit.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.access_key_redemptions WHERE key_id = key_row.id AND user_id = auth.uid()) THEN
        RAISE EXCEPTION 'This access key has already been redeemed by your account.';
    END IF;

    expiry := CASE
        WHEN key_row.entitlement_duration_days IS NULL THEN NULL
        ELSE NOW() + make_interval(days => key_row.entitlement_duration_days)
    END;

    INSERT INTO public.user_entitlements(user_id, tier_id, source, status, valid_from, valid_until, metadata)
    VALUES (auth.uid(), key_row.tier_id, 'access_key', 'active', NOW(), expiry, jsonb_build_object('access_key_id', key_row.id, 'campaign', key_row.campaign))
    RETURNING id INTO new_entitlement_id;

    INSERT INTO public.access_key_redemptions(key_id, user_id, entitlement_id)
    VALUES (key_row.id, auth.uid(), new_entitlement_id);

    UPDATE public.access_keys
    SET uses_count = uses_count + 1,
        updated_at = NOW()
    WHERE id = key_row.id;

    INSERT INTO public.entitlement_audit_log(user_id, action, source, entitlement_id, access_key_id, details)
    VALUES (auth.uid(), 'redeem_access_key', 'access_key', new_entitlement_id, key_row.id, jsonb_build_object('key_prefix', key_row.key_prefix));

    RETURN jsonb_build_object('ok', TRUE, 'entitlement_id', new_entitlement_id, 'valid_until', expiry);
END;
$$;

-- RLS policies for new tables
DROP POLICY IF EXISTS reader_access_tiers_public_read ON public.reader_access_tiers;
CREATE POLICY reader_access_tiers_public_read ON public.reader_access_tiers FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS reader_access_tiers_admin_all ON public.reader_access_tiers;
CREATE POLICY reader_access_tiers_admin_all ON public.reader_access_tiers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS provider_connections_own_read ON public.provider_connections;
CREATE POLICY provider_connections_own_read ON public.provider_connections FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS provider_connections_admin_all ON public.provider_connections;
CREATE POLICY provider_connections_admin_all ON public.provider_connections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS provider_tier_mappings_admin_all ON public.provider_tier_mappings;
CREATE POLICY provider_tier_mappings_admin_all ON public.provider_tier_mappings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS user_entitlements_own_read ON public.user_entitlements;
CREATE POLICY user_entitlements_own_read ON public.user_entitlements FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS user_entitlements_admin_all ON public.user_entitlements;
CREATE POLICY user_entitlements_admin_all ON public.user_entitlements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS access_keys_admin_all ON public.access_keys;
CREATE POLICY access_keys_admin_all ON public.access_keys FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS access_key_redemptions_own_read ON public.access_key_redemptions;
CREATE POLICY access_key_redemptions_own_read ON public.access_key_redemptions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS access_key_redemptions_admin_all ON public.access_key_redemptions;
CREATE POLICY access_key_redemptions_admin_all ON public.access_key_redemptions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS entitlement_audit_admin_read ON public.entitlement_audit_log;
CREATE POLICY entitlement_audit_admin_read ON public.entitlement_audit_log FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS entitlement_audit_admin_insert ON public.entitlement_audit_log;
CREATE POLICY entitlement_audit_admin_insert ON public.entitlement_audit_log FOR INSERT WITH CHECK (public.is_admin());

-- Replace chapter SELECT policies so locked chapter content is not publicly readable by raw table queries.
-- Only drop known policies. Do not blanket-drop every chapter policy because other
-- deployment-specific policies may exist.
DROP POLICY IF EXISTS "Public read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admin write chapters" ON public.chapters;
DROP POLICY IF EXISTS chapters_public_free_select ON public.chapters;
DROP POLICY IF EXISTS chapters_entitled_select ON public.chapters;
DROP POLICY IF EXISTS chapters_admin_all ON public.chapters;

CREATE POLICY chapters_public_free_select
ON public.chapters
FOR SELECT
USING (
    is_published = TRUE
    AND (
        required_tier_id IS NULL
        OR (public_release_at IS NOT NULL AND public_release_at <= NOW())
    )
    AND EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = chapters.story_id
          AND s.is_published = TRUE
    )
);

CREATE POLICY chapters_entitled_select
ON public.chapters
FOR SELECT
USING (
    is_published = TRUE
    AND required_tier_id IS NOT NULL
    AND auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM public.user_entitlements ue
        JOIN public.reader_access_tiers held ON held.id = ue.tier_id
        JOIN public.reader_access_tiers required ON required.id = chapters.required_tier_id
        WHERE ue.user_id = auth.uid()
          AND ue.status = 'active'
          AND (ue.valid_from IS NULL OR ue.valid_from <= NOW())
          AND (ue.valid_until IS NULL OR ue.valid_until > NOW())
          AND held.is_active = TRUE
          AND held.tier_rank >= required.tier_rank
    )
    AND EXISTS (
        SELECT 1
        FROM public.stories s
        WHERE s.id = chapters.story_id
          AND s.is_published = TRUE
    )
);

CREATE POLICY chapters_admin_all
ON public.chapters
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- SECURITY DEFINER functions must have explicit EXECUTE grants.
REVOKE ALL ON FUNCTION public.has_active_entitlement(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chapter_is_public(public.chapters) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_chapter_catalog(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_reader_chapter(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_entitlements() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_access_key(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_chapter_catalog(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_reader_chapter(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_entitlements() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_access_key(TEXT) TO authenticated;

-- Access keys must be generated as long high-entropy random codes. Store only
-- SHA-256 hashes in access_keys.key_hash and show plaintext only at creation.

-- Ask Supabase/PostgREST to refresh function/table metadata immediately.
NOTIFY pgrst, 'reload schema';

