# Reader Subscription SPA Plan

## Detailed Planning Pack

This executive plan is expanded into a full implementation-grade documentation set under [`PLANS/subscription-reader-spa/`](subscription-reader-spa/):

- [`README.md`](subscription-reader-spa/README.md) - index and reading order.
- [`00_Product_Brief.md`](subscription-reader-spa/00_Product_Brief.md) - product direction, audience, success criteria, boundaries.
- [`01_Information_Architecture.md`](subscription-reader-spa/01_Information_Architecture.md) - route hierarchy, navigation, journeys, auth/access behavior.
- [`02_Route_Page_Spec.md`](subscription-reader-spa/02_Route_Page_Spec.md) - every page, content module, layout, state, CTA, and data requirement.
- [`03_Design_System_And_Mobile.md`](subscription-reader-spa/03_Design_System_And_Mobile.md) - visual language, responsive/mobile rules, component specs, accessibility.
- [`04_Access_Entitlements_Backend.md`](subscription-reader-spa/04_Access_Entitlements_Backend.md) - entitlement model, access states, backend/RPC/RLS, provider adapters, admin workflow.
- [`05_Reader_Experience.md`](subscription-reader-spa/05_Reader_Experience.md) - chapter reader, preview reader, controls, progress, end-of-chapter logic.
- [`06_States_Errors_Loading.md`](subscription-reader-spa/06_States_Errors_Loading.md) - loading, empty, error, auth, provider, key, and degraded-network states.
- [`07_Feature_Backlog_And_Acceptance.md`](subscription-reader-spa/07_Feature_Backlog_And_Acceptance.md) - backlog, phased delivery, acceptance criteria, manual verification.

## 1. Purpose

Create a separate, lighter reader-focused SPA for subscription and access-key based fiction delivery. This app should sit beside the current public reader rather than replace it immediately.

The current reader remains the rich cinematic archive for public browsing, galleries, maps, lore, and timeline exploration. The subscription reader becomes the focused membership library for reading chapters, tracking updates, managing access, and connecting supporter accounts.

Primary v1 goal: **tiered chapter access** with Patreon as the first production provider, plus access keys and manual grants as first-class authorization paths.

---

## 2. Product Direction

### Goals

- Build a dedicated subscription reader SPA instead of cramming access workflows into the existing reader hub.
- Preserve Aether / Abstracto identity through typography, story colors, cover art, and soft glass surfaces.
- Make the experience lighter, faster, and easier to read than the main cinematic site.
- Support multi-page SPA flows for library discovery, reading, updates, access management, and account status.
- Normalize all access sources into one entitlement model: Patreon, access keys, manual grants, Discord, Ko-fi, PayPal, or automation.
- Keep locked content secure through Supabase RLS/RPC/backend logic, not frontend hiding or CSS blur.

### Non-goals for v1

- Replacing `index.html` or removing the current reader SPA.
- Gating every world-building surface immediately. V1 focuses on chapters.
- Building a full payment processor UI in the browser.
- Storing provider secrets, webhook secrets, access-key plaintext, or private payment data in frontend JavaScript.
- Adding a frontend framework, bundler, or build step.

---

## 3. Relationship to the Existing Reader SPA

The new subscription reader should reuse current project conventions without inheriting all current visual weight.

Recommended surface:

- New shell file, e.g. `subscription.html` or `reader.html` after final naming is chosen.
- New ES module folder, e.g. `js/subscription/`, to keep subscription routing and entitlement logic separate.
- New stylesheet or scoped CSS section, e.g. `subscription.css`, only if explicitly approved during implementation. If avoiding a new stylesheet, scope all subscription styles under a top-level app class.
- Same Supabase client pattern and session-based auth model.
- Same documentation discipline once implementation begins.

Reuse patterns from the current reader:

- Hash router with route cleanup and timeout handling.
- `DB` wrapper around Supabase calls.
- `UserAuth` style profile/session synchronization.
- Story accent colors through CSS variables.
- Toast/modal conventions.

Do not reuse unchanged:

- Heavy map/HUD console styling.
- Particle-heavy background treatment.
- Hover-only card reveals.
- Dense sidebar reading layouts as the primary mobile pattern.

---

## 4. Visual Direction

Target identity: **premium serial-fiction member library**.

Keep brand continuity:

- Cinzel-style headings for title moments.
- Lora-style long-form reading typography.
- Montserrat-style UI labels and metadata.
- Story-specific `--accent-color` treatment.
- Cover-art and background-art driven story pages.
- Soft glass panels and subtle border highlights.

