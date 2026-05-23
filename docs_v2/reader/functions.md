# Reader SPA (`index.html`) — Function Index

This document outlines the detailed breakdown of the functions, objects, and modular methods within the Reader Single Page Application (`index.html`). Following the ES6 modular refactor, all logic is encapsulated within specific domains under the `js/` directory.

---

## 1. `js/main.js` (Application Entry Point)

**File Range:** `Lines 1 - 61`

Responsible for bootstrapping the application. Binds all imported modules to the global `window` scope for inline HTML event listeners, and coordinates the initialization sequence within the `DOMContentLoaded` event listener.

### Core Architecture & Scope Bindings
- **Global Scope Exposure** (`Lines 23 - 40`): Explicitly attaches core modules to the `window` namespace to enable legacy inline HTML events:
  - `State` $\rightarrow$ `window.State`
  - `Utils` $\rightarrow$ `window.Utils`
  - `DB` $\rightarrow$ `window.DB`
  - `UserAuth` $\rightarrow$ `window.UserAuth`
  - `CommentsManager` $\rightarrow$ `window.CommentsManager`
  - `Particles` $\rightarrow$ `window.Particles`
  - `Visuals` $\rightarrow$ `window.Visuals`
  - `LorePrefetcher` $\rightarrow$ `window.LorePrefetcher`
  - `AudioController` $\rightarrow$ `window.AudioController`
  - `ReaderFeatures` $\rightarrow$ `window.ReaderFeatures`
  - `SaberController` $\rightarrow$ `window.SaberController`
  - `UI` $\rightarrow$ `window.UI`
  - `LoaderManager` $\rightarrow$ `window.LoaderManager`
  - `Actions` $\rightarrow$ `window.Actions`
  - `MapViewer` $\rightarrow$ `window.MapViewer`
  - `MapHub` $\rightarrow$ `window.MapHub`
  - `Render` $\rightarrow$ `window.Render`
  - `Router` $\rightarrow$ `window.Router`
- **Hashchange Event Listener** (`Line 43`): Sets up hash listener to delegate dynamic views to the client-side router: `window.addEventListener('hashchange', Router.handle);`
- **`DOMContentLoaded` Event Listener** (`Lines 45 - 60`): Coordinates the app initialization sequence:
  - `LoaderManager.show()` (`Line 47`): Instantly displays the active cinematic loader system (Primary cinematic loader for cold start).
  - `SaberController.init()` (`Line 50`): Initializes default lightsaber configuration and widget details in the background.
  - `LorePrefetcher.init()` (`Line 53`): Fire-and-forget background prefetching of encyclopedic data.
  - `UserAuth.init()` (`Line 55`): Restores active user authorization profiles and session listeners.
  - `Router.handle()` (`Line 56`): Evaluates current location hash and routes to the initial view.
  - `Visuals.initDynamicTransparency()` (`Line 57`): Bootstraps depth-of-field glassmorphism mouse blurs.
  - `Particles.init()` (`Line 58`): Spawns the background floating canvas particles.
  - `AudioController.init()` (`Line 59`): Loads the ambient site soundtrack system.

---

## 2. `js/config.js` (Configuration & Global State)

**File Range:** `Lines 1 - 45`

Contains global application parameters, database client instantiations, and strict text formatting/XSS mitigation helper functions.

### Variables & Objects
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` (`Lines 4 - 5`): Supabase database connection secrets.
- `supabaseClient` (`Line 7`): Shared client reference for Supabase operations.
- `State` (`Lines 10 - 20`): Live global state schema tracking reader session contexts:
  - `isInitialAppLoad` *(Boolean)*: Cold start flag governing if the monogram intro plays.
  - `currentStory` *(Object)*: Active story database record.
  - `currentStorySlug` *(String)*: Slug identifier for the current story view.
  - `currentChars` *(Array)*: Active character records loaded in character grid.
  - `currentWallpapers` *(Array)*: Active story wallpaper records.
  - `filterTag` *(String)*: Active gallery filter tag (defaults to `'All'`).
  - `galleryConfirmed` *(Boolean)*: Local safety confirmation toggle.
  - `galleryViewMode` *(String)*: View arrangement preference (restores `'grid'` or `'deck'`).
  - `showR18` *(Boolean)*: Mature artwork filter visibility toggle (stored in `localStorage`).
- `default_behavior_lightsaber` (`Line 23`): Layout metrics orientation key (defaults to `'horizontal'`).

### `Utils`
- `Utils.escapeHtml(unsafe)` (`Lines 27 - 35`): Strict sanitizer designed to neutralize dangerous HTML character entities (`&`, `<`, `>`, `"`, `'`).
- `Utils.escapeAttr(unsafe)` (`Lines 36 - 42`): Specialized attribute value sanitizer ensuring safe inline insertion of dynamic markup.

