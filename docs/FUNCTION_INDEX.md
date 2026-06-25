# Function Index

A comprehensive, categorized index of all meaningful functions across the `index.html`, `admin.html`, `writer.html`, and `cartographer.html` Single Page Applications.

---

## 1. `index.html` (Reader Frontend - Modularized)

The functions and components of the public reader SPA are now fully modularized and organized into dedicated ES6 files inside `/js/` and styles inside `styles.css` at the project root directory.

### `Router` (Navigation & Views - `js/router.js`)
- `handle()` - Also wraps `UI.hideLoading()` in both success and error completion paths so stage fade-in still completes if the saber widget throws during teardown.
- `handle()` - Also tears down the cold-start loader when the gallery advisory modal intercepts routing before any gallery render work begins.
- `withTimeout(promise, message)` - Caps route rendering work so stalled Supabase/network requests resolve into the router error panel instead of leaving the loader overlay visible indefinitely.
- `handle()` â€” Reads the current window hash and dispatches to the correct view renderer, now guarding route completions so stale or failed renders cannot leave the stage hidden or loader stuck.
- `navigate(path)` â€” Programmatically changes the URL hash and triggers a route update, short-circuiting same-route clicks into a safe re-render instead of waiting on a `hashchange` that will never fire.
- `getParts()` â€” Helper to break down the hash into view and ID parameters (e.g., `#story/123`).

### `Cache` (TTL + LRU Data Cache - `js/db.js`)
- `getHub(slug)` â€” Returns cached hub data if fresh (within 5-min TTL), or `null` if stale/missing. Updates LRU order on access.
- `setHub(slug, data)` â€” Stores hub data with a timestamp. Evicts the least-recently-used entry if at capacity (max 5).
- `_evictHub(slug)` â€” Removes a specific hub entry from both the ordered list and lookup map.
- `isStale(ttlTimestamp)` â€” Returns `true` if the given timestamp is older than the TTL threshold (5 minutes).

### `DB` (Supabase Data Access - `js/db.js`)
- `getStories()` â€” Fetches published stories (cached with TTL).
- `getAuthorProfile()` â€” Fetches admin profile + author links (cached with TTL).
- `getStoryHubData(slug)` â€” Fetches story + wallpapers + characters + lore + timeline + maps in parallel (LRU-cached). Timeline character links are batched via `.in()`.
- `getChapters(storyId)` â€” Fetches all published chapters for a specific story.
- `getCharacterGallery(characterId)` â€” Fetches only published gallery images for a character.
- `getLatestGalleryImages(storyId, limit, offset)` â€” Fetches only published recently added gallery images across all characters in a story with pagination/offset support.
- `getGalleryCollectionPreviews(storyId)` â€” Fetches published story-wide artwork plus joined character metadata for the main gallery's layered collection previews.
- `getLoreEntry(storyId, loreSlug)` â€” Fetches a single lore entry by slug.
- `getMapCounts(mapIds)` â€” Fetches node and edge counts for specified maps to display in the hub.
- `getAllMapNodeNames(storyId)` â€” Fetches all mapped planet names across all maps in a given story.

### `UserAuth` (Authentication - `js/auth.js`)
- `getAuthRedirectUrl()` â€” Internal helper that derives the reader root URL from the current page, removing query/hash state and filenames so confirmation emails return to the correct GitHub Pages subdirectory or local development root.
- `prepareAvatarUpload(file)` â€” Internal fail-safe optimizer that bounds ordinary PNG/JPG/JPEG avatars to 1024px and emits WebP when beneficial, while preserving GIF/other formats and falling back to the original on decode/canvas failure.
- `init()` â€” Checks for an existing session and sets up the `onAuthStateChange` listener.
- `fetchProfile(user)` â€” Asynchronously fetches the user's profile row from the DB. Implements exponential backoff (up to 5 retries starting at 300ms) to bypass database replication or trigger delays upon new user registration.
- `logout()` â€” Signs the current user out of Supabase and reloads the page.
- `showAuthModal(type)` â€” Opens the generic modal configured for either 'login' or 'register'.

### `CommentsManager` (User Interaction - `js/comments.js`)
- `init()` â€” Initializes the comments drawer UI bindings.
- `loadComments(targetId, targetType)` â€” Fetches comments linked to a specific entity (like a chapter or story).
- `renderComments(comments)` â€” Generates the HTML for the comments list.
- `postComment(content)` â€” Inserts a new comment into the database using the active session.
- `deleteComment(id)` â€” Deletes a comment (restricted to the comment owner or admin).
- `toggleUpvote(commentId)` â€” Toggles the like status on a comment for the active user.
- `toggleCommentDrawer()` â€” Opens or closes the sliding comments side panel.

### `UI` (Interface Helpers - `js/ui.js`)
- `setBg(url)` â€” Applies a reader background only when its URL changed, avoiding redundant CSS image reload/revalidation work.
- `showLoading() / hideLoading()` â€” Proxies to `LoaderManager` to control the global full-screen transition overlay.
- `openSaberModal() / closeSaberModal()` â€” Controls the lightsaber preferences modal.
- `toast(message, type, duration)` â€” Displays a temporary notification popup (success, error, info).
- `applyCustomColors(settings)` - Injects CSS variables into the `:root` to theme the site dynamically.
- `renderStoryCard(story)` - Returns the HTML block for a story display card.
- `renderChapterList(chapters)` - Returns the HTML list of chapters for the story view.
- `showGalleryWarning(storySlug)` â€” Displays a beautiful glassmorphic modal advising the user of aggregated/AI/mature content in the gallery, offering them a clear Yes (Proceed) or No (Go Back) option.
- `closeGalleryWarning()` â€” Closes the gallery content advisory modal with a smooth fade animation.

