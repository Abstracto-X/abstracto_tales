# Changelog

All notable changes to this project will be documented in this file.
Agents MUST update this file whenever they complete a task or make significant updates, including the date, time, and a summary of the changes.

## [2026-06-25]
### Changed
- 16:43 +05:30: Added `docs/reader/SUBSCRIPTION_HANDOVER.md` as the current handover for the Aether Pages subscription site, covering active boot path, backend/auth/access state, visual integration, demo-only areas, remaining P0/P1 work, verification scenarios, and documentation-process risks.
- 13:50 +05:30: Replaced the cropped cover art background banner in `.book-hero` and `.hero` with the clean grid-based columns layout from the main reader SPA. Re-styled `.book-hero` and `.hero` as glassmorphic panels, placing the portrait cover image in a dedicated left column (`.book-hero-cover`) and moving the book title, author, eyebrow, tagline, progress, and actions to the right column (`.book-hero-details`). Updated the layout in `aether-app.js` and responsive overrides in `subscription.css`.
- 12:56 +05:30: Added background style, story wallpapers, and background blur options to the preference settings drawer in the Member Library SPA. Modified `loadBackendLibrary()` to dynamically fetch custom story wallpapers from the `story_wallpapers` table in Supabase. Added settings `bgMode`, `bgBlur`, and `bgImageUrl` to the persisted store. Implemented helper functions `applyBgSettings()`, `getActiveStory()`, and `wallpaperSwatches()` to render and apply background configurations using CSS data attributes (`data-bg-mode` and `data-bg-blur`). Updated `setStoryAccent()` and `clearStoryAccent()` to respect chosen wallpapers, and wired settings adjustment click listeners in the `delegate()` event handler.
- 12:24 +05:30: Imported dynamic background image backdrop layer (`#global-bg`) and glassmorphic UI variables from the main site to `subscription.html` for thematic cohesion. Refined card/surface colors (`--surface`, `--surface-2`, `--surface-3`, `--border`, `--border-2`) across all themes in `subscription.css` to higher-contrast glass values to prevent readability issues against detailed covers. Updated `setStoryAccent` in `aether-app.js` to dynamically load the active story background/cover image and set opacity to `1`. Added `clearStoryAccent` to reset custom accent properties and transition the backdrop to a fallback state using the first story's cover at `opacity: 0.7`. Wired `render()` to call `clearStoryAccent` on non-story routes and added a CSS override to hide the background layer in the distraction-free chapter reader (`body.in-reader`).
- 12:18 +05:30: Integrated real Supabase database datastreams (cover images, cast members, timeline events, and glossaries/lore entries) into the Member Library SPA (`subscription.html`) using parallel queries (`Promise.all`). Designed Cast, Glossary, and Timeline sections in `VIEWS.story` to render dynamically and modularly only when their respective arrays are non-empty. Added client-side mock data purging (`purgeMockStoreData`) and dynamic notifications sync (`syncRealNotifications`) from real updates feed `D.UPDATES` to eliminate mock DB traces. Refactored chapter rows and CTA triggers to use valid, non-nested tags (`div` and `span`), resolving browser nested button clashes. Generalize resets for icon controls `.tb-btn` in `subscription.css` for proper close layout.
- 12:08 +05:30: Resolved subscription layout issues and bugs: eliminated Mojibake strings (em-dash, en-dash, middle-dot, ellipsis, curly quotes, bullets, and heart/gasp/theory/tears/fire emojis) by replacing them with Unicode escape sequences in `aether-app.js` and `aether-data.js`. Added a body-level `data-reader-theme` attribute toggle to synchronize the full screen background color and hide dark gradients when active reader themes (parchment, twilight, aether) are selected. Added `align-items: center` to home feed items (`.feed-item`) to prevent Play/Read CTA buttons from stretching vertically. Redesigned the notifications page, positioning the close cross absolutely in the top-right and adding a "Clear all" button.
- 11:54 +05:30: Redesigned the member reader subscription page (`subscription.html`) for desktop layouts. Replaced the bottom nav on desktop (≥ 1040px) with a left sidebar icon-rail (`.sidenav`) with settings/account triggers, transformed bottom sheets (`.sheet`) into centered modal dialogs on desktop (≥ 760px), shifted toasts to the bottom-right, and constrained chapter read CTAs and sticky buttons. Upgraded the secure chapter loading screen to a lightweight inline spinner (`.reader-loading`), and added pulsing gradients on primary buttons and left-accent hovers on feed items.
- 11:20 +05:30: Fixed Google OAuth implicit-token callbacks for the subscription reader by parsing `#access_token` and nested `#/vault#access_token` return URLs, setting the Supabase session from returned tokens, switching future subscription redirects to query-based Vault callbacks, and adding a main-reader fallback for subscription-origin OAuth returns.
- 00:59 +05:30: Fixed Google OAuth return handling by explicitly exchanging Supabase callback codes for sessions, cleaning transient OAuth URL parameters, and preserving the Vault route after login.
- 00:48 +05:30: Hardened subscription Google OAuth buttons by preventing delegated action default reloads, validating http/https redirects, adding a redirect toast, and manually assigning Supabase OAuth URLs when returned.
- 00:33 +05:30: Added Google OAuth to the active subscription reader bridge, including Google-first account UX, Patreon-after-Google pending action resume, updated Patreon activation copy, refreshed reader/database docs, and updated the subscription bundle script to include active Aether bridge files.
- 00:14 +05:30: Loaded Patreon Edge Function secrets from local environment data, fixed `supabase/config.toml` encoding for CLI parsing, and deployed the Patreon OAuth/start/callback/sync/webhook functions to project `gdivyqfhgashkqcqqnas`.

