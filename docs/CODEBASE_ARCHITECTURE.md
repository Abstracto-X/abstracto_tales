This document outlines the architecture of the "Abstracto Tales / The Aether Archives" project. It comprises three single-file Single Page Applications (SPAs) for administrative and editing interfaces, and a highly modular, clean ES6-module-based SPA for the public-facing reader frontend.

## Reader SPA (`index.html`) — Modular Architecture

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

---

## Admin Panel (`admin.html`) — CMS Operations

This document outlines the architecture, authentication security, global state, initialization flow, and advanced component paradigms of the administrative Content Management System (`admin.html`).

---

## 1. Purpose & Access Control

`admin.html` serves as the private administrative portal for content management, story publications, asset uploads, and moderation. Like the other apps, it is a single-file SPA built on vanilla HTML, CSS, and JS.

### Security Model:
- **Session-Based Authentication:** Leverages Supabase Auth. Upon successful login, it queries the database profiles to verify `role === 'admin'`. Access is blocked locally if this check fails.
- **Backend Database Protection:** Relies on Supabase Row Level Security (RLS) rules which check `public.is_admin()`. This ensures that even if local scripts are bypassed, write access is blocked at the database layer.

---

## 2. Global State Reference

Global states are organized within a dedicated `State` manager:

- `State` *(Object)* — Primary state container:
  - `user` *(Object | null)* — The active Supabase Auth session details.
  - `profile` *(Object | null)* — Profile columns fetched from the database, including the user's role.
  - `currentView` *(String)* — The active sidebar view identifier (e.g. `'dashboard'`, `'stories'`, `'mapRequests'`).
  - `stories` / `characters` / `lore` / `mapRequests` / `wallpapers` *(Array)* — Lists of queried database records used to populate dashboard tables.
  - `selectedStoryId` *(UUID | null)* — Story context filter used when managing chapters or gallery cards.
  - `selectedCharacterId` *(UUID | null)* — Character context filter used in gallery configurations.

---

## 3. Initialization Flow

Upon loading the Admin Panel, the page executes the following bootstrap sequence:

1. **`DOMContentLoaded` Event:**
   - **Auth Boot:** `Auth.init()` is triggered. To prevent a flash of the login screen for logged-in users, the lock overlay is hidden by default. The script runs `supabaseClient.auth.getSession()` to check for an active session. If found, it fetches the user profile; if not, it displays the login form.
   - **Real-time Session Syncing:** Subscribes to Supabase Auth state changes. This ensures that logging out or logging in on another tab automatically updates the active view.
   - **Visual Customizations:** Fetches and applies custom admin wallpaper backgrounds.
   - **Background Effects:** Starts the background floating particle canvas.
2. **Post-Authentication Dispatch (`Auth.showAdminView`):**
   - Populates user details (display name, profile avatar) in the sidebar.
   - Renders the primary dashboard view using `Views.render('dashboard')`.

---

## 4. Advanced Operational Paradigms

The Admin Panel utilizes several robust UI components to streamline content management:

### A. Drag-and-Drop Dropzone
- **Component:** Managed by `UI.imageUploadField` and `UI.initDragAndDrop`.
- **UX Features:** Replaces standard file inputs with a glassmorphic dropzone. Supports dragenter/dragover hover highlights, drag-and-drop file imports, local previews using the standard `FileReader` API, and pasting direct image URLs.

### B. Interactive Autocomplete Tagging
- **Components:** Built using `UI.initTagComponent` and `UI.initTagAutocomplete`.
- **Behavior:** Renders tag strings as deletable visual chips styled with deterministic HSL-themed colors. The autocomplete engine queries existing database tags, allowing admins to select tags using keyboard controls or enter custom tags.

### C. NSFW / R18 Content Categorization
- **Behavior:** Implements a visual toggle switch inside image upload forms. Saving an image with this toggle enabled programmatically appends a structural `NSFW` tag to the record's metadata. The Reader SPA uses this tag to filter content based on user preferences.

