This document outlines the architecture of the "Abstracto Tales / The Aether Archives" project. It comprises three single-file Single Page Applications (SPAs) for administrative and editing interfaces, and a highly modular, clean ES6-module-based SPA for the public-facing reader frontend.

## 1. Purpose

### `index.html` (Reader Frontend - Modularized)
The public-facing frontend designed for readers to browse and read stories. While originally a single-file monolith, it is now refactored into a clean skeleton utilizing a project-wide external stylesheet (`styles.css`) and a modular ES6 codebase:
- **`index.html`**: Clean skeletal HTML layout and external resource preload tags.
- **`styles.css`**: Complete layout, theme configurations, animations, and custom typography.
- **`js/main.js`**: Central bootstrapper and entry point.
- **`js/config.js`**: Environment keys, central `State` registry, and lightsaber preferences.
- **`js/db.js`**: Database API operations and LRU/TTL caching layers.
- **`js/auth.js`**: Profile synchronization and user authentication flow.
- **`js/comments.js`**: Comment drawers, inline annotations, and discussion managers.
- **`js/ui.js`**: Interface templates, particle engines, audio controllers, and lightsaber indicators.
- **`js/render.js`**: Dynamic HTML generator functions for pages and tabs.
- **`js/router.js`**: Custom client-side hash router and stage transition handling.
- **`js/timelines/TimelineHub.js`**: Two-phase chronology explorer for Story History and the local Galactic History JSON tree.
- **`js/timelines/LocationHistoryIndex.js`**: Lazy location-history lookup that scans Story History plus parsed Galactic History events and renders the map planet history overlay.
- **`js/timelines/galacticTimelineAssets.js`**: Central image registry exporting named Galactic History art variables and grouped asset maps used by `TimelineHub`.
- **`js/maps/MapViewer.js`**: Star chart SVG rendering and Dijkstra pathfinder.
- **`js/maps/MapHub.js`**: Star chart selector grids and dynamic catalog filters.

### `admin.html` (CMS / Admin Panel)
The restricted administrative portal used by the author to manage all content for the application. It provides comprehensive CRUD interfaces to draft stories, manage chapters, upload media (covers, maps, character avatars, wallpapers), and organize lore and timeline events. It enforces session-based authentication to ensure that only authorized users with an `admin` role can modify the database.

### `writer.html` (Writer's IDE)
A specialized, distraction-free writing environment (IDE) tailored for the author to draft content. It integrates a rich-text editor (Quill.js) with features like word targets, focus mode, typewriter scrolling, document snapshots, and split-view editing. It organizes both draft (Workspace) nodes and published elements into a hierarchical tree, reading and saving directly to the Supabase backend.

### `cartographer.html` (Collaborative Map Editor)
A collaborative map editing SPA where users with the `cartographer` or `admin` role can create story-linked maps, place planet nodes, and draw hyperlane paths on uploaded map images. Built on Leaflet.js (CRS.Simple) with Supabase-backed persistence. Features per-user color-coded contributions, a planet name autocomplete powered by `sw_planets.csv`, a changelog activity log, and multi-map support with dynamic coordinate spaces derived from uploaded image dimensions stored on the shared `maps` table.

### `scripts/scribblehub_autosync.js` (Background Chapter Import Worker)
A standalone Node.js worker for operational automation. It polls a configured ScribbleHub series, discovers recently published chapter links via the series RSS feed or series page, fetches unseen chapter bodies, and inserts them into the existing `chapters` table in Supabase using a service-role key. This script is intentionally isolated from the browser apps so `admin.html`, `writer.html`, and the public reader continue consuming the same chapter records with no frontend contract changes.

### `scripts/run_scribblehub_sync.ps1` / `scripts/register_scribblehub_sync_task.ps1` (Windows Runtime Helpers)
Supporting PowerShell helpers for Windows deployments. `run_scribblehub_sync.ps1` loads repo-local `.env` values into the process and launches the Node worker, while `register_scribblehub_sync_task.ps1` registers a Scheduled Task that starts the sync worker automatically at logon.

---

## 2. Global State

### `index.html` (Reader - Modularized)
Global state is encapsulated within the `State` object of `js/config.js` and specialized manager modules. Key properties and systems include:
- `window.supabase` *(Object)* — Holds the Supabase JS client instance initialized in `js/config.js`.
- `State.currentStory` *(Object | null)* — Holds the currently loaded story data.
- `Router` *(Object)* — Manages navigation state and current active view. Changes on hash change.
    - `_activeRouteToken` *(Number)* — Monotonic token used to ignore stale route completions so older async renders cannot re-hide/show the stage after a newer navigation starts.
    - `_pendingNavigationTimer` *(Number | null)* — Timeout handle for the delayed hash transition used by the fade animation, allowing same-route and rapid navigation cleanup.
