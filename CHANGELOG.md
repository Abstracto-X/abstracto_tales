# Changelog

All notable changes to this project will be documented in this file.
Agents MUST update this file whenever they complete a task or make significant updates, including the date, time, and a summary of the changes.

## [2026-06-02]
### Fixed
- 15:39 +05:30: Fixed `writer.html` Published Tree chapter creation by adding a direct live `chapters` insert path. The Published Tree Add Document action now creates an unpublished draft chapter with the next available chapter order, opens it in the writer, and supports publishing through the existing inspector status control. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.
- 15:29 +05:30: Hardened the ScribbleHub autosync fetch path by using browser-like request headers, logging whether `SCRIBBLEHUB_COOKIE` loaded, and stripping accidental wrapping quotes from `.env` values in `scripts/run_scribblehub_sync.ps1`.
- 15:22 +05:30: Added a `-Backfill` switch to `scripts/run_scribblehub_sync.ps1` so the PowerShell wrapper can load `.env` and pass `--backfill` through to the ScribbleHub autosync worker.

## [2026-05-29]
### Fixed
- 03:35 +05:30: Relaxed the manual `writer.html` Render Markdown guard so it works on the editor's current markdown-like text even after normal editing/formatting, instead of rejecting anything that is not a plain-text Quill Delta.
- 03:32 +05:30: Converted `writer.html` markdown rendering from automatic to manual. Removed text-change/load auto-render hooks, added a Render Markdown editor-header button plus `Ctrl+Shift+M`, and limited conversion to plain-text Quill documents so normal edits cannot trigger surprise re-rendering.
- 03:24 +05:30: Fixed `writer.html` markdown rendering so blank markdown lines are preserved as empty Quill paragraphs, keeping visible gaps between rendered paragraphs without reintroducing global paragraph-margin CSS.
- 03:19 +05:30: Removed the extra `writer.html` Quill paragraph margin CSS added during markdown rendering refinement, returning paragraph spacing to Quill's native behavior while keeping the markdown blob-regression guard.
- 03:16 +05:30: Fixed a `writer.html` markdown auto-render regression where editing/deleting lines in already-rendered documents could collapse the whole document into one text blob. Auto-render now only runs on plain-text Quill Deltas, and the markdown renderer preserves line-based paragraph breaks.
- 01:30 +05:30: Refined `writer.html` markdown rendering so markdown-like current editor text auto-renders after edits settle instead of relying on a paste-event hook. Saved plain-text Delta markdown now renders on document open. Updated writer docs and the performance report.
- 01:21 +05:30: Added native markdown detection/rendering to `writer.html` for LLM copy/paste workflows. Plain-text markdown pasted into Quill is converted to HTML without external libraries, raw markdown bodies are rendered on load when detected, and the writer performance report plus docs were updated.
- 01:15 +05:30: Added an explicit `writer.html` close-document flow for very large documents. The editor header now includes a close button, switching documents closes/unloads the current Quill content before opening the next node, cached full body content is released on close, split view/inspector/editor chrome reset, and the close path yields frames so the browser can settle between long-document teardown and mount. Updated writer docs and the performance report.
- 01:04 +05:30: Reduced `writer.html` long-document switching freezes by yielding a paint frame before large Quill content injection, suppressing programmatic-load text-change work, using a faster plain-text Delta load path, deferring full metrics scans to idle time, caching editor counts for target/session panels, and updating the active binder highlight without rebuilding the full tree. Updated the writer performance report and documentation.

## [2026-05-28]
### Fixed
- 03:28 +05:30: Applied the first `writer.html` performance and correctness pass: lightweight binder queries, lazy global-search body hydration, precomputed binder child indexes, serialized autosave revision guards, stale async node/link/search guards, batched Quill metrics updates, split-view rendering without throwaway Quill instances, and minor HTML escaping/link-search hardening. Added the applied-fixes log to `Internal_tools/performance_report_writer.md` and updated writer architecture/function documentation.

## [2026-05-27]
### Fixed
- 10:41 +05:30: Refined the `admin.html` gallery workspace so it now uses a single broad-view image board with a side toggle between published and unpublished collections instead of rendering both pools side by side. Also fixed gallery image saving by making the tag autocomplete render immediately and adding a resilient tag-value fallback, restoring the gallery tag system and preventing the `document.getElementById(...).value is null` save error. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.

