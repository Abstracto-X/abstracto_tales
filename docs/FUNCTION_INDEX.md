# Function Index

A comprehensive, categorized index of all meaningful functions across the `index.html`, `admin.html`, `writer.html`, and `cartographer.html` Single Page Applications.

---

## 1. `index.html` (Reader Frontend)

### `Router` (Navigation & Views)
- `handle()` - Also wraps `UI.hideLoading()` in both success and error completion paths so stage fade-in still completes if the saber widget throws during teardown.
- `handle()` — Reads the current window hash and dispatches to the correct view renderer, now guarding route completions so stale or failed renders cannot leave the stage hidden or loader stuck.
- `navigate(path)` — Programmatically changes the URL hash and triggers a route update, short-circuiting same-route clicks into a safe re-render instead of waiting on a `hashchange` that will never fire.
- `getParts()` — Helper to break down the hash into view and ID parameters (e.g., `#story/123`).

### `Cache` (TTL + LRU Data Cache)
- `getHub(slug)` — Returns cached hub data if fresh (within 5-min TTL), or `null` if stale/missing. Updates LRU order on access.
- `setHub(slug, data)` — Stores hub data with a timestamp. Evicts the least-recently-used entry if at capacity (max 5).
- `_evictHub(slug)` — Removes a specific hub entry from both the ordered list and lookup map.
- `isStale(ttlTimestamp)` — Returns `true` if the given timestamp is older than the TTL threshold (5 minutes).

### `DB` (Supabase Data Access)
- `getStories()` — Fetches published stories (cached with TTL).
- `getAuthorProfile()` — Fetches admin profile + author links (cached with TTL).
- `getStoryHubData(slug)` — Fetches story + wallpapers + characters + lore + timeline + maps in parallel (LRU-cached). Timeline character links are batched via `.in()`.
- `getChapters(storyId)` — Fetches all published chapters for a specific story.
- `getCharacterGallery(characterId)` — Fetches gallery images for a character.
- `getLatestGalleryImages(storyId, limit, offset)` — Fetches recently added gallery images across all characters in a story with pagination/offset support.
- `getLoreEntry(storyId, loreSlug)` — Fetches a single lore entry by slug.

### `UserAuth` (Authentication)
- `init()` — Checks for an existing session and sets up the `onAuthStateChange` listener.
- `handleAuthStateChange(event, session)` — Responds to logins/logouts to refresh the session and UI.
- `updateUserUI()` — Toggles visibility of login/register buttons vs. the user profile menu.
- `logout()` — Signs the current user out of Supabase and reloads the page.
- `showAuthModal(type)` — Opens the generic modal configured for either 'login' or 'register'.

### `CommentsManager` (User Interaction)
- `init()` — Initializes the comments drawer UI bindings.
- `loadComments(targetId, targetType)` — Fetches comments linked to a specific entity (like a chapter or story).
- `renderComments(comments)` — Generates the HTML for the comments list.
- `postComment(content)` — Inserts a new comment into the database using the active session.
- `deleteComment(id)` — Deletes a comment (restricted to the comment owner or admin).
- `toggleUpvote(commentId)` — Toggles the like status on a comment for the active user.
- `toggleCommentDrawer()` — Opens or closes the sliding comments side panel.

### `UI` (Interface Helpers)
- `showLoading() / hideLoading()` — Proxies to `SaberController` to control the global full-screen lightsaber transition overlay.
- `openSaberModal() / closeSaberModal()` — Controls the lightsaber preferences modal.
- `toast(message, type, duration)` — Displays a temporary notification popup (success, error, info).
- `applyCustomColors(settings)` - Injects CSS variables into the `:root` to theme the site dynamically.
- `renderStoryCard(story)` - Returns the HTML block for a story display card.
- `renderChapterList(chapters)` - Returns the HTML list of chapters for the story view.

- `initAuthLink(userProfile)` â€” Renders the far-right header auth slot as either a sign-in button or the current reader avatar/profile trigger.

