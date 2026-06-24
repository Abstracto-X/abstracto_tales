# Subscription Reader SPA - Product Brief

## 1. Product thesis

Build a separate, responsive subscription reader SPA for Abstracto Tales / Aether Archives that feels like a premium serial-fiction member library rather than a patched-on paywall. It keeps the identity of the main archive through type, story accents, cover art, and glass panels, but reduces the heavy cinematic/HUD treatment so reading and access management are fast, legible, and calm.

This is not a refactor of `index.html`. The current public reader remains the public cinematic archive for browsing, lore, maps, galleries, comments, and timelines. The subscription reader is a focused member surface for:

- chapter discovery;
- supporter-only or early-access reading;
- access-key redemption;
- Patreon connection/sync;
- entitlement/account status;
- update feeds and release visibility.

## 2. Success definition

A reader should be able to open the SPA on a phone, understand what is free vs locked, sign in or connect Patreon, redeem a key, and continue reading without hunting through a sci-fi cockpit UI. A supporter should feel that membership is a coherent library experience, not merely a lock icon bolted onto the old site.

### MVP success

- Separate SPA shell exists.
- Library, story, chapters, reader, updates, access, account, tiers, and help routes exist.
- Chapter catalog shows free/locked/early/key/pending/expired states.
- Locked chapters remain visible but full content is never fetched unless authorized.
- Access key redemption and Patreon-start UX exist.
- Account page shows entitlements.
- Mobile bottom nav and reader bottom sheet work without hover.

### Final product direction

- Home route feels like a member dashboard.
- Story hubs feel like serial-fiction landing pages with progress and release context.
- Updates route becomes a real release feed/calendar.
- Account route clearly explains providers, keys, grants, expiry, and next actions.
- Admin workflows support tier assignment, provider mapping, keys, manual grants, and audit logs.
- Provider adapters can add Ko-fi, PayPal, Discord, or automation without changing reader access logic.

## 3. Audience

### Anonymous visitor

- Wants to browse the member library and decide whether to support.
- Must see locked chapters and tier badges without seeing protected content.
- Needs a clear sign-in/connect/redeem path.

### Signed-in reader without access

- Has an account but no entitlement.
- Needs to know exactly what tier/source unlocks a chapter.
- Needs Patreon and access-key paths in obvious places.

### Active supporter

- Wants the newest chapters fast.
- Needs confidence that membership synced.
- Wants a comfortable reader, progress, and next/previous chapter flow.

### Beta/reviewer/gift reader

- Enters through an access key rather than a recurring provider.
- Needs redemption feedback, entitlement scope, and expiry/status visibility.

### Author/admin

- Needs to assign access tiers per chapter.
- Needs to generate/revoke keys.
- Needs to manually grant/revoke access.
- Needs provider-tier mapping in config/admin, not frontend code.

## 4. Design principles

1. **Membership clarity over mystery.** Locked content can be atmospheric, but the user should never wonder why access failed or what to do next.
2. **Lighter than the main archive.** Keep Aether identity, remove unnecessary particles/HUD density.
3. **Cards and sheets over cockpit panels.** Use story cards, chapter cards, sticky CTAs, and bottom sheets for mobile ergonomics.
4. **Visible locks, invisible content.** Catalog metadata can show locked chapters; protected full content must never be delivered to unauthorized clients.
5. **Provider-neutral core.** Patreon, Ko-fi, PayPal, Discord, access keys, and manual grants all become normalized entitlements.
6. **Desktop/tablet rich, mobile adapted.** No hover-only controls. Desktop gets spacious rails and columns; mobile gets bottom nav and sheets.
7. **Story color continuity.** Each story can tint accents, badges, dividers, and hero glows without overwhelming readability.
8. **Explicit state language.** Free, unlocked, early access, key locked, pending sync, expired, and locked tier must be distinct.

## 5. App boundaries

### Included in subscription SPA

- Member home/dashboard.
- Library of published stories.
- Story member hub.
- Chapter catalog.
- Secure chapter reader.
- Locked preview/gate flows.
- Recent updates/release feed.
- Tier explanation pages.
- Access management and Patreon flow entry.
- Access key redemption.
- Account entitlement dashboard.
- Access help/troubleshooting.

### Not included in v1

- Replacing `index.html`.
- A full payment checkout implemented directly in frontend.
- Provider secrets in JS.
- Gating lore/maps/galleries as the first milestone.
- Framework/bundler migration.
- DRM promises. The goal is server-side access control, not impossible copy prevention.

## 6. Content strategy

### Tone

Premium, clear, slightly mythic. Avoid sterile SaaS copy, but do not bury core access instructions in lore language.

Examples:

- Good: `This chapter is early access for Voyager tier until July 12, 2026.`
- Good: `Your Patreon is connected, but no matching tier was found. Try Sync Access or redeem a key.`
- Bad: `The archive denies your bloodline.`

### Copy hierarchy

Each access-sensitive surface should answer:

1. What is this?
2. Can I read it now?
3. If not, why not?
4. What action should I take?
5. What happens after that action?

## 7. Metrics to design for

Even if analytics are not implemented in v1, design decisions should support measuring later:

- anonymous -> sign-in conversion from locked gates;
- Patreon connect starts/completions;
- access key redemption success/failure;
- locked chapter gate return-to-read success;
- reader next-chapter progression;
- update feed open-to-read conversion;
- entitlement expiry/renewal recovery.

