# READER SPA — Architecture & Design System

This document outlines the architecture, global state management, initialization flow, and feature conventions for the public-facing Reader Single Page Application (`index.html`).

---

## 1. Purpose & Core Features

`index.html` serves as the public frontend for readers to browse and read stories, characters, lore, and interactive maps. It is designed as a single-file SPA utilizing vanilla HTML, CSS, and JavaScript.

### Core Visual & Functional Features:
- **Immersive Visuals:** Glassmorphic layout, dynamic floating canvas-particle background, and tailored HSL color themes loaded dynamically from story metadata.
- **Unified Navigation Router:** A custom client-side hash router that manages stage visibility and view transitions.
- **Reader Interface:** Immersive reading view with a persistent customizable Lightsaber Loading Widget (`SaberController`) that gates transitions.
- **World-Building Encyclopedia & Timelines:** Renders lore nodes, categorizations, and interactive timeline timelines mapping historical events to characters.
- **Character Gallery & voting:** Premium roster fanning view modes ("Card Deck" fanned fanning vs classic column "Grid") with age gating (R18/NSFW filters) and vote casting.
- **Interactive Navigation Star Chart (MapViewer):** A Leaflet.js-powered visual mapping canvas supporting Dijkstra-based pathfinding, hybrid routing for isolated planet nodes, connected-component parsing, and cross-map navicomputer hint lookups.

---

## 2. Global State Reference

The SPA state is stored globally in specialized manager objects:

- `supabaseClient` *(Object)* — Holds the initialized Supabase client instance.
- `currentStory` *(Object | null)* — The active loaded story row.
- `Router` *(Object)* — Manages navigation states, routing actions, and delays.
    - `_activeRouteToken` *(Number)* — Monotonic token used to reject stale async route completions during rapid clicks.
    - `_pendingNavigationTimer` *(Number | null)* — Timeout handle governing the fade-out phase of screen transitions.
- `CommentsManager` *(Object)* — Tracks comments drawers, lists, and comment form submissions.
- `UI` *(Object)* — Houses state toggles for modal displays, global notifications, and warning banners.
    - `State.galleryConfirmed` *(Boolean)* — Tracks mature/AI warning acceptance for the gallery session.
    - `State.galleryViewMode` *(String)* — Controls gallery layout: `'grid'` vs `'deck'`. Persisted to `localStorage`.
    - `State.showR18` *(Boolean)* — Governs active mature artwork visibility filter. Persisted to `localStorage`.
- `Cache` *(Object)* — TTL + LRU query cache.
    - `stories` / `author` *(Object | null)* — Stores stories and author records with TTL timestamps.
    - `_hubEntries` *(Array)* / `_hubMap` *(Object)* — Holds parsed story hub tables (max 5 records, 5-minute TTL).
- `Particles` *(Object)* — Floating canvas animation loops.
    - `_rafId` *(Number | null)* — Active animation frame handle.
    - `_paused` *(Boolean)* — Suspends physics loop when page is hidden.
- `UserAuth` *(Object)* — Active reader auth session.
    - `user` / `profile` *(Object | null)* — Active Supabase Auth record and matching DB profile profile details.
- `MapViewer` *(Object)* — Navigation star chart controller.
    - `mapData` *(Object | null)* — Node and edge objects retrieved from Supabase.
    - `currentMap` *(Object)* — Active chart metadata including pixel dimensions.
    - `graph` *(Object | null)* — Built adjacency list for path traversal.
    - `mapHeight` *(Number)* — Height baseline used for coordinate Y-axis inversion.
    - `state.pendingX` / `state.pendingY` / `state.dragTicking` — Drag coordinate buffering throttled via `requestAnimationFrame`.
    - `componentIndex` / `nodeComponentIndex` — Map of connected graph clusters to identify isolated systems.
    - `edgeLengthIndex` — Dictionary of pre-computed polyline lengths.
    - `routeState` — Contains active endpoints (`origin`, `destination`), off-lane segment geometry, and routing warning messages.
    - `crossMapIndex` — Quick dictionary mapping planet names to sibling charts to provide navigate links for cross-map planet queries.

---

## 3. Application Initialization Flow

When a reader loads the page, the application bootstraps through the following sequence:

1. **`DOMContentLoaded` Trigger:**
   - **Router Hook:** Initial hashes are bound, capturing the starting URL token.
   - **Lightsaber Loader Boot:** `SaberController.init()` sets up the vertical overlay and syncs visual backdrop details with the current device viewport.
   - **Session Verification:** `UserAuth.init()` triggers `supabase.auth.getSession()` to recover credentials. If active, it invokes `fetchProfile(user)` with an exponential backoff retry loop (to protect against database sync latency upon registration).
   - **Metadata Themes:** The application fetches system configurations and wallpaper backgrounds, applying them as CSS variables directly to the document root element.
   - **Particle Canvas Startup:** Spawns the floating background elements on a full-bleed canvas.
   - **Initial Route Dispatch:** `Router.handle()` is fired. The loader covers the screen, fetches page-specific data via standard DB wrappers, renders target HTML fragments, and finishes by executing the out-fade transition.
2. **Interactive Star Chart Setup (If Route Is Maps):**
   - Navigating to `#maps/storySlug/mapId` triggers `Render.maps()`.
   - The map dimensions are parsed and `MapViewer.init()` binds pointer drags, context menus, and navigation UI listeners.
   - `MapViewer.loadMapData()` fetches database nodes and edges, parses coordinates, runs connected-component segmentation, and draws SVG lane paths.

---

## 4. Supabase Usage & Query Encapsulation

- **Authentication:** Restricts comment edits and gallery votes to registered users. Sessions are checked on bootstrap; login and registration views are managed within a floating glassmorphic modal.
- **Client-Side Caching:** The custom `Cache` object optimizes Supabase query overhead:
  - Simple lists (stories list, author links) cache globally with a 5-minute TTL.
  - Complex nested queries (e.g. story encyclopedia fetches containing characters, lore, and wallpapers) use a 5-entry LRU cache, evicting the oldest record upon limit overload.
- **Relationships & Joins:** Rather than executing waterfall queries, relational queries utilize deep joins (e.g. `lore_entries(category_id(*))` or `.in('id', array)` formats) to collect references in unified database operations.

---

## 5. Navigation Star Chart Conventions

The Map System inside the Reader SPA is divided into two distinct structural zones to optimize navigation:

1. **The Star Chart Registry (Map Hub):**
   - Renders at `#maps/storySlug`.
   - Displays map cards dynamically organized into three categories: **Galactic**, **Regional / Sector**, and **Local**.
   - Thumbnail cards show live stats (node and hyperlane counts) query-calculated from database joins.
   - Real-time search filters are provided to quickly locate charts by name or category.
2. **The Interactive Star Chart Viewer:**
   - Renders at `#maps/storySlug/mapId`.
   - Utilizes Leaflet.js Simple CRS coordinates to project a full-screen zooming canvas for custom maps.
   - Displays floating layers for hyperlanes, custom curves, and interactive planet markers.
   - **Dijkstra Navigation Engine:** Readers can select Origin and Destination nodes. Standard paths traverse mapped lanes, rendering as glowing, pulsing lines.
   - **Hybrid Routing Fallback:** If a planet is unlinked (isolated world), the navigation computer finds the closest coordinate intercept along the nearest hyperlane or exit node, draws a dashed cyan "unregistered travel" vector, and provides reader warnings.
   - **Cross-Map Hints:** Search boxes query a cross-map index. If a planet exists on a sibling chart, it triggers a navigation tip: *"This planet is located on [Chart Name]. Click here to switch charts."*