## [2026-06-24]
### Added
- 23:32 +05:30: Implemented the Patreon OAuth/connect and manual sync Edge Function path. Added shared Patreon helpers, service-role OAuth token storage migration, callback entitlement refresh, frontend provider re-sync, Supabase function JWT config for external callbacks/webhooks, and updated subscription/database docs.
- 16:00 +05:30: Documented the newly implemented Patreon OAuth integration Edge Functions (`patreon-oauth-start`, `patreon-oauth-callback`, `provider-webhook`, and `sync-provider-entitlements`) in `docs_v2/shared/database.md` and `docs_v2/reader/functions.md`.
- 16:00 +05:30: Compiled the modular subscription documentation, updating the legacy `docs/CODEBASE_ARCHITECTURE.md` with details on immersive mode, keyboard navigation, and scroll progress tracking.
- 16:00 +05:30: Regenerated the consolidated codebase bundle `subscription_bundle.md` to capture recent updates to `subscription.html`, `subscription.css`, and `js/subscription/` modules.

## [2026-06-23]
### Added
- 22:35 +05:30: Created `docs_v2/reader/subscription_spa.md` to document the architecture, routing, state, rendering, and API connections of the Subscription reader SPA (`subscription.html`).
- 22:35 +05:30: Created `subscription.css` as a dedicated, standalone stylesheet containing optimized resets, layout rules, interactive hover micro-animations, theme skins (Dark, Parchment, Contrast), and responsive mobile breakpoints.
- 23:28 +05:30: Created bundling script `scripts/bundle_subscription.js` to combine all subscription SPA files.

### Changed
- 22:35 +05:30: Extracted all subscription-specific CSS from the main `styles.css` file into the new `subscription.css` to prevent layout bugs and style leakage. Updated `subscription.html` to reference `subscription.css` and allowed text selection in reader view.
- 22:35 +05:30: Linked the new `subscription_spa.md` document in `docs_v2/CODEBASE_OVERVIEW.md` and added it to the automatic documentation compiler (`scripts/compile_docs.js`), then compiled all documentation into the unified legacy `/docs/` folder.
- 23:28 +05:30: Aggregated all subscription SPA files (HTML, CSS, JS modules) into `subscription_bundle.md` at the project root for easy audit ingestion.

## [2026-06-15]
### Changed
- 10:57 +05:30: Gated the gallery R18/mature content toggle behind active user authentication. Unauthenticated users who attempt to enable R18 are shown a toast notification and prompted with the login modal. Synchronously checks for stored auth tokens on cold-start to prevent bypassing the R18 restriction, and automatically resets the showR18 setting to false upon user logout. Updated reader API map and functions documentation, and compiled legacy docs.
- 06:18 +05:30: Restored the reader map Navicomputer status widget to the right, moved zoom/reset/route-focus controls into a horizontal rail beside Minimize Panels, replaced the footer clock spinner with an animated Galactic Republic emblem, and removed the site-wide lower-right cursor hotspot that hid the entire application.
- 05:47 +05:30: Restructured the reader map HUD by moving Star Chart Registry/Layers into the top command bar and Navicomputer/Search into the compact status card, removing itinerary and Active Routes surfaces, adding inspector-based Plot Course selection, and making the floating route card avoid live dock/HUD rectangles. Added registry thumbnails, planet-class inspector accents, route/radar/minimize animations, HUD/footer glow treatments, responsive fallbacks, and updated reader map documentation.

### Fixed
- 04:20 +05:30: Made the Star Chart Registry scrollable by changing `.map-hub-screen` overflow from `hidden` to `visible` and adding border-radius inheritance to its grid overlay pseudo-element. Increased the translucency of the registry background box by lowering the linear-gradient opacity.
- 03:35 +05:30: Fixed reader registration confirmation redirects by passing a current-site `emailRedirectTo` to Supabase signup. The derived URL preserves the deployed `/abstracto_tales/` GitHub Pages base path while stripping page filenames, query parameters, and hashes. Updated reader architecture, function, and API documentation.

## [2026-06-14]
### Added
- 07:35 +05:30: Created `scripts/download_timeline_images.py`, a standard-library multi-threaded python utility to download all external wiki-scraped timeline images in parallel. The script extracts unique URLs, sanitizes filenames/directories, and saves them organized in `data/timeline/downloaded_images/Era/Sub-Era/` folders while showing a live CLI progress bar. Updated shared conventions documentation.