Lighten the experience:

- Reduce pure black backgrounds in favor of dark ink, muted navy, parchment-dark, and smoky gradients.
- Reduce glow intensity and animation density.
- Avoid console/HUD chrome except for small status badges.
- Prefer spacious cards, clean lists, clear hierarchy, and readable surfaces.
- Use accent colors as highlights, not full-screen neon systems.

Recommended tokens:

```txt
--sub-bg: #090b10;
--sub-surface: rgba(255,255,255,0.075);
--sub-surface-strong: rgba(255,255,255,0.12);
--sub-reader-bg: #f4ead8 or #11131a depending theme;
--sub-text: #f5f1e8;
--sub-muted: rgba(245,241,232,0.68);
--sub-border: rgba(255,255,255,0.14);
--accent-color: story/theme specific;
```

Reader themes should include at least:

- Dark archive
- Warm parchment
- High contrast

---

## 5. Mobile-First Layout Strategy

The subscription SPA should be designed mobile-first and enhanced for desktop.

### Global navigation

Mobile bottom nav:

- Library
- Updates
- Access
- Account

Rules:

- Respect `safe-area-inset-bottom`.
- Minimum 44px tap targets.
- Icons must have text labels.
- Active route should be visually obvious.
- Do not rely on hover states for critical controls.

Desktop enhancement:

- Convert bottom nav into a left rail or compact top nav.
- Keep account/access status visible in the header.
- Allow wider story and chapter grids.

### Story and chapter lists

- Use chapter cards instead of a dense sidebar by default.
- Cards show title, order, status, required tier, release date, excerpt/teaser, and primary CTA.
- Locked chapters remain visible.
- Unlocked cards prioritize `Read now`.
- Locked cards prioritize one action: `Connect Patreon`, `Redeem Key`, `Upgrade`, or `Sync Access`.

### Reading view

Mobile:

- Sticky mini header: back, story title, chapter title/position, access badge.
- Bottom sheet for reader controls: font size, theme, line width, chapter list, comments if included.
- Sticky next/previous controls at safe bottom edge.

Desktop:

- Centered reading column.
- Optional collapsible chapter rail.
- Access/account status in a light right-side panel only when useful.

---

## 6. SPA Route Map

Recommended hash routes:

```txt
#/home
#/library
#/story/:slug
#/story/:slug/chapters
#/story/:slug/chapter/:chapterId
#/story/:slug/preview/:chapterId

#/updates
#/calendar
#/tiers
#/tier/:tierSlug

#/access
#/access/patreon
#/access/key
#/access/success
#/access/pending
#/access/error

#/account
#/account/profile
#/account/entitlements
#/account/keys
#/account/sessions

#/help
#/help/access
#/help/patreon
```

### Main flows

Discovery:

```txt
#/home -> #/library -> #/story/:slug -> #/story/:slug/chapters
```

Reading:

```txt
chapter card -> #/story/:slug/chapter/:chapterId
```

Locked chapter:

```txt
locked chapter -> access gate -> Patreon / access key / sign in -> return to requested chapter
```

Patreon:

```txt
#/access/patreon -> OAuth start -> callback -> sync -> #/access/success -> return target
```

Access key:

```txt
#/access/key -> redeem -> #/access/success -> return target
```

Account:

```txt
#/account -> #/account/entitlements -> provider status / redeemed keys / expiry dates
```

---

## 7. Reader Access States

Chapter cards and chapter routes should use explicit access states.

| State | Meaning | Primary UI |
| --- | --- | --- |
| `free` | Public chapter, no login needed | `Read now` |
| `unlocked` | Current user has entitlement | `Read now` |
| `free_preview` | Safe excerpt available but full chapter locked | `Read preview` + unlock CTA |
| `locked_tier` | Requires a specific internal tier | `Requires {Tier}` + unlock CTA |
| `early_access` | Public later, supporter-only now | Release date + supporter CTA |
| `key_locked` | Access-key campaign chapter | `Redeem key` |
| `pending_sync` | Provider linked but entitlement not confirmed yet | `Sync access` / pending status |
| `expired` | User had access but grant expired | `Renew access` |

Rules:

- Locked chapters stay visible in lists.
- Locked full content must never be returned to the browser.
- Safe preview/excerpt text must be stored separately or generated server-side as intentionally public data.
- A locked direct chapter URL should render a gate, not a generic not-found state.
- After successful unlock, route back to the original chapter.

---

## 8. Access UX Patterns

### Access gate layout

Access gates should include:

- Story/chapter context.
- Required tier badge.
- Brief explanation of why the chapter is locked.
- One primary recommended CTA.
- Secondary access-key CTA.
- Sign-in prompt when anonymous.
- Provider/account status if logged in.

Example states:

```txt
Anonymous + locked:
Sign in to check access, connect Patreon, or redeem an access key.

Logged in + no entitlement:
This chapter requires Voyager tier. Connect Patreon or redeem a key.

Patreon linked + pending:
Your Patreon is linked. Sync is pending; try Refresh Access.

Expired:
Your previous access expired on {date}. Renew or redeem a key.
```

### Account entitlement dashboard

Show:

- Current Supabase profile.
- Linked providers.
- Active internal tier.
- Entitlement source: Patreon, access key, manual grant, Discord, Ko-fi, PayPal.
- Expiry/renewal date.
- Last provider sync time.
- Redeemed keys list without showing full key values.

---

## 9. Backend and Data Model Plan

### Core tables

Recommended tables:

- `reader_access_tiers`
  - Internal tier definitions and rank/order.
- `user_entitlements`
  - Active/expired user access grants.
- `provider_connections`
  - Links Supabase users to provider identities.
- `provider_tier_mappings`
  - Maps Patreon/Ko-fi/PayPal/Discord provider tiers/roles/products to internal tiers.
- `access_keys`
  - Hashed access keys, status, tier, max uses, expiry.
- `access_key_redemptions`
  - Redemption history by user/key.
- `entitlement_audit_log`
  - Manual grant, webhook, sync, redemption, expiry, revoke events.

### Existing table changes

Add to `chapters`:

- `required_tier_id UUID NULL REFERENCES reader_access_tiers(id)`
- Optional `public_release_at TIMESTAMPTZ NULL`
- Optional `preview_text TEXT NULL`

Default migration:

- Existing published chapters get `required_tier_id = NULL` and remain free.

### RPCs / server functions

Use secure RPCs for reader access:

- `get_chapter_catalog(story_id)`
  - Returns chapter metadata, lock status, tier labels, preview fields, and release data.
- `get_reader_chapter(chapter_id)`
  - Returns full chapter content only if public, admin, or entitled.
- `get_my_entitlements()`
  - Returns current user entitlement summary.
- `redeem_access_key(code)`
  - Hashes and validates code server-side, records redemption, grants entitlement.
- `refresh_provider_access(provider)`
  - Starts or triggers provider sync when allowed.

### RLS requirements

- Raw public/client access to locked `chapters.content` must be blocked.
- Admins keep full chapter access.
- Readers only access locked content through RPCs that verify entitlement.
- Access-key plaintext is never stored.
- Provider tokens/secrets are never exposed to browser clients.

---

## 10. Provider and Automation Strategy

Use Supabase Edge Functions as the provider adapter boundary.

Initial functions:

- `patreon-oauth-start`
- `patreon-oauth-callback`
- `provider-webhook`
- `sync-provider-entitlements`
- `redeem-access-key` if redemption is not handled only through RPC

Provider adapter contract:

```txt
provider
provider_user_id
provider_account_label
provider_tier_or_role_id
internal_tier_id
status
valid_from
valid_until
raw_event_reference
```

Priority:

1. Patreon OAuth + tier sync.
2. Access keys and manual grants.
3. Patreon webhooks for ongoing updates.
4. Ko-fi and PayPal webhooks.
5. Discord role verification or bot-driven sync.
6. Make/Zapier/custom automation posting normalized entitlement updates.

All providers must write normalized `user_entitlements`; reader UI should not care which provider granted access.

---

## 11. Admin / Author Workflow Requirements

Admin CMS should eventually support:

- Create/edit internal access tiers.
- Assign required tier to each chapter.
- Set optional public release date for early-access chapters.
- Add safe preview text.
- Generate access keys:
  - tier
  - expiry
  - max uses
  - campaign/note
  - single-use or multi-use
- Revoke access keys.
- View key redemptions.
- Manually grant/revoke user entitlement.
- Configure provider-tier mappings.
- View entitlement audit log.

Provider mapping must live in database/admin config, not hardcoded frontend logic.

---

## 12. UI Component Inventory

Suggested components for the subscription SPA:

- App shell
- Bottom nav / desktop nav rail
- Mobile mini header
- Library story card
- Story hero card
- Chapter card
- Tier badge
- Access gate panel
- Access status card
- Provider connection card
- Access-key redemption form
- Entitlement dashboard list
- Reader page
- Reader controls bottom sheet
- Toast/status banner
- Empty state panel
- Pending sync panel
- Error recovery panel

