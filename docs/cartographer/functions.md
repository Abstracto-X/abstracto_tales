# Cartographer Editor Functions

### `Auth` (Access Control)
- `init()` - Checks for an existing Supabase session before revealing the login view, then subscribes to auth state changes so shared sessions feel seamless across tabs/pages.
- `loadProfile()` — Fetches profile, populates shared user chrome, and routes to hub. Now allows `reader` role access to the collaborative hub.
- `login(email, password)` — Authenticates via `signInWithPassword`.
- `logout()` — Signs out and reloads.
- `showLogin() / showEditor()` — Toggles between login, hub, and editor views as needed.

### `Hub` (Post-Login Landing View)
- `show()` — Displays the hub, hides login/editor, and loads map cards plus contribution status data.
- `switchTab(tabId, btnElement)` — Swaps between the Active Maps and My Contributions tabs.
- `renderMaps()` — Renders project cards plus the role-dependent create/propose action card.
- `openMap(projectId)` — Enters the editor for a selected map project.
- `startCreateMapFlow()` — Takes admins from the hub into the editor and immediately opens the new-project modal.
- `renderContributions()` — Displays the contributor's pending, approved, and rejected requests. Tracks `State.pendingRequestCount` for enforcement of submission limits.
- `showProposeModal()` — Opens the modal for proposing a new map. Enforces a limit of 3 pending requests for users with the `reader` role.
- `submitProposal()` — Submits a new map proposal to the admin queue.

### `DB` (Supabase Data Access)
- `getProjects()` / `createProject(proj)` / `updateProject(id, updates)` — CRUD for `map_projects`.
- `getNodes(projectId)` / `saveNode(node)` / `deleteNode(id)` — CRUD for `map_nodes`.
- `getEdges(projectId)` / `saveEdge(edge)` / `deleteEdge(id)` — CRUD for `map_edges`.
- `logChange(action, entityType, entityId, oldData, newData)` — Inserts audit entry into `map_changelog`.
- `getChangelog(projectId, limit)` — Fetches recent changelog entries with contributor display names.
- `withdrawItem(reqItemId, reqId)` — Removes a proposed change from a request and cleans up the parent ticket if it becomes empty.

### `MapEngine` (Leaflet.js Controller)
- `init()` — Creates the Leaflet CRS.Simple map with custom zoom settings, binds click/contextmenu/mousemove events.
- `onContextMenu(e)` — Handles right-clicks on the map background. During `'trace'` mode with multiple nodes queued, it triggers the `ContextMenu` to allow finishing or curving the path.
- `loadProject(proj)` — Sets the image overlay bounds from project dimensions, fits map view, and renders all nodes/edges. Now includes `crossOrigin: true` to prevent CORS-tainted canvas errors during snipping from cloud storage.
- `renderAll()` — Clears and re-renders all edges then nodes on the map layers.
- `renderNode(node)` — Creates a `L.circleMarker` with contributor color, tooltip, click/context handlers.
  - [2026-05-17] FIX: Click and contextmenu handlers now use `action !== 'DELETE'` instead of `!action`, allowing tracing and right-click on newly drafted nodes (unapproved nodes) for path creation and context menu actions.
- `renderEdge(edge)` — Creates a `L.polyline` (or Catmull-Rom spline) with a thick, glowing `'pulse-spline'` class (weight: 6) to ensure consistent visual quality between draft and saved states. Includes tooltips and interaction handlers.
- `catmullRom(pts, segments)` — Interpolates a smooth curve through control points using Catmull-Rom spline math.
- `findMarkerForNode(nodeId)` — Searches the nodes layer for a marker matching the given node ID.
- `clear({ preserveImage })` — Clears topology/selection layers and optionally preserves the current base-image overlay so same-map reloads do not request it again.

### `ModeManager` (Interaction Modes)
- `set(mode)` — Switches between `'select'`, `'place'`, `'trace'` modes. Updates toolbar, status bar, cursor, and clears selection layer.

### `LocalDraftManager` (Autosave System)
- `getKey()` — Generates a unique `localStorage` key based on the current project and user ID.
- `save()` — Stashes all nodes/edges with the `_localAction` tag into `localStorage`.
- `load()` — Restores unsaved local changes upon map load, reinjecting them into the active `State`.
- `clear()` — Wipes the local draft from browser memory upon successful cloud save/submission.
- `discardAndReload()` — Prompts to delete the local draft and reload the map from the live database.