### D. Multi-File Sequential Upload Flow
- **Operation:** When uploading multiple media files, save routines (such as `Forms.saveGalleryImage`) sequentially upload files to Supabase Storage. It creates database records concurrently and provides progress feedback to prevent request timeouts.

---

### `admin.html` Updates

#### Drag-and-Drop Dropzone & Interactive Tagging Pipeline
- **Drag-and-Drop Dropzone Component:** Replaced legacy basic image upload fields with a feature-rich, drag-and-drop-enabled Dropzone component (`UI.imageUploadField` & `UI.initDragAndDrop`). It supports dragenter/dragover hover highlights, seamless drag-and-drop file transfers, revocable object-URL previews, and fallback URL text field matching.
- **Interactive Tag Chip & Autocomplete System:** Integrated a dynamic, HSL-themed visual tag chip input (`UI.initTagComponent` & `UI.initTagAutocomplete`) that converts input strings into deletable tag chips. The autocomplete-powered variant fetches existing distinct tags from the database (filtering out structural flags like `NSFW`), allowing arrow-key selection, click selection, and custom tokenization. 
- **NSFW / R18 Content Categorization:** Implemented a standardized visual toggle switch inside `Forms.galleryImageForm` that isolates age-gated media assets. Upon saving, it programmatically injects or prunes structural metadata tags (`NSFW`) while maintaining standard user tags.
- **Reader Visual Archive:** The public gallery uses one unified sub-window: a dominant selected-character profile image, compact biography/action panel, and a right-side browser containing archive totals plus a content-driven profile-image grid that can grow with roster length instead of clipping inside a fixed-height viewport. Hovering or focusing a card updates the hero and marks the active card with an accent glow. The detached scenic quote panel, scattered hero previews, and separate roster section are intentionally absent. A small Gallery banner replaces oversized story typography, Recently Added remains below the unified window, and offscreen profile cards retain lazy/async/low-priority loading.
- **Multi-File Sequential Upload Flow:** Overhauled database save routines (`Forms.saveGalleryImage` / `Forms.saveWallpaper`) to sequentially upload all selected local files to Supabase Storage, inserting corresponding metadata records concurrently and providing immediate user feedback.
- **Published Gallery + Hidden Pool Workspace:** `Views.gallery` now loads every gallery image for the selected story, supports story-wide character/tag/caption filtering, and presents a single broad-view gallery board with a side toggle between the reader-visible published collection and the unpublished holding pool. Admins can add directly into either state or move existing images between them using `character_gallery_images.is_published`.

---

## Writer IDE (`writer.html`) — Editor System

This document outlines the architecture, global state management, initialization flow, and hierarchical content tree structure of the Author Writing IDE (`writer.html`).

---

## 1. Purpose & Core Features

`writer.html` is a distraction-free, rich-text writing environment (IDE) tailored specifically for drafting and compiling story universes. Like other components, it is a single-file SPA built on vanilla HTML, CSS, and JS, featuring direct Supabase integration.

### Core Features:
- **Distraction-Free Workspace:** Minimalistic design offering a split-panel interface. Includes toggles for Focus Mode (hiding side panels) and Typewriter Scrolling (locking the cursor in the vertical center of the editor).
- **Rich Text Editor:** Integrated Quill.js editor that dynamically processes content, tracking word counts, session stats, and real-time writing speeds.
- **Hierarchical Binder (Document Tree):** An interactive left-sidebar tree representing folders, drafts, location notes, and character reference profiles.
- **Hallway Illumination Engine:** The editor pane features a visual illumination effect that grows brighter as the writer approaches their custom word targets.
- **Local Version Snapshots:** A lightweight, metadata-stored version control system that allows writers to save and restore historical document drafts locally.
- **Split-View Editing:** Allows writers to open a read-only node (e.g. world lore or character references) in a secondary panel for reference while writing.

---

## 2. Global State Reference

The IDE encapsulates state in a unified `state` manager and global context variables:

