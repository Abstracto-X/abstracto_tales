# Subscription Site Handover - Aether Pages Member Reader

Last updated: 2026-06-25 16:43 Asia/Kolkata

This is the working handover for the `subscription.html` member reader surface. It captures the current implemented state, the active code path, what has been verified, what remains demo/local-only, and the recommended next work order.

---

## 1. Current Status Snapshot

The subscription site is no longer just a static concept demo. It is now a production bridge built on the Aether Pages UI, with real Supabase Auth, subscription catalog reads, secure chapter-body RPC reads, access-key redemption, admin-managed access controls, and Patreon OAuth/sync code paths.

It is **not final production** yet. The main blocker is that the active runtime is still a large bridge monolith (`js/subscription/aether-app.js`) with local/demo features mixed together with real backend integration. The next major work should be hardening, verification, and module extraction rather than adding more UI toys into the monolith.

Current confidence:

| Area | Status | Notes |
| --- | --- | --- |
| Aether Pages UI shell | Working / active | `subscription.html` loads the Aether bridge, not the older modular `Sub*` runtime. |
| Main-site visual integration | Partially done | CSS now uses glass cards, story cover card hero, story backgrounds, main archive links, cast/timeline cross-links. |
| Supabase Auth | Mostly working | Email/password and Google OAuth code paths exist. Google callback parser now supports both `?code=` and `#access_token=` returns. Needs one clean end-to-end retest after latest callback fixes. |
| Access-key redemption | Working | User reported key redeem + chapter unlock working after pgcrypto search-path fix. |
| Secure chapter loading | Working in design/code | Full chapter body uses `get_reader_chapter` RPC only. Catalog path does not fetch locked body content. |
| Backend story/catalog loading | Implemented | Reads published stories and per-story chapter catalog. Also loads characters, lore, timeline, wallpapers. Falls back to fixtures if backend/catalog unavailable. |
| Admin access controls | Implemented in `admin.html` | Tiers, chapter gates, access keys, manual grants, provider mappings exist. |
| Patreon OAuth/sync | Implemented, needs full live verification | Edge Functions and browser calls exist. Requires Patreon app config + provider tier mapping validation. |
| Local reader features | Demo/local only | Progress, notes, comments, reactions, quotes, bookmarks, shelf/history are mainly localStorage/demo behavior. |
| Documentation state | Mixed | Updated `AGENTS.md` now says `docs/` is durable docs, but several generated/older docs still mention `docs_v2/`. Treat this as a repo process inconsistency to resolve. |

---

## 2. Active Boot Path

### Active files

- `subscription.html`
  - Loads the dedicated stylesheet.
  - Loads Supabase JS v2 from CDN.
  - Loads `js/subscription/aether-data.js`.
  - Loads `js/subscription/aether-app.js`.
  - Contains `#global-bg`, `#app`, and `<main id="main">`.

- `subscription.css`
  - Active stylesheet for the member reader.
  - Owns app shell, topbar, bottom nav, cards, story hero, reader mode, sheets, background modes, wallpaper swatches, access state badges, and responsive behavior.

- `js/subscription/aether-data.js`
  - Still present as fallback/demo data.
  - Must not be treated as access security.
  - Real backend loading can replace `D.STORIES` and `D.UPDATES`, but fixture data remains available when backend reads fail.

- `js/subscription/aether-app.js`
  - Active runtime.
  - Owns routing, auth, data loading, access resolution, rendering, sheets, toasts, local store, and admin-gated studio preview.
  - This file is now too large and should be split before long-term maintenance.

### Inactive/reference path

The older modular subscription files still exist:

- `js/subscription/main.js`
- `js/subscription/state.js`
- `js/subscription/auth.js`
- `js/subscription/db.js`
- `js/subscription/router.js`
- `js/subscription/ui.js`
- `js/subscription/render.js`

These are **not the active boot path** while `subscription.html` loads `aether-data.js` + `aether-app.js`. Keep them as reference until the Aether bridge is split into production modules.

---

## 3. Current Routes In The Active Aether Bridge

`parseHash()` in `js/subscription/aether-app.js` currently supports:

| Hash | View |
| --- | --- |
| `#/` | Home |
| `#/library` | Library |
| `#/updates` | Updates feed |
| `#/calendar` | Release calendar |
| `#/collections` | Collections index |
| `#/collections/:slug` | Collection page |
| `#/vault` | Access vault/account access management |
| `#/my-shelf` | Local shelf/progress area |
| `#/bookmarks` | Local bookmarks |
| `#/quotes` | Local quotes |
| `#/history` | Local history |
| `#/notifications` | Notifications feed |
| `#/benefits` | Membership benefit explainer |
| `#/onboarding` | Onboarding |
| `#/help` | Help |
| `#/support/check-access` | Access troubleshooting |
| `#/support/wrong-account` | Wrong-account support |
| `#/support/contact` | Contact support form placeholder |
| `#/story/:slug` | Story hub |
| `#/story/:slug/chapters` | Story chapter list |
| `#/story/:slug/recap` | Recap |
| `#/story/:slug/extras` | Extras |
| `#/story/:slug/updates` | Story updates |
| `#/read/:chapterId` | Reader |
| `#/studio` and `#/studio/*` | Admin-gated in-bridge studio preview |

Important: Some routes are real backend-backed, some are still demo/local. Do not assume every rendered feature is persisted.

---

## 4. Backend/Data Integration Currently Implemented

### Library load

`loadBackendLibrary()` does this after auth init:

1. Reads `stories` where `is_published = true`.
2. Normalizes each story into the Aether Pages story shape.
3. For each story, loads in parallel:
   - Chapter catalog through `get_chapter_catalog(target_story_id)` RPC.
   - Fallback chapter metadata from `chapters` if catalog RPC fails.
   - `characters` for cast tiles.
   - `lore_entries` for glossary tiles.
   - `timeline_events` for timeline CTA/summary.
   - `story_wallpapers` for background choices.
4. If at least one story has chapters:
   - Replaces `D.STORIES` with backend stories.
   - Builds `D.UPDATES` from backend chapter metadata.
   - Sets `D.PRIMARY_SLUG` and `D.FEATURED_SLUGS`.
   - Sets `backendState.usingFixtures = false`.
   - Purges mock localStorage IDs.
   - Syncs dynamic notifications.

### Secure chapter body load

`loadReaderChapterIntoFixture(chapterId)` calls:

```txt
get_reader_chapter(target_chapter_id)
```

It only attaches `chapter.content` when the RPC returns `can_read = true` and non-empty content. It does **not** fall back to direct `chapters.content` reads. Keep this rule. Locked content must never be shipped and blurred client-side.

### Current fallback behavior

If backend library loading fails or no backend story has catalog rows, the app keeps local fixtures from `aether-data.js` for UI continuity. This is useful for local/demo work, but production should make backend failure visible instead of silently showing fiction fixtures.

Recommended later change:

- Add a production flag such as `ALLOW_SUBSCRIPTION_FIXTURE_FALLBACK = false` for deployed environments.
- If backend load fails in production, render a clear maintenance/error state rather than demo stories.

---

## 5. Auth And Access Flows

### Supabase identity

Supabase Auth is the canonical site account system. Patreon is a linked provider/access source, not the primary account database.

Current login methods:

- Email/password sign-in.
- Email/password sign-up.
- Google OAuth through Supabase Auth.

Google OAuth notes:

- The bridge uses `flowType: "pkce"` and `detectSessionInUrl: false` so callback parsing is controlled manually.
- `signInWithGoogle()` stores:
  - `store.pendingAuthReturn = "subscription"`
  - optional `store.pendingAuthAction`, e.g. `connect-patreon`
- Redirect target is query-based:

```txt
subscription.html?sub_auth=google&sub_route=vault
```

- Callback parser handles both:
  - `?code=...`
  - `#access_token=...`
  - nested SPA weirdness like `subscription.html#/vault#access_token=...`

Manual verification still needed after the latest OAuth callback fix:

1. Start logged out on `subscription.html#/vault`.
2. Continue with Google.
3. Complete Google login.
4. Confirm return to `subscription.html#/vault`.
5. Confirm URL token/code params are cleaned.
6. Confirm account chip/sheet shows logged-in state.
7. Confirm a Supabase profile row is present.

### Entitlements

`refreshEntitlements()` calls:

```txt
get_my_entitlements()
```

It falls back to direct `user_entitlements` select if the RPC fails. Active entitlements are used by `entitlementLevel()` and the Aether bridge's access resolver.

### Access keys

- Admin generates keys in `admin.html` under Member Access.
- Plaintext key is shown once.
- Database stores hash/prefix/metadata only.
- Reader redeems through `redeem_access_key(submitted_code)`.
- User already reported key redeem + chapter unlock as working.

### Patreon

Browser path:

- Guest wants Patreon access.
- UI offers Google first, then Patreon.
- After Google session restore, pending action resumes `connectPatreonGo()`.
- `requestPatreonOAuth()` calls `patreon-oauth-start` Edge Function.
- Manual sync calls `sync-provider-entitlements`.