- `CommentsManager` *(Object)* — Manages state for the comments drawer/panel.
- `UI` *(Object)* — Handles global UI state like toasts and loading spinners.
- `LoaderManager` *(Object)* — Unified modular loading orchestrator. Tracks `activeLoaderId` and `activeLoader`, maintains a registry of dynamic loader modules, and decides whether to load/execute the monogram cinematic (`'primary'`) or standard lightsaber loading sequence (`'lightsaber'`) depending on initial load state and specific story settings.
- `State.isInitialAppLoad` *(Boolean)* — Tracks whether the application is performing its initial cold load, letting the primary cinematic loader coordinate the intro overlay instead of the default lightsaber loading states.
- `State.galleryConfirmed` *(Boolean)* — Tracks whether the user has viewed and accepted the Mature Content and AI advisory warning overlay for the gallery, preserving the choice for the current session.
- `State.galleryViewMode` *(String)* — Tracks whether the active character gallery is displayed in standard column `'grid'` or premium fanning `'deck'` view modes, persisted to `localStorage`.
- `State.gallerySearch` / `State.gallerySort` *(String)* — Hold the active character-gallery text query and client-side order (`curated`, `newest`, or `top`) while the route is open.
- `State.showR18` *(Boolean)* — Tracks whether the gallery header toggle is revealing mature/R18/NSFW tagged artwork. When enabled, mature-tagged images surface first across recently added items and individual character galleries; when disabled, those images stay hidden. Persisted to `localStorage`.
- `Cache` *(Object)* — TTL + LRU cache for Supabase query results.
    - `stories` *(Array | null)* — Cached stories list with `storiesTTL` timestamp.
    - `author` *(Object | null)* — Cached author profile with `authorTTL` timestamp.
    - `_hubEntries` *(Array)* — LRU-ordered list of cached story hub data (max 5 entries, 5-min TTL).
    - `_hubMap` *(Object)* — Quick slug-to-hub lookup dictionary.
- `MapViewer` *(Object)* - Advanced interactive map engine.
    - `mapData` *(Object | null)* - Loaded node and edge data for the currently selected Supabase map record.
    - `currentMap` *(Object)* - Active reader map metadata including Supabase `id`, image `src`, display `name`, and coordinate `width` / `height`.
    - `graph` *(Object | null)* - Adjacency list used for Dijkstra pathfinding.
    - `mapHeight` *(Number)* - Internal coordinate space height (4000px) used for Y-axis inversion.
    - `state.pendingX` / `state.pendingY` / `state.dragTicking` *(Number/Boolean)* — State variables used to gate dragging layout updates inside a `requestAnimationFrame` loop.
- `MinPriorityQueue` *(Class)* - Lightweight binary heap implementation for Dijkstra pathfinding.
- `MinPriorityQueue` *(Class)* — Lightweight binary heap implementation for Dijkstra pathfinding.
- `default_behavior_lightsaber` *(String)* — Sets the site-wide default loader orientation (`'vertical'` or `'horizontal'`) used when the reader has not saved a personal saber mode preference yet.
- `Particles` *(Object)* — Background particle engine.
    - `_rafId` *(Number | null)* — Current `requestAnimationFrame` ID for cancellation.
    - `_paused` *(Boolean)* — Whether the engine is paused (e.g., tab hidden).
- `UserAuth` *(Object)* — Manages current user session.
    - `user` *(Object | null)* — The authenticated user.
    - `profile` *(Object | null)* — The user's profile info from the DB.

#### `index.html` MapViewer state additions
- `MapViewer.componentIndex` / `MapViewer.nodeComponentIndex` — Connected-component indexes used to separate routeable hyperlane clusters from isolated worlds.
- `MapViewer.edgeLengthIndex` — Cached per-edge geometry lengths reused by routing and nearest-exit calculations.
- `MapViewer.routeState.offlaneSegments` / `routeState.accessPoints` / `routeState.advisory` — Hybrid-route metadata for snapped exits, straight-line off-lane travel, and reader-facing warnings about unregistered approach legs.
- `MapViewer.routeOverlayDismissed` — Tracks whether the reader manually hid the current in-map route information overlay, resetting when a new course is plotted or cleared.
- `MapViewer.crossMapIndex` — Bidirectional cross-map indexing mapping lowercase planet names to a list of `{ mapId, mapName }` records where they exist across all charts in the current story, enabling cross-map search and snap hints.
- `MapViewer.storyMaps` — Local cache of all maps for the current story to enable quick name and metadata mapping.
- `MapViewer.storySlug` — Stores the current story slug to construct clean relative routing paths during map switching.
- `MapViewer.dockState` — Object managing open and pinned states for Navicomputer, World Intel, Itinerary, and Charts docks.