- `supabase` *(Object)* — Holds the initialized Supabase client instance.
- `currentStoryId` *(UUID | null)* — The ID of the story currently being edited. Initialized from URL query parameters (`?story_id=`) or standard workspace selects.
- `state` *(Object)* — Main state engine:
  - `treeMode` *(String)* — Toggle between `'workspace'` (draft folders and notes) and `'published'` (live story elements like chapters).
  - `nodes` *(Array)* — flat array representing tree elements for the active `treeMode`.
  - `nodeMap` *(Object)* — Dictionary mapping node IDs to node objects for immediate O(1) lookups.
  - `activeNodeId` *(UUID | null)* — The ID of the node currently loaded in the active editor.
  - `expandedFolders` *(Set)* — Set of folder UUIDs currently expanded in the binder tree view. Persisted in `localStorage`.
  - `bookmarks` *(Set)* — Collection of flagged node UUIDs.
  - `childrenByParent` *(Object)* — Precomputed binder-tree child index used to avoid repeated full-array scans during recursive rendering.
  - `isDirty` *(Boolean)* — Tracks whether there are unsaved editor changes. Governs auto-saves and navigation warning prompts.
  - `editorChangeRevision` / async request tokens *(Number)* — Guard autosaves, node loads, inspector link renders, and global search against stale async completions.
  - `currentWordCount` / `currentCharCount` / `currentParaCount` *(Number)* — Cached long-document metrics reused by target bars and session stats.
  - `quill` *(Object)* — The Quill rich-text editor instance.
  - `currentTheme` *(String)* — Name of the active visual theme (e.g. Amber Glow, Solarized Dark). Persisted in `localStorage`.
  - `sessionStartWords` / `sessionStartTime` *(Number)* — word and time markers used to calculate session metrics.

---

## 3. Initialization Flow

Upon loading the Writer IDE, the page executes the following IIFE bootstrap process:

1. **IIIFE Launch (`init()`):**
   - **Environment Verification:** Validates that `Quill` and `window.supabase` are loaded via CDN.
   - **Client Bootstrap:** Initializes the Supabase client using the global anon key.
   - **Quill Setup:** `initQuill()` configures the editor toolbar and registers custom font and layout elements.
   - **Listener Bindings:** `bindEvents()` registers keyboard shortcuts (Ctrl+S, Focus Mode keys), sidebar resizers, and popup controllers.
   - **Visual Theme Selection:** Recovers saved visual themes from `localStorage` and injects theme classes onto the document root.
   - **Story Lookup:** Queries available stories via Supabase and populates the top dropdown, defaulting to the URL parameters if present.
   - **Tree Builder:** `loadNodes()` fetches lightweight node metadata for the selected story, indexes nodes by ID and parent ID, and renders the left binder tree. Full bodies are loaded on node open or on-demand global search.
   - **Long Document Switching:** `openNode()` closes and unloads the current document before opening another, yields paint frames between unload/load phases, shows metadata word counts immediately, defers full metric scans, and updates the active binder row without rebuilding the full tree.
   - **Markdown Rendering:** The editor header's Render Markdown button and `Ctrl+Shift+M` shortcut manually convert the current markdown-like editor text through the native renderer, avoiding surprise re-processing during normal edits.
   - **Session Metric Init:** Records baseline word counts and start times, launching interval timers to update statistics.

---

## 4. The Hierarchical Content Tree (Binder)

The left-hand Binder represents a hierarchical filesystem built on top of a single database table (`writer_nodes`).

### Technical Structure:
- **Recursive DB Mapping:** Tree nodes are stored in a flat database table where each node has a nullable `parent_id` linking back to its parent folder node. Root nodes have `parent_id = NULL`.
- **Tree Reconstruction:** The application fetches the flat array of nodes in a single select query. It then builds a lookup map in-memory and recursively parses child elements based on `parent_id` connections.
- **Node Types:** Mapped through the Postgres ENUM `node_type_enum`:
  - `folder` — Container node (can visually expand/collapse).
  - `document` / `note` — Text-based files containing Quill Delta data.
  - `character` / `location` / `item` — World-building reference cards.
  - `trash` — Isolated nodes pending deletion.