### `SnippingTool` (OCR & Planet Placement - External `js/SnippingTool.js`)
- `init()` — Initializes the Tesseract OCR worker.
- `activate(latlng)` — Displays the snipping overlay for the user to select map text.
- `onMouseUp(e)` — Captures the selected canvas area, runs OCR, fuzzy matches via `PlanetDB`, and creates a node. Handles CORS errors from cloud-hosted map images.
- `createPlanetFallback(err)` — Fallback for failed snips, now logging the error context for easier debugging.
- `createPlanet(name, matchData)` — Standard node creation with data pre-fill.
  - [2026-05-17] FIX: Removed `ModeManager.set('select');` so users remain in 'Place' mode after placing a node, enabling rapid placement of multiple nodes.

### `PathDrawer` (Advanced Spline Routing - External `js/PathDrawer.js`)
- `addNode(node)` — Adds a node to the trace queue with sequence numbering.
- `startCurving()` — Transitions to curvable spline mode with draggable control points (max 3).
- `refreshCurveVisuals()` — Real-time update of the pending spline curve.
- `finalize(isCurved)` — Saves the geometry (multi-point if curved) as an edge.

### `PlaceMode` (Overwritten by `SnippingTool`)
- `placeAt(latlng)` — Triggers the `SnippingTool` activation.

### `TraceMode` (Overwritten by `PathDrawer`)
- `addNode(node)`, `finish()`, `cancel()` — Mapped to `PathDrawer` methods.

### `PlanetEditor` (Node CRUD Popup)
- `openPopup(node, marker, isNew)` — Opens a Leaflet popup with name/region/sector fields, autocomplete, save/delete buttons.
- `bindAutocomplete(input)` — Binds the planet name input to `PlanetDB.search()` for CSV-based suggestions.
- `save(node, popup)` — Persists node changes to Supabase.
- `delete(node, popup)` — Removes node and cascading edges.

### `ProjectPicker` (Project Management)
- `toggle()` — Opens/closes the project dropdown menu.
- `refresh()` — Loads all projects from DB and renders the dropdown list.
- `select(id)` — Loads a project's nodes and edges, initializes the map, updates UI.
- `showCreateModal()` — Opens a modal with title, image upload, and publish toggle.
- `create()` — Creates a new project (reads image dimensions), uploads map image to `map-images` bucket.

### `Contributors` (Color Legend)
- `refresh()` — Scans nodes/edges for unique `created_by` IDs, assigns deterministic colors, renders the panel.

### `ChangelogDrawer` (Activity Log)
- `toggle() / close()` — Opens/closes the sliding changelog drawer.
- `load()` — Fetches and renders recent changelog entries with contributor colors and time-ago formatting.

### `PlanetDB` (CSV Autocomplete)
- `load()` — Fetches `data/sw_planets.csv`, parses into `{name, sector, region, grid}` objects.
- `search(query, limit)` — Prefix-first, then substring matching against loaded entries.

### `ContextMenu` (Right-Click Menu)
- `init()` — Creates the context menu DOM element.
- `show(e, nodeData)` — Positions and populates the menu. Intercepts clicks during `'trace'` mode to show specialized path-finalization options (Straight vs Curved) regardless of where the right-click occurs.
- `displayAt(e)` — Helper to position and reveal the menu element.
- `showEdge(e, edge)` — Populates the menu for existing edges (e.g., for deletion).
- `hide()` — Hides the context menu.
- `action(action, nodeId)` — Dispatches context menu clicks to edit/delete/trace-start actions.

### `Keyboard` (Shortcuts)
- `init()` — Registers: `V` (select), `P` (place), `T` (trace), `ESC` (cancel), `Enter` (finish trace), `Ctrl+S` (save).

// ==============================================
// SAVE MANAGER (The Master Router)
// ==============================================
const SaveManager = {
    save: async () => {
        // ... (existing code)
    },

    submitRequest: async () => {
        // ... (existing code)
        // Helper to strip all local UI tracking states so the JSON is pristine
        const clean = (obj) => { ... };
        // ... (existing code)
    },
    // ...
};

### `Particles` (Background Animation)
- `init()` — Canvas-based floating particle animation (same pattern as admin.html).

### `Utils` (Shared Helpers)
- `escapeHtml(s)` — HTML entity escaping.
- `slugify(s)` — URL-safe slug generation.
- `uploadImage(file, bucket, folder)` — Uploads the original map image bytes under a unique path with one-year cache metadata and returns the public URL.
- `timeAgo(d)` — Relative time formatting (e.g. "3m ago").
- `uuid()` — Generates a v4 UUID.
- `getContributorColor(userId)` — Deterministic hash-based color from a 12-color palette.


---