- `MapViewer.storyTimeline` - Stores the current story's timeline events while the reader map route is active so selected planets can search local Story History without another Supabase fetch.
- `MapViewer._historyRequestId` - Monotonic token that ignores stale compact planet-history overlay searches when readers click between map nodes quickly.
- `MapViewer.activeIntelTab` — Holds the active tab ID (e.g. `'overview'`) for the World Inspector left dock panel.

#### `index.html` TimelineHub state additions
- `TimelineHub._galacticTree` - Cached parsed copy of `data/timeline/timeline_tree.json`, loaded only when the reader opens Galactic History.
- `TimelineHub._galacticMetadata` - Cached parsed copy of `data/timeline/galactic_metadata.json`, loaded in parallel to decouple headers and assets from raw events.
- `TimelineHub._galacticData` - Cached normalized Galactic History state produced by `TimelineHub.parseWikiData(rawJson, metadata)`, containing eras, sub-eras, parsed BBY/ABY events, image assets, and chronology sort metadata for the UI.
- `TimelineHub._GALACTIC_TREE_URL` - Local JSON path used by the Galactic History explorer.

#### `index.html` LocationHistoryIndex state additions
- `LocationHistoryIndex._galacticCache` - In-memory Map keyed by normalized location name, caching Galactic History matches after the first planet-history lookup.
- `LocationHistoryIndex._overlay` - Reusable DOM overlay attached to `document.body` for map planet history results.

### `admin.html`
- `State` *(Object)* — The primary global state container for the admin panel.
  - `user` *(Object | null)* — The Supabase auth user object. Changes on auth state change.
  - `profile` *(Object | null)* — The admin user's profile data. Changes after fetching user profile post-login.
  - `currentView` *(String)* — Tracks the active view/section (e.g., 'dashboard', 'stories', 'characters', 'mapRequests'). Changes when navigating the sidebar.
  - `stories` *(Array)*, `characters` *(Array)*, `lore` *(Array)*, `mapRequests` *(Array)*, etc. — Caches for entity lists to populate tables.
  - `selectedStoryId` *(String | null)* — The ID of the currently selected story context for filtering chapters or related entities. Changes via the story dropdown on certain views.
  - `selectedCharacterId` *(String | null)* — For character relation filtering contexts.
  - `gallerySearch` *(String)* — Active admin gallery workspace search query spanning caption text, character names, and tags while filtering the published panel and hidden pool.

  - `galleryVisibilityFilter` *(String)* â€” Tracks whether the admin gallery workspace is currently showing the published board or the unpublished pool.

### `writer.html`
- `supabase` *(Object)* — Holds the initialized Supabase client instance.
- `currentStoryId` *(String | null)* — The ID of the story currently being edited. Initialized from the `?story_id=` URL parameter or the first available story; changes via the top-bar dropdown.
- `state` *(Object)* — The IDE's complex state manager.
  - `treeMode` *(String)* — Either `'workspace'` (drafts) or `'published'` (live entities). Changes via the binder tabs.
  - `nodes` *(Array)* — The current list of tree nodes (documents, folders, characters, etc.) for the active tree mode.
  - `nodeMap` *(Object)* — A dictionary mapping node IDs to node objects for quick lookup.
  - `childrenByParent` *(Object)* — A precomputed parent-id index used by the binder renderer to avoid repeatedly filtering the full node list while walking the tree.
  - `activeNodeId` *(String | null)* — The ID of the currently opened node in the editor. Changes when clicking a node in the binder.
  - `activeNodeRequestId` / `linksRenderRequestId` / `searchRequestId` *(Number)* — Monotonic request tokens used to ignore stale async editor, inspector-link, and global-search completions after the user changes context.
  - `expandedFolders` *(Set)* — Keeps track of which folders are visually expanded in the tree. Saved to/from `localStorage`.
  - `bookmarks` *(Set)* — A collection of bookmarked node IDs.
  - `savePromise` / `isSaving` / `pendingSaveAfterCurrent` *(Object | Boolean)* — Autosave coordination state that prevents overlapping Supabase writes from marking newer edits as saved.
  - `isDirty` *(Boolean)* — Tracks if the editor has unsaved changes. Changes on text input and resets on successful save.
  - `editorChangeRevision` *(Number)* — Incremented on each Quill text-change so save completions can tell whether newer edits happened while a write was in flight.
  - `isProgrammaticLoad` *(Boolean)* — Suppresses Quill `text-change` autosave work while large documents are being loaded into the editor.
  - `currentWordCount` / `currentCharCount` / `currentParaCount` *(Number)* — Cached editor metrics reused by target bars and session stats so long documents are not re-scanned by multiple panels.
  - `searchContentHydratedKey` *(String | null)* — Tracks whether full body text has been loaded on demand for the active story/tree mode global search.
  - `quill` *(Object)* — The Quill rich-text editor instance.
  - `currentTheme` *(String)* — The active UI theme name. Loaded from `localStorage`.
  - `sessionStartWords` / `sessionStartTime` *(Number)* — Tracking metrics for the active writing session.

