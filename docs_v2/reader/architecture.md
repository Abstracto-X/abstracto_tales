# Reader SPA (`index.html`) — Modular Architecture

This document outlines the detailed architecture and module structure of the public-facing Reader Single Page Application (`index.html`).

---

## 1. Overview

`index.html` serves as the public frontend for readers to browse and read stories, characters, lore, and interactive maps. 
Historically a monolithic file, it has been refactored into a **modular ES6 architecture** to improve maintainability, separation of concerns, and developer experience.

The application uses **vanilla HTML, CSS, and JavaScript** without a build step or bundler.

### Core Structure
- **`index.html`**: A lightweight HTML shell. It contains the DOM structure, `<script type="module" src="js/main.js"></script>`, and imports `styles.css`.
- **`styles.css`**: Contains all styling rules and CSS variables for the application.
- **`js/`**: The core JavaScript directory containing the modular ES6 architecture.

---

## 2. ES6 Module Architecture

The application logic is broken down into specialized singleton modules.

### Entry Point
- **`js/main.js`**
  - Imports all other modules.
  - Exposes necessary modules to the global `window` scope for inline event handlers (`onclick`, etc.) found in the HTML.
  - Bootstraps the application on `DOMContentLoaded` by initializing auth, configuring routing, and starting visual engines (particles, cinematic loaders).

### Configuration & State Management
- **`js/config.js`**
  - **`supabaseClient`**: Initializes and exports the Supabase client.
  - **`State`**: A global state object containing active story references, filter states, mature content flags (`showR18`), gallery view modes, and initialization flags.
  - **`Utils`**: General helper methods (e.g., date parsing, text formatting, truncation, sanitize string).

### Data Access Layer
- **`js/db.js`**
  - **`DB`**: Encapsulates all interactions with Supabase (e.g., `fetchStory()`, `fetchStories()`, `fetchEncyclopedia()`).
  - **`Cache`**: Implements a robust TTL (Time-To-Live) and LRU (Least Recently Used) caching mechanism to prevent redundant database hits for heavy queries.

### User Authentication
- **`js/auth.js`**
  - **`UserAuth`**: Handles Supabase session retrieval, sign-in, registration, sign-out, and profile synchronization. Registration explicitly sends an `emailRedirectTo` derived from the current reader root so confirmation links preserve the deployed GitHub Pages subpath instead of relying on Supabase's Site URL fallback. Exposes active user and profile details.

### Routing & Navigation
- **`js/router.js`**
  - **`Router`**: A custom hash-based client-side router. Listens to `hashchange` and controls transitions between views (`home`, `story`, `read`, `maps`).
  - Governs transition fade-ins/outs and prevents rapid-click race conditions using monotonic routing tokens.

### Rendering Engine
- **`js/render.js`**
  - **`Render`**: Responsible for DOM manipulation and injecting HTML structures based on the active route.
  - Contains methods like `Render.home()`, `Render.storyHub()`, `Render.chapter()`, `Render.maps()`, each corresponding to a major view.

### User Interface & Interactions
- **`js/ui.js`**
  - **`UI`**: General UI state toggles, modal handling (Auth, Profile, Wallpapers, Saber Configuration), and background wallpaper dynamic updates.
  - **`Actions`**: Event handlers for gallery voting and R18 filtering logic.
  - **`SaberController`**: The interactive Lightsaber loading sequence overlay.
  - **`LoaderManager`**: Orchestrates transitions between various cinematic loaders (e.g., `primary_loader`, `anomaly_loader`) dynamically based on story theme configurations using dynamic ES modules (`await import()`).
  - **`Visuals` & `Particles`**: Floating canvas particles, depth-of-field glassmorphism filters, and lightbox mechanics.

### Comments & Community
- **`js/comments.js`**
  - **`CommentsManager`**: Controls the sliding comments drawer, fetching comments, posting replies, editing, and managing user interaction within discussions.

### Maps & Cartography
- **`js/maps/`**
  - **`MapHub.js`**: Controls the map selection interface ("Star Chart Registry").
  - **`MapViewer.js`**: The Leaflet.js-based interactive star chart engine. Handles panning, zooming, custom SVG lanes, and the Dijkstra-based pathfinding navicomputer.

---

## 3. Application Initialization Flow

When a reader loads `index.html`, `js/main.js` dictates the bootstrap sequence:

1. **`DOMContentLoaded` Hook:**
   - **Loader Initiation**: `LoaderManager.show()` is fired immediately. The primary monogram cinematic or the lightsaber loader takes over the viewport.
   - **Auth Check**: `UserAuth.init()` retrieves the active session from Supabase local storage and fetches user profile details asynchronously.
   - **Engine Startup**: Visual engines such as `Particles.init()` and `Visuals.initDynamicTransparency()` are started. Dynamic transparency only adjusts background blur/brightness; it no longer hides the application when the pointer enters the lower-right viewport corner.
   - **Route Dispatch**: `Router.handle()` resolves the initial URL hash.
   