### `SaberController` (Lightsaber Loading Widget)
- `animateProgressTo(target, duration, onComplete)` - Defensively parses widget progress and guards `getProgress` / `setProgress` calls so malformed saber state cannot crash the animation loop before `onComplete()` runs.
- `hideLoading()` - Also wraps widget `hide()` and reset progress calls so loader teardown still finishes even if the saber widget misbehaves.
- `init()` — Dynamically imports and initializes the lightsaber widget logic, applying either the default or saved loader mode, hiding the separate progress bar overlay, and seeding its illumination backdrop from the current reader background image.
- `saveAndApply()` — Captures reader customizations from the modal, including loader mode, applies them to the widget, caches to `localStorage`, and triggers a demo ignition.
-`showLoading()` — Activates the overlay, syncs the current background image and responsive blade length into the widget, and runs a smooth `requestAnimationFrame`-driven sweep toward the near-complete state while the saber widget brightens the full viewport and concentrates extra glow at the emitter, blade body, and tip.

- `hideLoading()` — Smoothly finishes the last stretch to `100%`, briefly holds the completed frame, then fades out the overlay before resetting progress off-screen for the next transition.

### `MapViewer` (Interactive Map & Routing)
- `MinPriorityQueue` — Lightweight binary heap class providing `enqueue`, `dequeue`, and `isEmpty` methods for the pathfinding engine.
- `init()` - Initializes the transform-based panning/zooming engine for a specific Supabase map record, resetting route state, clearing stale overlays, and setting up the SVG/HTML overlay containers.
- `loadMapData()` - Fetches `map_nodes` and `map_edges` for the active `map_id` from Supabase, remaps edge foreign keys into the reader routing shape, and triggers graph construction and rendering.
- `renderMapData()` — Generates SVG paths for hyperlanes, route-overlay groups, and DOM elements for planet nodes, performing Y-axis inversion.
- `buildGraph()` — Converts the node and edge data into an adjacency list for pathfinding and seeds cached lane lengths.
- `calculateRoute()` — Executes normal Dijkstra routing for linked worlds, or falls back to hybrid nearest-exit routing when one or both selected worlds are isolated.
- `drawRoute(pathNodes, pathEdges, options)` — Highlights the active path, renders any off-lane overlay segments, and populates itinerary/summary UI for both standard and hybrid routes. Now includes logic for flow direction animation on hyperlanes.
- `bindUI()` - Wires the route inputs, search actions, map selector buttons, and layer toggles to the map controller. Selector clicks fully reinitialize the navicomputer for the chosen map record.
- `zoomToNode(nodeName)` — Locates a node by name and triggers zoomToRoute to focus the camera on it.
- `setMapSource(src, mapName)` - Swaps the visible map image, updates the active selector chip, and refreshes the reader-facing status for the current map.
- `getClosestPointOnSegment(point, start, end)` — Geometric helper to find the nearest point on a line segment to a given coordinate.
- `getCandidateComponentsForHybridRoute(sourceNode, targetNode)` — Determines which connected components to consider for routing between potentially isolated worlds.
- `renderRouteOverlay()` — Generates the SVG overlay for off-lane corridors, mid-edge junctions, and navigation markers.
- `formatDistance(value)` — Formats internal coordinate units into reader-facing distance strings.
- `setStatus(message, type)` — Updates the navicomputer status bar with context-aware coloring (info, success, warning, error).
- `refreshNodeStates()` — Updates visual classes (selected, active) on all node elements.
- `syncInputs()` — Harmonizes the navicomputer search fields with the current internal route state.

### `MapViewer` Additions
- `bindUI()` — Wires the route inputs, search actions, map selector buttons, and layer toggles to the map controller.
- `buildComponents()` — Walks the graph after load to assign connected-component IDs for routeable hyperlane clusters.
- `setMapSource(src, mapName)` — Swaps the visible map image while preserving navicomputer state and updating the active selector chip.
- `selectNode(nodeId)` / `assignSelectedNode(type)` — Drives the focused-world workflow so readers can inspect a node and promote it to origin or destination.
- `setRouteEndpoint(type, value)` — Resolves a selected node or exact input value into a persistent route endpoint.
- `createAccessPointForNode(node)` / `findNearestAccessPoint(node, componentId)` — Build native or snapped route-entry metadata for linked and unlinked worlds.
- `runDijkstra(sourceId, targetId)` / `findBestHybridRoute(sourceNode, targetNode)` — Shared routing helpers for standard graph traversal and hybrid nearest-exit fallback selection.
- `clearRoute()` / `swapRoute()` — Route management helpers for clearing or reversing the current nav path.
- `handleSearch()` — Focuses the map on an exact world search hit from the navicomputer search field.
- `renderNodeCard()` / `renderSummary()` — Renders the focused-world card plus the route summary metrics panel.
- `renderRouteOverlay()` — Draws cyan straight-line off-lane segments and exit markers for hybrid routes.
- `toggleLayer(key)` / `applyDisplayState()` — Manages reader-facing label and hyperlane visibility controls.

