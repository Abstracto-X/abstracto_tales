# Aether Pages Backend Integration Action Plan

## 0. Decision: do we need more major UI features before backend?

No major feature ideation is needed before backend integration. `aether-pages/` already has the right product shape for a premium member reader:

- home/dashboard with access banners, continue reading, archive stats, updates, recommendations, collections;
- library search and filters for readable/free/preview/early/member/key content;
- story hub with hero, progress, quick starts, recaps, extras, latest chapters, follow state, cast/glossary;
- chapter shelf with comfortable/compact/by-arc views;
- reader with progress bar, settings, reader toolbar, previews, locked gates, end-of-chapter actions, reactions, bookmarks, quotes, paragraph comments;
- member vault/access hub, provider cards, Patreon flow, access key flow, benefits, help, access check, wrong-account assistant, support packet;
- my shelf, bookmarks, quotes, history, notifications, collections, calendar.

The right next move is **not** more UI expansion. The right move is a short **UI stabilization/refactor phase**, then backend integration. The concept demo must be converted from a mock/localStorage application into a production app with real Supabase data, real auth, real entitlements, and secure chapter reads.

Mobile should be treated as a responsive target, not the product's primary constraint. The base should become a desktop/tablet-rich reader that adapts cleanly to phones.

---

## 1. Primary implementation principle

Keep `aether-pages` as the visual/product base, but do not keep its architecture as-is.

Current `aether-pages` is a demo:

- mock data in `js/data.js`;
- mock personas/access in localStorage;
- all route rendering in a very large `js/app.js`;
- fake provider/key flows;
- local-only progress/bookmarks/quotes/comments;
- no real backend security.

Production target:

```txt
Aether Pages UI
  -> modular vanilla JS subscription app
  -> Supabase Auth
  -> Supabase normalized entitlements
  -> secure catalog/content RPCs
  -> Patreon OAuth adapter
  -> access-key/manual-grant/admin workflows
  -> future provider adapters later
```

Locked content rule remains absolute: **full locked chapter content must never reach the browser until backend access checks pass.**

---

## 2. Phase 0 - Product lock and source cleanup

### Goal

Freeze the product shape before replacing mock internals.

### Work

- Treat `aether-pages/` as the UI/product source of truth.
- Treat `PLANS/subscription-reader-spa/` as the backend/access/security requirement source.
- Decide final production entry:
  - keep current `subscription.html`, or
  - replace it with Aether Pages UI, or
  - rename to `aether-pages.html` / `reader.html` later.
- Remove demo artifacts before integration:
  - Cloudflare injected script in `aether-pages/index.html`;
  - mojibake/encoding issues (`â€”`, `Â·`, broken emoji/text);
  - fake persona labels that should become real auth states;
  - any copy that says demo/mock.
- Decide which demo routes are production v1 vs later:
  - v1: home, library, story, chapters, read, updates, vault/access, benefits/tiers, shelf, bookmarks, quotes, history, notifications, help/support.
  - later or admin-only: studio routes, offline queue, share quote card, advanced analytics.
- Update older planning language to responsive desktop/tablet-rich with clean mobile adaptation.

### Exit criteria

- Route list is frozen for v1.
- UI features are classified as v1, v1-local, v1-backed, or later.
- No more major UI concept work blocks backend integration.

---

## 3. Phase 1 - Refactor Aether Pages into project architecture

### Goal

Move from mock monolith to maintainable production modules without losing the UI richness.

### Work

- Create/replace subscription app shell using the Aether Pages UI.
- Convert the large demo `app.js` into modules under `js/subscription/`, likely:
  - `main.js` - boot/init;
  - `state.js` - runtime state and local preferences;
  - `router.js` - hash route parser/dispatcher;
  - `db.js` - Supabase data access;
  - `auth.js` - Supabase auth/profile;
  - `access.js` - access-state resolver and entitlement helpers;
  - `renderHome.js`, `renderLibrary.js`, `renderStory.js`, `renderReader.js`, `renderAccess.js`, etc., or a practical grouped render split;
  - `ui.js` - sheets, toasts, chrome, delegated handlers;
  - `localStore.js` - local progress/bookmarks/settings migration;
  - `icons.js` / `templates.js` if needed.
