# Subscription Reader SPA - Access, Entitlements, Backend, and Admin Workflow

## 1. Core security principle

Locked content must never be fetched and blurred client-side. The client may receive catalog metadata, lock states, tier names, release dates, and safe previews. Full chapter content must only be returned by a secure backend/RPC path after checking publication, public release, admin status, or active entitlement.

## 2. Normalized entitlement model

Every access source writes to the same conceptual model:

```txt
user_id
internal_tier_id
source/provider
provider_connection_id optional
status
valid_from
valid_until optional
scope optional
metadata/audit reference
```

The reader app should not need to know whether a chapter was unlocked by Patreon, access key, manual grant, Discord role, Ko-fi, PayPal, or automation. It should only ask: `does this user have active entitlement for this tier/scope now?`

## 3. Chapter access states

| State | Meaning | Content returned? | Primary UX |
| --- | --- | --- | --- |
| `free` | Public chapter | yes | Read now |
| `unlocked` | User entitlement authorizes access | yes | Read now |
| `free_preview` | Safe preview exists but full chapter locked | preview only | Read preview / unlock |
| `locked_tier` | Requires internal tier | no | Requires tier / unlock |
| `early_access` | Supporter-only until public date | no unless entitled | Public date + unlock |
| `key_locked` | Intended for key campaign | no unless key grant exists | Redeem key |
| `pending_sync` | Provider linked but entitlement not confirmed | no | Sync access |
| `expired` | Prior entitlement no longer valid | no | Renew/redeem |

## 4. Tables

### `reader_access_tiers`

Purpose: internal provider-neutral tier definitions.

Important fields:

- `id`
- `slug`
- `name`
- `description`
- `tier_rank`
- `is_active`
- timestamps

Rules:

- Frontend displays tiers but does not hardcode provider tier IDs.
- Higher-rank-includes-lower-rank behavior must be explicitly decided and implemented in RPC logic.

### `user_entitlements`

Purpose: grants access to a user.

Important fields:

- `user_id`
- `tier_id`
- `source`
- `provider`
- `provider_connection_id`
- `status`
- `valid_from`
- `valid_until`
- `scope_type` / `scope_id` if later needed
- `created_by` for manual grants

Rules:

- Status can be active, expired, revoked, pending.
- Expiry checks happen in SQL/RPC.
- Admin/manual grants and provider grants share table.

### `provider_connections`

Purpose: maps a Supabase user to external identity.

Fields:

- `user_id`
- `provider`
- `provider_user_id`
- `provider_label`
- `status`
- `last_synced_at`
- safe metadata

Rules:

- Do not expose sensitive tokens to the frontend.
- Token storage, if required, belongs server-side only.

### `provider_tier_mappings`

Purpose: maps provider plan/tier/role/product IDs into `reader_access_tiers`.

Fields:

- `provider`
- `provider_tier_id`
- `provider_tier_name`
- `reader_tier_id`
- `is_active`

Rules:

- Admin-configured.
- Frontend never hardcodes Patreon tier IDs.

### `access_keys`

Purpose: redeemable keys for beta, gifts, reviewers, campaigns, support recovery.

Fields:

- hashed code, never plaintext long-term;
- `tier_id`;
- max uses;
- used count;
- valid from/until;
- status;
- campaign/note;
- created_by.

Rules:

- Show plaintext once at creation if generated client/admin side, then never again.
- Reader submits code to RPC; backend hashes/checks.

### `access_key_redemptions`

Purpose: records redemption history.

Fields:

- key id;
- user id;
- redeemed at;
- entitlement id;
- safe IP/user-agent optional if policy allows.

### `entitlement_audit_log`

Purpose: trace who/what granted, revoked, expired, or synced access.

Events:

- key generated;
- key redeemed;
- manual grant;
- manual revoke;
- provider linked;
- provider sync active;
- provider sync no matching tier;
- entitlement expired;
- webhook revoke.

## 5. Chapter table additions

Existing `chapters` should support:

- `required_tier_id` nullable;
- `public_release_at` nullable;
- `preview_text` nullable.

Rules:

- `required_tier_id = NULL` means free/public according to existing publish rules.
- `public_release_at` can convert early-access chapters to public after date.
- `preview_text` is safe public teaser copy.

## 6. RPC contract

### `get_chapter_catalog(target_story_id)`

Returns chapter metadata for catalog cards.

Should include:

- chapter id;
- title;
- order;
- word count/read metadata;
- preview text;
- required tier id/name/slug;
- public release date;
- computed `access_state`;
- computed `can_read` boolean.

Must not include full protected content.

### `get_reader_chapter(target_chapter_id)`

Returns full content only if authorized.

Authorized when:

- chapter is published and free;
- chapter is published and public release date has passed;
- user is admin;
- user has active entitlement for required tier/scope.

Unauthorized response options:

- return metadata with `can_read = false` and no content;
- or raise permission error caught by client and converted to gate.

### `get_my_entitlements()`

Returns active and relevant inactive entitlements for current user.

Should include:

- tier info;
- source/provider;
- status;
- validity dates;
- provider connection label;
- campaign/note if safe.

### `redeem_access_key(submitted_code)`

Server-side flow:

1. Require authenticated user.
2. Normalize and hash submitted code.
3. Find active key.
4. Check validity dates, revoke status, max uses, duplicate redemption.
5. Create entitlement.
6. Record redemption.
7. Audit event.
8. Return entitlement summary.

### `refresh_provider_access(provider)` / Edge function equivalent

Starts provider sync or returns current sync state. Patreon may use OAuth start/callback rather than a simple RPC.

## 7. Provider adapters

Provider adapters live in Supabase Edge Functions or trusted server automation, not frontend JS.

### Patreon v1

Functions:

- `patreon-oauth-start`
- `patreon-oauth-callback`
- optional webhook handler
- optional manual sync endpoint

Flow:

1. Reader signs in.
2. Reader clicks Connect Patreon.
3. Edge function creates signed state and OAuth URL.
4. Patreon redirects back to callback.
5. Callback validates state, exchanges code, fetches membership/tier data.
6. Provider tier IDs map to internal tiers.
7. Entitlements are inserted/updated.
8. Reader returns to success or pending route.

### Ko-fi / PayPal future

Likely webhook-first for payments/subscriptions. They should post normalized events into provider adapter boundary, not directly mutate frontend state.

### Discord future

Options:

- OAuth identity link + role check;
- bot-driven periodic role sync;
- automation webhook from Discord bot.

All paths write normalized entitlements.

## 8. Admin workflows

### Tier management

Admin can:

- create/edit tier name, slug, description, rank;
- deactivate tier;
- see mapped providers;
- see chapter count using tier.

### Chapter access assignment

In chapter editor/admin:

- select required tier or `Free`;
- set public release date;
- enter preview text;
- see warning that locked full content requires migration/RPC.

### Access key management

Admin can:

- generate key;
- assign tier;
- set expiry;
- set max uses;
- add campaign note;
- copy generated key once;
- revoke key;
- view redemption count/history.

### Manual grants

Admin can:

- find user by id/username/display name/email if available;
- select tier;
- set expiry;
- write reason/note;
- grant;
- revoke;
- audit.

### Provider mapping

Admin can:

- add provider mapping;
- map provider tier/product/role ID to internal tier;
- activate/deactivate mapping;
- keep mapping outside frontend logic.

### Audit review

Admin should eventually see:

- who performed action;
- source provider;
- target user;
- tier;
- timestamp;
- safe metadata.

## 9. Failure and abuse considerations

- Do not store access-key plaintext.
- Do not log submitted keys.
- Rate-limit redemption if possible.
- Provider webhook secret required.
- OAuth state must be signed and expiring.
- RLS must block direct locked content reads.
- Client fallback chapter reads are acceptable only for pre-migration local browsing; production locked chapters need RPC/RLS.
- Entitlement expiry should be calculated server-side, not trusted from client.