### Changed
- 12:06 +05:30: Rebuilt and repaired the reader Map Hub and interactive map viewer around the `PLANS/` Galactic Operations Deck concepts. Added a collision-aware fullscreen glass HUD, semantic Star Chart Registry cards, default desktop Navicomputer, responsive World Inspector and routing bottom sheets, route-analysis accordions, live route/radar status, layer/filter/search control stack, legend, contribution ticker, Galactic clock, panel minimizer, reduced-motion handling, backdrop-filter fallbacks, and synchronized accessible dock states. Hardened missing/null DOM bindings and interval cleanup while preserving existing Supabase map loading, Dijkstra/hybrid routing, history, watchlist, cross-map search, and natural node coloring.
- 07:41 +05:30: Configured `js/timelines/TimelineHub.js` event image resolution to point to local sanitized paths under `data/timeline/downloaded_images/` instead of fetching directly from the external Wikia/Fandom CDN.

## [2026-06-15]
### Added
- 03:44 +05:30: Added `docs_v2/reader/MAP_HANDOVER.md` with exact reader-map code locations, working feature inventory, synthetic telemetry disclosures, half-finished HUD behavior, accessibility and CSS cleanup risks, manual verification steps, and a highest-priority requirement to restore the currently unreachable Ã¢â‚¬Å“Help Map the GalaxyÃ¢â‚¬Â cartography contribution banner/action.


## [2026-06-05]
### Added
- 03:38 +05:30: Linked reader maps with Galactic/Story History through a new `js/timelines/LocationHistoryIndex.js` module. Focused map worlds now expose a History action that opens a reusable overlay, scans current story timeline events plus parsed Galactic History for normalized location mentions, groups results by era/time, and caches Galactic matches in memory for repeat lookups. Updated `MapViewer`, `Render.maps`, `main.js`, `styles.css`, and reader documentation.

### Changed
- 03:17 +05:30: Unified the main Gallery hero and character browser into one sub-window. Removed the detached scenic quote panel and scattered hero previews, replaced oversized story typography with a compact Gallery banner, kept the selected profile image dominant, and moved archive totals plus the scrollable profile grid into the right panel while preserving hover/focus hero updates and active glow.
- 03:17 +05:30: Tightened the Visual Archive hero so a full first row of the character roster is visible by default. Restored profile images as every character card's sole lead image, replaced the horizontal rail with a bounded scrollable grid, and made hover/focus update the hero with an active-card glow. The hero now decorates its left visual area with at most three non-R18 images belonging only to the selected character; other gallery URLs remain inert until selection to respect lazy-loading and cache-egress conventions.
- 08:00 +05:30: Implemented Part 2 of the map viewer redesign (World Inspector left dock panel). Overhauled `#world-intel-dock` with a structured header, pin/close buttons, and a dynamic `#world-intel-body`. Built the `MapViewer.renderWorldIntel` system to render a 3D rotating planetary orb with dynamic CSS background gradients corresponding to planetary class, a seed-hashing description generator, and a tabbed navigation panel containing Overview (telemetry table of generated specs), History (scans location index), Routes (hyperlane exits), Political (affiliation and security notes), and Nearby (Euclidean spatial proximity calculation). Persisted watchlist state in local storage under `abstracto_watchlist_${story_slug}` and wired quick actions. Updated `js/render.js`, `js/maps/MapViewer.js`, `docs/CODEBASE_ARCHITECTURE.md`, and `docs/FUNCTION_INDEX.md`.
- 07:40 +05:30: Implemented Part 1 of the map viewer redesign. Broke out the map console shell container into a fullscreen fixed viewport layout overlay with deep space radial gradients, vignette darkening, and CRT scanlines. Floating top header bar now houses Aether title, registry backlink, and right utility buttons (theme, volume, settings, user avatar). Added a minimize panels trigger placeholder. Modified `styles.css`, `js/render.js`, and `js/maps/MapViewer.js`.
- 06:40 +05:30: Overhauled the reader map viewer into a full-viewport sci-fi console layout. Replaced grid-split layout with edge-docked glassmorphic panels for the Navicomputer, World Intel, Itinerary, and Charts selector. Added an animated Astrogation Dial trigger, a scanline CRT terminal overlay, a cinematic vignette darkening overlay, and a permanent Contribute beacon button at bottom center. Modified `js/maps/MapViewer.js`, `js/render.js`, and `styles.css`.
- 03:58 +05:30: Changed the reader map planet-history interaction so clicking a planet opens a compact scrollable in-map history panel first, styled like the route information overlay. The full-screen location-history overlay remains available through the compact panel's Open Full Archive action and the focused-world card's Full History button. Updated `MapViewer`, `styles.css`, and reader documentation.