2. **Routing Phase:**
   - The target route fetches data via `DB` (leveraging `Cache`).
   - `Render` constructs the DOM structure and injects it into the reader stage.
   - Upon successful rendering, `Router` triggers the loader outro sequence (`LoaderManager.playOutro()`).

3. **Global Scope Binding:**
   - Due to the nature of inline HTML event listeners (`onclick="UI.openAuthModal()"`), `js/main.js` binds all relevant controller objects (`UI`, `Actions`, `UserAuth`, `Router`, etc.) directly to the `window` object.

---

## 4. Loader Architecture (Dynamic Loading)

To optimize load times, secondary loaders (like specific anomalies or interactive elements) are code-split and loaded dynamically.

`LoaderManager` in `js/ui.js` contains a `registry`:
```javascript
registry: {
    'primary': { path: '../components/primary_loader/primary_loader.js', className: 'PrimaryLoader' },
    'anomaly_flesh': { path: '../components/anomaly_loader/anomaly_loader.js', ... }
}
```
When a loader is requested, `LoaderManager` dynamically imports the module (`await import(config.path)`), ensuring that bulky canvas manipulation scripts only execute if the specific story requires them.

---

## 5. Security & Access Control

- **Read-Only by Default**: The Reader SPA operates strictly via read-only RLS policies for unauthenticated users.
- **Progressive Enhancement**: Functions like voting, commenting, and editing profile details require a verified `UserAuth` session. The UI progressively displays login prompts or auth-locked modals depending on user intent.

---

### Reader Map Conventions
- Implementation status, placeholder disclosures, exact code locations, and pending work are tracked in [`MAP_HANDOVER.md`](MAP_HANDOVER.md).
- **Two-Phase Map Discovery & Routing:** The maps view follows a robust two-phase routing structure. A root story map registry (`#maps/slug`) displays the **Star Chart Registry (Map Hub)**, which transitions into the **Interactive Viewer** (`#maps/slug/mapId`) when a specific map is selected. A glassmorphic top navigation bar on the viewer allows seamless return to the Registry.
- **Star Chart Registry (Map Hub):** A modern, grid-based interface displaying all charted maps associated with a story. Maps are dynamically grouped into **Galactic**, **Regional / Sector**, and **Local** categories, featuring live stats (node and hyperlane counts) on each thumbnail card.
- **Dynamic Search & Filtering:** The Map Hub includes a real-time responsive search bar to filter charts instantly by name or type category, dynamically hiding empty sections.
- **Galactic Operations Deck Composition:** The interactive viewer uses explicit overlay safe zones: a top command bar with Star Chart Registry and Layers controls, left World Inspector, right Navicomputer and radar/status card, an upper-right horizontal viewport-control rail beside Minimize Panels, centered legend, and bottom ticker/clock footer. The redundant itinerary dock and Active Routes footer action have been removed.
- **Responsive Overlay Strategy:** Desktop keeps the Navicomputer open by default while the World Inspector opens on planet selection. Narrow screens convert both side docks into bottom sheets, collapse pill labels, remove nonessential legend/radar decoration, and preserve the route, search, layer, zoom, and history controls. Reduced-motion preferences disable decorative orbital, radar, ticker, and panel animations.
- **HUD Synchronization:** Route changes update the Navicomputer summary, analysis accordions, floating route card, and compact radar/status card together. Active routes add a pulse state to the status radar, which clears through the same synchronization path when the route is cleared. The footer clock is managed by a single interval that is cleared by `MapViewer.destroy()`, and dock trigger `aria-expanded` state is synchronized with visual open/closed state.
- **Panel Minimization:** The top-right Minimize Panels control sits beside the horizontal zoom/reset/route-focus controls and hides all non-map overlays while leaving the command bar and restore control available. Theme and audio controls are lightweight visual preferences only; they add no media or third-party dependencies.
- **Cross-Map Planet Search & Navigation:** Navicomputer input fields (`Focus`, `Origin`, `Destination`) are enhanced with cross-map lookups. When a user queries a planet not charting on the current map, a non-intrusive hint detects if the world is charted in any other story map and provides one-click navigation links to switch charts instantly.
- The `maps` route renders as a full-viewport sci-fi console shell where the map fills 100% of the stage and the Navicomputer, World Intel, chart registry, layers, status card, and route card use docked or floating glassmorphic surfaces.
- `MapViewer.init()` binds the HUD stack, dock controls, route-analysis accordions, footer actions, layer toggles, live clock, and resets active route/dock states.
- `MapViewer` owns map switching, dock management, node selection, route plotting, inline routing status, route summaries, and the compact route-card stop preview.
- `MapViewer.routeState` persists selected endpoints plus computed route metadata, while `MapViewer.dockState` manages open/pinned states for all edge panels.
- `MapViewer.loadMapData()` queries `map_nodes` and `map_edges` by `map_id`, then remaps edge foreign-key fields into the legacy `source` / `target` shape expected by the routing engine.
- Map reader controls include layer toggles for labels and hyperlanes, explicit route actions (`Plot`, `Swap`, `Clear`, `Center Route`), and responsive layout behavior for smaller screens.
- Active route labels now run through a collision-aware placement pass that offsets important planet names around their nodes, raises those labels above nearby pins, and draws connector stems back to the owning planet node. Access-point markers no longer render separate "Exit" / "Approach" text labels, keeping hybrid route clusters less crowded.
- Reader map planet pins use a double-ring marker style. When the map image can be sampled safely, `MapViewer` derives each node's CSS color from nearby pixels on the underlying map image and falls back to the story accent color if canvas sampling is blocked.
- After plotting a course, MapViewer mirrors route distance, hop count, and a compact numbered stop preview into a glassmorphic route card. The card scores the active route plus the actual rectangles of open docks, status/control surfaces, and footer. On desktop, left-side candidates shift beside an open World Inspector instead of rendering underneath it.
- `MapViewer.buildComponents()` now derives connected hyperlane clusters after graph construction so isolated worlds can be recognized without extra fetches.
- `MapViewer.edgeLengthIndex` caches polyline lengths for each lane so nearest-exit snapping and route totals reuse the same geometry measurements.
- When a selected world has no registered lane links, `MapViewer.calculateRoute()` falls back to a hybrid route that snaps to the nearest linked world or point on a hyperlane, renders a cyan straight-line off-lane segment, and adds summary/route-card advisory copy warning that the remaining approach uses unregistered travel.
- **Inspector Course Plotting:** The World Inspector replaces its watchlist action with Plot Course. With an existing origin it immediately plots to the inspected world without opening the Navicomputer; without an origin it expands an inline searchable departure picker and rejects identical endpoints.
- Clicking a planet opens a compact, scrollable in-map history overlay first. `MapViewer.renderLocationHistoryOverlay()` passes the selected planet name and current story timeline into `LocationHistoryIndex`, which lazy-loads Galactic History if needed, scans by normalized exact location phrase, and caches Galactic matches in memory. The focused-world card and compact overlay still provide a Full History / Open Full Archive action through `MapViewer.openSelectedNodeHistory()` for the larger full-screen archive.

