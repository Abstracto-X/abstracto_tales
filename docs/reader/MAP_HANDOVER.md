# Reader Map Handover

Last audited: **2026-06-15 05:47 +05:30**

This is the working handover for the public reader Map Hub and interactive map viewer. Read this before changing the map so the next implementation pass can begin at the relevant code instead of surveying the whole repository.

## Latest HUD Restructure

- Star Chart Registry and Layers are labeled controls in the top-right command bar.
- Open Navicomputer and Search live in the bottom-right radar/status card. Zoom, reset, and route-focus controls use a horizontal rail beside the upper-right Minimize Panels control.
- The separate itinerary dock, inline Navicomputer itinerary, and Active Routes footer action were removed.
- World Inspector uses Plot Course instead of its watchlist action. Existing origins route immediately; otherwise an inline searchable departure picker plots without opening the Navicomputer.
- The floating route card renders numbered animated stops and scores live HUD/dock rectangles. Desktop left-side positions shift beside an open World Inspector.
- Registry entries use their map image as a hover/focus thumbnail, and the refreshed HUD includes scanlines, edge glows, planet-class inspector accents, active-route radar feedback, minimize-state feedback, a Galactic Republic clock emblem, and reduced-motion fallbacks.

## 1. Scope and Routes

- Registry route: `#maps/{storySlug}`
- Viewer route: `#maps/{storySlug}/{mapId}`
- Reader route assembly: `js/render.js`
- Registry controller: `js/maps/MapHub.js`
- Viewer/data/routing controller: `js/maps/MapViewer.js`
- Reader map styling: `styles.css`
- Concept references: `PLANS/`

No database schema changes were made for the redesign. The viewer still reads the existing `maps`, `map_nodes`, and `map_edges` data through `js/db.js`.

## 2. Exact Code Locations

Line numbers below are from the audit timestamp above. Small edits can shift them; use the named symbol or CSS heading as the stable anchor.

### Viewer and Registry Markup

| Area | Current location |
| --- | --- |
| Complete `Render.maps(slug, mapId)` route | `js/render.js:530-884` |
| Registry branch and `MapHub.render(...)` call | `js/render.js:571-586` |
| Viewer data preparation and map selector cards | `js/render.js:589-613` |
| Fullscreen `.map-console-shell--viewer` markup | `js/render.js:614-883` |
| Top command bar | `js/render.js:617-646` |
| Charts and layers floating panels | `js/render.js:648-680` |
| Map canvas and World Inspector shell | `js/render.js:682-711` |
| Navicomputer shell and route-analysis accordions | `js/render.js:713-797` |
| Radar/status card | `js/render.js:799-828` |
| HUD button stack and legend | `js/render.js:830-843` |
| Cartographer contribution card | `js/render.js:844-856` |
| Footer history/routes/ticker/clock | `js/render.js:858-875` |
| `MapViewer.init(...)` dispatch | `js/render.js:878-884` |

### Map Hub

`js/maps/MapHub.js` is only 106 lines and is safe to read in full.

| Symbol | Current location |
| --- | --- |
| `MapHub.renderCard(...)` | `js/maps/MapHub.js:14` |
| `MapHub.renderSection(...)` | `js/maps/MapHub.js:37` |
| `MapHub.render(...)` | `js/maps/MapHub.js:53` |
| `MapHub.init()` | `js/maps/MapHub.js:82` |
| `MapHub.onSearch(...)` | `js/maps/MapHub.js:88` |

### Viewer Controller

| Area / symbol | Current location |
| --- | --- |
| State fields and HUD timers | `js/maps/MapViewer.js:76-129` |
| `init(...)` | `js/maps/MapViewer.js:130` |
| `bindUI(...)` | `js/maps/MapViewer.js:243` |
| Database loading and map DOM rendering | `js/maps/MapViewer.js:330-430` approximately |
| Graph/component construction and pathfinding helpers | `js/maps/MapViewer.js:431-760` approximately |
| `selectNode(...)` | `js/maps/MapViewer.js:761` |
| Route endpoint assignment and route drawing | `js/maps/MapViewer.js:781-972` approximately |
| `clearRoute()` / `swapRoute()` | `js/maps/MapViewer.js:974-1008` |
| Full historical archive action | `js/maps/MapViewer.js:1070` |
| Compact location-history loading/rendering | `js/maps/MapViewer.js:1078-1170` approximately |
| Placeholder telemetry helpers | `js/maps/MapViewer.js:1170-1297` approximately |
| `renderWorldIntel(...)` | `js/maps/MapViewer.js:1298` |
| Inspector tab rendering | `js/maps/MapViewer.js:1390-1515` approximately |
| `renderSummary()` | `js/maps/MapViewer.js:1542` |
| Route overlay/card positioning | `js/maps/MapViewer.js:1590-1834` approximately |
| Layer state | `js/maps/MapViewer.js:1844-1861` approximately |
| Natural map-pixel node colors | `js/maps/MapViewer.js:1869` onward |
| `destroy()` cleanup | `js/maps/MapViewer.js:2055` |
| Pointer/touch camera controls | `js/maps/MapViewer.js:2080-2223` approximately |
| `initDocks(...)` | `js/maps/MapViewer.js:2224` |
| Dock open/close/toggle helpers | `js/maps/MapViewer.js:2260-2319` approximately |
| `toggleBeacon()` | `js/maps/MapViewer.js:2320` |
| Live clock | `js/maps/MapViewer.js:2339` |
| Footer ticker text | `js/maps/MapViewer.js:2355` approximately |
| HUD route status synchronization | `js/maps/MapViewer.js:2364` |
| Route-analysis placeholder calculations | `js/maps/MapViewer.js:2387` |
| Panel minimization | `js/maps/MapViewer.js:2418` |
| Theme/audio/ticker visual toggles | `js/maps/MapViewer.js:2430-2445` approximately |