### `Particles` (Background Engine)
- `init()` — Sets up the HTML5 Canvas, spawns particles, and registers `visibilitychange` listener for pause/resume.
- `animate()` — The `requestAnimationFrame` loop. Checks `_paused` flag before rendering. Stores rAF ID for cancellation.
- `resize()` — Handles window resize events to keep the canvas covering the screen.

---

## 2. `admin.html` (CMS / Admin Panel)

### `Auth` (Administrative Access)
- `init()` - Restores any existing Supabase session before revealing the login screen, then subscribes to auth state changes for seamless cross-tab login/logout handling.
- `loadProfile()` - Fetches the user's profile, verifies their role is exactly `'admin'`, updates the shell chrome, and returns a success boolean so `init()` can decide whether to reveal the login view.
- `signIn(email, password)` — Authenticates against Supabase and awaits profile validation.
- `signOut()` — Ends the Supabase session and locks the system.
- `showLoginView() / showAdminView()` — Toggles between the lock screen and the main CMS dashboard.

### `DB` (Supabase Data Access & Abstraction)
- **Stories**: `getStories()`, `saveStory(data)`, `deleteStory(id)` (Checks foreign key constraints before deletion).
- **Chapters**: `getChapters(storyId)`, `saveChapter(data)`, `deleteChapter(id)`.
- **Characters**: `getCharacters(storyId)`, `saveCharacter(data)`, `deleteCharacter(id)`.
- **Lore**: `getLoreCategories(storyId)`, `saveLoreCategory(data)`, `getLoreEntries(categoryId)`, `saveLoreEntry(data)`.
- **Timeline**: `getTimelineEvents()`, `saveTimelineEvent(data)`, `deleteTimelineEvent(id)`.
- **Media**: `getMaps()`, `saveMap()`, `getWallpapers()`, `saveWallpaper()`, `getGallery()`, `saveGalleryImage()`.
- **Map Requests**: `getMapRequests()`, `getRequestItems(reqId)`, `updateRequestStatus(reqId, status, feedback)`, `deleteMapRequest(reqId)`, `approveMapRequest(reqId)` (Applies changes to live tables and logs activity to `map_changelog`).
- **Settings**: `getSettings()`, `saveSettings(data)`.

### `Utils` (Shared Utilities)
- `uploadImage(file, bucket, folderPath)` — Uploads a blob/file to a Supabase Storage bucket and returns the public URL.
- `formatDate(dateString)` — Standardizes timestamp formatting for the UI.
- `generateSlug(text)` — Converts strings to URL-friendly slugs for routing.
- `sanitizeHTML(html)` — Basic wrapper to prevent XSS in visual editors.

### `Forms` & `Modal` (CRUD Interfaces)
- `Modal.open(title, htmlContent)` / `Modal.close()` — Manages the generic popup overlay.
- Forms automatically generate the DOM, populate existing data, handle field binding, and dispatch to `DB.saveX()`:
  - `storyForm(storyObj)`
  - `chapterForm(chapterObj)`
  - `characterForm(characterObj)`
  - `loreCategoryForm(categoryObj)` / `loreEntryForm(entryObj)`
  - `timelineEventForm(eventObj)`
  - `mapForm(mapObj)` / `wallpaperForm(wallpaperObj)`
  - `viewMapRequest(reqId)` / `approveMapRequest(reqId)` / `rejectMapRequest(reqId)` / `deleteMapRequest(reqId)`
  - `settingsForm(settingsObj)`
  - `deleteConfirmForm(entityType, entityId, fallbackAction)`

### `Views` (Admin Rendering)
- `render(viewName)` — The primary internal router mapping sidebar clicks to view functions.
- View rendering functions that fetch data, populate caches, and build tables/grids:
  - `dashboard()`, `stories()`, `chapters()`, `characters()`, `lore()`, `timeline()`, `maps()`, `mapRequests()`, `gallery()`, `wallpapers()`, `settings()`.

---

## 3. `writer.html` (Writer's IDE)