- `initAuthLink(userProfile)` Ã¢â‚¬â€ Renders the far-right header auth slot as either a sign-in button or the current reader avatar/profile trigger.

### `LoaderManager` (Modular Transition Orchestrator - `js/ui.js`)
- `determineRequiredLoader()` â€” Resolves the appropriate overlay module key (e.g., `'primary'` monogram loader or standard `'lightsaber'`) based on cold start states or specific story metadata values.
- `show()` â€” Asynchronously imports, mounts, and initiates the resolved visual loading system, ensuring a fallback defaults to the lightsaber if an error occurs.
- `hide()` â€” Invokes the target loading system's cleanup or exit hooks.
- `playOutro()` â€” Triggers custom exit animation routines on the active module when loading completes.

- `withTimeout(promise, message)` - Caps dynamic loader imports so startup can continue if a loader module fetch stalls.
- `clearPrimaryLoader()` - Directly fades/removes the primary loader DOM as a fallback when no active loader object is available.

### `SaberController` (Lightsaber Loading Widget - `js/ui.js`)
- `animateProgressTo(target, duration, onComplete)` - Defensively parses widget progress and guards `getProgress` / `setProgress` calls so malformed saber state cannot crash the animation loop before `onComplete()` runs.
- `hideLoading()` - Also wraps widget `hide()` and reset progress calls so loader teardown still finishes even if the saber widget misbehaves.
- `init()` â€” Dynamically imports and initializes the lightsaber widget logic, applying either the default or saved loader mode, hiding the separate progress bar overlay, and seeding its illumination backdrop from the current reader background image.
- `saveAndApply()` â€” Captures reader customizations from the modal, including loader mode, applies them to the widget, caches to `localStorage`, and triggers a demo ignition.
-`showLoading()` â€” Activates the overlay, syncs the current background image and responsive blade length into the widget, and runs a smooth `requestAnimationFrame`-driven sweep toward the near-complete state while the saber widget brightens the full viewport and concentrates extra glow at the emitter, blade body, and tip.

- `hideLoading()` â€” Smoothly finishes the last stretch to `100%`, briefly holds the completed frame, then fades out the overlay before resetting progress off-screen for the next transition.

### `AnomalyLoader` (Modular SCP Anomaly Loader - `js/ui.js`)
- `inject()` â€” Dynamically inserts scoped CRT scanline overrides, Courier Prime fonts, terminal status logs, and decryption progress indicators directly to `document.body` on demand.
- `show(pattern)` â€” Configures and launches a responsive canvas-based procedural walker engine (supporting `'flesh'`, `'hex'`, `'cyber'`, `'kinetic'`, or `'crystal'` patterns) and increments a simulated terminal breach progress bar.
- `hide()` â€” Fades out and pauses the active requestAnimationFrame particle rendering loops.
- `playOutro()` â€” Runs a visual fade out routine and purges elements from the DOM after the route renders.

### `MapHub` (Registry Discovery Screen - `js/maps/MapHub.js`)
- `render(maps, slug, themeColor, counts)` â€” Prepares and renders the full grid-based map registry screen, segmented by galactic, regional, and local categories.
- `renderSection(typeKey, maps, slug, counts)` â€” Renders an individual category registry row with count badges.
- `renderCard(map, slug, counts)` â€” Renders a sleek card for each map displaying visual thumbnails and charted stats.
- `init()` â€” Binds input events to the registry search bar.
- `onSearch(e)` â€” Filters displayed maps and hides empty sections in real-time as users type.

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
- `MinPriorityQueue` â€” Lightweight binary heap class providing `enqueue`, `dequeue`, and `isEmpty` methods for the pathfinding engine.
- `init()` - Initializes the transform-based panning/zooming engine for a specific Supabase map record, resetting route state, clearing stale overlays, and setting up the SVG/HTML overlay containers.
- `onPointerDown(e)` / `onPointerMove(e)` / `onPointerUp(e)` â€” Input callbacks implementing unified mouse and touch dragging via standard Pointer Events.
- `scheduleDragTick()` â€” Gates layout rendering transformations inside a `requestAnimationFrame` paint tick during drag operations to optimize frame rate.
- `loadMapData()` - Fetches `map_nodes` and `map_edges` for the active `map_id` from Supabase, remaps edge foreign keys into the reader routing shape, and triggers graph construction and rendering.
- `renderMapData()` â€” Generates SVG paths for hyperlanes, route-overlay groups, and DOM elements for planet nodes, performing Y-axis inversion.
- `buildGraph()` â€” Converts the node and edge data into an adjacency list for pathfinding and seeds cached lane lengths.
- `calculateRoute()` â€” Executes normal Dijkstra routing for linked worlds, or falls back to hybrid nearest-exit routing when one or both selected worlds are isolated.
- `drawRoute(pathNodes, pathEdges, options)` â€” Highlights the active path, renders off-lane overlay segments, and refreshes the route summary, floating route card, camera focus, and HUD state for standard and hybrid routes.
- `bindUI()` - Wires the route inputs, search actions, map selector buttons, and layer toggles to the map controller. Selector clicks fully reinitialize the navicomputer for the chosen map record.
- `zoomToNode(nodeName)` â€” Locates a node by name and triggers zoomToRoute to focus the camera on it.
- `setMapSource(src, mapName)` - Swaps the visible map image, updates the active selector chip, and refreshes the reader-facing status for the current map.
- `getClosestPointOnSegment(point, start, end)` â€” Geometric helper to find the nearest point on a line segment to a given coordinate.
- `getCandidateComponentsForHybridRoute(sourceNode, targetNode)` â€” Determines which connected components to consider for routing between potentially isolated worlds.
- `renderRouteOverlay()` â€” Generates the SVG overlay for off-lane corridors, mid-edge junctions, and navigation markers.
- `formatDistance(value)` â€” Formats internal coordinate units into reader-facing distance strings.
- `setStatus(message, type)` â€” Updates the navicomputer status bar with context-aware coloring (info, success, warning, error).
- `refreshNodeStates()` â€” Updates visual classes (selected, active) on all node elements.
- `syncInputs()` â€” Harmonizes the navicomputer search fields with the current internal route state.

