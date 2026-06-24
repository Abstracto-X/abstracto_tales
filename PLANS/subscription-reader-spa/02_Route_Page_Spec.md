# Subscription Reader SPA - Route and Page Specification

This document defines every planned route, its purpose, content modules, layout, states, CTAs, data needs, and mobile behavior.

## Shared shell

### Global shell anatomy

- **App backdrop:** low-motion gradient with optional story accent glow. No particle canvas by default.
- **Desktop rail:** compact logo, primary nav, account/access status chip.
- **Top bar:** back button, current surface title, account chip, optional compact entitlement badge.
- **Stage:** scrollable route container.
- **Mobile bottom nav:** Library, Updates, Access, Account.
- **Toast region:** reuses project toast convention.
- **Auth dialog:** sign in/sign up with Supabase session.
- **Reader bottom sheet:** only available on reading/preview surfaces.

### Shared data assumptions

- Stories come from published `stories`.
- Chapter catalogs come from `get_chapter_catalog` RPC once migration is installed.
- Full chapter content comes only from `get_reader_chapter` RPC.
- Entitlements come from `get_my_entitlements` RPC.
- Provider connection status should eventually come from provider connection/entitlement summary RPC, not direct token access.

---

## `#/home` - Member dashboard

### Purpose

First impression for the member SPA. It should say: this is the lighter supporter library, here is what you can read, here is your access state, and here is the latest activity.

### Layout

Desktop:

1. Hero/dashboard band split into 60/40 columns.
2. Left: welcome copy, primary CTAs, latest highlighted story/chapter.
3. Right: access status card with sign-in/connect/redeem actions.
4. Below: Continue Reading row, Latest Updates row, Featured Stories row.

Mobile:

1. Compact hero card.
2. Access status card directly under hero.
3. Horizontal scroll `Continue Reading` cards.
4. Latest updates list.
5. Featured story cards.

### Content modules

- **Hero title:** `Aether Member Library`.
- **Subtitle:** explains lighter supporter reading.
- **Primary CTA:** `Browse library` or `Continue reading`.
- **Secondary CTA:** `Manage access`.
- **Access status card:** guest/account/member/expired state.
- **Continue reading:** localStorage-backed last chapters; if absent, show `Start with Library`.
- **Latest releases:** 3-5 recent chapters across stories with access badges.
- **Supporter prompt:** Patreon + access-key dual CTA.

### States

- Guest: sign-in prompt and locked explanation.
- Logged in, no entitlement: account active, no grants.
- Active entitlement: show highest tier and expiry/renewal.
- Expired entitlement: show renew/redeem CTAs.
- Empty library: show graceful setup message.

### Data needs

- story list;
- chapter catalogs for newest releases;
- entitlements;
- local reading progress.

### Acceptance criteria

- A guest can reach library, access, and sign-in from above the fold.
- A member can jump to a readable recent/continued chapter in one tap.
- No layout depends on hover.

---

## `#/library` - Story library

### Purpose

Browse all published series available in the member SPA.

### Layout

- Page heading with description.
- Filter/search row (phase 2): status, genre, member content, updated recently.
- Responsive story grid.
- Each story card uses cover art, accent color, title, status, short description, chapter/member counts.

### Story card content

- Cover image.
- Story title.
- Status (`Ongoing`, `Complete`, etc.).
- Genre/short description.
- Chapter count.
- Locked/member count.
- Last updated date if available.
- CTA: `Open story`.
- Secondary link: `Main archive` for world-building content.

### Mobile behavior

- Cards stack vertically or 2-up on larger phones.
- Cover image can be wide thumbnail instead of tall poster to reduce scroll length.
- Filters collapse into a bottom sheet after phase 2.

### Empty/error states

- No published stories.
- Failed story fetch.
- All stories filtered out.

---

## `#/story/:slug` - Story member hub

### Purpose

A premium landing page for one story inside the member library.

### Layout

Desktop:

1. Story hero with cover left and copy/actions right.
2. Facts strip: chapters, locked/member chapters, status, latest update.
3. Access summary card: your access to this story.
4. Start/continue module.
5. Recent chapter cards.
6. Links to chapters, updates, main archive.

Mobile:

1. Poster/cover banner.
2. Title and synopsis.
3. Sticky CTA cluster: Continue/Open chapters/Unlock.
4. Facts chips.
5. Recent chapters.

### Content modules

