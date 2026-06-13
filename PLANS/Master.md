# Master Plan: Galactic Operations Deck Redesign

This document outlines the design and implementation plan to overhaul the public reader's interactive map viewer from a page-constrained view into a fully fullscreen, standalone **"Galactic Operations Deck"** HUD console.

---

## 🛸 UI Components & Features

1. **Fullscreen Fixed Map Stage:**
   - The map console shell breaks out of the standard reader viewport containers (`#app-container`, `#content-stage`) completely using a fixed fullscreen layout (`position: fixed; inset: 0; z-index: 9999; width: 100vw; height: 100vh;`).
   - Deep space background radial gradients and a CRT holographic grid scanline overlay simulate a premium star chart console.
   - A dark vignette is layered dynamically behind the interactive elements to create a high-contrast "dark map, bright planet pins" glowing effect.

2. **World Inspector (Left Dock Panel):**
   - Automatically slides out from the left on planet clicks.
   - Styled as a premium glassmorphic panel with frosted backdrop filters, thin cyan borders, and soft shadows.
   - Contains:
     - World header details (Name, Sector/Region, Link count badge).
     - **3D Planetary Orb:** A rotating gradient sphere simulating planetary rotation, with atmospheric glow.
     - **Quick Actions:** Shortcuts to "Set as Origin", "Set as Destination", and "Add to Watchlist" (persisted to local storage).
     - **Tabbed Navigation:** `OVERVIEW` (Affiliation, Governance, Population, Class, Resources, Threat Level deterministically generated using a hash seed), `HISTORY` (scans location history index), `ROUTES` (exit connections), `POLITICAL` (territorial status), and `NEARBY` (spatial neighbors).

3. **Navicomputer (Right Dock Panel):**
   - Coordinates route calculation inputs and results.
   - Contains collapsible **Route Analysis** accordions for detailed flight data:
     - **Hyperlane Preview:** Step-by-step navigation hop sequence.
     - **Fuel Estimate:** Fuel usage proportional to path distance.
     - **Political Borders:** Count of crossing regions.
     - **Hazard Rating:** Route risk evaluation (High for offlane travel, Medium for disputed/long routes, Low otherwise).
   - Features **Plot Course** and **Clear Route** buttons to drive Dijkstra-based pathfinding calculations.

4. **Minimize Panels Toggle:**
   - A floating "Minimize Panels" button in the top-right corner collapses all overlay elements (left/right docks, status cards, legend, footer) off-screen using translation transitions, leaving only the bare map stage visible.
   - Displays a compact "Expand Panels" trigger to slide them back.

5. **Bottom Right HUD Stack:**
   - A vertical pill-button dock providing direct controls:
     - `Navicomputer`: Toggle the right dock.
     - `Filters`: Open filter settings.
     - `Layers`: Toggle planet name or hyperlane visibility.
     - `Search`: Focus the planet search input.

6. **Bottom Right Status Card:**
   - Displays current astrogation status ("Navicomputer Online" or active route details e.g., `Milagro → Trillia`).
   - Features a custom vector **Radar Sweep Widget** (conic gradient sweep animation with concentric grid circles and blinking blips) signifying live navigation calculation.

7. **Bottom Center Legend:**
   - A floating legend panel identifying faction boundaries (The Galaxy (Political), Botian Space, Disputed Territory) and hyperlanes.

8. **Bottom Footer Ticker Bar:**
   - Includes quick-access buttons:
     - `Historical Index`: Opens the selected world's History tab.
     - `Active Routes`: Opens the Itinerary summary.
   - **Contribute Ticker:** A scrolling terminal text banner inviting reader contributions (Contribute Promo).
   - **Galactic Clock:** A live-ticking digital clock synchronized to local time, accompanied by a rotating astrogation dashed spinner.

---

## 🛠️ Codebase Modifications

- **[styles.css](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/styles.css):** Added full-viewport styles, glassmorphic layout tokens, panel minimized translate classes, rotating planet orb animations, ticking clock spinner, and CSS-based vector radar sweep.
- **[js/render.js](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/js/render.js):** Replaced the `Render.maps()` layout structure with HUD overlays, status cards, bottom footer elements, and tab templates.
- **[js/maps/MapViewer.js](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/js/maps/MapViewer.js):** Wired panel minimize toggle states, ticking digital clocks, deterministically seeded planet specifications (`getNodeSpecs`), watchlist updates, and route analysis statistics.
- **[docs/CODEBASE_ARCHITECTURE.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs/CODEBASE_ARCHITECTURE.md):** Updated documentation under Reader Map Conventions.
- **[docs/FUNCTION_INDEX.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs/FUNCTION_INDEX.md):** Registered newly added controller hooks.
- **[CHANGELOG.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/CHANGELOG.md):** Documented implementation logs under June 5th.

---

## 🔬 Manual Verification Steps

Verify the implementation by loading the reader maps interface:

1. **Viewer Entrance:**
   - Navigate to `/index.html#/maps/{story}/{map-id}`.
   - Confirm the main website header is hidden and the map console takes 100% of the screen.
   - Verify the dark vignette is visible on the outer edges and the scanline haze is present.
   - Confirm the Galactic Time clock is ticking and its spinner is rotating.

2. **Planet Inspection:**
   - Click a planet node (e.g., "Crul").
   - Confirm the **World Inspector** slides out from the left.
   - Verify the rotating 3D planetary gradient orb is visible.
   - Click the tabs (Overview, History, Routes, Political, Nearby) and confirm information loads dynamically.
   - Click "Add to Watchlist" and confirm button changes to "In Watchlist". Reload the page and select the same planet to verify state persistence.

3. **Minimize Panels:**
   - Click **Minimize Panels** in the top right.
   - Confirm all overlay panels slide off-screen smoothly.
   - Click the **Expand Panels** button that appears. Confirm all panels return to their positions.

4. **Navicomputer & Course Plotting:**
   - Click the **Navicomputer** button in the bottom-right HUD stack or click a planet node and select "Set as Origin".
   - Confirm the Navicomputer dock slides out.
   - Enter/select an Origin and Destination, then click **Plot Course**.
   - Confirm the route is drawn on the map.
   - Open the accordions in the Navicomputer (e.g., Hyperlane Preview, Fuel Estimate) and confirm the metrics match the plotted path.
   - Verify the Bottom Right Status Card updates from "Offline" to the active route (e.g., "Milagro → Trillia" and Hop/Distance counts).
   - Click **Clear Route** and confirm all route metrics, paths, and status messages reset to default.

5. **Layer and Search controls:**
   - Click **Toggle Labels** in the HUD stack. Verify labels are hidden. Click it again to restore them.
   - Click **Focus Search**. Verify the search input in the Navicomputer is highlighted.
