# Subscription Reader SPA - States, Errors, Empty, and Loading

## 1. State design principle

Every state must answer what happened and what to do next. The member SPA should never dump a raw backend error onto a reader when it can explain access, retry, or route recovery.

## 2. Global loading states

### App boot

Show a lightweight branded loader:

- app name;
- simple shimmer/pulse;
- no cinematic sequence;
- no long particle animation.

### Route loading

Use skeletons or soft panels for:

- story cards;
- chapter cards;
- account entitlement rows;
- update feed items.

Do not block the entire app if only a secondary module is loading.

## 3. Empty states

### Empty library

Copy:

`The member library is being prepared.`

Actions:

- Return home;
- Main archive link if public reader has content.

### Empty updates

Copy:

`No member-library updates yet.`

Actions:

- Browse library;
- View tiers/access.

### Empty chapters

Copy:

`No chapters are available in this shelf yet.`

Actions:

- Back to story;
- Main archive.

### No entitlements

Copy:

`No active access grants are attached to this account yet.`

Actions:

- Connect Patreon;
- Redeem key;
- Access help.

### No reading progress

Copy:

`Start a chapter and it will appear here.`

Actions:

- Browse library.

## 4. Not found states

### Story not found

Possible causes:

- bad slug;
- unpublished story;
- route typo;
- story removed.

Actions:

- Library;
- Home.

### Chapter not found

Possible causes:

- bad chapter id;
- chapter unpublished;
- mismatch between story slug and chapter;
- removed content.

Actions:

- Chapter shelf;
- Story hub;
- Library.

Unknown locked chapters should not masquerade as not-found when catalog metadata can confirm existence.

## 5. Auth states

### Guest

Message pattern:

`You are browsing as a guest. Sign in to check supporter access, connect Patreon, or redeem a key.`

Actions:

- Sign in;
- Browse free chapters;
- Redeem key after sign-in.

### Profile syncing

Message:

`Your account is signed in. Profile details are still syncing.`

Actions:

- Continue;
- Retry account load.

### Sign-in failed

Keep errors near the auth form. Avoid clearing the route context.

## 6. Access denied states

### Locked tier

Message:

`This chapter requires {Tier}. Connect a matching provider tier or redeem an access key.`

Actions:

- Connect Patreon;
- Redeem key;
- View tiers;
- Help.

### Early access

Message:

`This chapter is early access for {Tier} until {date}.`

Actions:

- Unlock now;
- Remind/read later if implemented;
- Back to chapters.

### Key locked

Message:

`This chapter is available through a reader access key or author-granted access.`

Actions:

- Redeem key;
- Access help.

### Pending sync

Message:

`Your provider connection exists, but access is still being verified.`

Actions:

- Sync access;
- View entitlements;
- Help.

### Expired

Message:

`Your previous access expired on {date}. Renew, reconnect, or redeem a key to continue.`

Actions:

- Connect/refresh Patreon;
- Redeem key;
- Help.

## 7. Patreon states

### Not connected

`Connect Patreon to verify supporter tier access.`

### Starting OAuth

`Opening Patreon authorization...`

Disable duplicate clicks while starting.

### Connected and active

`Patreon access is active as {Tier}.`

Actions:

- Continue reading;
- View entitlements.

### Connected but no matching tier

`Patreon is connected, but no eligible mapped tier was found.`

Actions:

- View tiers;
- Sync again;
- Access help.

### OAuth cancelled

`Patreon connection was cancelled. No changes were made.`

Actions:

- Try again;
- Redeem key.

### Provider error

`Patreon could not be checked right now.`

Actions:

- Retry;
- Help.

## 8. Access key states

### Empty key

`Enter an access key.`

### Redeeming

`Checking key...`

### Success

`Access key redeemed. {Tier} access is now attached to your account.`

Actions:

- Continue to chapter;
- View entitlements.

### Invalid

`That key could not be redeemed. Check the code and try again.`

### Expired

`That key has expired.`

### Revoked

`That key is no longer active.`

### Max uses reached

`That key has already been fully used.`

### Already redeemed

`This key is already attached to your account.`

### Not signed in

`Sign in first so this key can attach to your reader account.`

## 9. Network/degraded states

### Catalog fetch failed

Message:

`The chapter shelf could not load.`

Actions:

- Retry;
- Back to story.

### Entitlement fetch failed

Message:

`Access status could not be refreshed. Free chapters may still work.`

Actions:

- Retry;
- Account;
- Help.

### Chapter content fetch failed

If catalog says user should have access:

`The chapter could not be loaded. Try again.`

If access uncertain:

`Access could not be verified right now.`

Actions:

- Retry;
- View entitlements;
- Help.

## 10. Admin/configuration states surfaced to readers

Avoid exposing raw migration/config details to public readers. Use:

`Member access is temporarily unavailable. Free chapters remain available.`

For admin/dev contexts, detailed setup messages can mention missing RPCs or migrations.

## 11. Toast vs inline state

Use toast for:

- successful key redemption;
- sign-in success;
- sign-out;
- transient route/action notices.

Use inline state for:

- form validation;
- key redemption errors;
- Patreon status;
- entitlement explanations;
- access gates.

Do not put critical access explanations only in auto-dismiss toasts.
