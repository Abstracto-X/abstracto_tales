# Subscription Reader SPA - Information Architecture

## 1. Route groups

### Discovery

- `#/home`
- `#/library`
- `#/updates`

Discovery routes answer: what exists, what changed, and where should I start?

### Story detail

- `#/story/:slug`
- `#/story/:slug/chapters`

Story routes answer: what is this series, what can I read, what is locked, and how do I proceed?

### Reading

- `#/story/:slug/chapter/:chapterId`
- `#/story/:slug/preview/:chapterId`

Reading routes answer: show authorized prose or a deliberate access/preview experience.

### Access

- `#/tiers`
- `#/access`
- `#/access/patreon`
- `#/access/key`
- `#/access/success`

Access routes answer: what do I need, what do I currently have, and how do I unlock more?

### Account

- `#/account`
- `#/account/entitlements`

Account routes answer: who am I signed in as and what access is attached to this account?

### Help

- `#/help/access`

Help routes answer: why is access failing and what should the reader/admin check?

## 2. Global navigation model

### Mobile primary nav

The mobile bottom nav is intentionally small and stable:

- Library
- Updates
- Access
- Account

Home is reachable through the logo/header and route back links. Tiers and help are secondary destinations reached contextually from access gates, account, and access hub.

### Desktop primary nav

Desktop can use a left rail with:

- Home
- Library
- Updates
- Access
- Account

Tiers/help can sit as secondary rail/footer links. The desktop shell should preserve account/access status in the topbar so readers do not need to open Account just to know if they are signed in.

## 3. Route entry points

### `#/home`

Entry from:

- default hash;
- app logo;
- post-error recovery;
- marketing/member links.

Default redirect:

- empty hash or unknown root should land on `#/home`.

### `#/library`

Entry from:

- bottom nav;
- home CTAs;
- success pages;
- access gate fallback.

### `#/story/:slug`

Entry from:

- library cards;
- update cards;
- continue reading fallback;
- direct URL.

### `#/story/:slug/chapters`

Entry from:

- story hub;
- reader back control;
- chapter gate recovery;
- direct URL.

### `#/story/:slug/chapter/:chapterId`

Entry from:

- chapter card read CTA;
- continue reading;
- update feed;
- access success return route;
- direct URL.

Behavior:

- if authorized, render reader;
- if unauthorized but chapter exists, render access gate;
- if not found, render chapter-not-found state.

### `#/story/:slug/preview/:chapterId`

Entry from:

- preview CTAs on locked cards;
- access gate secondary action;
- update feed preview action.

Behavior:

- render only safe preview text;
- never fetch full protected content.

### `#/updates`

Entry from:

- bottom nav;
- home latest updates;
- story recent update modules.

### `#/tiers`

Entry from:

- access hub;
- locked gates;
- access help;
- home tier teaser.

### `#/access`

Entry from:

- bottom nav;
- locked gates;
- home access status;
- account quick actions.

### `#/access/patreon`

Entry from:

- access hub;
- locked gate primary CTA;
- tiers page;
- help page.

### `#/access/key`

Entry from:

- access hub;
- locked gate secondary CTA;
- Patreon alternative link;
- help page.

### `#/access/success`

Entry from:

- successful key redemption;
- Patreon callback/sync completion;
- manual refresh success.

Behavior:

- if `pendingReturnRoute` exists, primary CTA returns reader there;
- otherwise, primary CTA goes to account entitlements or library.

### `#/account`

Entry from:

- bottom nav;
- topbar account chip;
- access hub.

### `#/account/entitlements`

Entry from:

- account dashboard;
- access status card;
- success page;
- access help.

### `#/help/access`

Entry from:

- access hub;
- key error;
- Patreon error;
- entitlement expired state;
- locked gate secondary help link.

## 4. User journeys

### Anonymous discovery to free chapter

```txt
#/home -> #/library -> #/story/:slug -> #/story/:slug/chapters -> free chapter -> reader
```

Required behavior:

- no sign-in barrier for public/free chapters;
- locked chapters remain visible but not readable.

### Anonymous locked chapter to sign-in/access

```txt
locked chapter -> access gate -> sign in -> #/access -> provider/key -> #/access/success -> original chapter
```

Required behavior:

- preserve original desired chapter route;
- do not lose context during auth.

### Supporter Patreon sync

```txt
#/access/patreon -> OAuth start -> provider callback -> entitlement sync -> #/access/success -> library/chapter
```

Required behavior:

- signed state prevents account mismatch;
- failed/no-tier result is a recoverable status, not a crash.

### Access key holder

```txt
#/access/key -> sign in if needed -> redeem key -> entitlement created -> success -> target chapter
```

Required behavior:

- key attaches to authenticated account;
- key errors are specific and actionable.

### Lapsed supporter recovery

```txt
reader/account detects expired entitlement -> access gate/account expired state -> renew/reconnect/redeem -> access success
```

Required behavior:

- expired state is not shown as mysterious denial;
- previous source and expiry date should be visible if safe.

## 5. Auth-sensitive route behavior

| Route | Guest allowed? | Guest behavior |
| --- | --- | --- |
| `#/home` | yes | show guest access status |
| `#/library` | yes | show metadata and lock states |
| `#/story/:slug` | yes | show metadata and access summary |
| `#/story/:slug/chapters` | yes | show catalog without protected content |
| `#/story/:slug/chapter/:chapterId` | yes if free | gate if locked |
| `#/story/:slug/preview/:chapterId` | yes | show safe preview |
| `#/updates` | yes | show metadata and CTAs |
| `#/tiers` | yes | show tier guide |
| `#/access` | yes | prompt sign-in for account-bound actions |
| `#/access/patreon` | view yes, action no | connect requires sign-in |
| `#/access/key` | view yes, redeem no | redeem requires sign-in |
| `#/account` | no meaningful data | show sign-in/account gate |
| `#/account/entitlements` | no | show sign-in gate |
| `#/help/access` | yes | show help |

## 6. Locked-content routing rules

- Locked direct chapter URLs must not show 404 if the chapter exists.
- Locked direct chapter URLs should render a gate with story/chapter context.
- Unauthorized full-content fetch failures should be caught and converted to an access gate when catalog metadata confirms the chapter exists.
- Preview routes must only display `preview_text` or equivalent safe server-returned preview.
- After successful unlock, route back to the originally requested chapter when possible.

## 7. Recommended route fallbacks

- Empty hash -> `#/home`.
- Unknown route -> branded not-found with `Home` and `Library` actions.
- Missing story -> story-not-found with `Library` action.
- Missing chapter -> chapter-not-found with `Story chapters` and `Library` actions.
- Access RPC unavailable in local/dev -> show migration/setup warning only in admin/dev contexts; public users should see a friendly unavailable state.
