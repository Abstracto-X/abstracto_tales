# ADMIN PANEL — Architecture & CMS Operations

This document outlines the architecture, authentication security, global state, initialization flow, and advanced component paradigms of the administrative Content Management System (`admin.html`).

---

## 1. Purpose & Access Control

`admin.html` serves as the private administrative portal for content management, story publications, asset uploads, and moderation. Like the other apps, it is a single-file SPA built on vanilla HTML, CSS, and JS.

### Security Model:
- **Session-Based Authentication:** Leverages Supabase Auth. Upon successful login, it queries the database profiles to verify `role === 'admin'`. Access is blocked locally if this check fails.
- **Backend Database Protection:** Relies on Supabase Row Level Security (RLS) rules which check `public.is_admin()`. This ensures that even if local scripts are bypassed, write access is blocked at the database layer.

---

## 2. Global State Reference

Global states are organized within a dedicated `State` manager:

- `State` *(Object)* — Primary state container:
  - `user` *(Object | null)* — The active Supabase Auth session details.
  - `profile` *(Object | null)* — Profile columns fetched from the database, including the user's role.
  - `currentView` *(String)* — The active sidebar view identifier (e.g. `'dashboard'`, `'stories'`, `'mapRequests'`).
  - `stories` / `characters` / `lore` / `mapRequests` / `wallpapers` *(Array)* — Lists of queried database records used to populate dashboard tables.
  - `selectedStoryId` *(UUID | null)* — Story context filter used when managing chapters or gallery cards.
  - `selectedCharacterId` *(UUID | null)* — Character context filter used in gallery configurations.

---

## 3. Initialization Flow

Upon loading the Admin Panel, the page executes the following bootstrap sequence:

1. **`DOMContentLoaded` Event:**
   - **Auth Boot:** `Auth.init()` is triggered. To prevent a flash of the login screen for logged-in users, the lock overlay is hidden by default. The script runs `supabaseClient.auth.getSession()` to check for an active session. If found, it fetches the user profile; if not, it displays the login form.
   - **Real-time Session Syncing:** Subscribes to Supabase Auth state changes. This ensures that logging out or logging in on another tab automatically updates the active view.
   - **Visual Customizations:** Fetches and applies custom admin wallpaper backgrounds.
   - **Background Effects:** Starts the background floating particle canvas.
2. **Post-Authentication Dispatch (`Auth.showAdminView`):**
   - Populates user details (display name, profile avatar) in the sidebar.
   - Renders the primary dashboard view using `Views.render('dashboard')`.

---

## 4. Advanced Operational Paradigms

The Admin Panel utilizes several robust UI components to streamline content management:

### A. Drag-and-Drop Dropzone
- **Component:** Managed by `UI.imageUploadField` and `UI.initDragAndDrop`.
- **UX Features:** Replaces standard file inputs with a glassmorphic dropzone. Supports dragenter/dragover hover highlights, drag-and-drop file imports, local previews using the standard `FileReader` API, and pasting direct image URLs.

### B. Interactive Autocomplete Tagging
- **Components:** Built using `UI.initTagComponent` and `UI.initTagAutocomplete`.
- **Behavior:** Renders tag strings as deletable visual chips styled with deterministic HSL-themed colors. The autocomplete engine queries existing database tags, allowing admins to select tags using keyboard controls or enter custom tags.

### C. NSFW / R18 Content Categorization
- **Behavior:** Implements a visual toggle switch inside image upload forms. Saving an image with this toggle enabled programmatically appends a structural `NSFW` tag to the record's metadata. The Reader SPA uses this tag to filter content based on user preferences.

### D. Multi-File Sequential Upload Flow
- **Operation:** When uploading multiple media files, save routines (such as `Forms.saveGalleryImage`) sequentially upload files to Supabase Storage. It creates database records concurrently and provides progress feedback to prevent request timeouts.