- Story cover/background.
- Story title and genre/status.
- Synopsis.
- Access summary: guest/no access/tier active/expired/pending provider sync.
- Continue reading card: last opened chapter, progress percent if tracked, fallback to first readable chapter.
- Recent chapter shelf with access badges.
- `Main archive` link back to `index.html#/story/:slug`.

### CTAs

- `Continue reading` when progress exists.
- `Open chapters` always.
- `Unlock member chapters` when locked chapters exist and user lacks access.
- `Main archive` as secondary.

### Data needs

- story row;
- chapter catalog;
- entitlements;
- reading progress localStorage.

---

## `#/story/:slug/chapters` - Chapter shelf

### Purpose

Full chapter catalog with clear access state for every chapter.

### Layout

- Compact story header with back-to-story.
- Optional filter chips: All, Readable, Locked, Early access, Free.
- Chapter cards in chronological order.
- Sticky mobile unlock/read CTA when a selected/target chapter is locked.

### Chapter card anatomy

- Chapter number/order.
- Title.
- Access badge.
- Release/public date.
- Word count or estimated reading time.
- Preview teaser (safe public text only).
- State-specific helper line.
- Primary action.

### Chapter states and copy

- `free`: `Public chapter` + `Read now`.
- `unlocked`: `Included in your access` + `Read now`.
- `free_preview`: `Preview available` + `Read preview` + `Unlock full chapter`.
- `locked_tier`: `Requires {Tier}` + `Unlock`.
- `early_access`: `Public on {date}` + `Read with {Tier}`.
- `key_locked`: `Access key required` + `Redeem key`.
- `pending_sync`: `Provider sync pending` + `Refresh access`.
- `expired`: `Access expired` + `Renew or redeem key`.

### Security rule

Chapter cards may show metadata and safe preview text. They must not embed full protected content in hidden DOM, data attributes, JSON blobs, blur layers, or client caches.

---

## `#/story/:slug/chapter/:chapterId` - Reader

### Purpose

Read authorized chapter content comfortably.

### Authorized layout

- Mini reader header: back to chapters, story title, chapter number/title, access badge.
- Reading progress bar.
- Center reading column.
- Previous/Next footer.
- Floating/Sticky `Reader` controls button.
- Bottom sheet controls: theme, font size, line width, chapter list shortcut, return to story, report/access help link.

### Desktop enhancements

- Optional right-side reading context card: entitlement status, next public release, keyboard shortcuts.
- Optional collapsible chapter rail in later phase.

### Mobile behavior

- Header condenses to one or two lines.
- Reader controls open as bottom sheet.
- Previous/Next controls remain reachable near the bottom.
- Bottom nav may hide during scroll or remain offset below reader actions; avoid overlapping content.

### Unauthorized layout

If `get_reader_chapter` denies content or returns no content:

- Show access gate, not raw error.
- Preserve `pendingReturnRoute`.
- Show story/chapter context and required tier.
- Provide sign-in/Patreon/key CTAs.

### Reader comfort requirements

- Respect saved theme and scale.
- Line length should be readable: roughly 60-78 characters desktop, full comfortable width on mobile.
- Paragraph spacing larger than main archive if needed.
- No aggressive glow behind text.

---

## `#/story/:slug/preview/:chapterId` - Preview

### Purpose

Show safe public preview content for locked chapters.

### Layout

- Preview header with story/chapter.
- Preview text block in reader-like typography.
- Clear divider: `Preview ends here`.
- Unlock panel with required tier and actions.
- Back to chapters.

### Data rules

- Preview text must be a separate safe field (`preview_text`) or returned by catalog RPC.
- Never derive preview by fetching full locked content client-side.

---

## `#/updates` - Recent updates and release feed

### Purpose

Let supporters see what changed recently and what is coming next.

### Layout

- Page heading.
- Segmented tabs (phase 2): `Recent`, `Coming soon`, `Public releases`.
- Update cards grouped by story/date.
- Each update card has story, chapter, access state, date, CTA.

### Update card content

- Story title.
- Chapter title/order.
- Published date or public release date.
- Access badge.
- Helper text: readable now, locked until entitlement, early access until date, or public release scheduled.
- CTA: `Read`, `Preview`, `Unlock`, or `Open story`.

### Future calendar mode

A monthly/weekly release calendar can be added after reliable release dates exist. Until then, route can remain a list feed.

---

## `#/tiers` - Tier guide

### Purpose

Explain internal access tiers in a provider-neutral way.

### Layout