Server path:

- `patreon-oauth-start`
- `patreon-oauth-callback`
- `sync-provider-entitlements`
- `provider-webhook`
- `_shared/patreon.ts`
- `_shared/cors.ts`

Still needs full live verification with an actual Patreon account, exact Patreon redirect URI, and provider-tier mapping rows.

---

## 6. Admin/Author Workflow Available Now

In `admin.html`, the Member Access section provides:

- Internal access tiers:
  - Create/update/delete rows in `reader_access_tiers`.
- Chapter gates:
  - Chapter form has required tier selection.
  - `required_tier_id = NULL` means free/public when published.
  - `public_release_at` controls early-public release timing.
  - `preview_text` is safe teaser text.
- Access keys:
  - Generate hashed keys.
  - Set tier, label/campaign, max uses, grant duration, and key expiry.
  - Revoke keys.
- Manual grants:
  - Search profile by profile ID, username, or display name.
  - Insert active `user_entitlements` rows.
  - Revoke entitlements.
- Provider mappings:
  - Map provider tier/product/role IDs to internal `reader_access_tiers`.
  - Patreon is the first provider; Ko-fi/PayPal/Discord remain later adapters.

Known admin-side follow-up:

- Add better validation around deleting tiers that are in use.
- Add audit-log viewer for access changes.
- Add clearer provider-mapping helper copy explaining where to find Patreon tier IDs.
- Add import/sync UI for Patreon mapping diagnostics once OAuth has been live-tested.

---

## 7. Visual/UI State After Latest CSS Work

The UI has moved closer to the main site identity while keeping Aether Pages lighter than the cinematic public reader.

Current visual features:

- `#global-bg` background layer behind the app.
- Background modes in reader settings:
  - `story` / Artwork
  - `gradient` / Ambient
  - `solid`
- Optional blur toggle for story backgrounds.
- Wallpaper swatches from `story_wallpapers` plus default cover art.
- Story cover/card hero layout:
  - `.book-hero` / `.hero`
  - `.book-hero-cover`
  - `.book-hero-details`
  - designed to avoid cover cropping/stretching.
- Soft glass cards via `.card`, `.card.tinted`, surfaces, border tokens, backdrop filters.
- Story accent propagation:
  - `--s`, `--s2`, `--s-soft`
  - also maps to `--accent`, `--accent-2` for nested controls.
- Cross-links to main archive concepts:
  - Cast tiles link to `index.html#gallery/:storySlug/:characterId` where possible.
  - Timeline CTA links to `index.html#timeline/:storySlug`.
  - Some "Open Abstracto Tales" buttons currently only toast and should be wired to real navigation.

Important visual follow-up:

- Audit all `external-archive` actions. Some still show concept toasts instead of opening `index.html`.
- Confirm no story-cover/wallpaper URL is inserted without escaping where it can break inline styles.
- Check long title/tagline wrapping in `.book-hero` and mobile stack.
- Check crisp background mode readability; some wallpapers may need automatic overlay fallback.

---

## 8. Database Objects Involved

Core subscription tables/functions:

- `reader_access_tiers`
- `user_entitlements`
- `provider_connections`
- `provider_tier_mappings`
- `provider_oauth_tokens`
- `access_keys`
- `access_key_redemptions`
- `entitlement_audit_logs`
- `get_chapter_catalog(target_story_id)`
- `get_reader_chapter(target_chapter_id)`
- `get_my_entitlements()`
- `redeem_access_key(submitted_code)`

Chapter columns used by access:

- `required_tier_id`
- `public_release_at`
- `preview_text`

Required SQL files:

- `sql/2026-06-23_reader_subscription_access.sql`
- `scripts/sql/2026-06-23_reader_subscription_access.sql`
- `sql/2026-06-24_provider_oauth_tokens.sql`
- `scripts/sql/2026-06-24_provider_oauth_tokens.sql`
- `sql/hotfixes/2026-06-24_fix_redeem_access_key_pgcrypto_search_path.sql`

Security rule to preserve:

> Locked chapter bodies are only returned by `get_reader_chapter` after database-side authorization. Do not fetch locked chapter content in browser code and blur/hide it client-side.

---

## 9. Environment And Dashboard Checklist

### Supabase Auth

Google provider must be enabled.

Redirect allow-list should include deployed and local subscription callback URLs, especially:

```txt
https://abstracto-x.github.io/abstracto_tales/subscription.html?sub_auth=google&sub_route=vault
http://127.0.0.1:5500/subscription.html?sub_auth=google&sub_route=vault
```

Existing wildcard entries can remain, but keep exact query callback entries for clarity.

### Patreon

Required secrets/config for Edge Functions:

- `PATREON_CLIENT_ID`
- `PATREON_CLIENT_SECRET`
- `PATREON_REDIRECT_URI`
- `PATREON_STATE_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `PATREON_CAMPAIGN_ID`
- optional `PATREON_USER_AGENT`

`supabase/config.toml` should keep external callbacks/webhooks unauthenticated at the Supabase gateway layer while validating their own secrets/state:

- `patreon-oauth-callback`: `verify_jwt = false`
- `provider-webhook`: `verify_jwt = false`

Signed-in reader functions should remain JWT-protected.

---

## 10. What Is Still Demo/Local-Only

These areas render nicely but are not production-persistent yet:

- Reader comments and paragraph notes.
- Quote saving and quote cards.
- Bookmarks.
- History.
- Shelf/progress persistence beyond localStorage.
- Reactions.
- Notification dismissal and notification read state.
- Support contact form.
- Discord links.
- Several Studio preview actions.
- Some "Open Abstracto Tales" actions.
- Milestones/benefits status.
- Analytics/studio dashboard numbers.

Recommended production approach:

1. Decide which of these are v1 requirements versus post-launch delights.
2. For v1, persist only core reading progress/bookmarks if needed.
3. Leave comments/reactions/analytics as later work unless they are needed for launch.
4. Remove or label demo-only surfaces before public launch if they imply unavailable capabilities.

---

## 11. Highest-Priority Remaining Work

### P0 - Must fix/verify before public launch

1. **Final Google OAuth verification**
   - Confirm callback token parsing works on GitHub Pages and local dev.
   - Confirm user remains signed in after return.
   - Confirm no `#access_token` remains in URL.

2. **Patreon end-to-end live test**
   - Configure Patreon app redirect URI exactly.
   - Create provider-tier mapping rows in admin.
   - Connect Patreon from a signed-in reader.
   - Confirm `provider_connections`, `provider_oauth_tokens`, and `user_entitlements` rows update.
   - Confirm locked chapters unlock after sync.

3. **Production fixture fallback decision**
   - Prevent deployed site from silently showing mock stories if backend fails.
   - Add visible backend error/maintenance state for production.

4. **Aether monolith risk**
   - Stop adding major features directly into `aether-app.js`.
   - Split into modules before the next large feature wave.

5. **Manual security audit**
   - Confirm browser code cannot fetch locked `chapters.content` directly.
   - Confirm RLS blocks unauthorized direct table reads.
   - Confirm provider token table is service-role only.

### P1 - Strongly recommended

1. **Wire main archive actions**
   - Make `external-archive` open real `index.html` routes instead of only toast placeholders.

2. **Persist selected local features**
   - Decide on Supabase tables/RPCs for reading progress, bookmarks, quotes, and notes if they are launch scope.

3. **Improve account/access UI clarity**
   - Show exact reason locked chapter is locked.
   - Show active tier, expiry, provider, and last sync time.
   - Add wrong-account recovery steps.

4. **Admin diagnostics**
   - Add provider mapping help.
   - Add entitlement audit viewer.
   - Add Patreon sync status/errors for an account.

5. **Responsive QA pass**
   - Test story hero, library, vault, reader, sheets, and background modes across desktop/tablet/phone.

### P2 - Later polish

- Ko-fi adapter.
- PayPal adapter.
- Discord role adapter.
- Real notification preferences.
- Offline queue.
- Analytics dashboard.
- Full author studio replacement or removal of in-bridge studio preview.
- Reader comments/reactions persistence.

---

## 12. Recommended Next Implementation Order

1. **Verify Google OAuth once more** using the latest callback parser.
2. **Run Patreon live test** with one real mapped tier.
3. **Harden production fallback** so demo fixtures cannot masquerade as production data.
4. **Patch external main-archive links** to actually open `index.html` routes.
5. **Split `aether-app.js` into modules**:
   - `store.js`
   - `supabaseClient.js`
   - `auth.js`
   - `access.js`
   - `catalog.js`
   - `router.js`
   - `views/*.js` or grouped render modules
   - `sheets.js`
   - `backgrounds.js`
   - `localPersistence.js`
6. **Choose v1 local feature persistence scope**.
7. **Clean or label demo-only surfaces** before launch.

---

