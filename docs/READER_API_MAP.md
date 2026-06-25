# Reader API Map

This document is a quick-reference API map for the core reader modules:

- `js/config.js`
- `js/db.js`
- `js/auth.js`

It focuses on exported surfaces, shared state, dependencies, side effects, and the shape of each module's public contract.

---

## `js/config.js`

### Purpose
Provides the shared Supabase client, reader-global state, default loader behavior, and HTML escaping helpers.

### Exports

#### `SUPABASE_URL`
- Type: `string`
- Purpose: Public Supabase project URL used to initialize the shared browser client.

#### `SUPABASE_ANON_KEY`
- Type: `string`
- Purpose: Public Supabase anonymous key used by the reader frontend.

#### `supabaseClient`
- Type: `SupabaseClient`
- Depends on: `window.supabase.createClient(...)`
- Purpose: Shared Supabase client imported by the rest of the reader modules.

#### `State`
- Type: `object`
- Purpose: Central reader runtime state.

State fields:
- `isInitialAppLoad: boolean` - Cold-start flag for first-load behavior.
- `currentStory: object | null` - Active story row for the current route.
- `currentStorySlug: string | null` - Active story slug.
- `currentChars: array` - In-memory character list for current story views.
- `currentWallpapers: array` - In-memory wallpaper list for current story.
- `filterTag: string` - Active gallery filter tag.
- `gallerySearch: string` - Active character-gallery caption/tag/character search text.
- `gallerySort: string` - Active client-side gallery order: `curated`, `newest`, or `top`.
- `galleryConfirmed: boolean` - Mature-content gate confirmation flag.
- `galleryViewMode: string` - Gallery layout preference restored from `localStorage`.
- `showR18: boolean` - Gallery R18 visibility preference restored from `localStorage`; when `true`, gallery views reveal artwork tagged `R18`, `NSFW`, `mature`, or `suggestive` and prioritize those images first. Gated behind active user login; forced to `false` if the user is unauthenticated or logs out.

#### `default_behavior_lightsaber`
- Type: `string`
- Current value: `'horizontal'`
- Purpose: Default loader orientation when the user has not saved a preference.

#### `Utils`
- Type: `object`
- Purpose: Safe text escaping helpers used when building HTML strings.

`Utils` methods:
- `escapeHtml(unsafe)` -> `string`
  - Escapes `&`, `<`, `>`, `"`, and `'`.
  - Use for dynamic text inserted into HTML content.
- `escapeAttr(unsafe)` -> `string`
  - Escapes `&`, `"`, and `'`.
  - Use for dynamic text inserted into HTML attributes.

### Side Effects
- Reads `gallery_view_mode` from `localStorage` during module evaluation.
- Reads `show_r18` from `localStorage` during module evaluation.
- Initializes the shared Supabase client immediately when the module loads.

---

## `js/db.js`

### Purpose
Wraps reader-facing Supabase reads and provides lightweight in-memory caching for frequently reused story and profile data.

### Imports
- `supabaseClient` from `js/config.js`

### Exports

#### `Cache`
- Type: `object`
- Purpose: TTL/LRU cache used by reader data-fetching flows.

Cache state:
- `stories: array | null`
- `storiesTTL: number`
- `author: object | null`
- `authorTTL: number`
- `_hubEntries: array`
- `_hubMap: object`
- `_HUB_MAX: number` - Maximum cached story hubs.
- `_TTL: number` - Shared cache lifetime in milliseconds.

`Cache` methods:
- `getHub(slug)` -> `object | null`
  - Returns cached hub payload when fresh.
  - Evicts stale entries and updates LRU ordering on hit.
- `setHub(slug, data)` -> `void`
  - Inserts or refreshes a cached story hub payload.
  - Enforces `_HUB_MAX` by evicting the least-recently-used entry.
- `_evictHub(slug)` -> `void`
  - Removes one cached hub entry from both lookup structures.
- `isStale(ttlTimestamp)` -> `boolean`
  - Returns `true` when the provided timestamp is missing or older than `_TTL`.

#### `DB`
- Type: `object`
- Purpose: Reader data-access API for published stories, lore, maps, chapters, galleries, and author data.

`DB` methods:

- `getStories()` -> `Promise<array>`
  - Reads published rows from `stories`.
  - Uses `Cache.stories` when still fresh.
  - Returns `[]` on query failure.

- `getMapNodes(mapId)` -> `Promise<array>`
  - Reads `map_nodes` rows for one map.
  - Throws on Supabase error.

- `getMapEdges(mapId)` -> `Promise<array>`
  - Reads `map_edges` rows for one map.
  - Throws on Supabase error.

- `getMapCounts(mapIds)` -> `Promise<object>`
  - Batch-counts nodes and edges for multiple map ids.
  - Returns an object keyed by `mapId` with `{ nodes, edges }`.

- `getAllMapNodeNames(storyId)` -> `Promise<array>`
  - Returns `map_id` and `name` pairs for nodes across all maps in a story.
  - Attempts a subquery-based fetch first, then falls back to a two-step query if needed.

- `getAuthorProfile()` -> `Promise<object | null>`
  - Reads the first admin profile from `profiles`.
  - Reads matching `author_links`.
  - Uses cache and returns a combined payload shaped like `{ ...profile, links: [] }`.

- `getStoryHubData(slug)` -> `Promise<object | null>`
  - Main story hub aggregator.
  - Reads the published `stories` row by slug, then parallel-loads:
    - `story_wallpapers`
    - `characters`
    - `lore_entries` with `lore_categories`
    - `timeline_events`
    - `maps`
  - Also enriches timeline events with linked `characters`.
  - Returns a payload shaped like `{ story, wallpapers, characters, lore, timeline, maps }`.
  - Uses LRU hub caching keyed by story slug.

- `getChapters(storyId)` -> `Promise<array>`
  - Reads published `chapters` rows for one story.
  - Returns `[]` on query failure.

- `getCharacterGallery(characterId)` -> `Promise<array>`
  - Reads only published `character_gallery_images` rows for one character.
  - Returns `[]` on query failure.

- `getLatestGalleryImages(storyId, limit = 10, offset = 0)` -> `Promise<array>`
  - Reads latest published `character_gallery_images` joined through `characters`.
  - Supports paginated gallery loading via `range(...)`.
  - Returns `[]` on query failure.

- `getGalleryCollectionPreviews(storyId)` -> `Promise<array>`
  - Reads published gallery metadata and joined character metadata to calculate per-character artwork/tag totals for the main Visual Archive browser.
  - The integrated browser itself renders only character profile images; gallery image URLs are not assigned to its cards or hero.
  - Returns `[]` on query failure.

- `getLoreEntry(storyId, loreSlug)` -> `Promise<object | null>`
  - Reads a single `lore_entries` row with joined `lore_categories`.
  - Returns `null` on query failure.

### Database Touchpoints
- `stories`
- `profiles`
- `author_links`
- `story_wallpapers`
- `characters`
- `lore_entries`
- `lore_categories`
- `timeline_events`
- `timeline_event_characters`
- `maps`
- `map_nodes`
- `map_edges`
- `chapters`
- `character_gallery_images`

### Error Behavior
- Some methods fail softly and return empty/null values:
  - `getStories`
  - `getAuthorProfile`
  - `getChapters`
  - `getCharacterGallery`
  - `getLatestGalleryImages`
  - `getGalleryCollectionPreviews`
  - `getLoreEntry`
- Map-specific methods throw instead:
  - `getMapNodes`
  - `getMapEdges`

---

## `js/auth.js`

### Purpose
Owns reader authentication state, profile synchronization, sign-in/sign-up actions, avatar uploads, and profile editing.

### Imports
- `supabaseClient` from `js/config.js`
- `UI` from `js/ui.js`
- `CommentsManager` from `js/comments.js`

### Exports

#### Internal `prepareAvatarUpload(file)` helper
- Converts ordinary PNG/JPG/JPEG avatars to WebP with a maximum dimension of 1024px and quality `0.82` when the result is useful.
- Preserves GIF animation and other unsupported formats by returning the original file.
- Falls back to the original upload on decode, canvas, or encoding failure.

#### `UserAuth`
- Type: `object`
- Purpose: Public auth/session manager for the reader SPA.