### CSS

The **authoritative redesign overrides** begin at:

```css
/* READER MAPS — GALACTIC OPERATIONS DECK (2026 REFRESH) */
```

Current range: `styles.css:5625-6886`.

Important anchors inside that range:

| Area | Current location |
| --- | --- |
| Fullscreen body/shell/ambience | `styles.css:5625-5707` |
| Top HUD | `styles.css:5708` onward |
| Shared glass panels and docks | `styles.css:5831` onward |
| Planet orb | `styles.css:5935` |
| Navicomputer route analysis | `styles.css:5984` onward |
| Radar/status card | `styles.css:6241` |
| Legend | `styles.css:6328` |
| Footer ticker and clock | `styles.css:6367` |
| Cartographer beacon overrides | `styles.css:6478` |
| Panel-minimized states | `styles.css:6493` |
| Map Hub refresh | `styles.css:6518` |
| Responsive desktop/tablet overrides | `styles.css:6670` approximately |
| Mobile bottom-sheet layout | `styles.css:6717` |

There are older experimental map rules around `styles.css:1833-3830`. The EOF refresh overrides most of them. A future cleanup should consolidate or delete superseded rules only after a visual regression pass.

## 3. What Is Working

- Two-phase Map Hub → Viewer routing.
- Registry grouping by Galactic, Regional/Sector, and Local map type.
- Registry search by map name/type and live node/lane counts.
- Fullscreen map canvas with pan, wheel/pinch zoom, reset, and route focus.
- Supabase node/edge loading.
- Dijkstra routing and hybrid nearest-hyperlane routing for isolated worlds.
- Origin/destination assignment, swapping, clearing, and route drawing.
- Cross-map planet search hints.
- Layer visibility controls for labels and hyperlanes.
- Planet selection and left World Inspector.
- History lookup against Story History and lazy Galactic History.
- Inspector-based Plot Course workflow; legacy local-storage watchlist helpers remain in code without an inspector control.
- Responsive desktop overlays and mobile bottom sheets.
- Dock ARIA open-state synchronization.
- Cleanup of event listeners and live clock interval through `MapViewer.destroy()`.

## 4. Placeholder or Synthetic Features

These items look authoritative in the UI but are **not canonical database lore**.

### World Inspector Telemetry

`getStringHash`, `getNodeSpecs`, `getPlanetOrbGradient`, and `getNodeDescription` generate stable fictional values from the node name/ID.

Synthetic fields include:

- Description
- Affiliation
- Governance
- Population
- Planet class
- Resources
- Threat level
- Political status text

The values remain consistent across reloads but are placeholders. They should either:

1. Be visibly labeled **Estimated telemetry / Generated placeholder**, or
2. Be replaced with real columns or linked lore records.

Do not present these values as canon without a real data source.

### Route Analysis

The accordion calculations in `renderRouteAnalysis()` are approximations:

- **Fuel Estimate:** one arbitrary “fuel cell” per coordinate unit.
- **Political Borders:** compares node `region`/`sector` strings; it does not use political-boundary geometry.
- **Hazard Rating:** derives High/Medium/Low from hybrid travel, border count, and hop count.
- **Hyperlane Preview:** real route nodes, but only a textual presentation of the calculated path.

### HUD Utilities

- Theme button only toggles a warm CSS theme.
- Volume button only changes its icon/pressed state; there is no audio engine.
- Settings button currently opens the Layers panel rather than a dedicated settings panel.
- Radar is decorative CSS, not a live scanner.
- Galactic Time is the reader’s local device time, not a story calendar.

### Legend

The faction entries are hardcoded:

- The Galaxy (Political)
- Botian Space
- Disputed Territory
- Hyperlane

They are not derived from the active map’s metadata or boundary layers.

### Map Dimensions and Metadata