### `MapViewer` Additions
- `bindUI()` â€” Wires the route inputs, search actions, map selector buttons, and layer toggles to the map controller.
- `buildComponents()` â€” Walks the graph after load to assign connected-component IDs for routeable hyperlane clusters.
- `setMapSource(src, mapName)` â€” Swaps the visible map image while preserving navicomputer state and updating the active selector chip.
- `selectNode(nodeId)` / `assignSelectedNode(type)` â€” Drives the focused-world workflow so readers can inspect a node and promote it to origin or destination.
- `setRouteEndpoint(type, value)` â€” Resolves a selected node or exact input value into a persistent route endpoint.
- `createAccessPointForNode(node)` / `findNearestAccessPoint(node, componentId)` â€” Build native or snapped route-entry metadata for linked and unlinked worlds. Hardened against unlinked graph topography exceptions and malformed coordinate drift.
- `runDijkstra(sourceId, targetId)` / `findBestHybridRoute(sourceNode, targetNode)` â€” Shared routing helpers for standard graph traversal and hybrid nearest-exit fallback selection. Hardened to prevent crashes if nodes are asynchronously deleted or unlinked from subnetwork topology tables.
- `clearRoute()` / `swapRoute()` â€” Route management helpers for clearing or reversing the current nav path.
- `handleSearch()` â€” Focuses the map on an exact world search hit from the navicomputer search field.
- `renderNodeCard()` / `renderSummary()` â€” Renders the focused-world card plus the route summary metrics panel.
- `renderRouteOverlay()` â€” Draws cyan straight-line off-lane segments and exit markers for hybrid routes.
- `applyNodeNaturalColors()` â€” Samples nearby pixels from the loaded map image when possible and assigns per-node CSS colors for the double-ring planet markers, falling back gracefully when canvas reads are blocked.
- `ensureRouteInfoOverlay()` / `renderRouteInfoOverlay()` / `dismissRouteInfoOverlay()` â€” Creates and manages the numbered, animated in-stage route information card that appears after plotting a course.
- `positionRouteInfoOverlay()` / `getRouteScreenBounds()` / `getNodeScreenPoint()` â€” Scores route geometry and the live rectangles of open docks, footer, status card, and controls; desktop left candidates shift beside an open World Inspector.
- `layoutRouteLabels()` â€” Applies collision-aware directional offsets and connector-line geometry to selected and active route planet labels so important names avoid nearby labels and planet nodes.
- `toggleLayer(key)` / `applyDisplayState()` â€” Manages reader-facing label and hyperlane visibility controls.
- `crossMapSearch(name)` â€” Searches for a world name across all other maps of the same story.
- `updateCrossMapHint(name, hintId)` â€” Displays a non-intrusive navigation suggestion below the field if the searched planet exists in another chart.
- `hideCrossMapHint(hintId)` â€” Hides the cross-map hint for the specified field.
- `switchToMap(mapId)` â€” Switches active map in the viewer to the specified mapId using Router.navigate.

- `ensureLocationHistoryOverlay()` / `renderLocationHistoryOverlay(node)` / `renderLocationHistoryResults(node, results)` / `dismissLocationHistoryOverlay()` - Renders planet historical data inside the left World Intel dock panel instead of a floating overlay.
- `openSelectedNodeHistory()` - Opens the selected world's expanded full-screen location-history overlay by passing the planet name and current story timeline into `LocationHistoryIndex`.
- `getStringHash(str)` â€” Returns a deterministic numeric hash of a string.
- `getNodeSpecs(node)` â€” Generates deterministic specifications (Class, Affiliation, Governance, Population, Resources, Threat Level) for a world.
- `getPlanetOrbGradient(planetClass)` â€” Returns a CSS gradient matching the world's planetary classification.
- `getNodeDescription(node, specs)` â€” Generates a deterministic description of the world.
- `isInWatchlist(planetName)` / `toggleWatchlist(planetName)` â€” Handles watchlist state checking and synchronization to local storage.
- `renderWorldIntel(node)` â€” Renders the Left Dock panel with planetary orb, class-colored accent band, navigation tabs, endpoint actions, and an inline Plot Course origin picker that does not open the Navicomputer.
- `switchIntelTab(tabName, node)` / `renderIntelTabContent(tabName, node)` â€” Drives the tab switching and content generation for Overview, History, Routes, Political, and Nearby tabs.
- `initDocks(signal)` â€” Registers all dock triggers, close buttons, pin buttons, Escape key handlers, and click-dismiss listeners.
- `openDock(id)` / `closeDock(id)` / `forceCloseDock(id)` / `toggleDock(id)` â€” Controls the sliding and pinned visibility state of edge panels.
- `closeAllUnpinnedDocks()` â€” Iterates and collapses all open docks that are not explicitly pinned.
- `toggleBeacon()` â€” Toggles the Contribute beacon overlay card at the center bottom.
- `syncDockTrigger(id, isOpen)` â€” Keeps dock trigger classes and `aria-expanded` attributes synchronized with controller state.
- `startHudTimers()` â€” Starts the live Galactic Time clock; its interval is cleared during `destroy()`.
- `updateTickerText()` â€” Updates the footer bulletin from the active chart and currently selected world.
- `updateHudStatus()` â€” Mirrors active route endpoints, hop count, distance, and route mode into the compact HUD status card and synchronizes its active-route radar state.
- `renderRouteAnalysis()` / `toggleAnalysisPanel(key)` â€” Populates and controls the Hyperlane Preview, Fuel Estimate, Political Borders, and Hazard Rating accordion panels.
- `togglePanelsMinimized()` â€” Collapses or restores all non-map overlays without removing the command bar.
- `toggleThemeMode()` / `toggleVolumeIndicator()` â€” Manage dependency-free visual HUD preferences and their accessible pressed states.
- `toggleTicker()` â€” Collapses the footer bulletin while retaining the clock and route shortcuts.