---

## 13. Error, Empty, and Pending States

Required states:

- No stories available.
- Story not found.
- Chapter not found.
- Chapter exists but locked.
- User signed in but profile still syncing.
- Provider OAuth cancelled.
- Provider linked but no qualifying membership found.
- Provider webhook/sync pending.
- Access key invalid.
- Access key expired.
- Access key already redeemed.
- Access key max uses reached.
- Entitlement expired.
- Network/RPC timeout.

All states should use existing toast/status conventions where applicable, with inline recovery actions.

---

## 14. Rollout Phases

### Phase 1: Planning and visual prototype

- Create subscription SPA shell plan and visual direction.
- Prototype route map with mock data.
- Validate mobile bottom nav, chapter cards, access gates, and reader controls.

### Phase 2: Local SPA implementation with mock entitlements

- Add separate SPA shell and scoped modules.
- Implement routes and mock access states.
- Verify mobile layouts manually.

### Phase 3: Supabase schema and RPCs

- Add tier/access tables.
- Add chapter tier fields.
- Add RLS/RPC access boundary.
- Migrate existing chapters as free.

### Phase 4: Admin workflows

- Add tier selection to chapter form.
- Add access-key management.
- Add manual grant tools.
- Add provider mapping tools.

### Phase 5: Patreon integration

- Add Edge Functions for OAuth and sync.
- Normalize Patreon memberships into entitlements.
- Add account/provider status UI.

### Phase 6: Additional providers and automation

- Add Ko-fi, PayPal, Discord, and automation adapters.
- Keep all reader gating unchanged by writing the same entitlement model.

---

## 15. Manual Verification Plan

### Anonymous reader

1. Open the subscription SPA home route.
2. Open Library.
3. Open a story with mixed free and locked chapters.
4. Confirm free chapter cards show `Read now`.
5. Confirm locked chapter cards are visible with required tier badges.
6. Open a free chapter and confirm content renders.
7. Open a locked chapter and confirm an access gate renders.
8. Confirm locked full content is not present in page source or client state.

### Logged-in reader without access

1. Sign in as a normal reader.
2. Open a locked chapter.
3. Confirm the gate shows account context and required tier.
4. Confirm available actions include Patreon connection and access-key redemption.
5. Confirm direct route refresh keeps the user on an appropriate gate.

### Access-key redemption

1. Open `#/access/key`.
2. Enter a valid key.
3. Confirm success state and entitlement summary.
4. Confirm the app returns to the originally requested locked chapter.
5. Try an expired/revoked/maxed key and confirm clear error copy.

### Patreon-linked reader

1. Start Patreon connection from `#/access/patreon`.
2. Complete provider callback.
3. Confirm provider connection appears under account entitlements.
4. Confirm qualifying tier unlocks matching chapters.
5. Confirm non-qualifying tier leaves higher chapters locked.

### Expired or revoked entitlement

1. Use a test user with an expired entitlement.
2. Confirm previously unlocked chapters now show `expired` or `renew access` state.
3. Confirm free chapters remain readable.

### Mobile layout

1. Test at phone width.
2. Confirm bottom nav appears with Library, Updates, Access, Account.
3. Confirm all primary buttons meet large tap target expectations.
4. Confirm story/chapter pages do not require hover.
5. Confirm reader controls open as a bottom sheet.
6. Confirm sticky CTA and bottom nav respect safe-area spacing.

---

## 16. Risks and Open Questions

Risks:

- Provider APIs and webhook payloads can change; isolate them behind Edge Function adapters.
- RLS mistakes could expose locked content; prioritize database tests/manual raw-query checks.
- Access-key abuse if keys are stored or logged in plaintext; hash keys and avoid showing full values after creation.
- Current direct chapter query patterns must not remain available for locked content.
- A second reader SPA can duplicate UI/auth logic if boundaries are not kept clean.

Open questions before implementation:

- Final app filename: `subscription.html`, `reader.html`, or another route.
- Whether previews are manually authored or generated during publishing.
- Tier rank semantics: strict tier match or higher-tier-includes-lower-tier.
- Whether chapter access is story-specific, global, or both.
- Whether Discord role verification is account-link based or bot/automation based.
- Whether PayPal is one-time purchases, subscriptions, or both.

---

## 17. Assumptions

- Use the existing `PLANS/` directory.
- This file is a planning artifact only.
- Do not create a literal `plans.md` directory.
- No `docs_v2` or `CHANGELOG.md` update is required for this planning-only artifact.
- Full docs/database updates become mandatory when implementation begins.