### Workspace vs. Published Modes:
- **Workspace Tree:** Private drafts, outlines, folders, and notes managed in the `writer_nodes` recursive table.
- **Published Tree:** Virtual nodes mapped to live tables (`chapters`, `characters`, `lore_entries`, `timeline_events`). When opened, the inspector handles saving edits back to their respective public tables instead of `writer_nodes`.

---

## 5. Security & Access Conventions

Unlike the Admin and Reader SPAs, the Writer IDE does not implement explicit client-side auth checks.
- **Implicit Session Sharing:** The IDE relies on the active admin session cookie established in `admin.html`.
- **Backend Protection:** The Supabase RLS policy requires users to be authenticated (`auth.role() = 'authenticated'`). Any logged-in user can query the tables, ensuring easy access for collaborative writing teams while preventing public read/write access.

---

## Cartographer SPA (`cartographer.html`) — Collaborative Map Editor

This document outlines the architecture, global state management, role-based access control, coordinates layout, sandbox staging logic, and initialization flow of the Collaborative Map Editor (`cartographer.html`).

---

## 1. Purpose & Core Engine

`cartographer.html` is a collaborative star-map editing Single Page Application (SPA). It allows authorized users (admins, cartographers, and general readers) to design, customize, and edit story-linked maps.

### Core Technologies:
- **Leaflet.js (Simple Coordinate System):** Renders interactive map stages using Leaflet's `L.CRS.Simple` system. This allows custom images of any size to be plotted onto standard Cartesian plane grids.
- **Tesseract OCR (Text Snipping):** Employs an OCR engine (`js/SnippingTool.js`) that allows map designers to select labels directly from map images to create new planet nodes automatically.
- **Catmull-Rom Path Drawer:** Supports curved hyperlane lines (`js/PathDrawer.js`) interpolated via Catmull-Rom spline equations to draw elegant, pulsing hyperlanes.

---

## 2. Security Roles & Staging Queue (Sandbox Editor)

To protect the star map database from corruption, the editor operates on a role-based moderation system:

### User Roles:
- **Admin:** Full CRUD privileges. Can edit live map tables directly and approve or reject proposed changes in the Moderation Queue.
- **Cartographer:** Certified map creators. Can read all maps and submit revisions.
- **Reader (Contributor):** Registered users who can access the Sandbox editor to suggest revisions. Suggesting a revision is capped at 3 pending requests to prevent spam.

### Sandbox Staging & Moderation Queue:
- **Direct Live Edits Blocked:** Non-admins cannot directly modify the active `map_nodes` and `map_edges` tables.
- **Revision Tickets:** Edits made in the Sandbox editor are saved as pending revision tickets in the `map_requests` and `map_request_items` tables.
- **Clean Submissions:** `SaveManager.submitRequest` strips away local UI properties (such as color markers or tracking lines) to ensure only clean coordinate and entity payloads are submitted for admin approval.

---

## 3. Global State Reference

Operational state is managed in a global `State` container:

- `supabaseClient` *(Object)* — Initialized Supabase client.
- `State` *(Object)* — Primary state manager:
  - `user` / `profile` *(Object | null)* — The authenticated user and matching database profile column.
  - `pendingRequestCount` *(Number)* — Tracks the active user's pending request count.
  - `currentProject` *(Object | null)* — The active `maps` table record being edited.
  - `projects` / `stories` *(Array)* — Lists of active maps and story contexts.
  - `nodes` / `edges` *(Array)* — Mapped node and hyperlane objects.
  - `mode` *(String)* — Active canvas interaction mode: `'select'`, `'place'`, or `'trace'`.
  - `traceQueue` *(Array)* — Ordered list of planet nodes queued up when tracing hyperlanes.
  - `isDirty` *(Boolean)* — Tracks unsaved changes in the local draft workspace.
  - `contributors` *(Object)* — Lookup index mapping contributor UUIDs to distinct marker colors.
  - `undoStack` / `redoStack` *(Array)* — Local undo/redo action queues.
