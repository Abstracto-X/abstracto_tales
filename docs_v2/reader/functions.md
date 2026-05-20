# READER SPA — Function Index

This document provides a comprehensive index of the functions and classes operating within the public-facing Reader Single Page Application (`index.html`).

---

## 1. `Router` (Navigation & Views)
Manages client-side URL hash transitions, active view displays, and animation gates.

- `handle()`
  - **Description:** Invoked on hash change or page load. Reads the window hash, validates the destination view, starts the lightsaber loader, handles async rendering updates, and fades out the loader overlay. Defensively guards completions against stale route executions.
- `navigate(path)`
  - **Description:** Programmatically sets the window hash and triggers updates. Same-route clicks are intercepted and short-circuited to refresh page state instead of doing nothing.
- `getParts()`
  - **Description:** Deconstructs hash patterns (e.g. `#story/slug/chapter/3`) into view segments and identifier arguments.

---

## 2. `Cache` (TTL + LRU Data Cache)
Optimizes performance by caching Supabase query returns in local memory.

- `getHub(slug)`
  - **Description:** Returns cached story encyclopedia/hub data if active (under 5-minute TTL). Returns `null` if expired, and updates LRU sorting on success.
- `setHub(slug, data)`
  - **Description:** Caches story hub results with an active timestamp. Automatically evicts the least recently accessed record when at capacity (limit 5).
- `_evictHub(slug)`
  - **Description:** Removes a specific story hub record from memory pools.
- `isStale(ttlTimestamp)`
  - **Description:** Standard check evaluating if a cache timestamp has exceeded the 5-minute threshold.

---

## 3. `DB` (Supabase Data Access Wrapper)
Direct database connection functions executing queries and joins.

- `getStories()`
  - **Description:** Queries and returns published stories (caches results).
- `getAuthorProfile()`
  - **Description:** Fetches the site owner profile, links, and biographies (caches results).
- `getStoryHubData(slug)`
  - **Description:** Executes concurrent queries for story cards, wallpapers, lore indexes, timeline logs, and maps using join wrappers.
- `getChapters(storyId)`
  - **Description:** Queries published chapters for a story, ordered sequentially.
- `getCharacterGallery(characterId)`
  - **Description:** Fetches illustrations and details mapped to a given character profile.
- `getLatestGalleryImages(storyId, limit, offset)`
  - **Description:** Renders paginated gallery items across all story characters.
- `getLoreEntry(storyId, loreSlug)`
  - **Description:** Retrieves a specific lore article by slug and parent story.
- `getMapCounts(mapIds)`
  - **Description:** Returns count statistics (nodes and hyperlanes) for maps to display in the hub.
- `getAllMapNodeNames(storyId)`
  - **Description:** Queries distinct planet coordinates and names across all maps in a story to build navicomputer search autocomplete pools.

---

## 4. `UserAuth` (Authentication)
Maintains cookies, checks active credentials, and validates profiles.

- `init()`
  - **Description:** Inspects current cookie sessions and registers credentials listeners for logins, logouts, or session restorations.
- `fetchProfile(user)`
  - **Description:** Queries the database profiles table. Implements exponential backoff (retrying up to 5 times starting at 300ms) to resolve replication latency for new registrants.
- `logout()`
  - **Description:** Signs the active user out of Supabase and triggers a page reload to refresh the state.
- `showAuthModal(type)`
  - **Description:** Opens the visual modal customized for registration or credentials entry.

---

## 5. `CommentsManager` (User Interaction)
Manages comments overlay draws, comments creation, and likes.

- `init()`
  - **Description:** Binds scroll controls, submit forms, and click listeners on the comments drawer chrome.
- `loadComments(targetId, targetType)`
  - **Description:** Retrieves and processes database comments for target entities.
- `renderComments(comments)`
  - **Description:** Assembles the glassmorphic comments list HTML, including avatar thumbnails and deletion buttons.
- `postComment(content)`
  - **Description:** Submits a comment. Utilizes active auth credentials.
- `deleteComment(id)`
  - **Description:** Triggers database comment purge (restricted by RLS to comment owner or admin).