### `Particles` (Background Engine - `js/ui.js`)
- `init()` â€” Sets up the HTML5 Canvas, spawns particles, and registers `visibilitychange` listener for pause/resume.
- `animate()` â€” The `requestAnimationFrame` loop. Checks `_paused` flag before rendering. Stores rAF ID for cancellation.
- `resize()` â€” Handles window resize events to keep the canvas covering the screen.

### `Actions` (Gallery & General Operations - `js/ui.js`)
- `isMatureTag(tag)` â€” Normalizes gallery structural tags and detects whether a tag should be treated as mature content (`R18`, `NSFW`, `mature`, `suggestive`).
- `isMatureImage(image)` â€” Returns whether a gallery image carries any mature structural tags.
- `processGalleryImages(images)` â€” Applies the shared public-gallery mature-content rule set, hiding mature images while R18 is off and floating them to the front when R18 is on.
- `applyGalleryControls(images)` â€” Applies mature visibility, active tag, text search, and curated/newest/top-rated ordering to the current character artwork set.
- `bindGalleryControls()` â€” Binds the Visual Archive search, sort, and delegated tag controls after the character gallery route renders.
- `initArchiveCollectionDecks()` â€” Binds hover/focus selection for the integrated right-side character browser, updating the dominant profile hero, biography, counts, open action, and active-card glow without requesting gallery-preview imagery.
- `updateR18ToggleButtons()` â€” Refreshes every gallery-header R18 toggle instance so the button label and danger styling stay synchronized across gallery surfaces.
- `renderGalleryGrid(shuffle)` â€” Renders character gallery images under either standard grid or premium fanning Card Deck View modes, hiding mature-tagged artwork while R18 is off and prioritizing those images first when R18 is on.
- `renderLatestGalleryGrid()` â€” Rebuilds the public "Recently Added" gallery masonry using the shared mature-content visibility/order rules so the header toggle and load-more flow stay in sync.
- `toggleViewMode()` â€” Toggles the character gallery between column-based Grid View and stacked/fanning Card Deck View modes, saving the choice in local storage.
- `toggleR18()` â€” Toggles the shared gallery-header R18 mode on or off, updating the header control and re-rendering both recent-image and individual-character gallery views with the correct mature-content visibility and ordering. Gated behind authentication; triggers login modal if user is guest.
- `setFilter(tag)` â€” Filters the current character gallery by tag name (e.g. Portrait, Sketch, Action).
- `shuffleGallery()` â€” Shuffles the order of images in the active character gallery dynamically.
- `voteImage(imageId, value)` â€” Handles casting and updating image upvotes/downvotes against Supabase with real-time score synchronization.

### `Visuals` Gallery Viewer (`js/ui.js`)
- `initDynamicTransparency()` â€” Applies pointer-aware blur and brightness changes to the global reader background on desktop without hiding the application or treating the lower-right corner as a fullscreen-background hotspot.
- `openGalleryLightbox(index, images)` / `updateLightboxView()` â€” Opens the accessible artwork viewer and synchronizes image, metadata, counter, tags, and voting state without reassigning an unchanged image URL.
- `toggleLightboxDiscussion()` â€” Lazily opens or closes the current image discussion instead of loading comments on every image transition.
- `handleLightboxKeydown(event)` â€” Provides Escape, arrow navigation, and focus trapping while the artwork dialog is active.

---

---

## Subscription Reader SPA Functions (`subscription.html`, `js/subscription/`)

### `SubRouter` (`js/subscription/router.js`)
- `handle()` - Parses the current hash route, stores `return` targets for unlock flows, updates active navigation, dispatches render methods, and renders a recoverable error state on failures.
- `navigate(path)` - Moves the subscription SPA to a hash route.

### `SubRender` (`js/subscription/render.js`)
- `home()` - Renders the member-library landing view with access status and story shelf.
- `library()` - Renders the published story library.
- `story(slug)` - Renders a lightweight story hub with cover art, facts, main archive link, and starter chapter cards.
- `chapters(slug)` - Renders the mobile-friendly chapter shelf with free/locked/member badges.
- `chapter(slug, chapterId)` - Loads a secure reader chapter through RPC/fallback and renders either the chapter or locked access gate.
- `preview(slug, chapterId)` - Renders intentionally public preview text for locked chapters.
- `accessGate(story, chapter)` - Renders the locked-chapter explanation and primary unlock actions.
- `access(subRoute)` - Renders access overview, Patreon connection placeholder flow, key redemption, and success state.
- `account(subRoute)` - Renders profile and entitlement status for the signed-in reader.
- `updates()` - Renders a lightweight recent chapter catalog feed.
- `readerSheet()` - Renders mobile bottom-sheet controls for theme and font scaling.
- `error(err)` - Renders a recoverable route error panel.

