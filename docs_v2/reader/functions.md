# Reader Frontend Functions

The functions and components of the public reader SPA are now fully modularized and organized into dedicated ES6 files inside `/js/` and styles inside `styles.css` at the project root directory.

### `Router` (Navigation & Views - `js/router.js`)
- `handle()` - Also wraps `UI.hideLoading()` in both success and error completion paths so stage fade-in still completes if the saber widget throws during teardown.
- `handle()` - Also tears down the cold-start loader when the gallery advisory modal intercepts routing before any gallery render work begins.
- `withTimeout(promise, message)` - Caps route rendering work so stalled Supabase/network requests resolve into the router error panel instead of leaving the loader overlay visible indefinitely.
- `handle()` — Reads the current window hash and dispatches to the correct view renderer, now guarding route completions so stale or failed renders cannot leave the stage hidden or loader stuck.
- `navigate(path)` — Programmatically changes the URL hash and triggers a route update, short-circuiting same-route clicks into a safe re-render instead of waiting on a `hashchange` that will never fire.
- `getParts()` — Helper to break down the hash into view and ID parameters (e.g., `#story/123`).

### `Cache` (TTL + LRU Data Cache - `js/db.js`)
- `getHub(slug)` — Returns cached hub data if fresh (within 5-min TTL), or `null` if stale/missing. Updates LRU order on access.
- `setHub(slug, data)` — Stores hub data with a timestamp. Evicts the least-recently-used entry if at capacity (max 5).
- `_evictHub(slug)` — Removes a specific hub entry from both the ordered list and lookup map.
- `isStale(ttlTimestamp)` — Returns `true` if the given timestamp is older than the TTL threshold (5 minutes).

### `DB` (Supabase Data Access - `js/db.js`)
- `getStories()` — Fetches published stories (cached with TTL).
- `getAuthorProfile()` — Fetches admin profile + author links (cached with TTL).
- `getStoryHubData(slug)` — Fetches story + wallpapers + characters + lore + timeline + maps in parallel (LRU-cached). Timeline character links are batched via `.in()`.
- `getChapters(storyId)` — Fetches all published chapters for a specific story.
- `getCharacterGallery(characterId)` — Fetches only published gallery images for a character.
- `getLatestGalleryImages(storyId, limit, offset)` — Fetches only published recently added gallery images across all characters in a story with pagination/offset support.
- `getGalleryCollectionPreviews(storyId)` — Fetches published story-wide artwork plus joined character metadata for the main gallery's layered collection previews.
- `getLoreEntry(storyId, loreSlug)` — Fetches a single lore entry by slug.
- `getMapCounts(mapIds)` — Fetches node and edge counts for specified maps to display in the hub.
- `getAllMapNodeNames(storyId)` — Fetches all mapped planet names across all maps in a given story.

### `UserAuth` (Authentication - `js/auth.js`)
- `prepareAvatarUpload(file)` — Internal fail-safe optimizer that bounds ordinary PNG/JPG/JPEG avatars to 1024px and emits WebP when beneficial, while preserving GIF/other formats and falling back to the original on decode/canvas failure.
- `init()` — Checks for an existing session and sets up the `onAuthStateChange` listener.
- `fetchProfile(user)` — Asynchronously fetches the user's profile row from the DB. Implements exponential backoff (up to 5 retries starting at 300ms) to bypass database replication or trigger delays upon new user registration.
- `logout()` — Signs the current user out of Supabase and reloads the page.
- `showAuthModal(type)` — Opens the generic modal configured for either 'login' or 'register'.

### `CommentsManager` (User Interaction - `js/comments.js`)
- `init()` — Initializes the comments drawer UI bindings.
- `loadComments(targetId, targetType)` — Fetches comments linked to a specific entity (like a chapter or story).
- `renderComments(comments)` — Generates the HTML for the comments list.
- `postComment(content)` — Inserts a new comment into the database using the active session.
- `deleteComment(id)` — Deletes a comment (restricted to the comment owner or admin).
- `toggleUpvote(commentId)` — Toggles the like status on a comment for the active user.
- `toggleCommentDrawer()` — Opens or closes the sliding comments side panel.