### `cartographer.html`
- `supabaseClient` *(Object)* — Supabase client instance.
- `State` *(Object)* — Primary global state container.
  - `user` *(Object | null)* — Authenticated user. Set after login.
  - `profile` *(Object | null)* — User's profile row.
  - `pendingRequestCount` *(Number)* — Active pending contribution count.
  - `currentProject` *(Object | null)* — The active `maps` row used as the editor’s canonical parent record. Changes when switching maps.
  - `projects` *(Array)* — Cached list of available shared `maps` rows.
  - `stories` *(Array)* — Cached stories list used to require `story_id` when admins create new maps.
  - `nodes` *(Array)* — All `map_nodes` for the current map.
  - `edges` *(Array)* — All `map_edges` for the current map.
  - `mode` *(String)* — Current interaction mode: `'select'`, `'place'`, or `'trace'`.
  - `traceQueue` *(Array)* — Ordered list of nodes selected during trace mode before path finalization.
  - `isDirty` *(Boolean)* — Whether there are unsaved local changes.
  - `contributors` *(Object)* — Map of contributor user IDs to assigned display colors.
  - `undoStack` / `redoStack` *(Array)* — Client-side undo/redo history.
- `MapEngine` *(Object)* — Leaflet.js map controller managing layers, rendering, and Catmull-Rom spline interpolation.
- `Hub` *(Object)* — Post-login landing controller for map discovery, role-aware actions, and contribution status previews before entering the editor.
- `PlanetDB` *(Object)* — In-memory index of `sw_planets.csv` entries for autocomplete suggestions.
  - `entries` *(Array)* — Parsed planet records with `name`, `sector`, `region`, `grid` fields.

---

## 3. Initialization Flow

### `index.html` (Reader - Modularized)
The bootstrap sequence is triggered entirely within the ES6 module system of `js/main.js`:
1. **Module Loading & Global Binding:**
   - `<script type="module" src="js/main.js"></script>` imports all controller modules synchronously inside the module scope.
   - All modules (e.g. `Router`, `UI`, `DB`, `UserAuth`, `CommentsManager`, etc.) are explicitly bound to the global `window` object to prevent `ReferenceError`s from legacy inline event handlers.
2. **`DOMContentLoaded` Event Listener:**
   - Triggers `LoaderManager.show()` immediately to resolve and render the cold start primary loader. Loader module imports are time-boxed so a stalled dynamic import falls back instead of blocking app startup.
   - Starts a short bootstrap watchdog that invokes `Router.handle()` if loader or cosmetic startup work stalls before the initial route begins.
   - Initializes `Router` to set up hash change listeners.
   - `SaberController.init()` bootstraps the centered vertical lightsaber transition overlay before route rendering begins so loading states can mirror the live reader background without the separate progress bar overlay.
   - `UserAuth.init()` sets up the auth listener, checks existing session via `supabase.auth.getSession()`, fetching profile if needed, overriding default nav based on role.
   - Global `DB.getSettings()` call applies custom CSS variables from the backend.
   - Global `DB.getWallpapers()` call checks for custom main background.
    - `Particles.init()` starts the dynamic background canvas.
    - `Router.handle()` executes the initial route (e.g., `#home`), with same-route re-renders, guarded completion, time-boxed route rendering, and defensive loader teardown so failed, stalled, or stale async work cannot leave the reader stage blank or trapped beneath a stuck loader overlay. The same teardown path now also releases the cold-start loader if the gallery advisory modal intercepts the route before rendering. On initial load, the completion of this routing cycle triggers `LoaderManager.playOutro()` to transition smoothly into the active home view.
    - **Map Initialization:** When the maps view is rendered, `Render.maps()` passes the selected map row's `id`, image URL, and coordinate dimensions into `MapViewer.init()`, after which `MapViewer.loadMapData()` queries `map_nodes` and `map_edges` for that specific `map_id`.
