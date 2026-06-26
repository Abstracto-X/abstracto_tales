# Subscription Reader SPA (`subscription.html`) — Modular Architecture

This document outlines the architecture, state management, routing, database interactions, rendering flows, and styles of the Member Library Subscription Single Page Application (`subscription.html`).

---

## 1. Overview

`subscription.html` serves as a lightweight, mobile-first member library for published stories. It is designed around normalized entitlements, allowing tier-aware chapter catalogs, secure chapter reading via subscription RPCs, Patreon connection authentication, access-key redemption, and account status tracking.

It uses **vanilla HTML, CSS, and ES6 JavaScript** with no build step.

### Core Structure
- **`subscription.html`**: A lightweight HTML shell. It defines the layout structure, loads the Supabase client via CDN, and imports `<script type="module" src="js/subscription/main.js"></script>`.
- **`subscription.css`**: A standalone, dedicated stylesheet containing resets, layout rules, interactive hover micro-animations, responsive media queries, and reading theme configurations (Dark, Parchment, and High Contrast).
- **`js/subscription/`**: Contains the ES6 module architecture for this SPA.

---

## 2. Key Upgrades & Redesign Features

1. **Immersive Reading Mode:** A distraction-free reading experience. When active, all UI chrome (sidebar navigation rail, topbar, bottom nav) slides away to maximize screen space for the story content.
2. **Dynamic Table of Contents (ToC) Drawer:** A slide-out right drawer that lists all chapters of the current story, allowing quick jumps without losing reading state.
3. **Reading Progress Tracking:** A gradient progress bar at the top of the screen displays current chapter scroll progress. The app saves the last read chapter ID and scroll offset to local storage (`sub_reading_progress`), displaying a "Continue Reading" prompt on the Home screen.
4. **Estimated Reading Times:** Automatically computes estimated minutes to read based on chapter word count (approx. 220 words per minute).
5. **Advanced Typography Adjustments:** Readers can customize the reading window to their liking:
   - **Theme**: Dark (default Obsidian), Parchment (warm cream), and High Contrast (pure black/white).
   - **Font Family**: Serif (Spectral) vs. Sans-Serif (Space Grotesk).
   - **Text Size**: Font scaling factor (`--sub-reader-scale`).
   - **Line Spacing**: Line height adjustments (`--sub-reader-line-height`).
6. **Keyboard Navigation:** While in reading mode, users can use the `Arrow Left` and `Arrow Right` keys to page between chapters, and `Escape` to close drawers or settings.
7. **Obsidian Archive Aesthetic:** The visual theme consists of deep black/purple backgrounds, translucent card overlays (glassmorphism), warm gold accents, and ethereal cyan progress indicators.

---

## 3. ES6 Module Architecture

### Entry Point
- **`js/subscription/main.js`**
  - Imports all subscription-specific modules.
  - Exposes modules to the global `window` scope (`SubAuth`, `SubRouter`, `SubUI`, `SubState`).
  - Sets up the `hashchange` event listener.
  - Bootstraps the application on `DOMContentLoaded` by initializing UI controls, reading theme and scale settings from storage, checking auth session, and routing to the starting hash (defaults to `#/home`).

### State & Configurations
- **`js/subscription/state.js`**
  - **`SubState`**: Singleton state object tracking:
    - `user`: Active Supabase auth user.
    - `profile`: Joined user profile.
    - `stories`: Cache of loaded story list.
    - `entitlements`: List of user's active/inactive entitlements.
    - `currentStory`: The story currently being viewed.
    - `currentCatalog`: Chapter directory list of the current story.
    - `currentChapter`: The active chapter row being read.
    - `pendingReturnRoute`: Route parameter for post-login return redirects.
    - `authMode`: `'signin'` or `'signup'`.
    - `readerTheme`: Saved reading theme (`'dark'`, `'parchment'`, `'contrast'`).
    - `readerScale`: Font multiplier from `0.85` to `1.5`.
    - `readerLineHeight`: Line height factor from `1.4` to `2.2`.
    - `readerFont`: Saved reading font (`'Spectral'` or `'Space Grotesk'`).
  - **`AccessLabels`**: Text labels mapping DB access states to user-friendly titles.
  - **`normalizeChapter(chapter)`**: Helper to resolve a chapter's access levels, locks, and readable entitlements.
  - **`saveReadingProgress(storyId, chapterId, scrollPos)`**: Stores current chapter ID and scroll coordinates in local storage.
  - **`getReadingProgress(storyId)`**: Retrieves stored progress data for a story.
  - **`routeTo(path)`**: Navigates to a hash-based route.

### Data Access Layer
- **`js/subscription/db.js`**
  - **`SubDB`**: Encapsulates all query calls to Supabase:
    - `getStories()`: Fetches published stories.
    - `getStoryBySlug(slug)`: Fetches a single story using its slug.
    - `getChapterCatalog(storyId)`: Calls RPC `get_chapter_catalog` to fetch chapter order, release times, and access states.
    - `getReaderChapter(chapterId)`: Calls RPC `get_reader_chapter` which returns full HTML/markdown text content only if authorized.
    - `getMyEntitlements()`: Calls RPC `get_my_entitlements` to query active paid tiers, access keys, or manually granted entitlements.
    - `redeemAccessKey(submittedCode)`: Calls RPC `redeem_access_key` to hash and claim reader access keys.
    - `requestPatreonSync()`: Requests Patreon connection mapping and refresh.