- Keep vanilla JS. No React/Vue/build step.
- Preserve the Aether Pages CSS direction, but scope it so it does not break `index.html`.
- Decide whether production CSS lives:
  - inside `styles.css` as scoped `.sub-*`/`.aether-pages-*` section, or
  - in a dedicated stylesheet if project rule is updated/approved.
- Replace mock data calls with adapter boundaries, but keep temporary mock fallback until real Supabase fetches are wired.

### Exit criteria

- Aether Pages UI runs in the project surface.
- Route rendering still works after module split.
- Mock data is isolated behind data adapters, not hardcoded through all render functions.
- Syntax checks pass for all modules.

---

## 4. Phase 2 - Data contracts and Supabase access foundation

### Goal

Install the backend model that can safely support the Aether Pages UI.

### Work

- Finalize SQL migration for:
  - `reader_access_tiers`;
  - `user_entitlements`;
  - `provider_connections`;
  - `provider_tier_mappings`;
  - `access_keys`;
  - `access_key_redemptions`;
  - `entitlement_audit_log`.
- Finalize chapter fields:
  - `required_tier_id`;
  - `public_release_at`;
  - `preview_text`;
  - optional read-time/word-count support if needed.
- Finalize RPCs:
  - `get_chapter_catalog(target_story_id)`;
  - `get_reader_chapter(target_chapter_id)`;
  - `get_my_entitlements()`;
  - `redeem_access_key(submitted_code)`;
  - optional `get_reader_dashboard()` later to avoid multiple route waterfalls.
- RLS hardening:
  - public metadata readable;
  - locked full chapter content not directly readable;
  - admins keep authoring access;
  - RPCs enforce entitlement checks.
- Normalize access states from SQL/RPC into Aether Pages states:
  - `free`;
  - `unlocked`;
  - `preview`;
  - `locked`;
  - `early`;
  - `key`;
  - `pending`;
  - `expired`;
  - `unavailable`.

### Exit criteria

- Direct unauthorized reads of locked chapter content fail.
- Catalog can show locked cards without content leakage.
- Entitlement grants unlock content through RPC only.
- Key redemption creates entitlement and audit log.

---

## 5. Phase 3 - Real auth and account state

### Goal

Replace mock personas with real Supabase Auth.

### Work

- Implement subscription auth module:
  - session restore;
  - sign in;
  - sign up;
  - sign out;
  - profile fetch/sync;
  - account chip update;
  - auth modal/sheet behavior.
- Replace `persona()` and local fake states with real derived account state:
  - anonymous;
  - signed in no entitlement;
  - active entitlement;
  - pending provider sync;
  - no qualifying provider tier;
  - expired/revoked access.
- Preserve pending return route:
  - locked chapter -> sign in/connect/redeem -> return to chapter.
- Ensure guest browsing still works for public metadata and free chapters.

### Exit criteria

- Account chip reflects real auth.
- Guest can browse metadata.
- Sign-in state survives refresh.
- Locked routes preserve return path.

---

## 6. Phase 4 - Replace mock story/chapter data with Supabase data

### Goal

Make library, story hubs, chapter shelves, updates, and reader content use real published data.

### Work

- Replace `DATA.STORIES` with Supabase-backed methods:
  - `getStories()`;
  - `getStoryBySlug(slug)`;
  - `getChapterCatalog(storyId)`;
  - `getReaderChapter(chapterId)`.
- Map existing story/chapter fields into Aether Pages UI fields:
  - title, slug, author, genre, status, cover, accent, synopsis/tagline;
  - chapter order, title, access state, tier, public date, preview, read time.
- Keep safe fallbacks for missing optional fields.
- Build update feed from real chapter/catalog data at first.
- Later, add dedicated announcement/update tables if needed.

