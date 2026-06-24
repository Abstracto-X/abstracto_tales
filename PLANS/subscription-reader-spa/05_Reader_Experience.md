# Subscription Reader SPA - Reader Experience

## 1. Reader goal

The reader surface should feel calmer and more premium than the main archive. Reading is the product. Interface chrome should help orientation, access, and comfort without competing with prose.

## 2. Full chapter reader layout

### Header

The reader header should contain:

- back to chapter shelf;
- story title;
- chapter number;
- chapter title;
- access badge;
- optional reading progress.

Desktop can show this as a spacious header above the prose. Mobile should use a compressed sticky mini header or a header that scrolls away after orientation is established.

### Prose body

Requirements:

- serif font optimized for long reading;
- comfortable line height;
- responsive max width;
- no animated effects behind text;
- clear paragraph spacing;
- support for existing chapter HTML/linebreaks if content is stored as HTML.

### Footer

End-of-chapter footer should include:

- previous chapter;
- next chapter;
- back to chapters;
- story hub;
- access-aware next action.

## 3. Reader controls

### Controls to include

- Theme: Dark archive, warm parchment, high contrast.
- Font scale: A-, default/reset, A+.
- Line width: narrow, standard, wide.
- Chapter list shortcut.
- Access/account shortcut.
- Help/report issue link.

### Mobile behavior

Reader controls should open as a bottom sheet.

Rules:

- no tiny icon-only mystery buttons;
- sheet must be dismissible;
- controls must be reachable by thumb;
- bottom sheet must not cover the current line permanently;
- safe-area padding required.

### Desktop behavior

Desktop may use:

- same bottom sheet for consistency;
- popover near Reader button;
- optional side drawer.

Do not introduce heavy HUD panels around prose.

## 4. Reading progress

### Local v1

Local storage can track:

- last opened story slug;
- last opened chapter id;
- timestamp;
- rough scroll progress per chapter;
- reader theme/scale/width.

### Future account sync

If account-level progress is added later, treat local progress as optimistic and server progress as canonical after login. Avoid blocking reading on progress sync.

### UI placements

- Home: Continue Reading card.
- Story hub: Continue this story.
- Reader: progress bar/top indicator.
- Chapter shelf: read/started badges.

## 5. Preview reader

Preview route should feel intentional.

Required pieces:

- preview notice banner;
- story/chapter context;
- preview body in reader typography;
- clear `Preview ends here` divider;
- unlock panel with required tier;
- CTAs for Patreon/key/tiers;
- back to chapters.

Rule: preview content must come from safe public preview data, not by client-side trimming protected full content.

## 6. Access-aware end-of-chapter logic

### Next chapter is readable

Primary CTA: `Continue to next chapter`.

### Next chapter has preview only

Primary CTA: `Read preview`.
Secondary CTA: `Unlock full chapter`.

### Next chapter is locked

Primary CTA depends on user state:

- guest: `Sign in to check access`;
- signed in no entitlement: `Unlock next chapter`;
- Patreon linked/pending: `Sync access`;
- expired: `Renew access`;
- key campaign: `Redeem key`.

### No next chapter

Show:

- `Back to story`;
- `Latest updates`;
- optional supporter CTA if future locked content exists.

## 7. Chapter navigation

### Previous/next

Previous and next should respect catalog order. If the target exists but is locked, the navigation can still route there and show a gate instead of hiding it.

### Chapter list shortcut

Reader controls should include `Chapter shelf` so readers can jump out without using browser back.

### Keyboard shortcuts later

Optional desktop shortcuts:

- left/right: previous/next;
- `t`: theme menu;
- `+` / `-`: font size.

Keyboard shortcuts must not interfere with form fields or screen readers.

## 8. Spoiler-safe metadata

For locked chapters, safe metadata can include:

- title if public;
- order;
- public release date;
- required tier;
- preview text manually authored as safe;
- read time/word count if safe.

Avoid showing:

- hidden chapter body;
- major spoiler summaries;
- author notes intended for after the chapter;
- comments/discussion excerpts for locked content.

## 9. Reader performance

- Avoid loading maps/galleries/timelines in the subscription reader.
- Fetch only active chapter content.
- Catalog metadata can be cached lightly in memory.
- Full chapter content should not be cached across unauthorized state changes unless carefully scoped.
- On entitlement revocation/expiry, content should fail closed on next fetch.

## 10. Reader quality checklist

- Text readable at 390px width.
- Buttons do not overlap prose.
- Reader settings persist.
- Back/next/previous work after direct URL load.
- Unauthorized chapter URL becomes gate.
- Preview route never leaks full content.
- Long chapter does not trigger layout jank from decorative backgrounds.