---

## 3. `js/db.js` (Database Abstraction & Cache Engine)

**File Range:** `Lines 1 - 237`

Orchestrates database transaction wrappers for Supabase and implements a lightweight LRU/TTL caching layer.

### `Cache`
- `Cache.getHub(slug)` (`Lines 15 - 27`): Retrieves cached story data if available. Automatically evicts entries exceeding the 5-minute lifespan (`Cache._TTL`) and moves hits to the end of the `_hubEntries` list to preserve MRU ordering.
- `Cache.setHub(slug, data)` (`Lines 29 - 40`): Caches story hub results. Enforces a strict 5-entry limit (`Cache._HUB_MAX`) by shifting out and deleting the oldest cached entry.
- `Cache._evictHub(slug)` (`Lines 42 - 45`): Purges a designated story record from the cache tables.
- `Cache.isStale(ttlTimestamp)` (`Lines 47 - 49`): Evaluates whether a timestamp has expired past the 5-minute threshold.

### `DB`
- `DB.getStories()` (`Lines 53 - 64`): Fetches all published stories, using local memory if cache is valid.
- `DB.getMapNodes(mapId)` (`Lines 66 - 70`): Retrieves Leaflet cartographic coordinates associated with a map registry chart.
- `DB.getMapEdges(mapId)` (`Lines 72 - 76`): Pulls structural polyline edges (hyperlanes) connecting coordinate points.
- `DB.getMapCounts(mapIds)` (`Lines 79 - 90`): Parallel batch fetching of nodes and edges counts for Star Chart registry thumbnails.
- `DB.getAllMapNodeNames(storyId)` (`Lines 93 - 110`): Compiles planet names across all maps in a story to build a cross-map search index.
- `DB.getAuthorProfile()` (`Lines 113 - 137`): Queries the admin bio and social profiles, caching results.
- `DB.getStoryHubData(slug)` (`Lines 140 - 192`): unified parallel fetch coordinating multiple async DB operations for hub layouts, resolving complex timelines and event-character linkages.
- `DB.getChapters(storyId)` (`Lines 194 - 203`): Retreives published chapter lists sorted chronologically.
- `DB.getCharacterGallery(characterId)` (`Lines 205 - 213`): Pulls illustrations tagged with character credentials.
- `DB.getLatestGalleryImages(storyId, limit, offset)` (`Lines 215 - 224`): Retrieves recently uploaded story illustrations to populate Masonry grids.
- `DB.getLoreEntry(storyId, loreSlug)` (`Lines 226 - 235`): Resolves wiki details for a single lore entry.

---

## 4. `js/auth.js` (User Authentication & Profile Manager)

**File Range:** `Lines 1 - 219`

Manages reader session states, account creation, secure avatar storage transfers, and profile updates.

### `UserAuth`
- `UserAuth.init()` (`Lines 11 - 34`): Checks active user sessions, registers Supabase `onAuthStateChange` hooks, and triggers auth transitions or discussions refresh.
- `UserAuth.fetchProfile(user)` (`Lines 36 - 75`): Synchronizes display details with a 5-step exponential backoff retry wrapper to handle trigger-created profile entry latencies.
- `UserAuth.toggleMode()` (`Lines 77 - 83`): Toggles layouts of authentication prompt (login vs signup).
- `UserAuth.handleSubmit()` (`Lines 85 - 117`): Submits credentials, showing clean inline feedback during auth loops.
- `UserAuth.signOut()` (`Lines 119 - 121`): Revokes current active authentication credentials.
- `UserAuth.uploadAvatar(fileInput)` (`Lines 123 - 181`): Performs binary file transfers into Supabase storage (`Reader` bucket) with instant localized UI avatar preview generation.
- `UserAuth.saveProfile()` (`Lines 183 - 217`): Synchronizes display name, avatar URLs, and biography descriptions with the profiles database.