- `MapEngine` *(Object)* — Controls Leaflet.js canvases, layers, and coordinate conversions.
- `Hub` *(Object)* — Manages the post-login landing dashboard, project card grids, and contribution histories.
- `PlanetDB` *(Object)* — Local lookup index of `sw_planets.csv` records used for auto-completing planet names.

---

## 4. Cartesian Plane & Coordinate Systems

- **True Cartesian Coordinates:** The editor aligns coordinates with a true mathematical Cartesian grid where $X$ grows positive to the right and $Y$ grows positive upward.
- **Y-Axis Inversion:** Leaflet maps place the origin $(0,0)$ in the top-left, with $Y$ increasing downward. The `MapEngine` handles inverting coordinates upon loading or saving records. This matches the Y-axis inversion calculations in `index.html` to keep map visual overlays consistent between the viewer and editor.
- **Dynamic Scales:** Map bounds are derived dynamically from the image dimensions ($W \times H$) uploaded for each map project. This ensures that coordinates scale accurately regardless of the original image size.

---

## 5. Initialization Flow

Upon loading the Cartographer SPA, the application executes the following bootstrap sequence:

1. **`DOMContentLoaded` Event:**
   - **Form Bindings:** Registers credentials and login handlers.
   - **Auth Initialization:** `Auth.init()` checks Supabase for an active session. If active, it fetches the user profile; if not, it displays the login screen.
2. **Post-Authentication (`Auth.loadProfile` -> `Hub.show`):**
   - Verifies the user has a valid profile role (`admin`, `cartographer`, or `reader`).
   - Populates user cards in the header.
   - Renders the landing dashboard (`Hub.show()`), displaying available maps, contributor counts, and the user's contribution history.
3. **Editor Workspace Entry:**
   - **System Setup:** `App.init()` bootstraps:
     - `ContextMenu.init()` (floating context menus).
     - `MapEngine.init()` (Leaflet.js stage setup).
     - `Keyboard.init()` (Toolbar shortcuts: V, P, T, Esc).
     - `PlanetDB.load()` (Loads the CSV database into memory).
     - `LocalDraftManager.load()` (Restores unsaved changes from `localStorage` if found).
     - `ProjectPicker.refresh()` (Selects the target map context).

---

### `cartographer.html` Updates

#### Sandbox/Hub Wiring
- **Sandbox Editor:** Introduced a staging system for contributors to propose changes to maps. Changes are saved locally and submitted as "Submission Tickets" for admin review. The `SaveManager.submitRequest` method includes a `clean()` helper to strip local UI tracking states before submission.
- **Hub Dashboard:** Added a "My Contributions" tab for contributors to view their pending, approved, and rejected requests.
- **Coordinate Fixes:** Y-axis coordinates now align with a true Cartesian plane.

#### Security Enhancements & Activity Logging
- **Database Lockdown:** Non-admins can no longer directly modify `map_nodes` and `map_edges`. All changes must go through the new moderation queue.
- **Request Tables:** Added `map_requests` and `map_request_items` tables to handle proposed changes.
- **Activity Log:** Admin approvals in `admin.html` and direct admin edits in `cartographer.html` now automatically log activity to the `map_changelog` table via `DB.logChange`, ensuring a visible history in the map's Activity Log.

---

## Shared Conventions & Supabase Integration

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
- **Parallel Image Downloader:** `scripts/download_timeline_images.py` downloads all external event-linked image URLs mapped in `data/timeline/page_image_lookup.json`. It runs multi-threaded (default 16 workers), sanitizes filenames/directories, organizes files into a nested directory structure (`data/timeline/downloaded_images/Era/Sub-Era/`), and displays a live terminal progress bar using standard output.


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