- `toggleUpvote(commentId)`
  - **Description:** Casts or reverts comment likes against the votes database table.
- `toggleCommentDrawer()`
  - **Description:** Slides the glassmorphic comments side drawer in or out.

---

## 6. `UI` (Interface Helpers)
Assorted interface rendering blocks, colors, and modal setups.

- `showLoading() / hideLoading()`
  - **Description:** Proxies to `SaberController` to launch or dismiss the loading barrier.
- `openSaberModal() / closeSaberModal()`
  - **Description:** Displays customizable lightsaber mode preferences popup.
- `toast(message, type, duration)`
  - **Description:** Renders notifications (errors, confirmations) at the screen bottom.
- `applyCustomColors(settings)`
  - **Description:** Injects visual hex variables into CSS root variables.
- `renderStoryCard(story)`
  - **Description:** Renders individual story summary grid blocks.
- `renderChapterList(chapters)`
  - **Description:** Generates reading index tables.
- `showGalleryWarning(storySlug)`
  - **Description:** Launches warning modals advising readers about Mature (R18) or AI content.
- `closeGalleryWarning()`
  - **Description:** Fades out content warning overlays.
- `initAuthLink(userProfile)`
  - **Description:** Swaps login links with user avatars on the right side of the global navbar.

---

## 7. `SaberController` (Lightsaber Loading Widget)
Custom animations and ignition logic that gates stage loading screens.

- `init()`
  - **Description:** Hooks vertical loading wrappers, fetches saved customization tokens, and overlays background backdrops.
- `animateProgressTo(target, duration, onComplete)`
  - **Description:** Animates loading bar fills via math loops, checking variables to avoid frame freezes.
- `saveAndApply()`
  - **Description:** Saves custom light configurations, writes values to local storage, and fires preview animations.
- `showLoading()`
  - **Description:** Ignites custom blades, launches sweeps to 90%, and applies custom backglow.
- `hideLoading()`
  - **Description:** Sweeps progress to 100%, holds briefly, fades out the screen barrier, and retracts blades offscreen.

---

## 8. `MapHub` (Registry Discovery Screen)
Grid registry displaying mapped star charts and stats.

- `render(maps, slug, themeColor, counts)`
  - **Description:** Builds and shows categorized grids of available maps.
- `renderSection(typeKey, maps, slug, counts)`
  - **Description:** Renders individual map rows (e.g. Galactic or Regional).
- `renderCard(map, slug, counts)`
  - **Description:** Renders card items displaying thumbnail graphics and lane counts.
- `init()`
  - **Description:** Attaches listeners to search inputs.
- `onSearch(e)`
  - **Description:** Filters displayed maps based on title search in real-time.

---

## 9. `MapViewer` (Interactive Map & Routing)
Zooming canvas rendering Leaflet star charts and routing navicomputers.

- `MinPriorityQueue` *(Class)*
  - **Description:** Custom binary heap priority queue supporting Dijkstra traversals.
- `init()`
  - **Description:** Builds pointer interactions, overlay boxes, and resets active endpoints.
- `onPointerDown(e) / onPointerMove(e) / onPointerUp(e)`
  - **Description:** Normalizes drag actions across mouse clicks and touch drags.
- `scheduleDragTick()`
  - **Description:** Schedules map drags within `requestAnimationFrame` hooks to prevent frame lag.
- `loadMapData()`
  - **Description:** Queries nodes/edges from Supabase, formats data, and triggers graphs.
- `renderMapData()`
  - **Description:** Generates visual lane paths, curves, and planet markers using SVG.
- `buildGraph()`
  - **Description:** Converts loaded nodes and edges into adjacency structures.
- `calculateRoute()`
  - **Description:** Fires Dijkstra traversals; snaps unlinked systems to closest exits as straight off-lane coordinates.
- `drawRoute(pathNodes, pathEdges, options)`
  - **Description:** Animates navigation routes using glowing colors and updates itinerary readouts.