---

## 5. `js/router.js` (Client-Side Hash Routing & Pre-Fetcher)

**File Range:** `Lines 1 - 116`

Custom client-side hash router coordinating views transitions, optimistic assets pre-fetching, and NSFW/age gates.

### `Router`
- `Router.getParts()` (`Line 12`): Extracts views segments from location hash arrays.
- `Router.navigate(hash)` (`Lines 14 - 34`): Debounces rapid navigation inputs and executes pre-fetching triggers for story hubs during transit.
- `Router.handle()` (`Lines 36 - 114`): Core route dispatcher. Toggles off sidebars, lightboxes, and cartography resources, enforces gallery warning gates, and delegates content formatting to `Render` controllers. Uses a dynamic route token to resolve async race conditions.

---

## 6. `js/render.js` (HTML Templating & DOM Injection Engine)

**File Range:** `Lines 1 - 678`

Generates complex HTML string structures from raw Supabase database records and injects them into the `#content-stage` stage.

### `Render`
- `Render.home()` (`Lines 13 - 82`): Builds the public homepage grid, fetching story thumbnails and parsing the author links.
- `Render.storyHub(slug)` (`Lines 84 - 136`): Renders story-specific homepages, adding world-building tabs for timelines, lore guides, and maps.
- `Render.gallery(slug, charId)` (`Lines 138 - 291`): Handles two modular layouts. Builds character index cards with infinite Masonry scrolls, or formats individual bios featuring tag filtering sliders, NSFW safety toggles, and fanned deck views.
- `Render.reader(slug, chIdx)` (`Lines 293 - 369`): Builds the reading interface, formatting raw chapter paragraphs into comment-targeted text blocks, complete with text metrics customization panels.
- `Render.lore(slug)` (`Lines 371 - 412`): Assembles lore category classifications, compiling visual indexes.
- `Render.loreDetail(slug, loreSlug)` (`Lines 414 - 452`): Outputs descriptive wiki details pages.
- `Render.timeline(slug)` (`Lines 454 - 501`): Plots chronological events along an alternating left-to-right history timeline path.
- `Render.maps(slug, mapId)` (`Lines 503 - 676`): Sets up Leaflet CRS coordinate scopes, search elements, and plots course overlays.

---

## 7. `js/ui.js` (User Interface & Cinematic Visuals)

**File Range:** `Lines 1 - 1213`

Controls the overall user experience, including background rendering, lightboxes, canvas physics, dynamic card tilting, and modular loader transitions.

### `Particles`
- `Particles.init()` (`Lines 11 - 49`): Bootstraps float dust canvas. Listens to visibility changes to freeze/unfreeze loops, preserving CPU energy when tabs are hidden.

### `Visuals`
- `Visuals.initDynamicTransparency()` (`Lines 54 - 114`): Tracks cursor coordinate bounds on wide viewports to dynamically blur global backgrounds based on mouse location and proximity.
- `Visuals.initCardTilt()` (`Lines 116 - 137`): Uses single-event delegation on grids to apply dynamic perspective 3D tilting rotation transforms to hover-focused cards.
- `Visuals.openLightbox(src)` (`Lines 140 - 152`): Triggers basic image lightboxes.
- `Visuals.closeLightbox()` (`Lines 153 - 158`): Exits full-screen lightbox presentation modes.
- `Visuals.openGalleryLightbox(idx, images)` (`Lines 159 - 173`): Starts slideshow lightboxes with voting and comments drawer integrations.
- `Visuals.lbNext()` (`Lines 174 - 178`): Increments index cursor within active slideshow arrays.
- `Visuals.lbPrev()` (`Lines 179 - 183`): Decrements index cursor within active slideshow arrays.
- `Visuals.updateLightboxView()` (`Lines 184 - 203`): Re-binds illustration attachments, live scores, and panel discussions.