State fields:
- `user: object | null` - Current authenticated Supabase user.
- `profile: object | null` - Current `profiles` row for the authenticated user.
- `mode: string` - Current auth form mode: `'signin'` or `'signup'`.

`UserAuth` methods:

- `init()` -> `Promise<void>`
  - Consumes Supabase OAuth callback URLs first, including subscription-origin `?code=...` and `#access_token=...` returns, then reads the current auth session with `supabaseClient.auth.getSession()`.
  - If a session exists, loads the profile with `fetchProfile(...)`.
  - If no session exists, initializes guest auth/admin UI state.
  - Registers `supabaseClient.auth.onAuthStateChange(...)`.
  - On sign-in:
    - refreshes profile state
    - closes the auth modal
    - refreshes rendered comment threads
  - On sign-out:
    - clears `user` and `profile`
    - resets auth/admin UI
    - closes the profile modal
    - refreshes rendered comment threads

- `fetchProfile(user)` -> `Promise<void>`
  - Stores the authenticated user.
  - Reads the user's `profiles` row by `id`.
  - Retries up to 5 times with exponential backoff to tolerate delayed profile creation/sync.
  - On success:
    - updates `UserAuth.profile`
    - refreshes auth/admin UI
  - On failure:
    - logs the error
    - clears profile state
    - falls back to guest UI

- `toggleMode()` -> `void`
  - Switches between `'signin'` and `'signup'`.
  - Updates modal title, submit button label, switch button label, and clears inline errors.

- `handleSubmit()` -> `Promise<void>`
  - Reads email/password from the auth form.
  - Validates required fields.
  - On sign-up:
    - calls `supabaseClient.auth.signUp(...)` with `options.emailRedirectTo`
    - derives the redirect from the current reader URL, preserving the GitHub Pages `/abstracto_tales/` subpath while removing query, hash, and filename state
    - detects already-registered emails via empty `identities`
  - On sign-in:
    - calls `supabaseClient.auth.signInWithPassword(...)`
  - Writes inline success or error status to `#auth-error`.

- `signOut()` -> `Promise<void>`
  - Calls `supabaseClient.auth.signOut()`.

- `uploadAvatar(fileInput)` -> `Promise<void>`
  - Requires an authenticated user and a selected file.
  - Generates a temporary preview with `URL.createObjectURL(...)`.
  - Optimizes eligible PNG/JPG/JPEG files to bounded WebP before upload, with robust original-file fallback.
  - Uploads to a new `{user_id}-{timestamp}.{ext}` path in the `Reader` storage bucket with `cacheControl: '31536000'` and `upsert: false`.
  - Resolves a public URL and writes it into the profile form field.
  - Immediately updates the current `profiles` row with the new `avatar_url`.
  - On success:
    - updates `UserAuth.profile.avatar_url`
    - refreshes header/profile UI
    - refreshes rendered comment threads
  - On failure:
    - writes inline upload or backend error messaging

- `saveProfile()` -> `Promise<void>`
  - Requires an authenticated user.
  - Reads `display_name`, `avatar_url`, and `bio` from the profile modal.
  - Updates the current `profiles` row.
  - On success:
    - merges updates into `UserAuth.profile`
    - refreshes header/profile UI
    - refreshes rendered comment threads
    - closes the profile modal after a short delay
  - On failure:
    - writes inline error messaging

### UI / DOM Dependencies
- Auth modal:
  - `#auth-title`
  - `#auth-submit-btn`
  - `#auth-switch-btn`
  - `#auth-email`
  - `#auth-password`
  - `#auth-error`
- Profile modal:
  - `#profile-name`
  - `#profile-avatar`
  - `#profile-bio`
  - `#profile-msg`
  - `#profile-avatar-preview`
  - `#avatar-upload-status`

### Backend Touchpoints
- `supabaseClient.auth.getSession()`
- `supabaseClient.auth.onAuthStateChange(...)`
- `supabaseClient.auth.signUp(...)`
- `supabaseClient.auth.signInWithPassword(...)`
- `supabaseClient.auth.signOut()`
- `profiles` table
- `Reader` storage bucket