### `SubDB` (`js/subscription/db.js`)
- `getStories()` - Reads published stories for the subscription library.
- `getStoryBySlug(slug)` - Reads one published story by slug, using cached story data when available.
- `getChapterCatalog(storyId)` - Calls `get_chapter_catalog` RPC when available; falls back to published chapter metadata before the migration is applied.
- `getReaderChapter(chapterId)` - Calls `get_reader_chapter` RPC when available; falls back to current published chapter reads before the migration is applied.
- `getMyEntitlements()` - Calls `get_my_entitlements` RPC when available; falls back to direct `user_entitlements` reads if the table exists.
- `redeemAccessKey(code)` - Calls `redeem_access_key` RPC and reports a deployment-needed error when the migration is absent.
- `requestPatreonSync()` - Invokes the `patreon-oauth-start` Edge Function and redirects when it returns a provider URL.

### `SubAuth` (`js/subscription/auth.js`)
- `init()` - Restores the Supabase session, loads profile/entitlements, updates account chrome, and subscribes to auth state changes.
- `fetchProfile(user)` - Loads the signed-in reader profile with a safe fallback display profile.
- `syncAccountChip()` - Renders the header account chip as sign-in or active reader state.
- `setMode(mode)` / `toggleMode()` - Switches the auth dialog between sign-in and sign-up.
- `handleSubmit()` - Signs in or signs up with a redirect back to `subscription.html`.
- `signOut()` - Ends the Supabase session.

### `SubUI` (`js/subscription/ui.js`)
- `init()` - Binds delegated navigation, auth dialog triggers, and auth form controls.
- `setActiveNav(view)` - Highlights desktop rail and mobile bottom navigation states.
- `setBack(route, label)` - Configures the sticky mini-header back action.
- `setAccent(story)` - Applies story accent color and optional background art.
- `openAuthDialog()` / `closeAuthDialog()` - Controls the subscription auth dialog.
- `toast(message, type)` - Shows lightweight subscription toasts.
- `setInlineStatus(id, message, type)` - Writes inline form/status messages.
- `openReaderSheet()` / `closeReaderSheet()` - Controls the mobile reader controls sheet.
- `setReaderTheme(theme)` / `setReaderScale(scale)` - Stores and applies reading comfort preferences.

### `SubState` and helpers (`js/subscription/state.js`)
- `SubState` - Holds session/profile, entitlements, current story/catalog, pending unlock return route, auth mode, and reader preferences.
- `normalizeChapter(chapter)` - Converts RPC/fallback chapter rows into a shared `{ access_state, can_read, is_locked, required_tier_name }` shape.
- `routeTo(path)` - Shared hash navigation helper.

#### Subscription Edge Functions
- `supabase/functions/patreon-oauth-start/index.ts` - Returns a Patreon OAuth authorization URL when provider environment variables are configured.
- `supabase/functions/patreon-oauth-callback/index.ts` - Receives the Patreon callback and returns readers to `#/access/pending` after token exchange and entitlement mapping.
- `supabase/functions/provider-webhook/index.ts` - Accepts secret-protected normalized provider webhook payloads for Patreon/Ko-fi/PayPal/Discord automation and writes mapped entitlements through the service role.
- `supabase/functions/sync-provider-entitlements/index.ts` - Verifies the signed-in reader, refreshes stored Patreon OAuth tokens when needed, fetches current Patreon memberships, maps provider tiers, and refreshes normalized entitlements.

### Aether Pages bridge (`js/subscription/aether-app.js`)
- `init()` - Boots the imported Aether Pages UI bridge, creates shared scrim/toast containers, binds delegated controls, registers hash routing, and renders the current route.
- `render()` - Resolves the active hash route and injects the corresponding Aether Pages view into `#main`.
- `chapterResolved(ch)` - Temporary local access-state resolver. It is UI-only and must be replaced by Supabase entitlement/RPC truth before launch.
- `topbar(active)` / `bottomnav(active)` - Render the active Aether Pages chrome used by `subscription.html`.
- `openSheet(content)` / `closeSheet()` - Control the bridge bottom-sheet/dialog surface for reader settings, access, Patreon placeholder, and support flows.
- `toast(title, body, opts)` - Renders lightweight Aether Pages status toasts.

`aether-app.js` is an interim Phase 1 bridge copied from `aether-pages/`; future work should split it into production modules rather than adding more backend logic to the monolith.

Additional Aether Pages bridge functions:
- `getSupabase()` - Lazily creates the bridge Supabase client from the CDN global.
- `initAuth()` - Consumes OAuth callback codes or implicit hash tokens when present, restores the current Supabase Auth session, refreshes profile/entitlements, and subscribes to auth state changes.
- `refreshEntitlements()` - Reads normalized reader entitlements through `get_my_entitlements`, with a direct table fallback for transitional deployments.
- `signInWithPassword(email, password)` / `signUpWithPassword(email, password)` / `signOutReader()` - Email account actions used by the bridge account sheet.
- `oauthCallbackParams()` / `cleanOAuthCallbackUrl()` / `consumeOAuthCallback(client)` - Parse Supabase OAuth callback query/hash parameters, including `?code=...`, `#access_token=...`, and nested `#/vault#access_token=...` returns; exchange codes or set token sessions; and clean transient OAuth parameters from the URL while preserving the SPA route.
- `subscriptionRedirectTo()` - Builds a query-based `subscription.html?sub_auth=google&sub_route=vault` OAuth redirect and rejects `file://` usage because Supabase OAuth requires http/https origins.
- `signInWithGoogle(nextAction = "")` - Starts Supabase Google OAuth with a query-based subscription redirect, shows a redirect toast, stores optional pending actions plus a subscription-return marker, and manually redirects to `data.url` as a fallback. When `nextAction` is `connect-patreon`, the bridge resumes by starting Patreon OAuth after the Google session is restored.
- `requestPatreonOAuth()` - Starts the Patreon OAuth Edge Function and redirects only when the backend returns an authorization URL. Guest Patreon activation now routes through Google OAuth first, then resumes Patreon via `store.pendingAuthAction`.
- `syncProviderEntitlements()` - Calls `sync-provider-entitlements` for Patreon, refreshes `get_my_entitlements`, reloads backend catalog metadata, and clears local provider-pending state.
- `redeemKey(code)` - Redeems keys through the Supabase `redeem_access_key` RPC instead of faking access locally.

