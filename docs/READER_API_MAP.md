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
- `galleryConfirmed: boolean` - Mature-content gate confirmation flag.
- `galleryViewMode: string` - Gallery layout preference restored from `localStorage`.
- `showR18: boolean` - Gallery R18 visibility preference restored from `localStorage`; when `true`, gallery views reveal artwork tagged `R18`, `NSFW`, `mature`, or `suggestive` and prioritize those images first.

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

#### `UserAuth`
- Type: `object`
- Purpose: Public auth/session manager for the reader SPA.

State fields:
- `user: object | null` - Current authenticated Supabase user.
- `profile: object | null` - Current `profiles` row for the authenticated user.
- `mode: string` - Current auth form mode: `'signin'` or `'signup'`.

`UserAuth` methods:

- `init()` -> `Promise<void>`
  - Reads the current auth session with `supabaseClient.auth.getSession()`.
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
    - calls `supabaseClient.auth.signUp(...)`
    - detects already-registered emails via empty `identities`
  - On sign-in:
    - calls `supabaseClient.auth.signInWithPassword(...)`
  - Writes inline success or error status to `#auth-error`.

- `signOut()` -> `Promise<void>`
  - Calls `supabaseClient.auth.signOut()`.

- `uploadAvatar(fileInput)` -> `Promise<void>`
  - Requires an authenticated user and a selected file.
  - Generates a temporary preview with `URL.createObjectURL(...)`.
  - Uploads the file to the `Reader` storage bucket with `upsert: true`.
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
