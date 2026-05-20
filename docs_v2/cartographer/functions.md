# CARTOGRAPHER SPA — Function Index

This document provides a comprehensive index of the functions, classes, and handlers operating within the Collaborative Map Editor SPA (`cartographer.html`).

---

## 1. `Auth` (Access Control & Sessions)
Validates credentials, checks roles, and handles login screens.

- `init()`
  - **Description:** Entry point for map editor auth. Checks for an active Supabase session and subscribes to auth state changes to coordinate login screens.
- `loadProfile()`
  - **Description:** Queries profiles. Displays user cards in the header and loads the landing Hub if the user has an authorized role (`admin`, `cartographer`, or `reader`).
- `login(email, password)`
  - **Description:** Logs in user credentials via `signInWithPassword`.
- `logout()`
  - **Description:** Logs out the active user and refreshes the page to clear the state.
- `showLogin() / showEditor()`
  - **Description:** Toggles between the login screen and the main map workspace.

---

## 2. `Hub` (Discovery Dashboard & Contribution History)
Landing view managing available maps, contribution history, and proposal tickets.

- `show()`
  - **Description:** Displays the discovery Hub, queries operational maps, and fetches contributor statistics.
- `switchTab(tabId, btnElement)`
  - **Description:** Swaps between the map card list and the user's contribution history tab.
- `renderMaps()`
  - **Description:** Renders star chart cards and role-dependent map creation buttons.
- `openMap(projectId)`
  - **Description:** Enters the Leaflet editor for the selected map.
- `startCreateMapFlow()`
  - **Description:** Triggers new project modals for administrators to initialize new maps.
- `renderContributions()`
  - **Description:** Displays the active user's pending, approved, or rejected revision tickets.
- `showProposeModal()`
  - **Description:** Displays the proposal modal. Capped at 3 pending requests for standard readers.
- `submitProposal()`
  - **Description:** Submits a new map proposal ticket to the database moderation queue.

---

## 3. `DB` (Supabase Data Access & Sandbox Submissions)
Queries map elements, writes revisions, and logs changes.

- **Map Projects:** `getProjects()`, `createProject(proj)`, `updateProject(id, updates)`.
- **Map Nodes:** `getNodes(projectId)`, `saveNode(node)`, `deleteNode(id)`.
- **Map Edges:** `getEdges(projectId)`, `saveEdge(edge)`, `deleteEdge(id)`.
- **Auditing:** `logChange(action, entityType, entityId, oldData, newData)` — Records administrative edits to the global `map_changelog` table.
- **Activity Log:** `getChangelog(projectId, limit)` — Queries revision logs for the activity panel.
- **Staging Cleanup:** `withdrawItem(reqItemId, reqId)` — Removes proposed edits from a request, purging the parent ticket if it becomes empty.

---

## 4. `MapEngine` (Leaflet.js Controller)
Controls zooming maps, creates coordinate overlays, and parses splines.

- `init()`
  - **Description:** Instantiates the Leaflet canvas (`L.CRS.Simple`), binds coordinate tracking, and registers drag events.
- `onContextMenu(e)`
  - **Description:** Handles right-clicks on the canvas background. During hyperlane trace operations, it launches context menus to finalize lanes.
- `loadProject(proj)`
  - **Description:** Inverts image dimensions, sets coordinate limits, fits the view, and plots nodes and edges. Enables CORS headers to prevent canvas capture issues.
- `renderAll()`
  - **Description:** Clears all canvas overlays and draws hyperlane lines and planet markers.
- `renderNode(node)`
  - **Description:** Places planet markers on the canvas with contributor color rings, mouse handlers, and context actions.
- `renderEdge(edge)`
  - **Description:** Renders straight lanes or Catmull-Rom curves. Includes glowing pulse classes and indicator labels.
- `catmullRom(pts, segments)`
  - **Description:** Mathematical helper that interpolates curves through coordinates.
- `findMarkerForNode(nodeId)`
  - **Description:** Locates Leaflet markers using node UUIDs.
- `clear()`
  - **Description:** Purges map layers and clears overlays.

---

## 5. `ModeManager` (Interaction Modes)
Controls editor inputs and toggles workspace cursors.

- `set(mode)`
  - **Description:** Switches interaction modes: `'select'` (inspection), `'place'` (planet positioning), or `'trace'` (lane routing).

---

## 6. `LocalDraftManager` (Autosave System)
Manages local browser drafts to protect user progress.