## [2026-06-03]
### Changed
- 20:05 +05:30: Added stylesheet rules for tiled borderless images and alignment wrappers (`.aaa-codex-event-wrapper`) in `styles.css`. Implemented a 2x2 grid for opposite column layout (years with 1 card) and side-by-side flex layouts for below-card layout (years with multiple cards and Story History). Applied grayscale desaturation filters with full-color hover transitions and visual vertical spacing adjustments. Modified `TimelineHub.js` to ensure uniform card-then-images DOM order and registered tiled image grids under the IntersectionObserver scroll reveal system. Added page-level image deduplication (`_renderedImagesThisPage` Set) to prevent repeated images on a timeline view. Enforced uncropped containment (`object-fit: contain` and auto aspect ratios) to keep full images visible, and used `:only-child` CSS selectors to dynamically enlarge single image tiles while keeping multiple images small to fit. Made opposite column layout containers wider (`max-width: 580px`) to utilize large available screen space.
- 19:50 +05:30: Added keyword-associated image rendering in timeline cards. Updated `TimelineHub.js` to fetch `page_image_lookup.json` in parallel inside `initKeywordLinks`. Implemented `getEventImages()` to scan event texts for matched keywords and resolve their corresponding wiki URLs to image endpoints, and `renderEventImages()` to render them as glassmorphic preview cards. Integrated these helpers into `renderStoryEventCard` and `renderBranchingEventCard` to display images dynamically inside timeline event cards. Added CSS transitions, hover-zoom scales, reactive border glows, and captions for timeline images in `styles.css`.
- 17:35 +05:30: Integrated dynamic proper noun hyperlinking across Story History and Galactic History timelines. Implemented `initKeywordLinks()` and `applyKeywordLinks()` in `TimelineHub.js` to fetch `timeline_simple_links.json`, parse proper nouns (excluding numbers, lowercase words, and date codes), sort them length-descending to prevent nested links, and construct lookaround regex boundaries. Updated `js/render.js` to await keyword loading in Story History mode, and wrapped timeline event texts to render links matching the lightsaber accent theme with transition glows in `styles.css`. Removed aggressive browser cache forcing on timeline files.
- (Earlier): Rebuilt the reader Galactic History explorer completely from scratch into a premium AAA-game "Lore Codex" HUD. Scrapped old CSS styles and rewritten with a unified `.aaa-codex-...` style suite in `styles.css`. Implemented a CRT scanline grid, dynamic cursor-reactive ambient glow, high-tech portal cards, vertical directory navigation layout for sub-eras, tactical HUD key art viewports, and vertical neon timeline streams with pulsing node rings and holographic event cards. Rewrote all renderers and listeners in `TimelineHub.js` to support the new database terminal flow, including real-time sub-era details loading and dynamic mouse trackers.
- 16:50 +05:30: Added decoupled content organization for Galactic History. Created `data/timeline/galactic_metadata.json` to store all Era and Sub-Era header titles, date range labels, background images, and source section references. Updated `TimelineHub.js` to fetch both `timeline_tree.json` and `galactic_metadata.json` in parallel and map events dynamically using recursive section searches, making it easy to edit headers without touching raw scraped event data.
- 16:47 +05:30: Enhanced background legibility and fixed the black screen bug on the detailed timeline page. Set `.aaa-codex-shell` background to transparent so it doesn't cover `.aaa-codex-bg`, assigned a solid background color of `#020408` directly to `.aaa-codex-bg`, increased background image brightness to `0.38`, and lightened the radial vignette overlay.
- 16:35 +05:30: Refined the rebuilt Galactic History explorer: restored a clean 2x4 card grid layout for major eras to fit all 8 eras on-screen without scrolling; styled the overview cards to show era artwork full-span, outline number badges, serif headers, and records counts matching the specs. Eliminated the overlapping back buttons, leaving only a single inline navigation link: `&larr; BACK TO ERAS` on the sub-era page and `&larr; BACK TO SUB-ERAS` on the detailed timeline page. Dynamically hid the top search bar when drilling into sub-eras or timeline logs. Added media queries in `styles.css` for grid responsiveness on tablet and mobile viewports.

- (Earlier): Upgraded the reader Galactic History explorer to a premium AAA-game cinematic aesthetic. Enhanced `styles.css` with 3D hover/tilt effects, cinematic staggered entrance animations for sub-eras, frosted-glass noise textures, improved backdrop blurs, and pulsing glows for the vertical timeline. Updated `TimelineHub.js` to track mouse movements for 3D poster tilt and added an `IntersectionObserver` to trigger scroll-reveal animations for event cards.