### `LorePrefetcher`
- `LorePrefetcher.init()` (`Lines 211 - 223`): Prefetches encyclopedic articles containing images.
- `LorePrefetcher.getRandomEntry()` (`Lines 225 - 229`): Delivers random facts to the Monogram loading screen.

### `AudioController`
- `AudioController.init()` (`Lines 235 - 243`): Hooks volume togglers to handle backdrops audios.
- `AudioController.toggle()` (`Lines 244 - 254`): Toggles sound outputs.

### `ReaderFeatures`
- `ReaderFeatures.toggleFocus(btn)` (`Line 260`): Triggers margin alignments for clean reading.
- `ReaderFeatures.toggleFontMenu()` (`Line 261`): Swaps display status of style settings overlays.
- `ReaderFeatures.setFontSize(s)` (`Line 262`): Sets global text size class.
- `ReaderFeatures.setFontFamily(f)` (`Line 263`): Sets global text family style.
- `ReaderFeatures.applyFonts()` (`Line 264`): Updates classes across reader scopes.
- `ReaderFeatures.toggleSidebar()` (`Lines 265 - 270`): Toggles the chapter navigation list sidebars.

### `SaberController`
- `SaberController.getBackgroundImage()` (`Lines 282 - 288`): Pulls currently active backdrop images to sync backdrops.
- `SaberController.normalizeMode(mode)` (`Line 289`): Normalizes hilt/blade orientation parameters.
- `SaberController.getBladeLength(mode)` (`Lines 290 - 295`): Calculates responsive blade lengths based on screen resolutions.
- `SaberController.getLayoutForMode(mode)` (`Lines 296 - 314`): Returns layout parameters for horizontal/vertical configurations.
- `SaberController.clearAnimation()` (`Lines 315 - 324`): Standard animation cleanup.
- `SaberController.animateProgressTo(target, duration, onComplete)` (`Lines 325 - 350`): Custom ease-out progress animations.
- `SaberController.syncWidgetBackdrop()` (`Lines 351 - 361`): Syncs the active background into the widget options.
- `SaberController.init()` (`Lines 362 - 413`): Dynamically imports the core lightsaber widgets, merging local preferences.
- `SaberController.saveAndApply()` (`Lines 414 - 446`): Flushes selected configurations to `localStorage`.
- `SaberController.showLoading()` (`Lines 447 - 454`): Orchestrates progress bar fades and runs blade ignition sequences.
- `SaberController.hideLoading()` (`Lines 455 - 468`): Retracts blades and handles fade transitions.

### `UI`
- `UI.setBg(url)` (`Lines 478 - 483`): Direct update of backdrops, notifying Saber interfaces.
- `UI.setBackButton(act, lbl)` (`Lines 485 - 490`): Renders navigation return parameters.
- `UI.showWallpaperButton()` (`Lines 492 - 500`): Populates customization palettes.
- `UI.hideWallpaperButton()` (`Line 502`): Hides customization palettes.
- `UI.openWallpaperModal()` (`Lines 504 - 516`): Displays wallpaper choices.
- `UI.showLoading()` (`Lines 518 - 520`): Instructs LoaderManager to display the transition screens.
- `UI.hideLoading()` (`Lines 522 - 524`): Terminates active loading screens.
- `UI.openSaberModal()` (`Lines 526 - 532`): Displays blade configuration panels.
- `UI.closeSaberModal()` (`Lines 534 - 540`): Closes config panels.
- `UI.initAuthLink(userProfile)` (`Lines 542 - 556`): Populates user avatars or sign-in icons.
- `UI.openAuthModal()` (`Lines 558 - 571`): Displays authorization window.
- `UI.closeAuthModal()` (`Lines 573 - 579`): Dismisses authorization window.
- `UI.openProfileModal()` (`Lines 581 - 602`): Pre-fills bio settings and launches profile editing window.
- `UI.closeProfileModal()` (`Lines 604 - 610`): Closes profile editing window.
- `UI.initAdminLink()` (`Lines 612 - 623`): Renders shortcuts panel for privileged users.
- `UI.showGalleryWarning(storySlug)` (`Lines 625 - 659`): Launches age warnings screens.
- `UI.closeGalleryWarning()` (`Lines 661 - 666`): Hides content gates.

