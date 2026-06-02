# WRITER IDE — Function Index

This document provides a comprehensive index of the functions and handlers operating within the Author Writing IDE Single Page Application (`writer.html`).

---

## 1. Core IDE & State Management
Initializes systems, configures external assets, and registers operational hotkeys.

- `init()`
  - **Description:** Entry point for the IDE. Checks dependencies, hooks up Supabase, configures Quill editor nodes, binds events, applies custom theme tokens, fetches stories, and launches session metric timers.
- `initQuill()`
  - **Description:** Instantiates the Quill.js editor on `#editor-quill`. Registers custom fonts, sizes, line heights, and toolbar options.
- `bindEvents()`
  - **Description:** Binds DOM event listeners. Handles sidebar resizers, custom modal overlays, and essential keyboard hotkeys (such as `Ctrl+S` to save, `F11` for Focus Mode, and search panels).

---

## 2. `DB` (Supabase Data Access & Virtual Trees)
Fetches draft hierarchies, manages database saves, and virtualizes live published entities.

- `getStories()`
  - **Description:** Fetches available story rows to populate the top selection dropdown.
- `getNodes()`
  - **Description:** Fetches lightweight flat node metadata for the active story from the private `writer_nodes` tree table.
- `getPublishedNodes()`
  - **Description:** Asynchronously queries lightweight public database metadata (`chapters`, `characters`, `lore_entries`, and `timeline_events`), virtualizing it into folder/document node objects to show in the Binder tree view.
- `getSearchContent()`
  - **Description:** Lazily retrieves full body content for the active story/tree mode when global search needs content matching.
- `getNode(nodeId)`
  - **Description:** Fetches the text payload, snapshot histories, and detailed metadata columns for a specific node.
- `saveNode(nodeId, payload)`
  - **Description:** Saves content updates. Evaluates if the target node belongs to private drafts or virtualized published files, and writes to the correct table.
- `deleteNode(nodeId)`
  - **Description:** Deletes a node and all recursive sub-nodes (folder contents) from the database tree.
- `getLinks() / addLink() / removeLink()`
  - **Description:** Manages relational hyperlinks (`writer_node_links`) between world reference files.

---

## 3. Tree Rendering & Binder (Left Sidebar)
Builds recursive folders, updates active lists, and handles node sorting.

- `loadNodes()`
  - **Description:** Pulls lightweight node data from the database and triggers in-memory tree reconstruction.
- `buildNodeMap()`
  - **Description:** Converts flat database arrays into dictionary indexes (`state.nodeMap` and `state.childrenByParent`) for instant lookup by ID and parent.
- `getNodeChildren(parentId)`
  - **Description:** Retrieves pre-sorted children nodes belonging to a parent folder ID.
- `renderTree(filterText)`
  - **Description:** Traverses the node hierarchy recursively, generating nested list markup (`<ul>` and `<li>`) for the Binder panel.
- `updateTreeActiveSelection()`
  - **Description:** Moves the active Binder highlight in place after node switches without rebuilding the full tree.
- `renderTreeNode(node)`
  - **Description:** Renders individual tree list elements, attaching event handlers for click selection, folder expansion, dragging, and context menus.
- `toggleFolder(nodeId)`
  - **Description:** Expands or collapses a folder node in the Binder, saving the state in `expandedFolders`.

---

## 4. Editor Logic (Center Canvas)
Handles document loading, debounced auto-saves, and split-view reference panels.

- `openNode(nodeId)`
  - **Description:** Loads a selected node. Auto-saves the active draft first, loads the new content, configures editing locks, populates properties inspectors, and ignores stale async responses after rapid navigation.
- `scheduleSave() / saveCurrentNode()`
  - **Description:** Automates draft saves. Serializes writes, checks editor revision state, and schedules debounced Supabase writes without letting older saves clear newer edits.
- `closeActiveDocument(options) / unloadEditorContent()`
  - **Description:** Saves when needed, closes the current document, clears Quill's large content DOM, hides editor UI, and yields frames before another document opens.
- `loadNodeContentIntoEditor(node)`
  - **Description:** Inspects document contents (Quill JSON Delta vs raw HTML) and populates the canvas.
- `isPlainTextDelta(delta) / waitForNextFrame()`
  - **Description:** Speeds up plain-text Delta loading and yields a browser paint frame before large document injection.
- `isLikelyMarkdown(text) / markdownToHTML(markdown) / renderCurrentMarkdown()`
  - **Description:** Detects markdown-like current editor text, converts common markdown syntax to safe HTML while preserving line-based paragraph breaks and blank markdown lines, and inserts it through Quill when the user invokes Render Markdown.
- `renderNodeContentInSplitView(node)`
  - **Description:** Loads a secondary node as read-only in the split-view panel for reference while writing without creating throwaway Quill instances.
- `clearActiveSelection()`
  - **Description:** Clears the editor canvas and displays placeholder illustrations when no document is active.

---

## 5. Inspector & Properties (Right Sidebar)
Tracks document metadata, saves settings, and manages draft snapshots.

- `loadInspector(node)`
  - **Description:** Renders fields in the right sidebar (target word goals, summaries, status indicators, and snaps) tailored to the active node type.
- `saveInspectorField(field, value)`
  - **Description:** Saves updates made to inspector inputs (e.g. status tags or targets) directly back to the database.
- `getInspectorConfig(node)`
  - **Description:** Return disabled or visible states for property fields depending on whether the node is a private draft or a virtualized live record.
- `renderSnapshots(node) / takeSnapshot(name) / restoreSnapshot(snap)`
  - **Description:** Custom version control engine. Saves current Quill deltas as named snapshots in the node's JSONB metadata column, and handles rolling back.

---

## 6. Metrics & Utilities
Calculates real-time statistics, session speeds, and manages visual themes.

- `countWords(text)`
  - **Description:** Performs word counts on raw editor text.
- `updateCounts()`
  - **Description:** Fires on Quill text changes to update total word counts, target progress percentages, and footer readouts.
- `startSessionTimer() / updateSessionStats()`
  - **Description:** Updates active session times, calculates Words-Per-Minute, and displays active writing session metrics.
- `setTheme(themeName)`
  - **Description:** Injects visual variables and updates CSS root variables to apply the selected visual theme.
- `toggleFocusMode() / toggleTypewriterMode()`
  - **Description:** Adjusts active editor layout classes, centering views or hiding workspace side panels.
- `performSearchAll(query)`
  - **Description:** Launches a global full-text search across all loaded node drafts.

---

## 7. Context Menus & Actions
Manages binder operations, folder additions, and file duplications.

- `showContextMenu(e, nodeId) / hideContextMenu()`
  - **Description:** Positions and overlays custom right-click menus on binder nodes.
- `handleContextAction(action)`
  - **Description:** Routes context menu selections to specific operations (such as Rename, Duplicate, or Move).
- `createNode(type, parentId)`
  - **Description:** Spawns a new file/folder node under a parent folder.
- `duplicateNode(nodeId)`
  - **Description:** Clones an existing node's content, summaries, and properties under a new title.
- `renameNode(nodeId, newTitle)`
  - **Description:** Updates a node's display title in the database.