- 15:07 +05:30: Reworked the reader Galactic History implementation to match the supplied technical specification. `TimelineHub.parseWikiData(rawJson)` now normalizes the raw `timeline_tree.json` scrape into eras, sub-eras, and `{ year, era, text }` events; Galactic History now renders Page 1 era selection, Page 2 sub-era selection with parent-era background and glassmorphic image cards, and Page 3 detailed timeline with sub-era background, sticky SVG frequency chart, viewport scrubber, centered vertical branching event list, and arrow-key jumps between eventful years. Added `ImageMapping` to `js/timelines/galacticTimelineAssets.js` for normalized title-to-image resolution, and updated `styles.css`, `docs/CODEBASE_ARCHITECTURE.md`, and `docs/FUNCTION_INDEX.md` accordingly.
- 14:12 +05:30: Reworked the reader Galactic History focused era view into a two-part explorer in `js/timelines/TimelineHub.js` and `styles.css`: era pages now show a horizontal sub-era timebar with event-frequency bars, then a selected sub-era eventful-year navigator with branching same-year events and previous/next year controls. Expanded `js/timelines/galacticTimelineAssets.js` with twelve sub-era placeholder image variables and SVG dummy assets under `data/timeline/galactic/`. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md` for the new timeline behavior.

### Fixed
- 01:57 +05:30: Applied styling improvements to `styles.css` for the reader Galactic History console: darkened the focused left panel gradients for higher contrast, styled sub-era and timeline cards with soft translucent borders and backdrop blurs (glassmorphism), reduced timeline title size on the sidebar, aligned timeline event nodes/dots with a clean vertical track, and constrained event detail text width to avoid overlapping the illustration.
- 01:42 +05:30: Restored Galactic History sub-era poster card background images and gradient overlays in `styles.css`. Implemented responsive layout, color theme definitions, and text shadows for sub-era cards and event ranges. Aligned focused timeline header title/icon layouts to top-aligned (`align-items: flex-start`), and added a global font-family inheritance reset for buttons and input fields to prevent fallback monospace rendering.
- 01:00 +05:30: Fixed the reader Galactic History timeline art layering so era poster and sub-era cards render their configured HD images as a single contained layer instead of being covered by fallback theme art. Focused era pages now reuse the selected era poster as their background image rather than the generic focus hero.

## [2026-06-02]
### Fixed
- 20:49 +05:30: Added `js/timelines/galacticTimelineAssets.js` as the reader Galactic History image config, exposing named variables for every overview, era, focused-view, and sub-era asset. Reworked `TimelineHub` and timeline CSS so era posters, focus hero art, sub-era cards, and event details render dedicated image blocks from the config instead of relying on hardcoded CSS URLs or broad background images.
- 20:39 +05:30: Reworked the reader Galactic History page into a full-viewport archive console matching the supplied full-page concept. Added local poster and focused-view image crops under `data/timeline/galactic/`, hid the standard reader chrome while the console is active, replaced gradient-only cards with art-backed era posters, and tightened the focused era/timeline layout around the reference.
- 20:26 +05:30: Tightened the Galactic History concept redesign after screenshot review: filtered generated date/heading fragments out of event feeds, expanded the chronology console width and focused layout, replaced bokeh-like poster gradients with layered silhouette-style era art, and clamped feed cards so long archive titles no longer spill or clip.
- 20:20 +05:30: Redesigned the reader Galactic History page around the supplied concept reference. The route now presents a cinematic major-era poster grid first, then switches in-page to a focused era page with hero stats, sub-era cards, a right-side chronological feed, and a selected-event detail panel. Added responsive console styling and wired era/sub-era/event interactions in `TimelineHub`.
- 19:55 +05:30: Reworked the reader Galactic History era renderer so nested list headings with children are promoted into real browsable blocks, fixing archive sections that had empty `children` arrays but meaningful `lists` content. Expanded era cards now render record rows, block filter chips, show-more controls, and a stronger high-contrast archive-console visual treatment.
- 19:48 +05:30: Fixed the reader Galactic History explorer selecting the first duplicate "Timeline of galactic history" section from the local archive tree, which could be a metadata-only notice block. `TimelineHub.getGalacticRoot()` now ranks duplicate sections by child-era count and recursive record count so the real era tree renders.

### Changed
- 19:44 +05:30: Upgraded the reader timeline into a two-phase chronology explorer. `#timeline/{slug}` now opens a Story History / Timeline of Galactic History chooser, Story History renders as a searchable long-history list with linked character chips, and Galactic History lazily loads `data/timeline/timeline_tree.json` into expandable era cards. Added `js/timelines/TimelineHub.js`, updated reader routing/styles, and documented the new timeline module.

- 17:45 +05:30: Reduced reader map route-label crowding by expanding active label offsets and collision penalties, removed the hybrid route "Exit" / "Approach" SVG text, and converted all reader map planet pins to double-ring markers with per-node colors sampled from the map image when available. Added `crossorigin="anonymous"` to the reader map image for safe color sampling and updated map docs.
- 17:33 +05:30: Refined the reader map route UI so active planet labels render above node pins, include connector stems back to their planets, and use higher route-label stacking. Also shifted the route information overlay below the top map controls and upgraded it to a stronger glassmorphic style. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.
- 16:58 +05:30: Improved public reader map routing readability by adding collision-aware active route label placement and an in-map route information overlay that appears after plotting a course. The overlay positions itself away from the active route and route nodes, while the side-panel route details remain available. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.
- 15:39 +05:30: Fixed `writer.html` Published Tree chapter creation by adding a direct live `chapters` insert path. The Published Tree Add Document action now creates an unpublished draft chapter with the next available chapter order, opens it in the writer, and supports publishing through the existing inspector status control. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.
- 15:29 +05:30: Hardened the ScribbleHub autosync fetch path by using browser-like request headers, logging whether `SCRIBBLEHUB_COOKIE` loaded, and stripping accidental wrapping quotes from `.env` values in `scripts/run_scribblehub_sync.ps1`.
- 15:22 +05:30: Added a `-Backfill` switch to `scripts/run_scribblehub_sync.ps1` so the PowerShell wrapper can load `.env` and pass `--backfill` through to the ScribbleHub autosync worker.

