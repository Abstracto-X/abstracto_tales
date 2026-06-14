# Writer IDE Functions

### Core IDE & State Management
- `init()` — Bootstraps Quill, Supabase, listeners, and triggers initial data loads.
- `initQuill()` — Initializes the Quill.js rich text editor on the canvas.
- `bindEvents()` — Binds hotkeys (Ctrl+S, F11, etc.), modal overlays, and button clicks.

### `DB` (Supabase Data Access)
- `getStories()` — Populates the header dropdown to switch workspace contexts.
- `getNodes()` — Retrieves lightweight draft node metadata from the `writer_nodes` tree table without full document bodies.
- `getPublishedNodes()` — Synthesizes a lightweight virtual tree array from live `chapters`, `characters`, `lore`, and `timeline` tables.
- `createPublishedChapter()` — Inserts a new draft row into the live `chapters` table from the Published Tree, assigning the next available `chapter_order` for the active story.
- `getSearchContent()` — Lazily fetches full body fields for the active story/tree mode when global search needs content matching.
- `getNode(nodeId)` — Fetches the full content/body of a specific node asynchronously.
- `saveNode(nodeId, payload)` — Updates or inserts a node. Handles polymorphic saving (identifies if it's a draft node or a live table record).
- `deleteNode(nodeId)` — Purges a node from the DB.
- `getLinks() / addLink() / removeLink()` — Manages bidirectional hyperlinks between internal workspace nodes.

### Tree Rendering & Binder (Left Sidebar)
- `loadNodes()` — Fetches data via `DB` and triggers tree recreation.
- `buildNodeMap()` — Converts the flat array of node records into quick-access `state.nodeMap` and `state.childrenByParent` indexes.
- `getNodeChildren(parentId)` — Reads pre-sorted child arrays from `state.childrenByParent` while traversing the hierarchical tree structure.
- `renderTree(filterText)` — Recursively generates the HTML `<ul>`/`<li>` structure for the binder.
- `updateTreeActiveSelection()` — Moves the active binder highlight in place after document switches without rebuilding the entire tree.
- `renderTreeNode(node)` — Creates an individual tree item, attaching expanding, dragging, and context menu behaviors.
- `toggleFolder(nodeId)` — Expands/collapses sub-trees in the UI.

### Editor Logic (Center Canvas)
- `openNode(nodeId)` — The primary function for clicking a document: handles saving the old node, loading the new one, checking edit permissions, refreshing the inspector, and ignoring stale async loads after rapid navigation.
- `scheduleSave() / saveCurrentNode()` — Debounced auto-save mechanics that serialize Supabase writes and use editor revision checks so in-flight saves cannot mark newer edits as saved.
- `closeActiveDocument(options)` / `unloadEditorContent()` — Saves when needed, clears the active document, releases Quill's current content, hides editor UI, and yields frames before another large document opens.
- `loadNodeContentIntoEditor(node)` — Determines if the content is a Quill Delta JSON or raw HTML, and configures the editor gracefully.
- `isPlainTextDelta(delta)` / `waitForNextFrame()` — Helpers for faster plain-text Delta loading and yielding a browser paint frame before large document injection.
- `isLikelyMarkdown(text)` / `markdownToHTML(markdown)` / `markdownInlineToHTML(value)` / `renderCurrentMarkdown()` — Native markdown detection and manual rendering helpers for markdown-like current editor text, preserving line-based paragraph breaks and blank markdown lines as empty Quill paragraphs.
- `renderNodeContentInSplitView(node)` — Renders a read-only secondary view for cross-referencing without creating throwaway Quill instances.
- `clearActiveSelection()` — Resets the editor canvas to the empty/placeholder state.

### Inspector & Properties (Right Sidebar)
- `loadInspector(node)` — Populates the right panel fields (type, status, target, synopsis, image, notes) based on the active node's context.
- `saveInspectorField(field, value)` — Immediate auto-save handler for inspector input changes.
- `getInspectorConfig(node)` — Determines which inspector fields are enabled/disabled depending on whether the node is a draft or a published entity.
- `renderSnapshots(node) / takeSnapshot(name) / restoreSnapshot(snap)` — Handles the localized version control system array stored in node metadata.

### Metrics & Utilities
- `countWords(text)` — Simple whitespace-delimited word counter.
- `scheduleEditorMetricsUpdate()` / `applyEditorStats()` / `applyNodeStats()` / `updateCounts()` — Batches Quill text-change metrics, caches counts for long documents, and shows metadata counts immediately while full metrics calculate later.
- `startSessionTimer() / updateSessionStats()` — Calculates Words-Per-Minute and overall session duration.
- `setTheme(themeName)` — Injects the selected UI theme class onto the root body.
- `toggleFocusMode() / toggleTypewriterMode()` — Adjusts CSS bounds to hide sidebars or auto-scroll the editor to the center.
- `hydrateSearchContent()` / `performSearchAll(query)` — Global `Ctrl+Shift+F` full-text search that lazily hydrates body content for the active story/tree mode before matching.
### Context Menus & Actions
- `showContextMenu(e, nodeId) / hideContextMenu()` — Manages the custom right-click floating menu.
- `handleContextAction(action)` — Dispatches menu clicks to node operations.
- `createNode(type, parentId)` — Generates a new file/folder placeholder.
- `createPublishedChapter()` — Creates and opens a live unpublished chapter when the Published Tree is active, enabling direct chapter drafting/publishing from `writer.html`.
- `duplicateNode(nodeId)` — Clones an existing node and its content.
- `renameNode(nodeId, newTitle)` — Prompts and saves a title change.

---
