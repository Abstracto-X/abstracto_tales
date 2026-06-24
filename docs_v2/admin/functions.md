# Admin Panel Functions

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
