# Subscription Reader SPA - Feature Backlog and Acceptance Criteria

## 1. Phase roadmap

### Phase 0 - Documentation and product spec

Deliverables:

- detailed planning pack;
- route/page spec;
- design/mobile spec;
- access/backend/admin spec;
- reader-experience spec;
- states/errors spec;
- acceptance matrix.

Acceptance:

- every route has purpose, modules, states, and CTAs;
- locked content security rule is explicit;
- mobile behavior is specified;
- admin/provider requirements are specified.

### Phase 1 - Polished SPA shell and rich mockable UX

Deliverables:

- separate `subscription.html` shell;
- mobile bottom nav;
- desktop rail/topbar;
- route dispatcher;
- polished home/library/story/chapter/access/account layouts;
- reader bottom sheet;
- local reading progress.

Acceptance:

- mobile page does not feel like a desktop squeeze;
- every primary route has more than placeholder content;
- cards and CTAs are state-aware;
- reader controls are usable on touch screens.

### Phase 2 - Secure Supabase access foundation

Deliverables:

- access tier tables;
- entitlement tables;
- access key tables;
- provider connection/mapping tables;
- chapter access columns;
- RLS updates;
- catalog/content/entitlement/key RPCs.

Acceptance:

- unauthorized user cannot direct-query locked chapter content;
- catalog can show locked metadata without content;
- valid entitlement returns content;
- expired/revoked entitlement loses access;
- key redemption grants access and records audit.

### Phase 3 - Admin/author workflows

Deliverables:

- tier CRUD;
- chapter required tier/public release/preview fields;
- access key generate/revoke;
- manual grant/revoke;
- provider mapping config;
- audit visibility.

Acceptance:

- admin can configure a locked chapter without editing SQL;
- admin can generate a key and redeem it as test reader;
- admin can revoke entitlement and reader loses access;
- provider mapping is not hardcoded in frontend.

### Phase 4 - Patreon production integration

Deliverables:

- OAuth start/callback;
- state validation;
- membership tier fetch;
- mapping to internal tier;
- entitlement write;
- account status UI;
- webhook or sync refresh path.

Acceptance:

- signed-in reader can connect Patreon;
- qualifying Patreon tier unlocks mapped chapters;
- non-qualifying tier returns clear no-access state;
- callback returns to access success/pending/error route;
- no provider secrets exposed in browser.

### Phase 5 - Update feed, release polish, and progress

Deliverables:

- recent update feed;
- coming/public release grouping;
- continue reading;
- local progress bar;
- read-state indicators;
- story hub progress.

Acceptance:

- reader can resume last chapter;
- updates page tells what is new and what is locked;
- chapter cards show read/unread/progress where possible.

### Phase 6 - Additional providers and automation

Deliverables:

- Ko-fi adapter;
- PayPal adapter;
- Discord role adapter;
- generic automation webhook contract;
- provider mapping admin support.

Acceptance:

- each provider writes normalized entitlements;
- reader UI remains unchanged except provider cards/status;
- revokes/expiry are audited.

## 2. Feature backlog

### P0 - Must have

- Separate SPA shell.
- Mobile bottom nav.
- Route map from plan.
- Story library.
- Story detail.
- Chapter catalog with lock states.
- Secure content fetch boundary.
- Access gate.
- Access key redemption.
- Patreon connect entry.
- Account entitlement summary.
- Admin tier assignment and keys.
- Documentation and manual verification.

### P1 - Should have

- Continue reading.
- Reader progress bar.
- Reader theme/scale/line width.
- Update feed with recent chapters.
- Tier guide.
- Detailed entitlement page.
- Provider status cards.
- Pending sync and expired states.
- Better empty/error states.

### P2 - Nice to have

- Release calendar.
- Chapter filters.
- Bookmarks.
- Offline-ish local cache for metadata only.
- Keyboard shortcuts desktop.
- Multiple language/localization copy hooks.
- Gift-key campaign landing route.

## 3. Acceptance checklist by route