### Cross-Module Side Effects
- Calls `UI.initAuthLink(...)` to refresh the reader header auth slot.
- Calls `UI.initAdminLink()` to show or hide privileged shortcuts.
- Calls `UI.closeAuthModal()` and `UI.closeProfileModal()` during auth transitions.
- Calls `CommentsManager.refreshRenderedThreads()` whenever auth/profile state changes affect comment controls.

---

## Subscription Reader API Map (`js/subscription/`)

The subscription reader is a separate SPA rooted at `subscription.html`. It imports the shared `supabaseClient` and `Utils` from `js/config.js` but keeps its own route/auth/render state under `js/subscription/`.

### `js/subscription/state.js`

Exports:
- `SubState` - Subscription runtime state: `user`, `profile`, `stories`, `entitlements`, `currentStory`, `currentCatalog`, `pendingReturnRoute`, `authMode`, `readerTheme`, and `readerScale`.
- `AccessLabels` - Display labels for access states: `free`, `unlocked`, `free_preview`, `locked_tier`, `early_access`, `key_locked`, `pending_sync`, `expired`.
- `normalizeChapter(chapter)` - Normalizes RPC/fallback rows into a consistent access shape.
- `routeTo(path)` - Hash route helper for subscription routes.
- `safeText` / `safeAttr` - Re-exported escaping helpers from shared `Utils`.

Side effects:
- Reads reader theme/scale preferences from `localStorage`.

### `js/subscription/db.js`

Exports:
- `SubDB.getStories()` - Reads published `stories` rows.
- `SubDB.getStoryBySlug(slug)` - Reads one published story.
- `SubDB.getChapterCatalog(storyId)` - Prefers `get_chapter_catalog(target_story_id)` RPC. Fallback reads published chapter metadata without content-sensitive entitlement fields.
- `SubDB.getReaderChapter(chapterId)` - Prefers `get_reader_chapter(target_chapter_id)` RPC. Fallback reads existing published chapter rows for pre-migration compatibility.
- `SubDB.getMyEntitlements()` - Prefers `get_my_entitlements()` RPC. Fallback reads `user_entitlements` when available.
- `SubDB.redeemAccessKey(code)` - Calls `redeem_access_key(submitted_code)` RPC.
- `SubDB.requestPatreonSync()` - Calls the `patreon-oauth-start` Supabase Edge Function and redirects when it returns a URL.

Database touchpoints:
- Existing: `stories`, `chapters`, `profiles`.
- Migration-backed: `reader_access_tiers`, `user_entitlements`, `provider_connections`, `access_keys`, `access_key_redemptions` through RPCs and entitlement fallback reads.

### `js/subscription/auth.js`

Exports:
- `SubAuth.init()` - Restores session, loads profile/entitlements, subscribes to auth changes.
- `SubAuth.fetchProfile(user)` - Reads `profiles` by auth user id.
- `SubAuth.syncAccountChip()` - Updates the `#sub-account-chip` header slot.
- `SubAuth.setMode(mode)` / `SubAuth.toggleMode()` - Controls sign-in/sign-up dialog mode.
- `SubAuth.handleSubmit()` - Handles sign-in/sign-up using Supabase Auth.
- `SubAuth.signOut()` - Signs out of Supabase.

DOM dependencies:
- `#sub-account-chip`
- `#sub-auth-dialog`
- `#sub-auth-title`
- `#sub-auth-message`
- `#sub-auth-email`
- `#sub-auth-password`
- `#sub-auth-submit`
- `#sub-auth-toggle`

### `js/subscription/router.js`

Exports:
- `SubRouter.handle()` - Dispatches hash routes for `home`, `library`, `story`, `updates`, `access`, `account`, `tiers`, and `help`.
- `SubRouter.navigate(path)` - Programmatic subscription hash navigation.

### `js/subscription/render.js`

Exports:
- `SubRender` route render methods for home, library, story hubs, chapter shelves, chapter reader, previews, tier list/detail pages, help pages, access gates, access workflows, account/entitlement dashboard, updates, reader controls sheet, empty states, and route errors.

DOM dependencies:
- `#sub-stage`
- Delegated `[data-sub-route]` and `[data-sub-open-auth]` controls.

### `js/subscription/ui.js`

