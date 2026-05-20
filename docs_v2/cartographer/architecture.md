# CARTOGRAPHER SPA — Architecture & Staging System

This document outlines the architecture, global state management, role-based access control, coordinates layout, sandbox staging logic, and initialization flow of the Collaborative Map Editor (`cartographer.html`).

---

## 1. Purpose & Core Engine

`cartographer.html` is a collaborative star-map editing Single Page Application (SPA). It allows authorized users (admins, cartographers, and general readers) to design, customize, and edit story-linked maps.

### Core Technologies:
- **Leaflet.js (Simple Coordinate System):** Renders interactive map stages using Leaflet's `L.CRS.Simple` system. This allows custom images of any size to be plotted onto standard Cartesian plane grids.
- **Tesseract OCR (Text Snipping):** Employs an OCR engine (`js/SnippingTool.js`) that allows map designers to select labels directly from map images to create new planet nodes automatically.
- **Catmull-Rom Path Drawer:** Supports curved hyperlane lines (`js/PathDrawer.js`) interpolated via Catmull-Rom spline equations to draw elegant, pulsing hyperlanes.

---

## 2. Security Roles & Staging Queue (Sandbox Editor)

To protect the star map database from corruption, the editor operates on a role-based moderation system:

### User Roles:
- **Admin:** Full CRUD privileges. Can edit live map tables directly and approve or reject proposed changes in the Moderation Queue.
- **Cartographer:** Certified map creators. Can read all maps and submit revisions.
- **Reader (Contributor):** Registered users who can access the Sandbox editor to suggest revisions. Suggesting a revision is capped at 3 pending requests to prevent spam.

### Sandbox Staging & Moderation Queue:
- **Direct Live Edits Blocked:** Non-admins cannot directly modify the active `map_nodes` and `map_edges` tables.
- **Revision Tickets:** Edits made in the Sandbox editor are saved as pending revision tickets in the `map_requests` and `map_request_items` tables.
- **Clean Submissions:** `SaveManager.submitRequest` strips away local UI properties (such as color markers or tracking lines) to ensure only clean coordinate and entity payloads are submitted for admin approval.

---

## 3. Global State Reference

Operational state is managed in a global `State` container:

- `supabaseClient` *(Object)* — Initialized Supabase client.
- `State` *(Object)* — Primary state manager:
  - `user` / `profile` *(Object | null)* — The authenticated user and matching database profile column.
  - `pendingRequestCount` *(Number)* — Tracks the active user's pending request count.
  - `currentProject` *(Object | null)* — The active `maps` table record being edited.
  - `projects` / `stories` *(Array)* — Lists of active maps and story contexts.
  - `nodes` / `edges` *(Array)* — Mapped node and hyperlane objects.
  - `mode` *(String)* — Active canvas interaction mode: `'select'`, `'place'`, or `'trace'`.
  - `traceQueue` *(Array)* — Ordered list of planet nodes queued up when tracing hyperlanes.
  - `isDirty` *(Boolean)* — Tracks unsaved changes in the local draft workspace.
  - `contributors` *(Object)* — Lookup index mapping contributor UUIDs to distinct marker colors.
  - `undoStack` / `redoStack` *(Array)* — Local undo/redo action queues.
- `MapEngine` *(Object)* — Controls Leaflet.js canvases, layers, and coordinate conversions.
- `Hub` *(Object)* — Manages the post-login landing dashboard, project card grids, and contribution histories.
- `PlanetDB` *(Object)* — Local lookup index of `sw_planets.csv` records used for auto-completing planet names.

---

## 4. Cartesian Plane & Coordinate Systems

- **True Cartesian Coordinates:** The editor aligns coordinates with a true mathematical Cartesian grid where $X$ grows positive to the right and $Y$ grows positive upward.
- **Y-Axis Inversion:** Leaflet maps place the origin $(0,0)$ in the top-left, with $Y$ increasing downward. The `MapEngine` handles inverting coordinates upon loading or saving records. This matches the Y-axis inversion calculations in `index.html` to keep map visual overlays consistent between the viewer and editor.
- **Dynamic Scales:** Map bounds are derived dynamically from the image dimensions ($W \times H$) uploaded for each map project. This ensures that coordinates scale accurately regardless of the original image size.

---

## 5. Initialization Flow

Upon loading the Cartographer SPA, the application executes the following bootstrap sequence:

1. **`DOMContentLoaded` Event:**
   - **Form Bindings:** Registers credentials and login handlers.
   - **Auth Initialization:** `Auth.init()` checks Supabase for an active session. If active, it fetches the user profile; if not, it displays the login screen.
2. **Post-Authentication (`Auth.loadProfile` -> `Hub.show`):**
   - Verifies the user has a valid profile role (`admin`, `cartographer`, or `reader`).
   - Populates user cards in the header.
   - Renders the landing dashboard (`Hub.show()`), displaying available maps, contributor counts, and the user's contribution history.
3. **Editor Workspace Entry:**
   - **System Setup:** `App.init()` bootstraps:
     - `ContextMenu.init()` (floating context menus).
     - `MapEngine.init()` (Leaflet.js stage setup).
     - `Keyboard.init()` (Toolbar shortcuts: V, P, T, Esc).
     - `PlanetDB.load()` (Loads the CSV database into memory).
     - `LocalDraftManager.load()` (Restores unsaved changes from `localStorage` if found).
     - `ProjectPicker.refresh()` (Selects the target map context).