- `#/home`: dashboard, access status, continue/latest/library entry.
- `#/library`: story grid with clear cards.
- `#/story/:slug`: hero, facts, access summary, recent chapters.
- `#/story/:slug/chapters`: full catalog, badges, CTAs, no protected content.
- `#/story/:slug/chapter/:chapterId`: authorized reader or gate.
- `#/story/:slug/preview/:chapterId`: safe preview only.
- `#/updates`: recent release list with lock states.
- `#/tiers`: tier explanations from database.
- `#/access`: access hub with status and actions.
- `#/access/patreon`: provider-specific connection flow.
- `#/access/key`: redemption form and errors.
- `#/access/success`: confirmation and next action.
- `#/account`: profile/access summary.
- `#/account/entitlements`: detailed grants/providers/keys.
- `#/help/access`: troubleshooting and links.

## 4. Manual verification scenarios

### Anonymous reader - catalog and locks

1. Open `subscription.html#/home`.
2. Confirm hero, access status, and story cards render.
3. Open Library.
4. Open a story with mixed chapters.
5. Confirm free and locked cards are both visible.
6. Confirm locked cards show tier badges and unlock actions.
7. Open free chapter; content renders.
8. Open locked chapter; gate renders.
9. Confirm protected content is not visible in DOM or client state.

Expected:

- Anonymous can browse metadata.
- Anonymous cannot fetch locked content.
- Gate offers sign-in and key/access actions.

### Logged-in reader without access

1. Sign in as a normal reader.
2. Open locked chapter.
3. Confirm account-aware gate copy.
4. Confirm Patreon and key CTAs appear.
5. Refresh the direct URL.
6. Confirm route still shows gate, not broken state.

Expected:

- Login persists.
- No entitlement means no content.
- Return route is preserved for post-unlock.

### Access key redemption

1. Sign in.
2. Go to `#/access/key`.
3. Enter valid key.
4. Confirm success state.
5. Confirm entitlement appears in account.
6. Return to locked chapter.
7. Confirm chapter now reads.
8. Try invalid/expired/revoked/maxed key.

Expected:

- Valid key grants access.
- Invalid keys show direct errors.
- Plaintext key is not displayed in logs or reused UI.

### Patreon entitlement sync

1. Sign in.
2. Open `#/access/patreon`.
3. Click connect.
4. Complete OAuth in provider sandbox.
5. Return to SPA.
6. Confirm entitlement summary.
7. Open mapped locked chapter.
8. Test a non-qualifying tier.

Expected:

- Qualifying tier unlocks.
- Non-qualifying tier explains mismatch.
- Provider mapping controls tier translation.

### Expired/revoked entitlement

1. Use test account with active entitlement.
2. Confirm chapter reads.
3. Expire or revoke entitlement from admin/SQL.
4. Refresh account entitlements.
5. Reopen chapter.

Expected:

- Access is lost.
- Account shows expired/revoked.
- Gate offers renew/redeem options.

### Mobile layout

1. Test at ~390px width.
2. Confirm bottom nav appears and desktop rail is hidden.
3. Confirm tap targets are comfortable.
4. Confirm story hero stacks.
5. Confirm chapter cards are readable.
6. Confirm reader controls open as bottom sheet.
7. Confirm bottom nav/reader controls do not overlap text or CTAs.
8. Confirm no feature requires hover.

Expected:

- Phone UI feels intentional, not squeezed.
- Sticky elements respect safe area.

### Admin workflow

1. Create/activate tier.
2. Assign required tier to chapter.
3. Add preview text.
4. Generate access key for same tier.
5. Redeem as reader.
6. Revoke key/entitlement.
7. Confirm reader access changes.

Expected:

- Admin can manage access without code changes.
- Reader state follows backend truth.

## 5. Definition of done for first polished release

- UI is no longer a bare scaffold.
- Every planned route has meaningful content.
- Mobile layout is first-class.
- Access states are explicit and tested manually.
- Locked content security is enforced server-side.
- Admin can configure tiers/keys/grants.
- Patreon start/callback exists or is clearly disabled with admin-visible configuration requirements.
- Documentation in `PLANS/` and `docs_v2/` matches implementation status.