2. **Reader Header Chrome:**
   - The top-right header controls combine utility shortcuts (saber settings, wallpaper/audio toggles, admin shortcut when applicable), a static contributor badge with a hover/focus popover crediting the Vesper collaboration, and the auth/profile slot managed by `UI.initAuthLink()`.

### `admin.html`
1. **`DOMContentLoaded` Event Listener:**
   - `Auth.init()` executes:
     - Keeps `#login-view` hidden by default so shared-domain Supabase sessions can restore without a visible login flash.
     - Checks session via `supabaseClient.auth.getSession()`.
     - If session exists, calls `Auth.loadProfile()` and only reveals the login view when profile validation fails.
     - Subscribes to auth state changes so cross-tab sign-in/out events can swap between the admin shell and login screen.
     - Subscribes to auth state changes so cross-tab sign-in/out events can swap between the admin shell and login screen.
   - `UI.applyAdminWallpaper()` fetches and sets custom admin background.
   - `Particles.init()` starts the background effects.
2. **Post-Authentication (`Auth.loadProfile` -> `Auth.showAdminView`):**
   - Populates sidebar user avatar/name.
   - Calls `Views.render('dashboard')` to render the default CMS view.

### `writer.html`
1. **IIFE -> `init()`:**
   - Checks for `Quill` and `window.supabase`.
   - Initializes Supabase using the global anon key.
   - `initQuill()` sets up the rich text editor on `#editor-quill`.
   - `bindEvents()` attaches UI listeners (buttons, modal handlers, hotkeys).
   - `setTheme(state.currentTheme)` applies the user's stored theme.
   - `DB.getStories()` populates the workspace dropdown, defaulting to the first or the `?story_id=` URL param.
   - `loadNodes()` fetches lightweight hierarchical document metadata from the DB, building `state.nodes`, `nodeMap`, and `childrenByParent`, then rendering the left sidebar binder. Full node bodies are fetched only when a document is opened or when global search hydrates searchable content on demand.
   - In Published Tree mode, the Add Document control creates a live draft `chapters` row with the next available `chapter_order`, opens it in the editor, and lets the existing inspector status control publish it directly from `writer.html`.
   - `startSessionTimer()` begins tracking time/word count.
   - During editing, Quill text changes increment a revision counter, schedule a debounced autosave, and batch editor metrics/outline/target updates through `requestAnimationFrame` so typing does not synchronously recompute all panels on every keystroke.
   - Long document switching first closes and unloads the current editor content, yields frames for the browser to release/render, then opens the requested document. The header close button uses the same unload path so very large documents can be explicitly closed before opening another.
   - Markdown rendering is manual: the editor header's Render Markdown button (or `Ctrl+Shift+M`) converts the editor's current markdown-like text through the native renderer. This avoids surprise re-processing while typing or deleting, while still allowing explicit conversion inside an already edited document.

### `cartographer.html`
1. **`DOMContentLoaded` Event Listener:**
   - Binds login form submit handler.
   - `Auth.init()` keeps `#login-view` hidden by default, checks for a shared Supabase session first, and only reveals the login screen when no valid session/profile is available.
   - Subscribes to auth state changes so sign-in/out from any tab can move between the login view, hub, and editor correctly.
2. **Post-Authentication (`Auth.loadProfile` -> `Hub.show`):**
   - Verifies profile `role IN ('cartographer','admin')`.
   - Populates shared user UI elements for both the hub and editor chrome.
   - Renders the Cartography Hub with active map cards, contribution status tab, and role-sensitive create/propose actions.
3. **Editor Entry (`Hub.openMap` or admin create flow -> `Auth.showEditor`):**
   - `App.init()` bootstraps: `ContextMenu.init()`, `MapEngine.init()` (Leaflet CRS.Simple), `Keyboard.init()` (V/P/T shortcuts), `PlanetDB.load()` (CSV autocomplete), `Particles.init()`, `DB.getStories()` (for story-linked map creation), `ProjectPicker.refresh()` (auto-selects first available map).

---

## 4. Supabase Usage & Conventions

### Initialization & Auth Pattern
Across all three files, Supabase is initialized via the CDN script: `window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` with a generic public anon key.

The authentication pattern is strictly **Session-Based**:
- **`index.html`**: Users log in (`signInWithPassword`) or register. Their session cookie determines permissions (e.g., leaving comments, liking gallery images).
- **`admin.html`**: Enforces strict role-based access control. Upon gaining a session, it queries `profiles` to check if `role === 'admin'`. If not, access isn't granted locally. `admin.html` relies on Supabase Row Level Security (RLS) to physically protect data on the backend.
- **`writer.html`**: Doesn't explicitly check or manage auth, implicitly relying on the active session cookie established by `admin.html` allowing the DB queries to pass RLS.
- **`cartographer.html`**: Enforces role-based access control, accepting `role IN ('cartographer', 'admin')`. It now uses the shared `maps` table as the parent source for hub/editor records, alongside `map_nodes`, `map_edges`, and `map_changelog` for topology/editor data.

