-- Hotfix: make redeem_access_key find pgcrypto.digest on Supabase.
-- Run this in Supabase SQL Editor if redeeming a key fails with:
--   function digest(text, unknown) does not exist

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

REVOKE ALL ON FUNCTION public.redeem_access_key(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_access_key(TEXT) TO authenticated;
NOTIFY pgrst, 'reload schema';
