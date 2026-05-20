# ADMIN PANEL — Function Index

This document provides a comprehensive index of the administrative functions, database operations, views, and UI helpers operating within the CMS Admin Panel (`admin.html`).

---

## 1. `Auth` (Administrative Access Control)
Manages admin sessions, lock screens, and roles validation.

- `init()`
  - **Description:** Entry point for admin auth. Checks for a restoring Supabase session, validates the user profile, and subscribes to auth state changes to synchronize views.
- `loadProfile()`
  - **Description:** Fetches the active user's profile and validates that `role === 'admin'`. If true, it returns `true` to display the admin dashboard; otherwise, it displays the login screen.
- `signIn(email, password)`
  - **Description:** Authenticates user credentials via Supabase `signInWithPassword`.
- `signOut()`
  - **Description:** Ends the active Supabase session and locks the admin dashboard.
- `showLoginView() / showAdminView()`
  - **Description:** Toggles between the glassmorphic login lock screen and the CMS admin dashboard.

---

## 2. `DB` (Supabase Data Access & CMS Mutators)
Operational database calls, storage file uploads, and modification ticket moderations.

- **Stories:**
  - `getStories()` — Queries all story entries regardless of publication status.
  - `saveStory(data)` — Upserts story rows (adds details, cover images, background banners, and theme colors).
  - `deleteStory(id)` — Deletes a story. Checks foreign key references first to prevent DB errors.
- **Chapters:**
  - `getChapters(storyId)` — Queries all chapter records for a story.
  - `saveChapter(data)` — Upserts chapter titles, orders, and body content.
  - `deleteChapter(id)` — Deletes a chapter.
- **Characters:**
  - `getCharacters(storyId)` — Queries characters mapped to a story.
  - `saveCharacter(data)` — Upserts character names, bio cards, and profile avatars.
  - `deleteCharacter(id)` — Deletes a character.
- **Lore:**
  - `getLoreCategories(storyId)` — Queries lore category items.
  - `saveLoreCategory(data)` — Upserts category details.
  - `getLoreEntries(categoryId)` — Queries lore entries under a category.
  - `saveLoreEntry(data)` — Upserts lore titles, summaries, and cover banners.
- **Timeline:**
  - `getTimelineEvents()` — Queries in-universe chronological events.
  - `saveTimelineEvent(data)` — Upserts event details and associates related characters.
  - `deleteTimelineEvent(id)` — Deletes a timeline event.
- **Media Assets:**
  - `getMaps()` — Queries map records.
  - `saveMap()` — Upserts map slugs, name labels, dimensions, and backgrounds.
  - `getWallpapers()` — Queries story wallpaper backgrounds.
  - `saveWallpaper()` — Upserts wallpaper assets.
  - `getGallery()` — Queries character art assets.
  - `saveGalleryImage()` — Upserts character illustrations and structural tags.
- **Map Revision Tickets:**
  - `getMapRequests()` — Queries submitted contributor map revision tickets.
  - `getRequestItems(reqId)` — Queries proposed coordinate additions, updates, or deletions inside a ticket.
  - `updateRequestStatus(reqId, status, feedback)` — Updates ticket statuses.
  - `deleteMapRequest(reqId)` — Deletes a request ticket.
  - `approveMapRequest(reqId)` — Approves proposed coordinate edits. Merges changes into the live nodes/edges tables and logs the actions to `map_changelog`.
- **System Configurations:**
  - `getSettings()` — Queries key-value settings.
  - `saveSettings(data)` — Upserts site settings.

---

## 3. `Utils` (Shared Utilities)
Operational file parsers, slug generators, and visual helpers.

- `uploadImage(file, bucket, folderPath)`
  - **Description:** Uploads files to a target public Supabase Storage bucket and returns the public file URL.
- `formatDate(dateString)`
  - **Description:** Formats raw Postgres timestamp strings into readable dates.
- `generateSlug(text)`
  - **Description:** Converts strings into URL-safe slugs for routing.
- `sanitizeHTML(html)`
  - **Description:** Sanitizes HTML input to prevent XSS vulnerability vectors.

---

## 4. `Forms` & `Modal` (CRUD Editors)
Builds dynamic modal forms, binds input fields, and triggers database saves.

- `Modal.open(title, htmlContent) / Modal.close()`
  - **Description:** Launches or hides the floating form editor modal.
- Form builders instantiate forms, pre-fill existing properties, and route submits:
  - `storyForm(storyObj)`
  - `chapterForm(chapterObj)`
  - `characterForm(characterObj)`
  - `loreCategoryForm(categoryObj)` / `loreEntryForm(entryObj)`
  - `timelineEventForm(eventObj)`
  - `mapForm(mapObj)` / `wallpaperForm(wallpaperObj)`
  - `viewMapRequest(reqId)` / `approveMapRequest(reqId)` / `rejectMapRequest(reqId)`
  - `settingsForm(settingsObj)`
  - `deleteConfirmForm(entityType, entityId, fallbackAction)`

---

## 5. `Views` (View Routing Controllers)
Swaps dashboard views, populates list tables, and manages operational counts.

- `render(viewName)`
  - **Description:** Handles sidebar navigation clicks, fetches the required view data, and loads the respective views.
- View renderers fetch data, check local states, and build database tables:
  - `dashboard()`, `stories()`, `chapters()`, `characters()`, `lore()`, `timeline()`, `maps()`, `mapRequests()`, `gallery()`, `wallpapers()`, `settings()`.

---

## 6. `UI` (Dashboard Interactive Elements)
Dropzone helpers, autocomplete tags, and previews.

- `imageUploadField(id, label, currentValue, bucketName, multiple)`
  - **Description:** Renders a modern dropzone form element supporting drag-and-drop file inputs, pasted URL links, and image previews.
- `handleFileSelection(input, listId, urlInputId)`
  - **Description:** Triggered on file selection. Uses `FileReader` to show image previews.
- `handleUrlInput(input, listId)`
  - **Description:** Handles pasted image URLs, showing an instant live preview or placeholder fallback.
- `clearPreviews(listId, urlInputId)`
  - **Description:** Clears image previews and resets their inputs.
- `initDragAndDrop(id)`
  - **Description:** Hooks drag-and-drop events onto a target dropzone.
- `initTagComponent(elementId, initialTags)`
  - **Description:** Converts text inputs into interactive visual chips styled with deterministic colors.
- `initTagAutocomplete(containerId, initialTags)`
  - **Description:** Advanced tagging input with autocompletion. Queries distinct database tags, offering keyboard selections for tags or custom token tags.