### Exit criteria

- Library renders real stories.
- Story hub renders real story and catalog.
- Chapter shelf renders real chapter states.
- Reader loads real content only when authorized.
- Demo `data.js` is no longer required for production paths.

---

## 7. Phase 5 - Production access gates and entitlement UX

### Goal

Make Aether Pages access UX reflect backend truth.

### Work

- Replace `chapterResolved()` with backend-aware resolver using catalog/RPC results.
- Keep Aether Pages access visuals and copy:
  - access banners;
  - inline chapter badges;
  - locked fallback page;
  - preview wall;
  - expected-access/help flow.
- Wire `Vault`/Access hub to real entitlements.
- Wire `Benefits`/tiers page to real `reader_access_tiers`.
- Implement account entitlement details:
  - active grants;
  - expired/revoked/pending grants;
  - source/provider;
  - valid dates;
  - mapped tier.

### Exit criteria

- Same chapter state appears consistently across home/library/story/shelf/reader/account.
- Expired/revoked access removes reader access on refresh/refetch.
- Access help and wrong-account assistant use real account/provider state where possible.

---

## 8. Phase 6 - Access keys and manual grants

### Goal

Ship a reliable non-payment access path before Patreon is fully depended on.

### Work

- Wire access key sheet/page to `redeem_access_key` RPC.
- Handle errors:
  - invalid;
  - expired;
  - revoked;
  - max uses reached;
  - already redeemed;
  - not signed in;
  - network/RPC failure.
- Refresh entitlements after redemption.
- Return to pending chapter after success.
- Complete/admin-check workflows:
  - create tiers;
  - assign tier to chapters;
  - generate/revoke keys;
  - manual grant/revoke;
  - provider-tier mapping configuration.
- Keep audit logs for grants/revokes/redemptions.

### Exit criteria

- Admin can lock a chapter behind a tier.
- Admin can generate a key.
- Reader can redeem key and unlock matching chapter.
- Revoked/expired key fails cleanly.
- Manual grant unlocks content; revoke removes access.

---

## 9. Phase 7 - Patreon auth and entitlement sync

### Goal

Add Patreon as the first production provider. Other payment adapters stay later.

### Work

- Edge Functions:
  - `patreon-oauth-start`;
  - `patreon-oauth-callback`;
  - `sync-provider-entitlements` / refresh endpoint;
  - optional Patreon webhook endpoint if needed for ongoing lifecycle updates.
- Store provider connection safely:
  - provider user id;
  - label/account name if available;
  - status;
  - last sync;
  - no client-exposed secrets.
- Map Patreon tiers through `provider_tier_mappings`, not frontend hardcoding.
- Write normalized `user_entitlements`.
- Aether Pages UI states:
  - connect Patreon;
  - connecting;
  - connected active;
  - connected no qualifying tier;
  - sync pending;
  - expired/cancelled;
  - wrong account support path.
- Keep current plan: no PMPro/Razorpay/PayPal/Ko-fi implementation in this phase.

### Exit criteria

- Signed-in reader can start Patreon OAuth.
- Callback links provider to same Supabase user.
- Qualifying tier grants entitlement.
- Non-qualifying tier is clearly explained.
- Provider secrets never reach browser.

---

## 10. Phase 8 - Reader personal features: decide local vs backed

### Goal

Make rich reader features production-safe without blocking paid access launch.

### Feature classification

#### Can remain local for v1

- reader theme/settings;
- local reading progress;
- local bookmarks;
- local quote saves;
- local history;
- local followed stories;
- dismissed notifications.

#### Should be Supabase-backed soon after

- cross-device reading progress;
- bookmarks;
- saved quotes;
- followed stories;
- notifications;
- support contact packets.

#### Needs moderation/abuse design before launch

- paragraph comments;
- chapter comments;
- reactions if public/aggregate;
- share quote cards.

### Work

- Keep local-first versions working during backend integration.
- Add clean adapter boundaries so each local feature can later move to Supabase.
- Do not let local features control access decisions.

