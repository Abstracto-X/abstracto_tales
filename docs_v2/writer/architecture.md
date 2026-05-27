# WRITER IDE — Architecture & Editor System

This document outlines the architecture, global state management, initialization flow, and hierarchical content tree structure of the Author Writing IDE (`writer.html`).

---

## 1. Purpose & Core Features

`writer.html` is a distraction-free, rich-text writing environment (IDE) tailored specifically for drafting and compiling story universes. Like other components, it is a single-file SPA built on vanilla HTML, CSS, and JS, featuring direct Supabase integration.

### Core Features:
- **Distraction-Free Workspace:** Minimalistic design offering a split-panel interface. Includes toggles for Focus Mode (hiding side panels) and Typewriter Scrolling (locking the cursor in the vertical center of the editor).
- **Rich Text Editor:** Integrated Quill.js editor that dynamically processes content, tracking word counts, session stats, and real-time writing speeds.
- **Hierarchical Binder (Document Tree):** An interactive left-sidebar tree representing folders, drafts, location notes, and character reference profiles.
- **Hallway Illumination Engine:** The editor pane features a visual illumination effect that grows brighter as the writer approaches their custom word targets.
- **Local Version Snapshots:** A lightweight, metadata-stored version control system that allows writers to save and restore historical document drafts locally.
- **Split-View Editing:** Allows writers to open a read-only node (e.g. world lore or character references) in a secondary panel for reference while writing.

---

## 2. Global State Reference

The IDE encapsulates state in a unified `state` manager and global context variables:

- `supabase` *(Object)* — Holds the initialized Supabase client instance.
- `currentStoryId` *(UUID | null)* — The ID of the story currently being edited. Initialized from URL query parameters (`?story_id=`) or standard workspace selects.
- `state` *(Object)* — Main state engine:
  - `treeMode` *(String)* — Toggle between `'workspace'` (draft folders and notes) and `'published'` (live story elements like chapters).
  - `nodes` *(Array)* — flat array representing tree elements for the active `treeMode`.
  - `nodeMap` *(Object)* — Dictionary mapping node IDs to node objects for immediate O(1) lookups.
  - `activeNodeId` *(UUID | null)* — The ID of the node currently loaded in the active editor.
  - `expandedFolders` *(Set)* — Set of folder UUIDs currently expanded in the binder tree view. Persisted in `localStorage`.
  - `bookmarks` *(Set)* — Collection of flagged node UUIDs.
  - `childrenByParent` *(Object)* — Precomputed binder-tree child index used to avoid repeated full-array scans during recursive rendering.
  - `isDirty` *(Boolean)* — Tracks whether there are unsaved editor changes. Governs auto-saves and navigation warning prompts.
  - `editorChangeRevision` / async request tokens *(Number)* — Guard autosaves, node loads, inspector link renders, and global search against stale async completions.
  - `quill` *(Object)* — The Quill rich-text editor instance.
  - `currentTheme` *(String)* — Name of the active visual theme (e.g. Amber Glow, Solarized Dark). Persisted in `localStorage`.
  - `sessionStartWords` / `sessionStartTime` *(Number)* — word and time markers used to calculate session metrics.

---

## 3. Initialization Flow

Upon loading the Writer IDE, the page executes the following IIFE bootstrap process:

1. **IIIFE Launch (`init()`):**
   - **Environment Verification:** Validates that `Quill` and `window.supabase` are loaded via CDN.
   - **Client Bootstrap:** Initializes the Supabase client using the global anon key.
   - **Quill Setup:** `initQuill()` configures the editor toolbar and registers custom font and layout elements.
   - **Listener Bindings:** `bindEvents()` registers keyboard shortcuts (Ctrl+S, Focus Mode keys), sidebar resizers, and popup controllers.
   - **Visual Theme Selection:** Recovers saved visual themes from `localStorage` and injects theme classes onto the document root.
   - **Story Lookup:** Queries available stories via Supabase and populates the top dropdown, defaulting to the URL parameters if present.
   - **Tree Builder:** `loadNodes()` fetches lightweight node metadata for the selected story, indexes nodes by ID and parent ID, and renders the left binder tree. Full bodies are loaded on node open or on-demand global search.
   - **Session Metric Init:** Records baseline word counts and start times, launching interval timers to update statistics.

---

## 4. The Hierarchical Content Tree (Binder)

The left-hand Binder represents a hierarchical filesystem built on top of a single database table (`writer_nodes`).

### Technical Structure:
- **Recursive DB Mapping:** Tree nodes are stored in a flat database table where each node has a nullable `parent_id` linking back to its parent folder node. Root nodes have `parent_id = NULL`.
- **Tree Reconstruction:** The application fetches the flat array of nodes in a single select query. It then builds a lookup map in-memory and recursively parses child elements based on `parent_id` connections.
- **Node Types:** Mapped through the Postgres ENUM `node_type_enum`:
  - `folder` — Container node (can visually expand/collapse).
  - `document` / `note` — Text-based files containing Quill Delta data.
  - `character` / `location` / `item` — World-building reference cards.
  - `trash` — Isolated nodes pending deletion.

### Workspace vs. Published Modes:
- **Workspace Tree:** Private drafts, outlines, folders, and notes managed in the `writer_nodes` recursive table.
- **Published Tree:** Virtual nodes mapped to live tables (`chapters`, `characters`, `lore_entries`, `timeline_events`). When opened, the inspector handles saving edits back to their respective public tables instead of `writer_nodes`.

---

## 5. Security & Access Conventions

Unlike the Admin and Reader SPAs, the Writer IDE does not implement explicit client-side auth checks.
- **Implicit Session Sharing:** The IDE relies on the active admin session cookie established in `admin.html`.
- **Backend Protection:** The Supabase RLS policy requires users to be authenticated (`auth.role() = 'authenticated'`). Any logged-in user can query the tables, ensuring easy access for collaborative writing teams while preventing public read/write access.
