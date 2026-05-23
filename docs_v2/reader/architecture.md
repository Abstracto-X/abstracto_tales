# Reader SPA (`index.html`) — Modular Architecture

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
  - **`UserAuth`**: Handles Supabase session retrieval, sign-in, registration, sign-out, and profile synchronization. Exposes active user and profile details.

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
   - **Engine Startup**: Visual engines such as `Particles.init()` and `Visuals.initDynamicTransparency()` are started.
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