## [2026-05-29]
### Fixed
- 03:35 +05:30: Relaxed the manual `writer.html` Render Markdown guard so it works on the editor's current markdown-like text even after normal editing/formatting, instead of rejecting anything that is not a plain-text Quill Delta.
- 03:32 +05:30: Converted `writer.html` markdown rendering from automatic to manual. Removed text-change/load auto-render hooks, added a Render Markdown editor-header button plus `Ctrl+Shift+M`, and limited conversion to plain-text Quill documents so normal edits cannot trigger surprise re-rendering.
- 03:24 +05:30: Fixed `writer.html` markdown rendering so blank markdown lines are preserved as empty Quill paragraphs, keeping visible gaps between rendered paragraphs without reintroducing global paragraph-margin CSS.
- 03:19 +05:30: Removed the extra `writer.html` Quill paragraph margin CSS added during markdown rendering refinement, returning paragraph spacing to Quill's native behavior while keeping the markdown blob-regression guard.
- 03:16 +05:30: Fixed a `writer.html` markdown auto-render regression where editing/deleting lines in already-rendered documents could collapse the whole document into one text blob. Auto-render now only runs on plain-text Quill Deltas, and the markdown renderer preserves line-based paragraph breaks.
- 01:30 +05:30: Refined `writer.html` markdown rendering so markdown-like current editor text auto-renders after edits settle instead of relying on a paste-event hook. Saved plain-text Delta markdown now renders on document open. Updated writer docs and the performance report.
- 01:21 +05:30: Added native markdown detection/rendering to `writer.html` for LLM copy/paste workflows. Plain-text markdown pasted into Quill is converted to HTML without external libraries, raw markdown bodies are rendered on load when detected, and the writer performance report plus docs were updated.
- 01:15 +05:30: Added an explicit `writer.html` close-document flow for very large documents. The editor header now includes a close button, switching documents closes/unloads the current Quill content before opening the next node, cached full body content is released on close, split view/inspector/editor chrome reset, and the close path yields frames so the browser can settle between long-document teardown and mount. Updated writer docs and the performance report.
- 01:04 +05:30: Reduced `writer.html` long-document switching freezes by yielding a paint frame before large Quill content injection, suppressing programmatic-load text-change work, using a faster plain-text Delta load path, deferring full metrics scans to idle time, caching editor counts for target/session panels, and updating the active binder highlight without rebuilding the full tree. Updated the writer performance report and documentation.

## [2026-05-28]
### Fixed
- 03:28 +05:30: Applied the first `writer.html` performance and correctness pass: lightweight binder queries, lazy global-search body hydration, precomputed binder child indexes, serialized autosave revision guards, stale async node/link/search guards, batched Quill metrics updates, split-view rendering without throwaway Quill instances, and minor HTML escaping/link-search hardening. Added the applied-fixes log to `Internal_tools/performance_report_writer.md` and updated writer architecture/function documentation.

## [2026-05-27]
### Fixed
- 10:41 +05:30: Refined the `admin.html` gallery workspace so it now uses a single broad-view image board with a side toggle between published and unpublished collections instead of rendering both pools side by side. Also fixed gallery image saving by making the tag autocomplete render immediately and adding a resilient tag-value fallback, restoring the gallery tag system and preventing the `document.getElementById(...).value is null` save error. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.

## [2026-05-25]
### Added
- 23:21 +05:30: Added a standalone ScribbleHub chapter autosync worker at `scripts/scribblehub_autosync.js`, plus `.env.example`, Windows helper scripts (`scripts/run_scribblehub_sync.ps1`, `scripts/register_scribblehub_sync_task.ps1`), and a `npm run sync:scribblehub` entrypoint. The worker polls a ScribbleHub series feed/page for recent chapters, fetches unseen chapter bodies, and inserts them into the existing Supabase `chapters` table with a hidden provenance marker for idempotent re-syncs. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md` to document the new automation flow.

## [2026-05-26]
### Changed
- 22:11 +05:30: Rebuilt the `admin.html` gallery manager into a story-wide media workspace with search/filter controls, richer image cards, quick publish/hide actions, and a dedicated unpublished image pool. Gallery forms now support `is_published` state directly, the reader SPA now filters gallery queries to published images only, and `scripts/sql/2026-05-26_gallery_image_publish_state.sql` was added to introduce the new database column/index without changing your existing policies. Updated `docs/CODEBASE_ARCHITECTURE.md`, `docs/FUNCTION_INDEX.md`, `docs/DATABASE_CONTEXT.md`, and `docs/READER_API_MAP.md`.

### Fixed
- 14:54 +05:30: Added `--backfill` mode to the ScribbleHub autosync worker to crawl TOC pages (`?toc=N`), resequence `chapter_order`, and insert missing earlier chapters ahead of previously imported recent chapters (with mixed-chapter safety checks and dry-run = no writes).
- 14:42 +05:30: Updated the ScribbleHub autosync worker so `--dry-run` does not fetch chapter bodies, added fetch throttling via `SCRIBBLEHUB_FETCH_DELAY_MS`, and made sync passes skip individual chapter fetch/parse failures (like `403 Forbidden`) instead of aborting the entire run.
- 23:22 +05:30: Moved the public gallery R18 control into a shared gallery header and updated reader gallery ordering so enabling R18 reveals mature-tagged images first in both the recent-items feed and individual character galleries. `js/render.js` now renders the shared header toggle and removes the per-character R18 button, while `js/ui.js` centralizes mature-tag detection, ordering, latest-grid rerendering, and load-more consistency. Updated `docs/CODEBASE_ARCHITECTURE.md`, `docs/FUNCTION_INDEX.md`, and `docs/READER_API_MAP.md` to reflect the new behavior.
- 23:08 +05:30: Fixed the public gallery R18 visibility regression so mature-tagged images saved from `admin.html` no longer disappeared from reader gallery surfaces by default. This laid the groundwork for the later shared-header toggle refinement the same night.
- 22:47 +05:30: Hardened the reader SPA startup and route lifecycle against intermittent stuck-loader states. `js/main.js` now has a bootstrap watchdog and catches noncritical loader/auth/prefetch failures, `js/router.js` now time-boxes route rendering and guards synchronous cleanup failures, and `js/ui.js` now time-boxes dynamic loader imports with a direct primary-loader DOM cleanup fallback. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md` to reflect the new loader safety behavior.