## 13. Manual Verification Matrix

### Anonymous reader

1. Open `subscription.html` in a clean/incognito session.
2. Confirm home loads without console errors.
3. Open library/story page.
4. Confirm free chapters show readable actions.
5. Confirm locked chapters show gates and never display body text.
6. Confirm Vault prompts sign-in/connect/redeem.

### Google login

1. Open `subscription.html#/vault` logged out.
2. Click Continue with Google.
3. Complete Google login.
4. Expected:
   - Returns to `subscription.html#/vault`.
   - No `code`, `access_token`, or `refresh_token` remains in the URL.
   - Account chip/sheet shows logged-in state.
   - Supabase Auth user/profile exists.

### Access key

1. Admin creates a key in `admin.html` Member Access.
2. Copy plaintext key before closing modal.
3. In `subscription.html#/vault`, redeem key as a signed-in reader.
4. Expected:
   - Success toast.
   - Entitlement appears.
   - A gated chapter for that tier unlocks.
   - Key usage count increments.

### Patreon

1. Confirm Patreon provider mapping exists in admin.
2. Sign in as reader.
3. Connect Patreon from Vault.
4. Complete Patreon OAuth.
5. Expected:
   - Returns to Vault.
   - Provider connection row exists.
   - OAuth token row exists server-side only.
   - Entitlement row exists if Patreon tier maps.
   - Locked chapter unlocks after sync.

### Admin chapter gate

1. In `admin.html`, edit a published chapter.
2. Assign required access tier.
3. Set optional public release date and preview text.
4. Save.
5. Open subscription story as guest/no-access user.
6. Expected:
   - Catalog shows locked/early/key state.
   - Preview text only, no full body.
   - Authorized account can read via RPC.

### Visual/background QA

1. Open home and a story page.
2. Confirm hero cover is a portrait card, not cropped banner sludge.
3. Open settings.
4. Switch background mode: Artwork, Ambient, Solid.
5. Toggle blur background.
6. Select a wallpaper swatch if story has wallpapers.
7. Check mobile width <= 600px.
8. Expected:
   - Layout stacks cleanly.
   - Text remains readable.
   - Bottom nav/sheets remain usable.

---

## 14. Known Process/Documentation Risk

The repo currently has mixed documentation rules:

- Updated `AGENTS.md` says durable docs live in `docs/` and docs generation scripts should not run unless explicitly requested.
- Some existing overview/generated docs still describe `docs_v2/` as source-of-truth and `npm run compile-docs` as mandatory.
- `docs_v2/reader/subscription_spa.md` currently contains newer subscription details than `docs/reader/subscription_spa.md`.

Recommended follow-up:

1. Decide whether `docs/` or `docs_v2/` is the true editable source going forward.
2. Update `docs/CODEBASE_OVERVIEW.md` to match `AGENTS.md` if `docs/` is now canonical.
3. Either retire `docs_v2/` or restore the old compile workflow consistently.
4. Avoid running `npm run compile-docs` until this is resolved, unless intentionally syncing from `docs_v2`.

---

## 15. Quick File Map For Next Agent

| Task | Primary files |
| --- | --- |
| Fix OAuth/login | `js/subscription/aether-app.js`, `js/auth.js`, Supabase Auth dashboard |
| Fix Patreon | `supabase/functions/*`, `supabase/functions/_shared/patreon.ts`, `admin.html`, `provider_tier_mappings` |
| Fix catalog/content | `js/subscription/aether-app.js`, `sql/2026-06-23_reader_subscription_access.sql`, `get_chapter_catalog`, `get_reader_chapter` |
| Admin access UI | `admin.html` only |
| Visual shell/background | `subscription.css`, `js/subscription/aether-app.js`, `subscription.html` |
| Main archive links | `js/subscription/aether-app.js` |
| Split bridge into modules | `js/subscription/aether-app.js` into `js/subscription/` modules |
| Docs/process cleanup | `AGENTS.md`, `docs/CODEBASE_OVERVIEW.md`, maybe `docs_v2/` |

---

## 16. Do Not Break These Rules

- Do not add React/Vue/build tooling.
- Do not move admin/writer/cartographer logic out of their single files.
- Do not expose service role keys in frontend code.
- Do not fetch locked chapter bodies directly in frontend code.
- Do not store plaintext access keys in the database.
- Do not log OAuth tokens or paste callback URLs with `access_token` into docs/issues/chat.
- Do not treat `aether-data.js` fixtures as production access truth.
- Do not add more major features to `aether-app.js` before planning the module split.