- `getKey()` — Generates unique `localStorage` keys using the active user and project UUID.
- `save()` — Stores pending revisions (tagged with `_localAction` properties) in browser memory.
- `load()` — Restores unsaved changes from `localStorage` upon entering the editor.
- `clear()` — Wipes the local draft workspace after changes are successfully submitted to the database.
- `discardAndReload()` — Purges local drafts and reloads the map from the database.

---

## 7. `SnippingTool` (OCR & Auto Placement - `js/SnippingTool.js`)
Captures map coordinates, executes OCR scans, and automates planet node creations.

- `init()` — Initializes the Tesseract OCR engine.
- `activate(latlng)` — Displays the cropping frame at the target coordinate.
- `onMouseUp(e)` — Captures the cropped image, executes OCR, searches the CSV planet database, and generates planet nodes.
- `createPlanetFallback(err)` — Fallback workflow when OCR scans fail.
- `createPlanet(name, matchData)` — Node creator that pre-fills planet details (such as Sector and Region). The user remains in place mode after creating a node to allow placing multiple planets in sequence.
- `placeAt(latlng)` — Places a generic planet node marker at the clicked canvas coordinate.

---

## 8. `PathDrawer` (Advanced Spline Drawer - `js/PathDrawer.js`)
Guides curved lane placements on the canvas.

- `addNode(node)` — Adds a node to the active trace queue.
- `startCurving()` — Transitions to curved spline editing, rendering drag points to adjust curves.
- `refreshCurveVisuals()` — Dynamically redraws hyperlane curves as control points are dragged.
- `finalize(isCurved)` — Saves lane coordinates and geometry types.

---

## 9. `PlanetEditor` (Node Metadata CRUD popup)
Node popup editor for updating sectors, coordinates, and names.

- `openPopup(node, marker, isNew)` — Opens a popup on the planet marker with fields for name, sector, region, and custom delete buttons.
- `bindAutocomplete(input)` — Binds planet search inputs to `PlanetDB` for CSV autocompletion.
- `save(node, popup)` — Saves node properties to the local draft workspace or Supabase.
- `delete(node, popup)` — Deletes a node and any connected hyperlanes.

---

## 10. `ProjectPicker` (Map Management dropdown)
Header dropdown managing maps, metadata, and creation flows.

- `toggle()` — Opens or closes the dropdown map list.
- `refresh()` — Queries database maps to populate selection lists.
- `select(id)` — Swaps the editor context, centers the camera, and fetches the chosen map elements.
- `showCreateModal()` — Displays forms to upload map assets and specify coordinate scales.
- `create()` — Uploads map images to the `maps` bucket, registers coordinates, and creates the new map project.

---

## 11. Custom Drawer & Interface managers
Legends, menus, and keyboard shortcuts.

- `Contributors.refresh()` — Assigns distinct marker colors to contributors based on active node edits.
- `ChangelogDrawer` — Sidebar panel displaying map change histories. Includes `toggle()`, `close()`, and `load()`.
- `PlanetDB` — Parser that loads `data/sw_planets.csv` and searches sector and region columns.
- `ContextMenu` — Floating menu showing options to inspect elements, delete lanes, or trace routes.
  - `displayAt(e)` — Displays the generic right-click context menu.
  - `showEdge(e, edge)` — Triggers the specific context menu for a selected hyperlane edge.
- `Keyboard` — Registers hotkeys: `V` (select), `P` (place), `T` (trace), `Esc` (cancel), `Enter` (save lane), and `Ctrl+S` (save project).
- `Particles` — floating particle animation canvas.
- `Utils` — Shared helpers including `slugify()`, `timeAgo()`, and deterministic color generators (`getContributorColor()`).
  - `escapeHtml(s)` — Encodes strings to prevent XSS injection.
  - `uuid()` — Generates unique IDs for local mock objects before they hit Postgres.

---

## 12. `SaveManager` (Submission Controller)
Master router coordinating local drafts, direct database writes, and revision tickets.

- `save()`
  - **Description:** Triggers database writes. Evaluates the user's role: admins save changes directly to live map tables, while other roles submit revisions to the moderation queue.
- `submitRequest()`
  - **Description:** Wraps active workspace updates into a moderation ticket.
  - **Helper `clean(obj)`:** Strips temporary visual UI attributes from nodes and edges to ensure only clean coordinate and entity payloads are written.