### Database Query Conventions
In all files, Supabase data access is encapsulated in module objects (`DB` object).
- **`DB` Object Wrapper**: Supabase `.from()` calls are grouped into asynchronous methods (e.g., `DB.getStories()`, `DB.saveStory()`).
- **CRUD Operations**: Rigorously follows the standard `.select()`, `.insert()`, `.update()`, `.delete()` chain using `.eq('id', ...)` for targeting records.
- **Batched Queries**: Uses `.in('column', [...ids])` for bulk lookups (e.g., timeline character links) to avoid N+1 query waterfalls.
- **Client-Side Caching**: `Cache` implements TTL (5-min expiry) + LRU (5-entry cap) for story hub data. Stories and author profiles are also cached with TTL timestamps.
- **Error Handling**: Database calls throw errors that are caught by UI or form functions, utilizing a centralized `toast(message, 'error')` or `UI.showToast()` to alert the user.
- **Relationships**: Relational queries pull nested sub-records (e.g., `lore_entries(..., lore_categories(id, name))`) to avoid N+1 queries.

### Operational Worker Conventions
- **Service-role only for offline tooling:** `scripts/scribblehub_autosync.js` runs outside the browser and must use `SUPABASE_SERVICE_ROLE_KEY` from the environment instead of any client publishable key.
- **No schema fork:** The worker writes directly into `public.chapters`, preserving the existing reader/admin/writer flows instead of introducing a separate import table.
- **Import provenance marker:** Imported chapter bodies begin with an HTML comment marker in the format `<!-- imported-from:scribblehub {chapterUrl} -->`. This keeps the source URL attached to the chapter for idempotent sync checks while staying invisible in the reader render.
- **Recent-window polling:** The worker inspects the most recent ScribbleHub entries (default 15) so it can run continuously on a local machine or scheduler without needing a full historical crawl every pass.
- **Fetch throttling and skips:** The worker rate-limits chapter fetches by a small delay and skips individual chapters that fail to fetch/parse (e.g., `403 Forbidden` due to R18/login gating) so a single blocked page does not abort the whole sync pass.
- **Full backfill + resequencing:** When run with `--backfill`, the worker crawls the ScribbleHub series TOC pages (`?toc=N`), sorts chapters oldest-to-newest, then resequences `chapters.chapter_order` for already-imported ScribbleHub chapters and inserts any missing earlier chapters before the newer ones. This path is designed specifically for "import the last few chapters first, then backfill everything earlier" without losing ordering.

### Storage Conventions
Media assets are managed using Supabase Storage buckets.
- **Immutable upload paths:** New application-managed image uploads use unique timestamp/randomized names and `cacheControl: '31536000'`. Upload helpers retain a short-cache branch for any future intentional `upsert`/stable-path replacement so immutable caching is not applied to mutable objects.
- **Admin image optimization:** `admin.html` converts ordinary PNG/JPG/JPEG cover, background, character, gallery, lore, wallpaper, icon, and avatar uploads to bounded WebP files in the browser when conversion succeeds and is smaller/useful. GIF/WebP/unknown formats pass through untouched, and decode/canvas failures fall back to the original file.
- **Reader avatar optimization:** `js/auth.js` applies the same fail-safe pattern with a 1024px bound before writing uniquely named files to the `Reader` bucket.
- **Map fidelity boundary:** Map uploads in `admin.html` and `cartographer.html` preserve the original file bytes and dimensions instead of applying lossy conversion because coordinate alignment, pixel sampling, and OCR depend on the source image. They still receive immutable cache metadata when newly uploaded.
- **Existing objects:** Cache metadata and file encoding changes apply only to new uploads; existing Supabase Storage objects are not rewritten retroactively.