### Exit criteria

- Reader features work locally without risking entitlement security.
- Later backend persistence is straightforward.

---

## 11. Phase 9 - Updates, notifications, support, and account polish

### Goal

Turn support surfaces from demo pages into useful production flows.

### Work

- Build update feed from real published/public_release_at/catalog data.
- Keep calendar as derived view initially.
- Build notifications from:
  - local computed events first;
  - later admin announcements/subscriptions.
- Wire Access Health Check to real data:
  - signed-in account;
  - provider connection;
  - last sync;
  - entitlement status;
  - tier mapping result.
- Wire support packet with safe context only:
  - account id/email;
  - provider name/status;
  - entitlement ids/statuses;
  - story/chapter attempted;
  - masked key suffix only if available.

### Exit criteria

- User can self-diagnose common access issues.
- Support packet never includes secrets/full keys/tokens.
- Updates and notifications do not expose locked content.

---

## 12. Phase 10 - QA, security, and production hardening

### Goal

Prove the product is safe and stable before launch.

### Work

- Manual verification matrix:
  - anonymous free and locked browsing;
  - logged-in no access;
  - valid/invalid key redemption;
  - manual grant/revoke;
  - Patreon active/no-tier/pending/expired;
  - direct locked chapter URL;
  - refresh on every route;
  - responsive desktop/tablet/phone;
  - no hover-only critical controls.
- Security checks:
  - direct chapter table select cannot fetch locked content;
  - RPC denies unauthorized content;
  - catalog contains no full protected text;
  - browser state does not cache locked content for unauthorized users;
  - access key plaintext is not stored/logged;
  - OAuth state validation works.
- Performance checks:
  - avoid fetching all chapter bodies;
  - avoid loading demo data in production;
  - lazy-load expensive sections if needed;
  - reduce route waterfalls with optional dashboard RPC later.
- Documentation:
  - update `docs_v2/reader/subscription_spa.md`;
  - update `docs_v2/reader/functions.md`;
  - update `docs_v2/reader/api_map.md`;
  - update `docs_v2/shared/database.md`;
  - run `npm run compile-docs`;
  - update `CHANGELOG.md`.

### Exit criteria

- Manual verification passes.
- Docs match implementation.
- No known locked-content leak path remains.

---

## 13. Phase 11 - Release rollout

### Goal

Launch without risking the main public reader.

### Work

- Keep subscription reader as a separate route/file from `index.html`.
- Deploy Supabase migration and Edge Functions to staging first.
- Configure required env secrets:
  - Supabase URL/keys;
  - Patreon client id/secret;
  - Patreon redirect URI;
  - state secret;
  - webhook secret if used.
- Seed test tiers and provider mappings.
- Create test chapters in all access states.
- Soft-launch with access keys/manual grants before trusting Patreon alone.
- Add link from main archive only after basic flows pass.

### Exit criteria

- Staging works end-to-end.
- Production launch can be rolled back by removing links/disabling provider mapping without breaking `index.html`.

---

## 14. Later phase - Payment/provider adapters beyond Patreon

Keep this explicitly later for now.

Potential adapters:

- Razorpay native adapter for India-first INR/UPI/subscriptions;
- Ko-fi webhook adapter;
- PayPal adapter;
- Discord role/member sync;
- PMPro/WordPress sidecar bridge if useful;
- generic automation webhook.

Rule: every future provider writes the same normalized entitlement model. No provider should change the reader's chapter access logic.

---

## 15. Immediate next sprint recommendation

Do these first:

1. Clean and import Aether Pages UI into the real subscription surface.
2. Split mock monolith into modules/adapters.
3. Preserve routes and UI richness while removing mock persona/data assumptions.
4. Wire Supabase auth.
5. Wire real story/catalog/content reads.
6. Enforce locked-content RPC security.
7. Then wire access keys.
8. Then Patreon.

This avoids building backend against the old mediocre scaffold and avoids spending more time inventing UI when `aether-pages` already has the stronger product model.

