# Subscription Reader SPA - Design System and Mobile Layouts

## 1. Visual position

The subscription reader should look like it belongs to Abstracto Tales, but it should not feel like the full cinematic archive. The main archive can be theatrical. The member SPA should be premium, readable, and fast.

### Keep

- Cinzel-style headings for story/title moments.
- Lora-style reading typography.
- Montserrat-style UI labels.
- Story accent colors.
- Cover art and soft background art.
- Glass panels, thin borders, subtle gold/accent highlights.

### Reduce

- Particles and continuous motion.
- Heavy HUD chrome.
- Pure black full-screen surfaces.
- Aggressive neon glow behind text.
- Dense map-console patterns.
- Hover-only interactions.

## 2. Design tokens

Recommended conceptual tokens:

```txt
--sub-bg: #090b10;
--sub-bg-2: #11131c;
--sub-surface: rgba(255,255,255,0.075);
--sub-surface-strong: rgba(255,255,255,0.12);
--sub-border: rgba(255,255,255,0.14);
--sub-border-strong: rgba(216,181,91,0.35);
--sub-text: #f5f1e8;
--sub-muted: rgba(245,241,232,0.68);
--sub-reader-dark: #11131a;
--sub-reader-parchment: #f4ead8;
--sub-reader-contrast: #050505;
--accent-color: story-specific;
```

## 3. Typography

### Display

Use Cinzel/Cinzel Decorative style only for:

- app hero title;
- story title;
- major page H1;
- ceremonial tier names.

Do not use decorative type for long labels, forms, or body copy.

### UI

Use Montserrat-style uppercase/small labels for:

- nav;
- badges;
- card meta;
- CTAs;
- status chips.

### Reading

Use Lora-style serif for chapter content. Long-form reading should have:

- comfortable line-height;
- generous paragraph spacing;
- constrained max-width;
- no animated backgrounds directly behind text.

## 4. Color usage

Story accent color should appear in:

- active nav indicator;
- badge border/glow;
- hero divider;
- card top border;
- primary CTA gradient;
- progress bar.

Do not flood entire surfaces with story accent. Accent is seasoning, not soup.

## 5. Component specifications

### App shell

Desktop:

- grid: rail + content;
- rail around 76-96px wide;
- topbar 64-76px high;
- stage scrolls independently.

Mobile:

- no desktop rail;
- topbar sticky;
- stage has bottom padding for nav safe area;
- bottom nav fixed/floating.

### Mobile bottom nav

Items:

- Library
- Updates
- Access
- Account

Rules:

- 44px minimum tap target.
- Text label always visible.
- Active item has accent dot/bar and stronger text.
- Respect `env(safe-area-inset-bottom)`.
- Do not include every route; keep it stable.

### Topbar

Content:

- back button when route has parent;
- route label or compact logo;
- account chip;
- optional entitlement status chip.

Mobile:

- back label can collapse to icon + short text;
- account chip can become avatar/initial.

### Story card

Must include:

- cover thumbnail;
- title;
- status/genre;
- short description;
- chapter/access counts when available;
- explicit open action.

Visual:

- rounded glass card;
- cover image with soft gradient overlay;
- accent border or corner glow.

### Story hero

Must include:

- cover/poster;
- title;
- synopsis;
- facts chips;
- continue/open chapters/unlock CTAs;
- main archive secondary link.

Desktop:

- two-column hero.

Mobile:

- stacked poster, title, CTA cluster.

### Chapter card

Must include:

- chapter number;
- title;
- access badge;
- release/public date if relevant;
- preview teaser;
- word count/read time;
- state-specific CTA.

Locked visual treatment:

- card remains visible;
- content metadata readable;
- no fake blur over actual content;
- lock state shown through badge, helper line, and CTA.

### Access gate

Must include:

- story/chapter context;
- required tier;
- why locked;
- primary action;
- secondary key action;
- account/provider status when known;
- help link.

Gate should feel like a door, not a dead end.

### Reader page

Required:

- sticky mini header;
- progress indicator;
- serif reading column;
- previous/next;
- bottom sheet controls;
- saved theme/scale.

Optional later:

- reading progress percentage;
- estimated time remaining;
- keyboard shortcuts;
- chapter rail;
- bookmarks.

### Reader bottom sheet

Controls:

- theme: dark/parchment/contrast;
- font size A-/A+;
- line width;
- chapter list;
- access/help;
- close.

Mobile:

- sheet slides from bottom;
- backdrop tap closes;
- not taller than viewport;
- controls are large.

Desktop:

- can appear as popover or side panel, but bottom sheet is acceptable for consistency.

## 6. Responsive breakpoints

Recommended:

- `<= 1024px`: reduce desktop columns, denser grids.
- `<= 860px`: hide rail, enable mobile bottom nav, stack hero.
- `<= 560px`: single-column cards, compact headings, sticky CTA simplification.
- `<= 380px`: shorten labels, avoid multi-button rows that overflow.

## 7. Mobile route notes

### Home

- Access status card appears above story grid.
- Continue reading should be one-tap reachable.

### Library

- Avoid tall poster cards for every item if many stories exist; use compact hybrid cards.

### Story

- Primary CTA should stay visible early.
- Facts chips wrap.

### Chapters

- Cards stack.
- Locked CTAs remain visible.
- Filter chips scroll horizontally.

### Reader

- Text is priority.
- Avoid persistent UI overlays covering paragraphs.
- Reader FAB should not overlap next/previous controls.

### Access/account

- Forms are single-column.
- Provider cards stack.
- Error/status messages appear directly under action.

## 8. Accessibility and usability

- All interactive controls need visible focus states.
- Color is not the only indicator of locked/unlocked state.
- Badges need text labels.
- Touch targets at least 44px.
- Modal/dialog focus should not trap permanently; close controls are visible.
- `prefers-reduced-motion` disables decorative transitions.
- Reader themes must maintain contrast.
- Forms must have labels, not placeholders only, before final polish.

## 9. Motion rules

Allowed:

- subtle card lift;
- soft opacity/translate route transition;
- bottom sheet slide;
- progress bar update;
- skeleton shimmer if restrained.

Avoid:

- constant particle fields;
- rotating HUD machinery;
- text glow pulses;
- animation behind reading content.

## 10. Empty and loading states

Use branded but clear panels:

- icon;
- concise title;
- direct explanation;
- one primary recovery action;
- optional secondary action.

Examples:

- `No active grants yet` -> Connect Patreon / Redeem key.
- `No chapters available` -> Return to story / Main archive.
- `Sync pending` -> Try refresh / Access help.