### `LoaderManager` (Loader Orchestration)
- `LoaderManager.determineRequiredLoader()` (`Lines 706 - 714`): Examines context (app start-up vs story config metadata) to select transition themes:
  - Cold Start $\rightarrow$ `'primary'` (Custom monogram loading screen)
  - Story Theme $\rightarrow$ Story-configured Anomaly loading screens (`'anomaly_flesh'`, `'anomaly_hex'`, `'anomaly_cyber'`, `'anomaly_kinetic'`, `'anomaly_crystal'`)
  - Fallback/Default $\rightarrow$ `'lightsaber'`
- `LoaderManager.show()` (`Lines 716 - 761`): Handles transitions. Runs dynamic async imports (`await import()`) to load loading screen scripts on-demand, caching modules and initializing layouts.
- `LoaderManager.hide()` (`Lines 763 - 771`): Instructs active screen loaders to execute exit transition layouts.
- `LoaderManager.playOutro()` (`Lines 773 - 790`): Orchestrates outro animations when transitioning out of the monogram loading screen.

### `Actions`
- `Actions.fetchVotes()` (`Lines 799 - 827`): Queries image reaction metadata.
- `Actions.voteImage(imageId, value)` (`Lines 829 - 893`): Inserts/updates/deletes upvotes and downvotes, updating affected DOM nodes directly.
- `Actions.renderGalleryGrid(shuffle)` (`Lines 896 - 1127`): Custom chunked grid rendering using `requestIdleCallback` to prevent long-tasks locks, or manages 3D Album Cover decks.
- `Actions.toggleViewMode()` (`Lines 1128 - 1139`): Toggles grids and 3D decks.
- `Actions.toggleR18()` (`Lines 1140 - 1159`): Safety filters.
- `Actions.setFilter(t)` (`Line 1160`): Sets tags filters.
- `Actions.shuffleGallery()` (`Line 1161`): Randomizes artwork lists.
- `Actions.loadMoreLatestImages(storyId)` (`Lines 1163 - 1211`): Infinite pagination handler.

---

## 8. `js/comments.js` (Threaded Discussions Panel)

**File Range:** `Lines 1 - 277`

Manages threaded comments, paragraph annotations, image discussions, and authorization actions.

### `CommentsManager`
- `CommentsManager.openDrawer(targetId, targetType, title, context, prefix)` (`Lines 12 - 33`): Instantiates comments panel.
- `CommentsManager.closeDrawer()` (`Lines 35 - 47`): Closes discussion overlay.
- `CommentsManager.renderInput()` (`Lines 49 - 87`): Draws inputs and prompts depending on authentication status.
- `CommentsManager.loadThread()` (`Lines 89 - 174`): Loads target threads, matching metadata configurations.
- `CommentsManager.postComment()` (`Lines 176 - 212`): Inserts new comments.
- `CommentsManager.refreshRenderedThreads()` (`Lines 214 - 218`): Syncs forms on auth change.
- `CommentsManager.editComment(id, currentContent)` (`Lines 220 - 230`): Instantiates inline edit textareas.
- `CommentsManager.cancelEdit(id)` (`Lines 232 - 240`): Discards current edits.
- `CommentsManager.saveEdit(id)` (`Lines 242 - 259`): Commits changes to the comments database.
- `CommentsManager.deleteComment(id)` (`Lines 261 - 275`): Prompt confirmation before deleting comments.

---

## 9. `js/maps/MapHub.js` (Star Chart Registry Index)

**File Range:** `Lines 1 - 105`

Categorizes and renders the Star Chart Registry hub, including live data counters.