### Image Delivery Conventions
- Above-the-fold story covers, featured gallery art, lore-detail art, and active reader maps remain eager and may use high fetch priority.
- Offscreen reader/admin/cartographer thumbnails use native lazy loading, asynchronous decoding, and low fetch priority where appropriate.
- `UI.setBg()` and the gallery lightbox avoid reassigning an unchanged URL, preventing needless CSS/image reload or revalidation work.
- `cartographer.html` reuses the existing Leaflet base-image overlay when reloading the same map with unchanged dimensions, while still rebuilding topology layers.
### Reader Map Conventions
- **Two-Phase Map Discovery & Routing:** The maps view follows a robust two-phase routing structure. A root story map registry (`#maps/slug`) displays the **Star Chart Registry (Map Hub)**, which transitions into the **Interactive Viewer** (`#maps/slug/mapId`) when a specific map is selected. A glassmorphic top navigation bar on the viewer allows seamless return to the Registry.
- **Star Chart Registry (Map Hub):** A modern, grid-based interface displaying all charted maps associated with a story. Maps are dynamically grouped into **Galactic**, **Regional / Sector**, and **Local** categories, featuring live stats (node and hyperlane counts) on each thumbnail card.
- **Dynamic Search & Filtering:** The Map Hub includes a real-time responsive search bar to filter charts instantly by name or type category, dynamically hiding empty sections.
- **Cross-Map Planet Search & Navigation:** Navicomputer input fields (`Focus`, `Origin`, `Destination`) are enhanced with cross-map lookups. When a user queries a planet not charting on the current map, a non-intrusive hint detects if the world is charted in any other story map and provides one-click navigation links to switch charts instantly.
- The `maps` route renders as a full-viewport sci-fi console shell where the map fills 100% of the stage and all modules (Navicomputer, World Intel, Itinerary, and Map selector) live as edge-docked glassmorphic panels triggered dynamically.
- `MapViewer.init()` binds the interactive dial trigger, edge dock controls, layer toggles, and resets active route/dock states.
- `MapViewer` owns map switching, dock management, node selection, route plotting, inline routing status, route summaries, and itinerary generation.
- `MapViewer.routeState` persists selected endpoints plus computed route metadata, while `MapViewer.dockState` manages open/pinned states for all edge panels.
- `MapViewer.loadMapData()` queries `map_nodes` and `map_edges` by `map_id`, then remaps edge foreign-key fields into the legacy `source` / `target` shape expected by the routing engine.
- Map reader controls include layer toggles for labels and hyperlanes, explicit route actions (`Plot`, `Swap`, `Clear`, `Center Route`), and responsive layout behavior for smaller screens.
- Active route labels now run through a collision-aware placement pass that offsets important planet names around their nodes, raises those labels above nearby pins, and draws connector stems back to the owning planet node. Access-point markers no longer render separate "Exit" / "Approach" text labels, keeping hybrid route clusters less crowded.
- Reader map planet pins use a double-ring marker style. When the map image can be sampled safely, `MapViewer` derives each node's CSS color from nearby pixels on the underlying map image and falls back to the story accent color if canvas sampling is blocked.
- After plotting a course, MapViewer mirrors route distance, hop count, and a compact itinerary into a glassmorphic in-map overlay card. The card chooses a low-obstruction viewport corner based on the active route and route nodes, while also reserving vertical space below the top label/hyperlane controls and active map chip.
- `MapViewer.buildComponents()` now derives connected hyperlane clusters after graph construction so isolated worlds can be recognized without extra fetches.
- `MapViewer.edgeLengthIndex` caches polyline lengths for each lane so nearest-exit snapping and route totals reuse the same geometry measurements.
- When a selected world has no registered lane links, `MapViewer.calculateRoute()` falls back to a hybrid route that snaps to the nearest linked world or point on a hyperlane, renders a cyan straight-line off-lane segment, and adds itinerary/summary advisory copy warning that the remaining approach uses unregistered travel.
- Clicking a planet opens a compact, scrollable in-map history overlay first. `MapViewer.renderLocationHistoryOverlay()` passes the selected planet name and current story timeline into `LocationHistoryIndex`, which lazy-loads Galactic History if needed, scans by normalized exact location phrase, and caches Galactic matches in memory. The focused-world card and compact overlay still provide a Full History / Open Full Archive action through `MapViewer.openSelectedNodeHistory()` for the larger full-screen archive.