Backend data bridge functions:
- `loadBackendLibrary()` - Loads published Supabase stories and catalog RPC metadata into the active Aether Pages UI, with fixture fallback when backend catalog data is unavailable.
- `normalizeBackendStory(row)` - Converts a Supabase story row into the Aether Pages story object shape.
- `normalizeBackendChapter(row, story)` - Converts `get_chapter_catalog` rows into the Aether chapter object shape and access labels.
- `backendStateToAether(row)` - Maps normalized SQL access states to Aether UI states.
- `loadReaderChapterIntoFixture(chapterId)` - Loads full chapter text through `get_reader_chapter` only after a readable backend chapter route is opened.
- `textToBlocks(value)` - Converts backend chapter HTML/text into reader paragraph blocks.

Backend fallback additions:
- `loadBackendLibrary()` now has a direct published chapter metadata fallback when `get_chapter_catalog` is missing from the schema cache.
- `loadReaderChapterIntoFixture()` is now RPC-only for full chapter bodies through `get_reader_chapter`; there is no direct `chapters.content` fallback for locked-content safety.

Admin-aware bridge functions:
- `refreshProfile()` - Loads the active reader profile and role after session restore/sign-in.
- `isAdmin()` - Checks whether the signed-in profile has the admin role.
- `adminGate()` - Renders a non-admin gate for protected `#/studio` bridge routes.

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
- **Media**: `getMaps()`, `saveMap()`, `getWallpapers()`, `saveWallpaper()`, `getGallery()`, `getStoryGalleryImages()`, `saveGalleryImage()`.
- **Map Requests**: `getMapRequests()`, `getRequestItems(reqId)`, `updateRequestStatus(reqId, status, feedback)`, `deleteMapRequest(reqId)`, `approveMapRequest(reqId)` (Applies changes to live tables and logs activity to `map_changelog`).
- **Settings**: `getSettings()`, `saveSettings(data)`.

### `Utils` (Shared Utilities)
- `getImageUploadPayload(file, options)` — Converts eligible PNG/JPG/JPEG uploads to bounded WebP when useful, preserving unsupported/animated formats and returning the original on failure.
- `uploadImage(file, bucket, folderPath, options)` — Uploads a uniquely named image with one-year cache metadata by default; map callers opt out of conversion and any intentional upsert receives short-cache behavior.
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
  - `setGalleryImagePublished(id, isPublished)`
  - `viewMapRequest(reqId)` / `approveMapRequest(reqId)` / `rejectMapRequest(reqId)` / `deleteMapRequest(reqId)`
  - `settingsForm(settingsObj)`
  - `deleteConfirmForm(entityType, entityId, fallbackAction)`

### `Views` (Admin Rendering)
- `render(viewName)` — The primary internal router mapping sidebar clicks to view functions.
- View rendering functions that fetch data, populate caches, and build tables/grids:
  - `dashboard()`, `stories()`, `chapters()`, `characters()`, `lore()`, `timeline()`, `maps()`, `mapRequests()`, `gallery()`, `wallpapers()`, `settings()`.
  - `gallery()` now renders a story-wide media workspace with search/filter controls, a single broad-view gallery board, and a side toggle between published and unpublished image collections.

### `UI` (Interactive Dashboard Components)
- `imageUploadField(id, label, currentValue, bucketName, multiple)` — Renders a modern drag-and-drop dropzone dashboard UI element with a file picker input, text URL input, and dynamic client-side image preview area.
- `handleFileSelection(input, listId, urlInputId)` — Fired on standard browser file changes. Cleans out stale assets and uses revocable object URLs for local image previews.
- `handleUrlInput(input, listId)` — Handles pasting a direct image URL, showing an instant live rendering or placeholder fallback.
- `clearPreviews(listId, urlInputId)` — Revokes temporary preview object URLs, purges previews, and clears bound text/file values.
- `initDragAndDrop(id)` — Binds `dragenter`, `dragover`, `dragleave`, and `drop` event listeners to a target upload area, enabling high-performance visual state transitions and multi-file processing.
- `initTagComponent(elementId, initialTags)` — Replaces static tag strings with a dynamic, HSL-colored interactive tag-chip wrapper. Handles Backspace, Enter, and Comma key triggers alongside individual chip deletion buttons, automatically syncing the parsed array back to hidden elements.
- `initTagAutocomplete(containerId, initialTags)` — Advanced interactive tag input with live database autocompletion. Immediately renders existing chips, then asynchronously hydrates suggestion options from the database so save flows are not blocked by the autocomplete fetch.
- `getTagValues(containerId)` — Reads the current gallery tag selection from the autocomplete widget, using the hidden input when present and a container dataset fallback when the widget is still hydrating.