Exports:
- `SubUI.init()` - Delegated nav/auth binding.
- `SubUI.setActiveNav(view)` - Active desktop/mobile nav state.
- `SubUI.setBack(route, label)` - Header back button.
- `SubUI.setAccent(story)` - Story accent/background CSS variables.
- `SubUI.openAuthDialog()` / `SubUI.closeAuthDialog()` - Auth modal controls.
- `SubUI.toast(message, type)` - Subscription toast.
- `SubUI.setInlineStatus(id, message, type)` - Inline status writer.
- `SubUI.openReaderSheet()` / `SubUI.closeReaderSheet()` - Reader bottom sheet.
- `SubUI.setReaderTheme(theme)` / `SubUI.setReaderScale(scale)` - Reading preference persistence.

### Aether Pages bridge scripts (active `subscription.html` boot path)

- `js/subscription/aether-data.js` - temporary local fixture dataset imported from the approved Aether Pages concept. It provides stories, chapters, access states, collections, notifications, and reader-local seeds on `window.DATA`.
- `js/subscription/aether-app.js` - temporary vanilla runtime for the Aether Pages bridge. It owns hash routing, local-store state, access-state simulation, top/bottom chrome, sheets, and all current Aether Pages route rendering. It defaults to anonymous access and must be split into production modules before backend launch.

The prior modular `Sub*` API remains available in the repository but is not the active boot path while the Aether Pages bridge is being refactored into production modules.

Auth bridge additions in `aether-app.js`:
- Initializes Supabase with the project publishable key when `window.supabase` is present.
- Explicitly consumes OAuth callback parameters before session restore. It exchanges PKCE `code` parameters with `auth.exchangeCodeForSession(...)`, accepts implicit hash token returns through `auth.setSession(...)`, supports nested `#/vault#access_token=...` SPA hashes, then restores `auth.getSession()`, subscribes to `auth.onAuthStateChange`, and stores active `authState.user/session`.
- Calls `get_my_entitlements` RPC with a direct `user_entitlements` fallback for bridge-only entitlement display.
- Account sheet supports Google OAuth, password sign-in/sign-up/sign-out, and a Patreon-first onboarding path that resumes Patreon connect after Google auth. Google OAuth actions prevent default delegated click behavior and use a manual `data.url` redirect fallback.
- Key redemption calls `redeem_access_key(submitted_code)`.
- Patreon connect calls `patreon-oauth-start` Edge Function and redirects only when a provider URL is returned. Manual provider re-sync calls `sync-provider-entitlements`, refreshes local entitlements, and reloads backend catalog metadata.

Backend catalog/content additions in `aether-app.js`:
- `loadBackendLibrary()` reads published `stories`, then uses `get_chapter_catalog` to populate Aether Pages story/chapter cards from safe metadata.
- `normalizeBackendStory(row)` maps Supabase story rows to the Aether Pages UI shape.
- `normalizeBackendChapter(row, story)` maps catalog RPC rows to Aether states (`free`, `unlocked`, `preview`, `early`, `key`, `locked`).
- `loadReaderChapterIntoFixture(chapterId)` calls `get_reader_chapter` on demand for readable backend chapters and only attaches content when the RPC returns authorized content.
- `textToBlocks(value)` converts backend text/HTML into paragraph blocks for the Aether reader without relying on blurred hidden content.

Fallback behavior update:
- If `get_chapter_catalog` is unavailable, `loadBackendLibrary()` reads direct published chapter metadata so the UI shows real site stories instead of Aether mock fixtures.
- Full backend chapter body loading is RPC-only: `loadReaderChapterIntoFixture()` calls `get_reader_chapter` and does not fall back to direct `chapters.content` reads.

Admin-aware auth bridge additions:
- `refreshProfile()` loads `profiles(id, username, display_name, avatar_url, role)` for the active Supabase user.
- `isAdmin()` returns true for `profile.role === 'admin'`.
- The account sheet/topbar surface admin links only for admin profiles.
- `#/studio*` routes render an admin gate for non-admin users; admins can open the Aether Studio preview and the production `admin.html` CMS link.

- `store.pendingAuthAction` is a local bridge flag used to resume `connect-patreon` after Supabase Google OAuth redirects back to `subscription.html#/vault`.