### Reader Timeline Conventions
- **Two-Phase Timeline Discovery:** The timeline route now opens a chronology chooser at `#timeline/{slug}`. Readers select either **Story History** (`#timeline/{slug}/story`) or **Timeline of Galactic History** (`#timeline/{slug}/galactic`) instead of landing directly in one long alternating list.
- **Story History:** The existing Supabase `timeline_events` stream is rendered as a searchable, compact long-history list with event counts, first/latest date stats, and linked character chips that navigate to the character gallery.
- **Galactic History:** The galactic reference view loads `data/timeline/timeline_tree.json` on demand through `TimelineHub.fetchGalacticTree()`. The parser expects the extractor shape `{ title, children, lists }` with nested list items shaped like `{ text, children }`, ranks duplicate "Timeline of galactic history" sections by child-era count and recursive record count, then runs `TimelineHub.parseWikiData(rawJson)` to normalize raw Wookieepedia scrape nodes into UI-ready eras, sub-eras, and `{ year, era, text }` event objects. Date parsing supports BBY/ABY values and implied-era ranges such as `34 - 35 ABY`.
- **Galactic History Browsing:** The first screen is the searchable major-era poster grid. Selecting an era opens Page 2, a parent-era-background sub-era selection page with a left-aligned 40%-width hero, a glassmorphic "View timeline overview" action, and an image-backed responsive sub-era card grid. Selecting a sub-era or overview opens Page 3, a detailed timeline view that uses the active sub-era image (or era image for overview), a sticky SVG mountain frequency chart, a glassmorphic viewport scrubber, and a centered vertical event list. Event cards contain only a quote icon and parsed paragraph text; same-year events branch left/right according to count, and left/right arrow keys jump between eventful years.
- **Galactic History Images:** `js/timelines/galacticTimelineAssets.js` exports `ImageMapping`, a normalized title-to-image configuration object, because `timeline_tree.json` does not contain image URLs. Fallback era and sub-era image arrays keep dynamic parsed sections image-backed even before final art is assigned.
- **Performance Boundary:** The large galactic JSON is not fetched on story hub load or timeline chooser load; it is cached in memory only after a reader enters the Galactic History view.

### `cartographer.html` Updates

#### Sandbox/Hub Wiring
- **Sandbox Editor:** Introduced a staging system for contributors to propose changes to maps. Changes are saved locally and submitted as "Submission Tickets" for admin review. The `SaveManager.submitRequest` method includes a `clean()` helper to strip local UI tracking states before submission.
- **Hub Dashboard:** Added a "My Contributions" tab for contributors to view their pending, approved, and rejected requests.
- **Coordinate Fixes:** Y-axis coordinates now align with a true Cartesian plane.

#### Security Enhancements & Activity Logging
- **Database Lockdown:** Non-admins can no longer directly modify `map_nodes` and `map_edges`. All changes must go through the new moderation queue.
- **Request Tables:** Added `map_requests` and `map_request_items` tables to handle proposed changes.
- **Activity Log:** Admin approvals in `admin.html` and direct admin edits in `cartographer.html` now automatically log activity to the `map_changelog` table via `DB.logChange`, ensuring a visible history in the map's Activity Log.

### `admin.html` Updates

#### Drag-and-Drop Dropzone & Interactive Tagging Pipeline
- **Drag-and-Drop Dropzone Component:** Replaced legacy basic image upload fields with a feature-rich, drag-and-drop-enabled Dropzone component (`UI.imageUploadField` & `UI.initDragAndDrop`). It supports dragenter/dragover hover highlights, seamless drag-and-drop file transfers, revocable object-URL previews, and fallback URL text field matching.
- **Interactive Tag Chip & Autocomplete System:** Integrated a dynamic, HSL-themed visual tag chip input (`UI.initTagComponent` & `UI.initTagAutocomplete`) that converts input strings into deletable tag chips. The autocomplete-powered variant fetches existing distinct tags from the database (filtering out structural flags like `NSFW`), allowing arrow-key selection, click selection, and custom tokenization. 
- **NSFW / R18 Content Categorization:** Implemented a standardized visual toggle switch inside `Forms.galleryImageForm` that isolates age-gated media assets. Upon saving, it programmatically injects or prunes structural metadata tags (`NSFW`) while maintaining standard user tags.
- **Reader Visual Archive:** The public gallery uses one unified sub-window: a dominant selected-character profile image, compact biography/action panel, and a right-side browser containing archive totals plus a content-driven profile-image grid that can grow with roster length instead of clipping inside a fixed-height viewport. Hovering or focusing a card updates the hero and marks the active card with an accent glow. The detached scenic quote panel, scattered hero previews, and separate roster section are intentionally absent. A small Gallery banner replaces oversized story typography, Recently Added remains below the unified window, and offscreen profile cards retain lazy/async/low-priority loading.
- **Multi-File Sequential Upload Flow:** Overhauled database save routines (`Forms.saveGalleryImage` / `Forms.saveWallpaper`) to sequentially upload all selected local files to Supabase Storage, inserting corresponding metadata records concurrently and providing immediate user feedback.
- **Published Gallery + Hidden Pool Workspace:** `Views.gallery` now loads every gallery image for the selected story, supports story-wide character/tag/caption filtering, and presents a single broad-view gallery board with a side toggle between the reader-visible published collection and the unpublished holding pool. Admins can add directly into either state or move existing images between them using `character_gallery_images.is_published`.