---

### Subscription Access Admin Functions

#### `DB` additions
- `getAccessTiers()` / `saveAccessTier()` / `deleteAccessTier()` - Manage internal subscription tiers in `reader_access_tiers`.
- `getAccessKeys()` / `saveAccessKey()` / `updateAccessKey()` - Manage hashed access keys in `access_keys`.
- `getEntitlements()` / `saveEntitlement()` / `updateEntitlement()` - Manage normalized reader grants in `user_entitlements`.
- `findProfileForAccess(query)` - Finds an existing profile by UUID, username, or display name before manual grant creation.
- `getProviderMappings()` / `saveProviderMapping()` - Manage external provider tier/product/role mappings in `provider_tier_mappings`.

#### `Forms` additions
- `accessTierForm()` / `saveAccessTier()` / `deleteAccessTier()` - CRUD modal for internal access tiers.
- `accessKeyForm()` / `saveAccessKey()` / `revokeAccessKey()` - Generates one-time plaintext access keys, hashes them client-side with SHA-256, stores only the hash/prefix, and revokes keys by status update.
- `manualGrantForm()` / `saveManualGrant()` / `revokeEntitlement()` - Grants or revokes a reader entitlement for an existing profile.
- `providerMappingForm()` / `saveProviderMapping()` - Configures provider tier mappings without hardcoding Patreon/Ko-fi/PayPal/Discord IDs in the reader SPA.
- `chapterForm()` / `saveChapter()` now include `required_tier_id`, `public_release_at`, and `preview_text` fields for subscription-reader chapter gates.

#### `Views` additions
- `access(container)` - Renders the Access Control workspace with tier counts, active key counts, active grant counts, provider mappings, and management tables.

---

## 3. `writer.html` (Writer's IDE)

### Core IDE & State Management
- `init()` — Bootstraps Quill, Supabase, listeners, and triggers initial data loads.
- `initQuill()` — Initializes the Quill.js rich text editor on the canvas.
- `bindEvents()` — Binds hotkeys (Ctrl+S, F11, etc.), modal overlays, and button clicks.