### `UI` (Interface Helpers - `js/ui.js`)
- `setBg(url)` — Applies a reader background only when its URL changed, avoiding redundant CSS image reload/revalidation work.
- `showLoading() / hideLoading()` — Proxies to `LoaderManager` to control the global full-screen transition overlay.
- `openSaberModal() / closeSaberModal()` — Controls the lightsaber preferences modal.
- `toast(message, type, duration)` — Displays a temporary notification popup (success, error, info).
- `applyCustomColors(settings)` - Injects CSS variables into the `:root` to theme the site dynamically.
- `renderStoryCard(story)` - Returns the HTML block for a story display card.
- `renderChapterList(chapters)` - Returns the HTML list of chapters for the story view.
- `showGalleryWarning(storySlug)` — Displays a beautiful glassmorphic modal advising the user of aggregated/AI/mature content in the gallery, offering them a clear Yes (Proceed) or No (Go Back) option.
- `closeGalleryWarning()` — Closes the gallery content advisory modal with a smooth fade animation.

- `initAuthLink(userProfile)` â€” Renders the far-right header auth slot as either a sign-in button or the current reader avatar/profile trigger.

### `LoaderManager` (Modular Transition Orchestrator - `js/ui.js`)
- `determineRequiredLoader()` — Resolves the appropriate overlay module key (e.g., `'primary'` monogram loader or standard `'lightsaber'`) based on cold start states or specific story metadata values.
- `show()` — Asynchronously imports, mounts, and initiates the resolved visual loading system, ensuring a fallback defaults to the lightsaber if an error occurs.
- `hide()` — Invokes the target loading system's cleanup or exit hooks.
- `playOutro()` — Triggers custom exit animation routines on the active module when loading completes.

- `withTimeout(promise, message)` - Caps dynamic loader imports so startup can continue if a loader module fetch stalls.
- `clearPrimaryLoader()` - Directly fades/removes the primary loader DOM as a fallback when no active loader object is available.

### `SaberController` (Lightsaber Loading Widget - `js/ui.js`)
- `animateProgressTo(target, duration, onComplete)` - Defensively parses widget progress and guards `getProgress` / `setProgress` calls so malformed saber state cannot crash the animation loop before `onComplete()` runs.
- `hideLoading()` - Also wraps widget `hide()` and reset progress calls so loader teardown still finishes even if the saber widget misbehaves.
- `init()` — Dynamically imports and initializes the lightsaber widget logic, applying either the default or saved loader mode, hiding the separate progress bar overlay, and seeding its illumination backdrop from the current reader background image.
- `saveAndApply()` — Captures reader customizations from the modal, including loader mode, applies them to the widget, caches to `localStorage`, and triggers a demo ignition.
-`showLoading()` — Activates the overlay, syncs the current background image and responsive blade length into the widget, and runs a smooth `requestAnimationFrame`-driven sweep toward the near-complete state while the saber widget brightens the full viewport and concentrates extra glow at the emitter, blade body, and tip.

- `hideLoading()` — Smoothly finishes the last stretch to `100%`, briefly holds the completed frame, then fades out the overlay before resetting progress off-screen for the next transition.

### `AnomalyLoader` (Modular SCP Anomaly Loader - `js/ui.js`)
- `inject()` — Dynamically inserts scoped CRT scanline overrides, Courier Prime fonts, terminal status logs, and decryption progress indicators directly to `document.body` on demand.
- `show(pattern)` — Configures and launches a responsive canvas-based procedural walker engine (supporting `'flesh'`, `'hex'`, `'cyber'`, `'kinetic'`, or `'crystal'` patterns) and increments a simulated terminal breach progress bar.
- `hide()` — Fades out and pauses the active requestAnimationFrame particle rendering loops.
- `playOutro()` — Runs a visual fade out routine and purges elements from the DOM after the route renders.