### User Authentication
- **`js/subscription/auth.js`**
  - **`SubAuth`**: Manages member logins and registrations:
    - `init()`: Connects listener for auth changes, updates `SubState.user`, fetches entitlements, and updates the top bar account chip.
    - `handleSubmit()`: Validates inputs and handles signup/signin actions.
    - Active `aether-app.js` bridge password recovery: `sendPasswordReset(email)` sends Supabase recovery emails from the account sheet, and recovery callbacks open a `sheetUpdatePassword()` form that calls `updateReaderPassword(password)`.
    - `signOut()`: Signs the reader out and returns to home.
    - `toggleMode()`: Switches the modal context between signin and registration.

### Client-Side Router
- **`js/subscription/router.js`**
  - **`SubRouter`**: Client-side hash router. Parses parameters, sets navigation rail active states, triggers stage loading overlays, and dispatches to specific rendering actions. Resets reading mode layouts when transitioning away from a chapter view.
    - `#/home` -> `SubRender.home()`
    - `#/library` -> `SubRender.library()`
    - `#/story/:slug` -> `SubRender.story(slug)`
    - `#/story/:slug/chapters` -> `SubRender.chapters(slug)`
    - `#/story/:slug/chapter/:id` -> `SubRender.chapter(slug, id)`
    - `#/story/:slug/preview/:id` -> `SubRender.preview(slug, id)`
    - `#/updates` -> `SubRender.updates()`
    - `#/access` -> `SubRender.access()`
    - `#/account` -> `SubRender.account()`

### Dynamic Renderers
- **`js/subscription/render.js`**
  - **`SubRender`**: Generates and inserts raw HTML templates into `#sub-stage`:
    - `home()`: Renders the welcome hero panel, continue reading banner (if progress exists), access cards, and story highlights.
    - `library()`: Renders the complete story cards list.
    - `story(slug)`: Detailed story page, cover illustration, facts, and initial catalog index.
    - `chapters(slug)`: Renders the catalog binder list showing chapter orders, release dates, and lock statuses.
    - `chapter(slug, chapterId)`: The primary reading interface including paragraph layout, theme styles, font scaling, and navigation links.
    - `preview(slug, chapterId)`: Displays public excerpts/previews for locked chapters.
    - `accessGate(story, chapter)`: Blocking interstitial asking the user to sign in, connect Patreon, or redeem a key.
    - `access(subRoute)`: Interface to redeem keys, link Patreon networks, or show access statuses.
    - `account(subRoute)`: Shows profile details and lists active entitlements.
    - `updates()`: Displays a chronological listing of recently published chapters.
    - `tocDrawer(catalog, currentChapterId, slug)`: Renders table of contents side drawer.
    - `readerSheet()`: Renders typography and theme configuration sheet.

### User Interface Controls
- **`js/subscription/ui.js`**
  - **`SubUI`**: UI binding handlers:
    - `init()`: Attaches global document click listeners for navigations, configures keyboard shortcuts (Arrows and Escape), and binds drawers' backdrop/closer events.
    - `setActiveNav(view)`: Syncs active styling flags (`.is-active`) across desktop rail and mobile bottom navigation.
    - `setBack(route, label)`: Shows/hides the topbar back arrow button and binds click navigation.
    - `setAccent(story)`: Sets page accent CSS variables (`--accent-color`) and custom story background styles dynamically based on the active story.
    - `openAuthDialog()` / `closeAuthDialog()`: Controls visibility of the login HTML `<dialog>`.
    - `toast(message, type)`: Shows temporary status notifications at the bottom of the screen.
    - `setInlineStatus(id, message, type)`: Writes validation text to target elements inside forms.
    - `openReaderSheet()` / `closeReaderSheet()`: Toggles the reader settings toolbar drawer.
    - `openToC()` / `closeToC()`: Toggles the table of contents drawer.
    - `toggleImmersive()`: Toggles district-free reading layouts.
    - `attachScrollListener(storyId, chapterId)`: Connects window scrolling to the progress indicator and periodically saves reading scroll progress.
    - `detachScrollListener()`: Cleans up scrolling event bindings.
    - `setReaderTheme(theme)` / `setReaderFont(font)` / `setReaderScale(scale)` / `setReaderLineHeight(lh)`: Applies style properties.

---

## 4. Styling & Aesthetics (`subscription.css`)

`subscription.css` isolates styling from the rest of the application. It establishes:
1. **Design Tokens**: Centralized `--sub-*` colors, background layers with noise texturing, gold/cyan glows, and smooth transitions.
2. **Layout Boundaries**: Fixed app-shell layout (`grid-template-columns: 88px 1fr` on desktop) utilizing container dimensions and independent `.sub-stage` overflow scrolling. Supports transition-out slides for immersive modes.
3. **Responsive Media Breakpoints**: 
   - `max-width: 860px` (Tablet/Mobile): Hides the desktop sidebar rail, sticky-aligns the top bar, and presents a floating glassmorphic bottom bar navigation layout.
   - `max-width: 560px` (Mobile Small): Minimizes margins, collapses back button text, and wraps grid elements.
4. **Theme Skins**: Overrides backgrounds, text colors, and border colors when `data-reader-theme` matches `parchment` or `contrast`.