### `MapHub`
- `MapHub.renderCard(map, slug, counts)` (`Lines 14 - 35`): Formats map records, embedding node and hyperlane counts.
- `MapHub.renderSection(typeKey, maps, slug, counts)` (`Lines 37 - 51`): Sorts charts into Galactic, Regional, or Sector scopes.
- `MapHub.render(maps, slug, themeColor, counts)` (`Lines 53 - 79`): Compiles sections and search structures.
- `MapHub.init()` (`Lines 81 - 85`): Registers listeners on query fields.
- `MapHub.onSearch(e)` (`Lines 87 - 104`): Filters registry list based on search term.

---

## 10. `js/maps/MapViewer.js` (Cartography Navigator & Dijkstra Navicomputer)

**File Range:** `Lines 1 - 1374`

High-performance navigation engine integrating Leaflet.js coordinate tracking with a double-linked graph implementation and a Dijkstra pathfinding navicomputer.

### `MinPriorityQueue`
- `MinPriorityQueue.constructor()` (`Lines 6 - 8`): Instantiates binary heap array elements.
- `MinPriorityQueue.enqueue(element, priority)` (`Lines 10 - 13`): Places nodes based on priority metrics.
- `MinPriorityQueue.dequeue()` (`Lines 15 - 23`): Pops and returns the node with lowest priority.
- `MinPriorityQueue.isEmpty()` (`Lines 25 - 27`): Returns boolean indicator.
- `MinPriorityQueue.bubbleUp()` (`Lines 29 - 40`): Re-aligns binary heap.
- `MinPriorityQueue.sinkDown()` (`Lines 42 - 72`): Performs binary adjustments.