### `MapHub` (Registry Discovery Screen - `js/maps/MapHub.js`)
- `render(maps, slug, themeColor, counts)` — Prepares and renders the full grid-based map registry screen, segmented by galactic, regional, and local categories.
- `renderSection(typeKey, maps, slug, counts)` — Renders an individual category registry row with count badges.
- `renderCard(map, slug, counts)` — Renders a sleek card for each map displaying visual thumbnails and charted stats.
- `init()` — Binds input events to the registry search bar.
- `onSearch(e)` — Filters displayed maps and hides empty sections in real-time as users type.

### `TimelineHub` (Chronology Explorer - `js/timelines/TimelineHub.js`)
- `fetchGalacticTree()` - Lazily fetches `data/timeline/timeline_tree.json` and `data/timeline/galactic_metadata.json` in parallel and caches them for the Galactic History route.
- `initKeywordLinks()` - Fetches `timeline_simple_links.json`, filters out noise/lowercase entries to target proper nouns, and compiles a longest-match-first global regular expression with word boundaries.
- `applyKeywordLinks(text)` - Escapes HTML markup and replaces recognized proper nouns with target hyperlinked elements.
- `getEventImages(text)` - Scans the text for matched keywords, resolving each to its Wookieepedia page URL, and checks if it exists in the image lookup to return a list of matching images.
- `renderEventImages(images)` - Generates glassmorphic container cards for matched images with animated scales, glows, and name captions.
- `getGalacticRoot(tree)` - Resolves the generated tree root or richest nested "Timeline of galactic history" section, handling duplicate title sections from the local extractor output.
- `parseWikiData(rawJson, metadata)` - Decouples headers, ranges, and assets from event text by mapping over the metadata configuration and dynamically pulling events from corresponding raw nodes.
- `findSectionByTitle(node, targetTitle)` / `findSubEraNode(eraNode, sourceTitle)` - Locate raw era and sub-era nodes recursively within the raw JSON tree to merge events.
- `getSubEraNodes(eraNode)` / `collectParsedEvents(section, fallbackRange)` - Discover sub-era source nodes and recursively flatten year-header children into timeline event records.
- `parseSingleYear(value)` / `parseRangeFromTitle(title)` / `normalizeDateText(value)` / `cleanTimelineText(value)` - Extract and clean BBY/ABY dates, including implied-era ranges such as `34 - 35 ABY`.
- `getTimelineOrder(event)` / `formatYearLabel(year)` / `groupEventsByYear(events)` - Map BBY in reverse and ABY forward for chronological sorting and eventful-year grouping.
- `buildFrequencyPath(events)` - Buckets normalized events and builds the SVG mountain chart path for the detailed timeline.
- `countListItems(items)` / `countSectionEvents(section)` - Recursively count nested galactic history records for era metrics.
- `isChronologyHeading(text, hasChildren)` - Detects generated date/heading rows so they remain structural context instead of malformed event cards.
- `getGalacticData(tree)` - Returns the cached normalized Galactic History state, parsing the raw tree once if needed.
- `getEraTitle(title)` / `getEraRange(title)` - Derive display labels and date range strings from generated era titles.
- `getEraPosterAsset(index)` / `getSubEraAsset(index)` - Resolve configured Galactic History image variables for era posters and sub-era cards.
- `renderLanding(storyEvents, slug)` - Renders the two-choice timeline registry for Story History and Galactic History.
- `renderStoryHistory(events, slug)` / `renderStoryEventCard(evt, index, slug)` - Render the upgraded searchable Story History event list and linked character chips.
- `renderGalacticExplorer(tree, slug)` / `renderEraOverviewCard(era, index)` - Render the full-viewport concept-style Galactic History console and major-era poster grid with single-layer contained era poster art.
- `renderSubEraSelectionPage(era, eraIndex)` / `renderSubEraSelectionCard(subEra, eraIndex, subIndex)` - Render Page 2: parent-era background, left-aligned hero, overview action, and image-backed glassmorphic sub-era card grid.
- `renderDetailedTimelinePage(era, subEra)` / `renderBranchingYearGroup(group, groupIndex)` / `renderBranchingEventCard(event, count, groupIndex, eventIndex)` / `getBranchSide(count, groupIndex, eventIndex)` - Render Page 3: sub-era/era background, sticky SVG frequency chart, viewport scrubber, centered vertical line, and branching year cards.
- `initStoryHistory()` / `filterStoryEvents(event)` - Bind and execute Story History search filtering.
- `initGalacticExplorer()` / `initTimelineKeyboard()` / `initTimelineScrollSync()` / `filterGalacticEras(event)` - Bind search, arrow-key year navigation, and viewport scrubber updates.
- `openGalacticEra(index)` / `showEraOverview()` / `openEraTimeline(eraIndex)` / `openSubEraTimeline(eraIndex, subEraIndex)` / `renderTimelineIntoHost(era, subEra)` / `navigateEventfulYear(direction)` - Switch between Page 1, Page 2, and Page 3, including arrow-key jumps between eventful years.
- `selectSubEra()` / `openRecordDetail()` / `toggleEra()` / `filterEraSection()` / `toggleEraRecords()` - Legacy no-op compatibility handlers for cached older Galactic History markup.