## [2026-05-25]
### Added
- 23:21 +05:30: Added a standalone ScribbleHub chapter autosync worker at `scripts/scribblehub_autosync.js`, plus `.env.example`, Windows helper scripts (`scripts/run_scribblehub_sync.ps1`, `scripts/register_scribblehub_sync_task.ps1`), and a `npm run sync:scribblehub` entrypoint. The worker polls a ScribbleHub series feed/page for recent chapters, fetches unseen chapter bodies, and inserts them into the existing Supabase `chapters` table with a hidden provenance marker for idempotent re-syncs. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md` to document the new automation flow.

## [2026-05-26]
### Changed
- 22:11 +05:30: Rebuilt the `admin.html` gallery manager into a story-wide media workspace with search/filter controls, richer image cards, quick publish/hide actions, and a dedicated unpublished image pool. Gallery forms now support `is_published` state directly, the reader SPA now filters gallery queries to published images only, and `scripts/sql/2026-05-26_gallery_image_publish_state.sql` was added to introduce the new database column/index without changing your existing policies. Updated `docs/CODEBASE_ARCHITECTURE.md`, `docs/FUNCTION_INDEX.md`, `docs/DATABASE_CONTEXT.md`, and `docs/READER_API_MAP.md`.

### Fixed
- 14:54 +05:30: Added `--backfill` mode to the ScribbleHub autosync worker to crawl TOC pages (`?toc=N`), resequence `chapter_order`, and insert missing earlier chapters ahead of previously imported recent chapters (with mixed-chapter safety checks and dry-run = no writes).
- 14:42 +05:30: Updated the ScribbleHub autosync worker so `--dry-run` does not fetch chapter bodies, added fetch throttling via `SCRIBBLEHUB_FETCH_DELAY_MS`, and made sync passes skip individual chapter fetch/parse failures (like `403 Forbidden`) instead of aborting the entire run.
- 23:22 +05:30: Moved the public gallery R18 control into a shared gallery header and updated reader gallery ordering so enabling R18 reveals mature-tagged images first in both the recent-items feed and individual character galleries. `js/render.js` now renders the shared header toggle and removes the per-character R18 button, while `js/ui.js` centralizes mature-tag detection, ordering, latest-grid rerendering, and load-more consistency. Updated `docs/CODEBASE_ARCHITECTURE.md`, `docs/FUNCTION_INDEX.md`, and `docs/READER_API_MAP.md` to reflect the new behavior.
- 23:08 +05:30: Fixed the public gallery R18 visibility regression so mature-tagged images saved from `admin.html` no longer disappeared from reader gallery surfaces by default. This laid the groundwork for the later shared-header toggle refinement the same night.
- 22:47 +05:30: Hardened the reader SPA startup and route lifecycle against intermittent stuck-loader states. `js/main.js` now has a bootstrap watchdog and catches noncritical loader/auth/prefetch failures, `js/router.js` now time-boxes route rendering and guards synchronous cleanup failures, and `js/ui.js` now time-boxes dynamic loader imports with a direct primary-loader DOM cleanup fallback. Updated `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md` to reflect the new loader safety behavior.

## [2026-05-23]
### Added
- 11:45 +05:30: Added [`docs/READER_API_MAP.md`](docs/READER_API_MAP.md) with a dedicated API reference for `js/config.js`, `js/db.js`, and `js/auth.js`, covering exports, shared state, database touchpoints, side effects, and UI dependencies.

### Changed
- 12:00 +05:30: Rewrote `AGENTS.md` to match the current architecture, including the modularized `index.html` reader, the addition of `cartographer.html` as a primary application surface, and explicit instructions for using and maintaining `docs/READER_API_MAP.md`.
- Modularized `index.html` (the Reader SPA) into a clean HTML shell importing a unified `styles.css` and a modular ES6 JavaScript architecture located in the `js/` directory (`main.js`, `config.js`, `db.js`, `auth.js`, `router.js`, `render.js`, `ui.js`, `comments.js`, `maps/`).
- Fixed dynamic import pathways for modular loaders (`primary_loader` and `anomaly_loader`) to resolve correctly relative to `js/ui.js`.
- Created separate detailed architecture documentation for the modularized `index.html`.
- Completely rewrote and updated `docs_v2/reader/functions.md` with a comprehensive and highly-detailed mapping of all the new ES6 modules, functions, and objects.

## [2026-05-24]
### Fixed
- 22:18 +05:30: Fixed the reader router so direct `#gallery/...` loads no longer leave the primary cold-start loader stuck above the maturity advisory modal. `js/router.js` now releases the active loader even when the gallery warning intercepts routing before a gallery render begins, and the related reader documentation was updated in `docs/CODEBASE_ARCHITECTURE.md` and `docs/FUNCTION_INDEX.md`.

### Changed
- 22:22 +05:30: Updated `AGENTS.md` with a ChatGPT/Codex-specific `apply_patch` note explaining why literal patch matching can fail on changed or mis-encoded lines and documenting the safer workflow for creating small, exact hunks.