Missing map dimensions fall back to `4000 × 4000`. Map type falls back to `galactic`. These defaults may hide incomplete records.

## 5. Half-Done / Known Problems

### Highest Priority: Cartography Contribution Banner

The “Help Chart the Galaxy” markup exists at `js/render.js:844-856`, and `MapViewer.toggleBeacon()` exists at `js/maps/MapViewer.js:2320`.

However, the current final CSS hides the only trigger:

```css
.cartographer-beacon-pill {
    display: none;
}
```

That rule is near `styles.css:6478`. Therefore, the contribution card is effectively unreachable during normal use.

The footer ticker mentions contributing, but this is not equivalent to the intended visible banner.

Required follow-up:

- Add a clearly visible **Help Map the Galaxy / Contribute Cartography** banner or footer action.
- It should open the existing contribution card or navigate to `cartographer.html`.
- Preserve the login/registration warning for guests.
- On desktop, place it in the footer ticker area or directly above the footer without colliding with the legend/status card.
- On mobile, use a compact footer icon/button rather than hiding it.
- Decide whether all registered readers can enter `cartographer.html`; the editor itself only accepts cartographer/admin roles, so messaging should not imply automatic edit permission.

### World Inspector Canonical Data

The visual presentation is polished, but most content is generated placeholder data. There is no edit/admin pipeline for canonical world profiles.

Recommended future model:

- Add documented optional columns to `map_nodes`, or
- Link a map node to a lore entry/world-profile record.

This requires reading `docs_v2/shared/database.md` before implementation.

### Registry Scope

The top-right **Star Chart Registry** control is a map switcher with image-backed previews. It is not a faction, threat, region, connectivity, or watchlist filter system.

### Dedicated Settings

The gear and Layers button open the same panel. Either remove the duplicate control or implement a real settings surface.

### Audio

The audio control is visual-only. Either label it as unavailable, remove it, or implement an actual optional ambient-audio system with user consent and persistence.

### Route Information Duplication

Route data can appear in:

- Navicomputer summary
- Navicomputer analysis
- Floating route overlay
- Radar/status card

This is intentional for the concept, but it can become noisy. A UX pass should decide which surfaces remain visible at each viewport width.

### Contribution and Bottom Dock Collisions

The hidden contribution card, centered legend, and footer share the lower viewport. If the contribution banner is restored, explicitly test:

- No active route
- Active route overlay
- World Inspector and Navicomputer both open
- 1366×768 laptop viewport
- Mobile portrait

### Legacy CSS Duplication

Older map CSS remains earlier in `styles.css`. The final refresh wins through cascade order, but duplicate rules make future changes fragile. Consolidation is desirable after browser verification.

### Inline Styles and Inline Handlers

The Inspector tab contents still contain several inline style strings and `onclick` handlers. They are compatible with the current project but make the UI harder to maintain and audit.

### Accessibility Follow-up

The main dock controls have ARIA states, but keyboard/focus behavior still needs a manual pass:

- Focus should move into an opened mobile bottom sheet.
- Escape should return focus to the opening trigger.
- Planet nodes should eventually be keyboard-focusable buttons rather than click-only `div` elements.
- The scrolling ticker should have a non-moving reduced-motion presentation.

## 6. Suggested Implementation Order

1. Restore the visible Cartography contribution action/banner.
2. Label generated world data as estimated, or connect it to canonical data.
3. Manually test all desktop/mobile collision states.
4. Remove or implement the visual-only audio/settings controls.
5. Reduce duplicated route surfaces further if manual viewport testing still feels noisy.
6. Consolidate legacy map CSS.
7. Improve planet-node keyboard accessibility.

## 7. Manual Verification Checklist

Automated browser testing is not run by default for this project.

1. Open `index.html#/maps/{storySlug}`.
2. Search by map name and by `galactic`, `regional`, and `local`.
3. Open a chart.
4. Confirm the main reader header is hidden and restored after navigating away.
5. Select a planet; test all five Inspector tabs.
6. Confirm generated telemetry is understood as placeholder data.
7. Plot linked and isolated-world routes.
8. Test Plot, Swap, Clear, Center Route, labels, and hyperlanes.
9. Test History, inspector Plot Course, and cross-map hints.
10. Test Minimize/Expand Panels.
11. Verify the contribution banner/action is visible after it is implemented.
12. Repeat at 1366×768, tablet width, and mobile portrait.
13. Confirm no console errors and no UI overlap.

## 8. Documentation Requirements for the Next Pass

For any integrated map change:

1. Update this handover if placeholder status or locations change.
2. Update `docs_v2/reader/architecture.md` for layout/state/lifecycle changes.
3. Update `docs_v2/reader/functions.md` for new, renamed, or deleted functions.
4. Update `docs_v2/shared/database.md` if canonical world fields or queries are added.
5. Run `npm run compile-docs`.
6. Add a timestamped entry to `CHANGELOG.md`.