### `LocationHistoryIndex` (Map Planet History Overlay - `js/timelines/LocationHistoryIndex.js`)
- `normalizeText(value)` - Lowercases and normalizes text into a whitespace-padded phrase for exact location matching.
- `getLocationTerms(locationName)` - Builds normalized search terms from the selected map node name, including a parenthetical-stripped variant.
- `textMatchesLocation(text, terms)` - Checks whether a normalized timeline text contains any location term as a phrase.
- `findStoryEvents(locationName, storyEvents)` - Scans the current story's `timeline_events` payload for matching title/description text and maps matches into overlay records.
- `findGalacticEvents(locationName)` - Lazy-loads parsed Galactic History through `TimelineHub`, scans event text by location phrase, sorts matches chronologically, and caches results by normalized location name.
- `search(locationName, storyEvents)` - Combines Story History and Galactic History matches into a single grouped result payload.
- `ensureOverlay()` / `open(locationName, storyEvents)` / `close()` - Creates, opens, and closes the reusable map planet history overlay.
- `render(locationName, results)` / `renderEvent(event)` - Renders grouped time/era event results with existing timeline keyword links.

### `GalacticTimelineAssets` (Timeline Image Registry - `js/timelines/galacticTimelineAssets.js`)
- Named exports such as `GALACTIC_OVERVIEW_BACKGROUND`, `GALACTIC_ERA_REPUBLIC`, and `GALACTIC_SUBERA_CLONE_WARS` expose one variable per Galactic History image asset.
- `ImageMapping` - Title-normalized era/sub-era image mapping used by `TimelineHub` because `timeline_tree.json` does not contain image URLs.
- `GALACTIC_TIMELINE_ASSETS` - Groups overview, focus, detail, timeline-panel, era poster, and sub-era card images for `TimelineHub` rendering. The sub-era registry includes twelve SVG placeholder variables so dynamically discovered sub-era sets from `timeline_tree.json` have image-backed cards even before final art is assigned.