### `DB` (Supabase Data Access)
- `getStories()` — Populates the header dropdown to switch workspace contexts.
- `getNodes()` — Retrieves lightweight draft node metadata from the `writer_nodes` tree table without full document bodies.
- `getPublishedNodes()` — Synthesizes a lightweight virtual tree array from live `chapters`, `characters`, `lore`, and `timeline` tables.
- `createPublishedChapter()` — Inserts a new draft row into the live `chapters` table from the Published Tree, assigning the next available `chapter_order` for the active story.
- `getSearchContent()` — Lazily fetches full body fields for the active story/tree mode when global search needs content matching.
- `getNode(nodeId)` — Fetches the full content/body of a specific node asynchronously.
- `saveNode(nodeId, payload)` — Updates or inserts a node. Handles polymorphic saving (identifies if it's a draft node or a live table record).
- `deleteNode(nodeId)` — Purges a node from the DB.
- `getLinks() / addLink() / removeLink()` — Manages bidirectional hyperlinks between internal workspace nodes.

### Tree Rendering & Binder (Left Sidebar)
- `loadNodes()` — Fetches data via `DB` and triggers tree recreation.
- `buildNodeMap()` — Converts the flat array of node records into quick-access `state.nodeMap` and `state.childrenByParent` indexes.
- `getNodeChildren(parentId)` — Reads pre-sorted child arrays from `state.childrenByParent` while traversing the hierarchical tree structure.
- `renderTree(filterText)` — Recursively generates the HTML `<ul>`/`<li>` structure for the binder.
- `updateTreeActiveSelection()` — Moves the active binder highlight in place after document switches without rebuilding the entire tree.
- `renderTreeNode(node)` — Creates an individual tree item, attaching expanding, dragging, and context menu behaviors.
- `toggleFolder(nodeId)` — Expands/collapses sub-trees in the UI.

### Editor Logic (Center Canvas)
- `openNode(nodeId)` — The primary function for clicking a document: handles saving the old node, loading the new one, checking edit permissions, refreshing the inspector, and ignoring stale async loads after rapid navigation.
- `scheduleSave() / saveCurrentNode()` — Debounced auto-save mechanics that serialize Supabase writes and use editor revision checks so in-flight saves cannot mark newer edits as saved.
- `closeActiveDocument(options)` / `unloadEditorContent()` — Saves when needed, clears the active document, releases Quill's current content, hides editor UI, and yields frames before another large document opens.
- `loadNodeContentIntoEditor(node)` — Determines if the content is a Quill Delta JSON or raw HTML, and configures the editor gracefully.
- `isPlainTextDelta(delta)` / `waitForNextFrame()` — Helpers for faster plain-text Delta loading and yielding a browser paint frame before large document injection.
- `isLikelyMarkdown(text)` / `markdownToHTML(markdown)` / `markdownInlineToHTML(value)` / `renderCurrentMarkdown()` — Native markdown detection and manual rendering helpers for markdown-like current editor text, preserving line-based paragraph breaks and blank markdown lines as empty Quill paragraphs.
- `renderNodeContentInSplitView(node)` — Renders a read-only secondary view for cross-referencing without creating throwaway Quill instances.
- `clearActiveSelection()` — Resets the editor canvas to the empty/placeholder state.

### Inspector & Properties (Right Sidebar)
- `loadInspector(node)` — Populates the right panel fields (type, status, target, synopsis, image, notes) based on the active node's context.
- `saveInspectorField(field, value)` — Immediate auto-save handler for inspector input changes.
- `getInspectorConfig(node)` — Determines which inspector fields are enabled/disabled depending on whether the node is a draft or a published entity.
- `renderSnapshots(node) / takeSnapshot(name) / restoreSnapshot(snap)` — Handles the localized version control system array stored in node metadata.

### Metrics & Utilities
- `countWords(text)` — Simple whitespace-delimited word counter.
- `scheduleEditorMetricsUpdate()` / `applyEditorStats()` / `applyNodeStats()` / `updateCounts()` — Batches Quill text-change metrics, caches counts for long documents, and shows metadata counts immediately while full metrics calculate later.
- `startSessionTimer() / updateSessionStats()` — Calculates Words-Per-Minute and overall session duration.
- `setTheme(themeName)` — Injects the selected UI theme class onto the root body.
- `toggleFocusMode() / toggleTypewriterMode()` — Adjusts CSS bounds to hide sidebars or auto-scroll the editor to the center.
- `hydrateSearchContent()` / `performSearchAll(query)` — Global `Ctrl+Shift+F` full-text search that lazily hydrates body content for the active story/tree mode before matching.
### Context Menus & Actions
- `showContextMenu(e, nodeId) / hideContextMenu()` — Manages the custom right-click floating menu.
- `handleContextAction(action)` — Dispatches menu clicks to node operations.
- `createNode(type, parentId)` — Generates a new file/folder placeholder.
- `createPublishedChapter()` — Creates and opens a live unpublished chapter when the Published Tree is active, enabling direct chapter drafting/publishing from `writer.html`.
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

## 5. `scripts/scribblehub_autosync.js` (Background Chapter Import Worker)

### CLI & Configuration
- `parseArgs(argv)` â€” Reads `--once`, `--dry-run`, and `--help` worker flags.
- `printHelp()` â€” Prints environment-variable requirements and worker usage.
- `getConfig()` â€” Validates env configuration for Supabase credentials, ScribbleHub series target, story target, polling interval, and publish mode.
- `requireEnv(name)` â€” Throws if a required environment variable is missing.

### ScribbleHub Discovery & Parsing
- `discoverRecentChapters(config)` â€” Attempts the ScribbleHub series RSS feed first, then falls back to scraping the series table-of-contents page for recent chapter links.
- `extractRecentChaptersFromFeed(xml, limit)` â€” Parses RSS `<item>` entries into recent chapter metadata.
- `extractRecentChaptersFromSeriesPage(html, limit)` â€” Extracts recent `/read/.../chapter/...` links from the series page when feed discovery is unavailable.
- `fetchChapterBody(entry, config)` â€” Downloads an individual chapter page and returns sanitized chapter text ready for insertion.
- `extractChapterHtml(rawHtml)` â€” Uses heuristic content-container matching (`#chp_raw`, `#chp_contents`, `.chapter-content`, etc.) before falling back to broad body extraction.
- `sanitizeImportedContent(html, sourceUrl)` â€” Converts scraped HTML into newline-preserving plain chapter text and prepends the invisible ScribbleHub provenance marker comment.

### Supabase Sync
- `getStoryRecord(supabase, config)` â€” Resolves the destination story by `STORY_ID` or `STORY_SLUG`.
- `getExistingChapters(supabase, storyId)` â€” Loads existing chapter titles, orders, and content for dedupe checks.
- `buildKnownChapterIndexes(existingChapters)` â€” Creates in-memory title and imported-source indexes so the worker only inserts unseen chapters.
- `insertChapter(supabase, storyId, record)` â€” Inserts a new `chapters` row and computes `word_count` for compatibility with existing admin/reader views.
- `runSync(config, options)` â€” Executes one import pass, ordering unseen ScribbleHub chapters oldest-to-newest so `chapter_order` remains sequential.

### Shared Helpers
- `normalizeSeriesUrl(url)` / `normalizeChapterUrl(url)` â€” Canonicalize ScribbleHub URLs for matching and dedupe.
- `buildRequestOptions(cookie)` / `fetchText(url, cookie)` â€” Centralize fetch headers and optional authenticated cookie support.
- `decodeHtmlEntities(text)` / `stripTags(html)` / `cleanWhitespace(value)` / `extractFirst(text, regex)` â€” Utility helpers used throughout the feed/page parser.
- `extractImportedSource(content)` â€” Reads the hidden `imported-from:scribblehub` marker from an existing chapter body so repeated sync passes stay idempotent.
- `main()` â€” Boots the worker, runs an immediate sync pass, and optionally enters continuous polling mode.

## 6. `scripts/run_scribblehub_sync.ps1` and `scripts/register_scribblehub_sync_task.ps1` (Windows Helpers)

### Runtime Bootstrap
- `run_scribblehub_sync.ps1` - Loads key/value pairs from the repo-local `.env`, exposes them to the current process, and launches the Node-based ScribbleHub autosync worker with optional `-Once`, `-DryRun`, and `-Backfill` switches.

### Scheduled Task Registration
- `register_scribblehub_sync_task.ps1` - Registers a Windows Scheduled Task named `AbstractoTales-ScribbleHubSync` by default, configured to launch the PowerShell runner hidden at user logon with basic auto-restart settings.

## 7. ScribbleHub Autosync Updates (Backfill)
- `scripts/scribblehub_autosync.js` now supports `--backfill` to crawl full ScribbleHub TOC pages (`?toc=N`), resequence `chapters.chapter_order`, and insert missing earlier chapters ahead of already-imported recent chapters.
- Additional env knobs: `SCRIBBLEHUB_TOC_PAGES_MAX`, `CHAPTER_ORDER_START`, and `ALLOW_MIXED_CHAPTERS`.