---

### Reader Timeline Conventions
- **Two-Phase Timeline Discovery:** The timeline route now opens a chronology chooser at `#timeline/{slug}`. Readers select either **Story History** (`#timeline/{slug}/story`) or **Timeline of Galactic History** (`#timeline/{slug}/galactic`) instead of landing directly in one long alternating list.
- **Story History:** The existing Supabase `timeline_events` stream is rendered as a searchable, compact long-history list with event counts, first/latest date stats, and linked character chips that navigate to the character gallery.
- **Galactic History:** The galactic reference view loads `data/timeline/timeline_tree.json` on demand through `TimelineHub.fetchGalacticTree()`. The parser expects the extractor shape `{ title, children, lists }` with nested list items shaped like `{ text, children }`, ranks duplicate "Timeline of galactic history" sections by child-era count and recursive record count, then runs `TimelineHub.parseWikiData(rawJson)` to normalize raw Wookieepedia scrape nodes into UI-ready eras, sub-eras, and `{ year, era, text }` event objects. Date parsing supports BBY/ABY values and implied-era ranges such as `34 - 35 ABY`.
- **Galactic History Browsing:** The first screen is the searchable major-era poster grid. Selecting an era opens Page 2, a parent-era-background sub-era selection page with a left-aligned 40%-width hero, a glassmorphic "View timeline overview" action, and an image-backed responsive sub-era card grid. Selecting a sub-era or overview opens Page 3, a detailed timeline view that uses the active sub-era image (or era image for overview), a sticky SVG mountain frequency chart, a glassmorphic viewport scrubber, and a centered vertical event list. Event cards contain only a quote icon and parsed paragraph text; same-year events branch left/right according to count, and left/right arrow keys jump between eventful years.
- **Galactic History Images:** `js/timelines/galacticTimelineAssets.js` exports `ImageMapping`, a normalized title-to-image configuration object, because `timeline_tree.json` does not contain image URLs. Fallback era and sub-era image arrays keep dynamic parsed sections image-backed even before final art is assigned.
- **Performance Boundary:** The large galactic JSON is not fetched on story hub load or timeline chooser load; it is cached in memory only after a reader enters the Galactic History view.