### `MapViewer`
- `MapViewer.init(mapConfig)` (`Lines 115 - 177`): Bootstraps coordinate projections and bounds.
- `MapViewer.bindUI()` (`Lines 179 - 230`): Registers routing interactions and search inputs.
- `MapViewer.loadMapData()` (`Lines 232 - 262`): Resolves Supabase coordinates.
- `MapViewer.renderMapData()` (`Lines 264 - 328`): Draws canvas markers and hyperlane vectors.
- `MapViewer.buildGraph()` (`Lines 330 - 346`): Structures double-linked graph nodes.
- `MapViewer.setMapSource(id, name, src, w, h)` (`Lines 348 - 364`): Switch charts.
- `MapViewer.normalizeName(name)` (`Line 366`): Standardizes names.
- `MapViewer.findNodeByName(name)` (`Lines 368 - 371`): Queries nodes.
- `MapViewer.hasLinkedNeighbors(nodeId)` (`Line 373`): Neighbor connections verification.
- `MapViewer.createEmptyRouteState()` (`Lines 375 - 385`): Wipes route cache values.
- `MapViewer.measureGeometry(n1, n2)` (`Lines 387 - 395`): Straight line geometric computations.
- `MapViewer.getClosestPointOnSegment(p, a, b)` (`Lines 397 - 409`): Calculates projections onto vector segments.
- `MapViewer.buildComponents()` (`Lines 411 - 449`): Identifies isolated sub-networks.
- `MapViewer.createAccessPointForNode(...)` (`Lines 451 - 460`): Inserts coordinate access indicators.
- `MapViewer.findNearestAccessPoint(...)` (`Lines 462 - 524`): Searches isolated hyperlanes paths.
- `MapViewer.getCandidateComponentsForHybridRoute(...)` (`Lines 526 - 534`): Charts lanes intersections.
- `MapViewer.runDijkstra(startId, endId)` (`Lines 536 - 593`): Evaluates route weights.
- `MapViewer.findBestHybridRoute(startId, endId)` (`Lines 595 - 656`): Evaluates pathfinding when endpoints reside in isolated networks.
- `MapViewer.selectNode(nodeId, nodeDomEl)` (`Lines 658 - 666`): Displays info overlays.
- `MapViewer.assignSelectedNode(role)` (`Lines 668 - 674`): Sets endpoint bounds.
- `MapViewer.setRouteEndpoint(role, name)` (`Lines 676 - 714`): Configures route coordinates and cross-map hints.
- `MapViewer.calculateRoute()` (`Lines 716 - 765`): Invokes pathfinding calculation routing.
- `MapViewer.drawRoute(path)` (`Lines 767 - 859`): Renders structural SVGs representing solid and dashed hyperlane trajectories.
- `MapViewer.clearRoute()` (`Lines 861 - 869`): Wipes navicomputer overlays.
- `MapViewer.swapRoute()` (`Lines 871 - 893`): Alternates direction pathways.
- `MapViewer.handleSearch(e)` (`Lines 895 - 909`): Centers on search results.
- `MapViewer.crossMapSearch(query)` (`Lines 912 - 918`): Searches target planet indexes.
- `MapViewer.updateCrossMapHint(inputEl, query)` (`Lines 921 - 941`): Renders navigation hints for cross-map searches.
- `MapViewer.hideCrossMapHint(inputEl)` (`Lines 943 - 946`): Hides cross-map hints.
- `MapViewer.switchToMap(mapId)` (`Lines 949 - 952`): Triggers transitions.
- `MapViewer.renderNodeCard(node)` (`Lines 954 - 980`): Fills sidebar cards.
- `MapViewer.renderSummary(result)` (`Lines 982 - 1026`): Renders total cost calculations.
- `MapViewer.refreshNodeStates()` (`Lines 1028 - 1042`): Focuses markers.
- `MapViewer.syncInputs()` (`Lines 1044 - 1049`): Syncs datalist coordinates.
- `MapViewer.setStatus(msg)` (`Lines 1051 - 1058`): Emits console messages.
- `MapViewer.toggleLayer(selector, active)` (`Lines 1060 - 1063`): Toggles elements.
- `MapViewer.applyDisplayState()` (`Lines 1065 - 1075`): Adjusts styling properties.
- `MapViewer.computeEdgeDistance(edge, fromNode, toNode)` (`Lines 1077 - 1079`): Compares and returns edge costs.
- `MapViewer.computeTotalDistance(edges)` (`Line 1081`): Summation helper.
- `MapViewer.formatDistance(dist)` (`Line 1083`): Returns text descriptions.
- `MapViewer.renderRouteOverlay()` (`Lines 1085 - 1133`): Plots path coordinates.
- `MapViewer.focusActiveRoute()` (`Lines 1135 - 1145`): Restores focus around routes.
- `MapViewer.resetView()` (`Lines 1147 - 1150`): Centers active canvas layouts.
- `MapViewer.zoomToRoute()` (`Lines 1152 - 1204`): Renders bounding box overlays.
- `MapViewer.zoomToNode(node)` (`Lines 1206 - 1214`): Zoom focusing.
- `MapViewer.destroy()` (`Lines 1216 - 1225`): Destroys Leaflet map instances and unbinds event listeners.
- `MapViewer.centerMap()` (`Lines 1227 - 1238`): Map panning adjustments.
- `MapViewer.update()` (`Lines 1240 - 1244`): Layout resets.
- `MapViewer.clamp(...)` (`Lines 1246 - 1256`): Map clamping values.
- `MapViewer.zoom(...)` (`Lines 1258 - 1270`): Zoom bounds adjustments.
- `MapViewer.onWheel(...)` (`Lines 1272 - 1275`): Mouse scroll wheel triggers.
- `MapViewer.onPointerDown(...)` (`Lines 1277 - 1285`): Click start tracking.
- `MapViewer.onTouchStart(...)` (`Lines 1287 - 1298`): Touch start bounds.
- `MapViewer.startDrag(...)` (`Lines 1300 - 1305`): Initializes drags.
- `MapViewer.onPointerMove(...)` (`Lines 1307 - 1314`): Dynamic drag recalculations.
- `MapViewer.onTouchMove(...)` (`Lines 1316 - 1332`): Touch drag loops.
- `MapViewer.scheduleDragTick()` (`Lines 1334 - 1344`): Coordinates frame calculations.
- `MapViewer.doDrag()` (`Lines 1346 - 1351`): Pans cartography viewports.
- `MapViewer.onPointerUp()` (`Lines 1353 - 1357`): Drag releases.
- `MapViewer.onUp()` (`Lines 1359 - 1362`): Release loops.
- `MapViewer.onResize()` (`Lines 1364 - 1372`): Updates responsive coordinates on window resize.