### `MapViewer` (Interactive Map & Routing - `js/maps/MapViewer.js`)
- `MinPriorityQueue` — Lightweight binary heap class providing `enqueue`, `dequeue`, and `isEmpty` methods for the pathfinding engine.
- `init()` - Initializes the transform-based panning/zooming engine for a specific Supabase map record, resetting route state, clearing stale overlays, and setting up the SVG/HTML overlay containers.
- `onPointerDown(e)` / `onPointerMove(e)` / `onPointerUp(e)` — Input callbacks implementing unified mouse and touch dragging via standard Pointer Events.
- `scheduleDragTick()` — Gates layout rendering transformations inside a `requestAnimationFrame` paint tick during drag operations to optimize frame rate.
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
- `createAccessPointForNode(node)` / `findNearestAccessPoint(node, componentId)` — Build native or snapped route-entry metadata for linked and unlinked worlds. Hardened against unlinked graph topography exceptions and malformed coordinate drift.
- `runDijkstra(sourceId, targetId)` / `findBestHybridRoute(sourceNode, targetNode)` — Shared routing helpers for standard graph traversal and hybrid nearest-exit fallback selection. Hardened to prevent crashes if nodes are asynchronously deleted or unlinked from subnetwork topology tables.
- `clearRoute()` / `swapRoute()` — Route management helpers for clearing or reversing the current nav path.
- `handleSearch()` — Focuses the map on an exact world search hit from the navicomputer search field.
- `renderNodeCard()` / `renderSummary()` — Renders the focused-world card plus the route summary metrics panel.
- `renderRouteOverlay()` — Draws cyan straight-line off-lane segments and exit markers for hybrid routes.
- `applyNodeNaturalColors()` — Samples nearby pixels from the loaded map image when possible and assigns per-node CSS colors for the double-ring planet markers, falling back gracefully when canvas reads are blocked.
- `ensureRouteInfoOverlay()` / `renderRouteInfoOverlay()` / `dismissRouteInfoOverlay()` — Creates and manages the in-map route information card that appears after plotting a course.
- `positionRouteInfoOverlay()` / `getRouteScreenBounds()` / `getNodeScreenPoint()` — Chooses a low-obstruction viewport corner for the route information overlay based on the active route and planet node screen positions, with top spacing reserved for map controls.
- `layoutRouteLabels()` — Applies collision-aware directional offsets and connector-line geometry to selected and active route planet labels so important names avoid nearby labels and planet nodes.
- `toggleLayer(key)` / `applyDisplayState()` — Manages reader-facing label and hyperlane visibility controls.
- `crossMapSearch(name)` — Searches for a world name across all other maps of the same story.
- `updateCrossMapHint(name, hintId)` — Displays a non-intrusive navigation suggestion below the field if the searched planet exists in another chart.
- `hideCrossMapHint(hintId)` — Hides the cross-map hint for the specified field.
- `switchToMap(mapId)` — Switches active map in the viewer to the specified mapId using Router.navigate.

- `ensureLocationHistoryOverlay()` / `renderLocationHistoryOverlay(node)` / `renderLocationHistoryResults(node, results)` / `dismissLocationHistoryOverlay()` - Renders planet historical data inside the left World Intel dock panel instead of a floating overlay.
- `openSelectedNodeHistory()` - Opens the selected world's expanded full-screen location-history overlay by passing the planet name and current story timeline into `LocationHistoryIndex`.
- `getStringHash(str)` — Returns a deterministic numeric hash of a string.
- `getNodeSpecs(node)` — Generates deterministic specifications (Class, Affiliation, Governance, Population, Resources, Threat Level) for a world.
- `getPlanetOrbGradient(planetClass)` — Returns a CSS gradient matching the world's planetary classification.
- `getNodeDescription(node, specs)` — Generates a deterministic description of the world.
- `isInWatchlist(planetName)` / `toggleWatchlist(planetName)` — Handles watchlist state checking and synchronization to local storage.
- `renderWorldIntel(node)` — Overhauls the Left Dock panel layout with planetary orb, navigation tabs, and quick actions.
- `switchIntelTab(tabName, node)` / `renderIntelTabContent(tabName, node)` — Drives the tab switching and content generation for Overview, History, Routes, Political, and Nearby tabs.
- `initDocks(signal)` — Registers all dock triggers, close buttons, pin buttons, Escape key handlers, and click-dismiss listeners.
- `openDock(id)` / `closeDock(id)` / `forceCloseDock(id)` / `toggleDock(id)` — Controls the sliding and pinned visibility state of edge panels.
- `closeAllUnpinnedDocks()` — Iterates and collapses all open docks that are not explicitly pinned.
- `toggleBeacon()` — Toggles the Contribute beacon overlay card at the center bottom.
- `syncDockTrigger(id, isOpen)` — Keeps dock trigger classes and `aria-expanded` attributes synchronized with controller state.
- `startHudTimers()` — Starts the live Galactic Time clock; its interval is cleared during `destroy()`.
- `updateTickerText()` — Updates the footer bulletin from the active chart and currently selected world.
- `updateHudStatus()` — Mirrors active route endpoints, hop count, distance, route mode, and active-route count into the compact HUD status surfaces.
- `renderRouteAnalysis()` / `toggleAnalysisPanel(key)` — Populates and controls the Hyperlane Preview, Fuel Estimate, Political Borders, and Hazard Rating accordion panels.
- `togglePanelsMinimized()` — Collapses or restores all non-map overlays without removing the command bar.
- `toggleThemeMode()` / `toggleVolumeIndicator()` — Manage dependency-free visual HUD preferences and their accessible pressed states.
- `toggleTicker()` — Collapses the footer bulletin while retaining the clock and route shortcuts.