- Heading: `Member access levels`.
- Tier cards ordered by rank.
- Each tier card includes name, description, rank, active status, provider mapping hints, and CTA.
- FAQ snippet: higher-tier-includes-lower-tier behavior if enabled.

### CTAs

- `Connect Patreon`.
- `Redeem key`.
- `View access help`.

### Data needs

- `reader_access_tiers` rows.
- Optional provider mapping summary.

---

## `#/access` - Access hub

### Purpose

Main place to unlock, sync, or understand access.

### Layout

Desktop:

- Access status summary wide card.
- 2x2 provider/action grid.
- Troubleshooting/help panel.

Mobile:

- Status card first.
- Primary recommended action card next.
- Remaining cards stacked.

### Cards

1. **Patreon** - not connected, connected/pending, active, no matching tier, expired.
2. **Access key** - redeem beta, gift, reviewer, or recovery key.
3. **Manual author grant** - explains author-granted access appears automatically after sign-in.
4. **Future providers** - Ko-fi, PayPal, Discord: roadmap or hidden until configured.
5. **Help** - common issues and link to `#/help/access`.

### State copy examples

- Guest: `Sign in first so access can attach to your reader account.`
- No access: `No active grants found yet.`
- Active: `You currently have {Tier} access from {source}.`
- Pending: `Your provider is linked; sync is still being verified.`
- Expired: `Your previous access expired on {date}.`

---

## `#/access/patreon` - Patreon connection

### Purpose

Focused provider route for Patreon OAuth and sync explanation.

### Layout

- Patreon explainer card.
- What happens next checklist:
  1. Sign in to reader account.
  2. Go to Patreon authorization.
  3. Membership tier maps to internal access tier.
  4. Return to member library.
- Connection status panel.
- Primary CTA.
- Secondary `Redeem key instead`.
- Troubleshooting link.

### States

- Guest: CTA opens auth first.
- Signed in not connected: `Connect Patreon`.
- OAuth starting: inline loading status.
- Connected no tier: `Connected, no qualifying tier found`.
- Connected active: `Patreon access active`.
- Error/cancelled: clear recovery copy.

---

## `#/access/key` - Access key redemption

### Purpose

Redeem a beta/gift/reviewer/recovery key.

### Layout

- Key explainer.
- Input field with formatting hint.
- Redeem button.
- Inline status.
- Security note: keys attach to signed-in account.
- After success: entitlement summary and return CTA.

### Behavior

- If guest, opening redeem prompts sign-in and preserves route.
- Trim whitespace and normalize case before submit if backend expects it.
- Do not log full key in console/toasts.
- After success, refresh entitlements and return to pending chapter when present.

### Error states

- empty input;
- invalid key;
- expired key;
- revoked key;
- max uses reached;
- already redeemed;
- user not signed in;
- RPC/network failure.

---

## `#/access/success` - Access success

### Purpose

Confirm that access changed and give a next best action.

### Layout

- Success headline.
- Entitlement summary.
- Primary CTA: `Continue to chapter` if pending return exists, otherwise `View entitlements`.
- Secondary CTA: `Browse library`.
- Optional sync-delay explanation for provider grants.

---

## `#/account` - Account dashboard

### Purpose

Identity and status summary.

### Layout

- Profile card: display name/email/avatar if available.
- Current access card.
- Provider connections summary.
- Recent keys/grants summary.
- Quick actions: View entitlements, Connect Patreon, Redeem key, Sign out.

### Guest state

- Gate with sign-in CTA and explanation that entitlements attach to an account.

---

## `#/account/entitlements` - Entitlement detail

### Purpose

Detailed list of active, expired, revoked, and pending access grants.

### Layout

- Status summary at top.
- Entitlement list grouped by status.
- Each row: tier name, source/provider, valid from/until, status, story/chapter scope if limited, audit-safe note/campaign label.
- Provider connections list.
- Redeemed keys list without plaintext key.

### CTAs

- `Sync Patreon`.
- `Redeem another key`.
- `Access help`.

---

## `#/help/access` - Access help

### Purpose

Reduce support burden by explaining how access works.

### Layout

- Quick answers accordion/list:
  - Why is a chapter locked?
  - I support on Patreon but cannot read.
  - My access key failed.
  - My entitlement expired.
  - Can I use Ko-fi/PayPal/Discord?
  - Why can I see a locked chapter card?
- Contact/admin instruction placeholder.
- Links to Access, Patreon, Key, Account.

### Copy rules

Be direct. Avoid blaming the reader. Every error should provide a next action.