### Core IDE & State Management
- `init()` — Bootstraps Quill, Supabase, listeners, and triggers initial data loads.
- `initQuill()` — Initializes the Quill.js rich text editor on the canvas.
- `bindEvents()` — Binds hotkeys (Ctrl+S, F11, etc.), modal overlays, and button clicks.

### `DB` (Supabase Data Access)
- `getStories()` — Populates the header dropdown to switch workspace contexts.
- `getNodes()` — Retrieves all raw draft nodes from the `writer_nodes` tree table.
- `getPublishedNodes()` — Synthesizes a virtual tree array from live `chapters`, `characters`, `lore`, and `timeline` tables.
- `getNode(nodeId)` — Fetches the full content/body of a specific node asynchronously.
- `saveNode(nodeId, payload)` — Updates or inserts a node. Handles polymorphic saving (identifies if it's a draft node or a live table record).
- `deleteNode(nodeId)` — Purges a node from the DB.
- `getLinks() / addLink() / removeLink()` — Manages bidirectional hyperlinks between internal workspace nodes.

### Tree Rendering & Binder (Left Sidebar)
- `loadNodes()` — Fetches data via `DB` and triggers tree recreation.
- `buildNodeMap()` — Converts the flat array of node records into a quick-access dictionary (`state.nodeMap`).
- `getNodeChildren(parentId)` — Helper to traverse the hierarchical tree structure.
- `renderTree(filterText)` — Recursively generates the HTML `<ul>`/`<li>` structure for the binder.
- `renderTreeNode(node)` — Creates an individual tree item, attaching expanding, dragging, and context menu behaviors.
- `toggleFolder(nodeId)` — Expands/collapses sub-trees in the UI.

### Editor Logic (Center Canvas)
- `openNode(nodeId)` — The primary function for clicking a document: handles saving the old node, loading the new one, checking edit permissions, and refreshing the inspector.
- `scheduleSave() / saveCurrentNode()` — The debounced auto-save mechanics that push dirty `state.quill` content to Supabase.
- `loadNodeContentIntoEditor(node)` — Determines if the content is a Quill Delta JSON or raw HTML, and configures the editor gracefully.
- `renderNodeContentInSplitView(node)` — Renders a read-only secondary view for cross-referencing.
- `clearActiveSelection()` — Resets the editor canvas to the empty/placeholder state.

### Inspector & Properties (Right Sidebar)
- `loadInspector(node)` — Populates the right panel fields (type, status, target, synopsis, image, notes) based on the active node's context.
- `saveInspectorField(field, value)` — Immediate auto-save handler for inspector input changes.
- `getInspectorConfig(node)` — Determines which inspector fields are enabled/disabled depending on whether the node is a draft or a published entity.
- `renderSnapshots(node) / takeSnapshot(name) / restoreSnapshot(snap)` — Handles the localized version control system array stored in node metadata.

### Metrics & Utilities
- `countWords(text)` — Simple whitespace-delimited word counter.
- `updateCounts()` — Fired on Quill text-change to update footer metrics.
- `startSessionTimer() / updateSessionStats()` — Calculates Words-Per-Minute and overall session duration.
- `setTheme(themeName)` — Injects the selected UI theme class onto the root body.
- `toggleFocusMode() / toggleTypewriterMode()` — Adjusts CSS bounds to hide sidebars or auto-scroll the editor to the center.
- `performSearchAll(query)` — Global `Ctrl+Shift+F` full-text search across all loaded nodes.
### Context Menus & Actions
- `showContextMenu(e, nodeId) / hideContextMenu()` — Manages the custom right-click floating menu.
- `handleContextAction(action)` — Dispatches menu clicks to node operations.
- `createNode(type, parentId)` — Generates a new file/folder placeholder.
- `duplicateNode(nodeId)` — Clones an existing node and its content.
- `renameNode(nodeId, newTitle)` — Prompts and saves a title change.

---

## 4. `cartographer.html` (Collaborative Map Editor)

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
- `clear()` — Removes image overlay and clears all layer groups.

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
- `uploadImage(file, bucket, folder)` — Uploads to Supabase Storage, returns public URL.
- `timeAgo(d)` — Relative time formatting (e.g. "3m ago").
- `uuid()` — Generates a v4 UUID.
- `getContributorColor(userId)` — Deterministic hash-based color from a 12-color palette.