### `Particles` (Background Engine - `js/ui.js`)
- `init()` — Sets up the HTML5 Canvas, spawns particles, and registers `visibilitychange` listener for pause/resume.
- `animate()` — The `requestAnimationFrame` loop. Checks `_paused` flag before rendering. Stores rAF ID for cancellation.
- `resize()` — Handles window resize events to keep the canvas covering the screen.

### `Actions` (Gallery & General Operations - `js/ui.js`)
- `isMatureTag(tag)` — Normalizes gallery structural tags and detects whether a tag should be treated as mature content (`R18`, `NSFW`, `mature`, `suggestive`).
- `isMatureImage(image)` — Returns whether a gallery image carries any mature structural tags.
- `processGalleryImages(images)` — Applies the shared public-gallery mature-content rule set, hiding mature images while R18 is off and floating them to the front when R18 is on.
- `applyGalleryControls(images)` — Applies mature visibility, active tag, text search, and curated/newest/top-rated ordering to the current character artwork set.
- `bindGalleryControls()` — Binds the Visual Archive search, sort, and delegated tag controls after the character gallery route renders.
- `initArchiveCollectionDecks()` — Binds hover/focus selection for the integrated right-side character browser, updating the dominant profile hero, biography, counts, open action, and active-card glow without requesting gallery-preview imagery.
- `updateR18ToggleButtons()` — Refreshes every gallery-header R18 toggle instance so the button label and danger styling stay synchronized across gallery surfaces.
- `renderGalleryGrid(shuffle)` — Renders character gallery images under either standard grid or premium fanning Card Deck View modes, hiding mature-tagged artwork while R18 is off and prioritizing those images first when R18 is on.
- `renderLatestGalleryGrid()` — Rebuilds the public "Recently Added" gallery masonry using the shared mature-content visibility/order rules so the header toggle and load-more flow stay in sync.
- `toggleViewMode()` — Toggles the character gallery between column-based Grid View and stacked/fanning Card Deck View modes, saving the choice in local storage.
- `toggleR18()` — Toggles the shared gallery-header R18 mode on or off, updating the header control and re-rendering both recent-image and individual-character gallery views with the correct mature-content visibility and ordering.
- `setFilter(tag)` — Filters the current character gallery by tag name (e.g. Portrait, Sketch, Action).
- `shuffleGallery()` — Shuffles the order of images in the active character gallery dynamically.
- `voteImage(imageId, value)` — Handles casting and updating image upvotes/downvotes against Supabase with real-time score synchronization.

### `Visuals` Gallery Viewer (`js/ui.js`)
- `openGalleryLightbox(index, images)` / `updateLightboxView()` — Opens the accessible artwork viewer and synchronizes image, metadata, counter, tags, and voting state without reassigning an unchanged image URL.
- `toggleLightboxDiscussion()` — Lazily opens or closes the current image discussion instead of loading comments on every image transition.
- `handleLightboxKeydown(event)` — Provides Escape, arrow navigation, and focus trapping while the artwork dialog is active.

---