- `bindUI()`
  - **Description:** Hooks inputs and toggles; selector clicks fully swap coordinate assets.
- `zoomToNode(nodeName)`
  - **Description:** Center-scrolls viewers onto specific planets.
- `getClosestPointOnSegment(point, start, end)`
  - **Description:** Coordinates math calculating distances from isolated targets to straight lines.
- `getCandidateComponentsForHybridRoute(sourceNode, targetNode)`
  - **Description:** Evaluates route components between unlinked coordinates.
- `renderRouteOverlay()`
  - **Description:** Renders straight cyan paths indicating hybrid off-lane voyages.
- `formatDistance(value)`
  - **Description:** Parses coordinate lengths into formatted user strings.
- `setStatus(message, type)`
  - **Description:** Updates search output displays using custom indicator styles (warnings, success).
- `refreshNodeStates()`
  - **Description:** Recalculates visual indicator classes on map nodes.
- `syncInputs()`
  - **Description:** Aligns form fields with calculated coordinate paths.
- `crossMapSearch(name)`
  - **Description:** Evaluates sibling maps for missing node lookups.
- `updateCrossMapHint(name, hintId)`
  - **Description:** Displays navigation tips highlighting planet locations on other maps.
- `switchToMap(mapId)`
  - **Description:** Switches viewer contexts to different maps using URL routing redirects.
- `buildComponents()`
  - **Description:** Walks the graph after load to assign connected-component IDs for routeable hyperlane clusters.
- `setMapSource(src, mapName)`
  - **Description:** Swaps the visible map image while preserving navicomputer state and updating the active selector chip.
- `selectNode(nodeId)` / `assignSelectedNode(type)`
  - **Description:** Drives the focused-world workflow so readers can inspect a node and promote it to origin or destination.
- `setRouteEndpoint(type, value)`
  - **Description:** Resolves a selected node or exact input value into a persistent route endpoint.
- `createAccessPointForNode(node)` / `findNearestAccessPoint(node, componentId)`
  - **Description:** Build native or snapped route-entry metadata for linked and unlinked worlds. Hardened against unlinked graph topography exceptions and malformed coordinate drift.
- `runDijkstra(sourceId, targetId)` / `findBestHybridRoute(sourceNode, targetNode)`
  - **Description:** Shared routing helpers for standard graph traversal and hybrid nearest-exit fallback selection.
- `clearRoute()` / `swapRoute()`
  - **Description:** Route management helpers for clearing or reversing the current nav path.
- `handleSearch()`
  - **Description:** Focuses the map on an exact world search hit from the navicomputer search field.
- `renderNodeCard()` / `renderSummary()`
  - **Description:** Renders the focused-world card plus the route summary metrics panel.
- `toggleLayer(key)` / `applyDisplayState()`
  - **Description:** Manages reader-facing label and hyperlane visibility controls.
- `hideCrossMapHint(hintId)`
  - **Description:** Hides the cross-map hint for the specified field.

---

## 10. `Particles` (Background Canvas Engine)
Generates floating star graphics in background canvases.

- `init()`
  - **Description:** Creates HTML5 canvas dimensions, populates star arrays, and attaches window visibility checks.
- `animate()`
  - **Description:** Physics loop executing dynamic particle adjustments inside `requestAnimationFrame`.
- `resize()`
  - **Description:** Scales canvas resolution during browser resizing.

---

## 11. `Actions` (Gallery & Layouts)
Handles character collections, sorting filters, and media grids.

- `renderGalleryGrid(shuffle)`
  - **Description:** Builds fanning deck or column layouts, filtering R18 elements.
- `toggleViewMode()`
  - **Description:** Switches grids between Deck fanning and standard Grid formats.
- `toggleR18()`
  - **Description:** Toggle filters on age-restricted artwork and updates display grids.
- `setFilter(tag)`
  - **Description:** Refines current lists using character visual attributes.
- `shuffleGallery()`
  - **Description:** Triggers random shuffling transitions on roster items.
- `voteImage(imageId, value)`
  - **Description:** Pushes upvotes/downvotes against Supabase and updates visual count indicators.