## [2026-05-23]
### Added
- 11:45 +05:30: Added [`docs/READER_API_MAP.md`](docs/READER_API_MAP.md) with a dedicated API reference for `js/config.js`, `js/db.js`, and `js/auth.js`, covering exports, shared state, database touchpoints, side effects, and UI dependencies.

### Changed
- 12:00 +05:30: Rewrote `AGENTS.md` to match the current architecture, including the modularized `index.html` reader, the addition of `cartographer.html` as a primary application surface, and explicit instructions for using and maintaining `docs/READER_API_MAP.md`.
- Modularized `index.html` (the Reader SPA) into a clean HTML shell importing a unified `styles.css` and a modular ES6 JavaScript architecture located in the `js/` directory (`main.js`, `config.js`, `db.js`, `auth.js`, `router.js`, `render.js`, `ui.js`, `comments.js`, `maps/`).
- Fixed dynamic import pathways for modular loaders (`primary_loader` and `anomaly_loader`) to resolve correctly relative to `js/ui.js`.
- Created separate detailed architecture documentation for the modularized `index.html`.
- Completely rewrote and updated `docs_v2/reader/functions.md` with a comprehensive and highly-detailed mapping of all the new ES6 modules, functions, and objects.

## [2026-05-24]
### Fixed
- 22:18 +05:30: Fixed the reader router so direct `#gallery/...` loads no longer leave the primary cold-start loader stuck above the maturity advisory modal. `js/router.js` now releases the active loader even when the gallery warning intercepts routing before a gallery render begins, and the related reader documentation was updated in `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.

### Changed
- 22:22 +05:30: Updated `AGENTS.md` with a ChatGPT/Codex-specific `apply_patch` note explaining why literal patch matching can fail on changed or mis-encoded lines and documenting the safer workflow for creating small, exact hunks.
## [2026-06-14]
### Changed
- 06:51 +05:30: Fixed the reader Gallery landing layout so the unified Visual Archive panel no longer clips the hero/browser block at a fixed 500px height. `styles.css` now lets the feature shell grow with roster content and removes the desktop-only internal scroll lock from the right-side character browser grid. Updated `docs/CODEBASE_ARCHITECTURE.md` to match the new content-driven archive behavior.
- 03:17 +05:30: Reworked the main Visual Archive landing into an archive-console layout inspired by the supplied reference: featured character presentation, story-backed scenic panel, gallery metrics, and a horizontal collection roster rendered as compact interactive Deck View previews. Preserved the existing reader background behavior and kept Recently Added below the collection area.
- 03:17 +05:30: Upgraded the public reader gallery into the Visual Archive with a cinematic landing page, improved roster/recent cards, character-gallery search, tag filters, curated/newest/top-rated sorting, richer metadata, and an accessible on-demand discussion lightbox.
- 03:17 +05:30: Preserved the original 3D scrolling Deck View and added boundary-aware wheel release, keyboard controls, touch swipes, focus styling, and reduced-motion handling.
- 05:55 +05:30: Reduced Supabase image egress for new uploads by adding one-year cache metadata to unique Storage paths, fail-safe client-side WebP conversion for ordinary admin/reader PNG/JPG/JPEG uploads, and original-byte preservation for high-fidelity maps.
- 05:55 +05:30: Added safe image loading hints across reader/admin/cartographer surfaces, prevented unchanged reader background/lightbox URL reassignment, reused same-map Leaflet image overlays, and documented that existing Storage object metadata is not changed retroactively.

## 2026-06-23 21:33 +05:30

- Added the lightweight subscription.html member reader SPA with mobile-first navigation, story library, tier-aware chapter catalog UI, locked access gates, Patreon connection placeholder, access-key redemption screen, account entitlement dashboard, and reader preference bottom sheet.
- Added subscription reader modules under js/subscription/ and scoped subscription styles in styles.css.
- Added sql/2026-06-23_reader_subscription_access.sql for access tiers, entitlements, provider connections, provider mappings, hashed access keys, redemptions, audit logs, chapter access columns, secure chapter catalog/content RPCs, and RLS policy changes.
- Updated modular documentation for the new subscription reader surface and access model.

## 2026-06-23 21:36 +05:30

- Added initial Supabase Edge Functions for Patreon OAuth start/callback, normalized provider webhooks, and provider entitlement sync boundaries. These keep provider secrets/server writes outside the subscription SPA and are ready for provider-specific webhook signature logic and any additional sync rules.


## 2026-06-23 21:44 +05:30

- Extended dmin.html with a Member Access / Access Control workspace for subscription tiers, access-key generation/revocation, manual reader grants, and provider tier mappings.
- Extended chapter editing in dmin.html with required access tier, public release date, and safe preview text fields for subscription.html chapter gates.


## 2026-06-24 16:14 +05:30 - Subscription reader Aether Pages bridge

- Replaced `subscription.html`'s earlier scaffold shell with the Aether Pages member-reader shell and active bridge scripts.
- Imported the Aether Pages visual system into `subscription.css`, reframed it as desktop/tablet-rich with responsive adaptation, and omitted the copied Cloudflare challenge injection.
- Added `js/subscription/aether-data.js` and `js/subscription/aether-app.js` as temporary Phase 1 bridge files so the approved Aether Pages product/UI flows are now the active subscription surface.
- Reset the bridge's default access state to anonymous and routed the account icon to the access vault instead of the old persona switcher entry point.
- Restored/updated `docs_v2/` source docs from the current modular docs, documented the Aether Pages bridge, and recompiled legacy docs with `npm run compile-docs`.

## 2026-06-24 16:34 +05:30 - Aether Pages auth/access bridge

- Added a Supabase-aware auth bridge inside `js/subscription/aether-app.js` while the Aether Pages monolith is being split.
- Account sheet now supports Supabase password sign-in, sign-up, sign-out, session restore, and entitlement display.
- Patreon connect now calls the `patreon-oauth-start` Edge Function and no longer fakes immediate member access when the provider is not configured. Provider re-sync now refreshes Supabase entitlements instead of mutating local persona state.
- Access-key redemption now calls the `redeem_access_key` RPC instead of granting local demo access.
- Updated subscription reader docs and recompiled generated docs.

## 2026-06-24 16:57 +05:30 - Aether Pages backend catalog bridge

- Added a backend story/catalog loader to the active Aether Pages bridge: published `stories` metadata is loaded from Supabase and chapter cards are populated through `get_chapter_catalog` safe metadata.
- Added on-demand secure reader content loading through `get_reader_chapter`; backend chapter bodies are requested only when a readable chapter is opened and the RPC authorizes content.
- Added backend-to-Aether state mapping, story/chapter normalizers, generated backend update rows, and safe fixture fallback when catalog RPCs are not deployed yet.
- Updated subscription reader docs and recompiled generated docs.

## 2026-06-24 17:12 +05:30 - Real backend fallback for Aether Pages bridge

- Fixed the Aether Pages bridge still showing mock data when subscription RPCs are not deployed by adding a direct published chapter metadata fallback after `get_chapter_catalog` schema-cache failures.
- Added a direct published chapter content fallback after `get_reader_chapter` failures so current pre-migration real chapters can open from Supabase.
- Documented the fallback as transitional and recompiled generated docs.

## 2026-06-24 17:33 +05:30 - Harden subscription SQL before DB application

- Revised `sql/2026-06-23_reader_subscription_access.sql` and mirrored `scripts/sql/2026-06-23_reader_subscription_access.sql` based on external SQL security review before any database application.
- Replaced blanket `public.chapters` policy dropping with explicit known policy drops.
- Added parent-story publication checks to raw chapter table policies so published chapters from unpublished stories cannot leak.
- Added explicit revokes/grants for new subscription tables and RPC function execution.
- Added PostgREST schema reload notification and access-key high-entropy guidance.
- Updated subscription/database docs and recompiled generated docs.

## 2026-06-24 17:58 +05:30 - Admin-aware subscription bridge

- Added profile-role loading to the Aether Pages bridge so signed-in admin profiles are recognized on `subscription.html`.
- Added admin CMS links to the account/top chrome for admins.
- Gated `#/studio` preview routes to admin profiles and rendered an admin-required gate for non-admin users.
- Documented the admin-aware bridge behavior and recompiled generated docs.

## 2026-06-24 18:12 +05:30 - Fix redeem access key pgcrypto lookup

- Updated `redeem_access_key` in the subscription migration to use `SET search_path = public, extensions` so Supabase can resolve `pgcrypto.digest`.
- Added `sql/hotfixes/2026-06-24_fix_redeem_access_key_pgcrypto_search_path.sql` for databases that already applied the previous function version.
- Documented the hotfix and recompiled generated docs.

## 2026-06-24 18:28 +05:30 - Remove direct chapter body fallback after RPC deploy

- Removed the temporary direct `chapters.content` fallback from the Aether Pages bridge reader route.
- Backend chapter bodies now load only through `get_reader_chapter`, preserving the entitlement/RLS security boundary after the subscription RPC migration is deployed.
- Updated subscription reader docs and recompiled generated docs.
