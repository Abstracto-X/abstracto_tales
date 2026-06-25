# Background Sync & Helpers Functions

### CLI & Configuration
- `parseArgs(argv)` â€” Reads `--once`, `--dry-run`, and `--help` worker flags.
- `printHelp()` â€” Prints environment-variable requirements and worker usage.
- `getConfig()` â€” Validates env configuration for Supabase credentials, ScribbleHub series target, story target, polling interval, and publish mode.
- `requireEnv(name)` â€” Throws if a required environment variable is missing.

### ScribbleHub Discovery & Parsing
- `discoverRecentChapters(config)` â€” Attempts the ScribbleHub series RSS feed first, then falls back to scraping the series table-of-contents page for recent chapter links.
- `extractRecentChaptersFromFeed(xml, limit)` â€” Parses RSS `<item>` entries into recent chapter metadata.
- `extractRecentChaptersFromSeriesPage(html, limit)` â€” Extracts recent `/read/.../chapter/...` links from the series page when feed discovery is unavailable.
- `fetchChapterBody(entry, config)` â€” Downloads an individual chapter page and returns sanitized chapter text ready for insertion.
- `extractChapterHtml(rawHtml)` â€” Uses heuristic content-container matching (`#chp_raw`, `#chp_contents`, `.chapter-content`, etc.) before falling back to broad body extraction.
- `sanitizeImportedContent(html, sourceUrl)` â€” Converts scraped HTML into newline-preserving plain chapter text and prepends the invisible ScribbleHub provenance marker comment.

### Supabase Sync
- `getStoryRecord(supabase, config)` â€” Resolves the destination story by `STORY_ID` or `STORY_SLUG`.
- `getExistingChapters(supabase, storyId)` â€” Loads existing chapter titles, orders, and content for dedupe checks.
- `buildKnownChapterIndexes(existingChapters)` â€” Creates in-memory title and imported-source indexes so the worker only inserts unseen chapters.
- `insertChapter(supabase, storyId, record)` â€” Inserts a new `chapters` row and computes `word_count` for compatibility with existing admin/reader views.
- `runSync(config, options)` â€” Executes one import pass, ordering unseen ScribbleHub chapters oldest-to-newest so `chapter_order` remains sequential.

### Shared Helpers
- `normalizeSeriesUrl(url)` / `normalizeChapterUrl(url)` â€” Canonicalize ScribbleHub URLs for matching and dedupe.
- `buildRequestOptions(cookie)` / `fetchText(url, cookie)` â€” Centralize fetch headers and optional authenticated cookie support.
- `decodeHtmlEntities(text)` / `stripTags(html)` / `cleanWhitespace(value)` / `extractFirst(text, regex)` â€” Utility helpers used throughout the feed/page parser.
- `extractImportedSource(content)` â€” Reads the hidden `imported-from:scribblehub` marker from an existing chapter body so repeated sync passes stay idempotent.
- `main()` â€” Boots the worker, runs an immediate sync pass, and optionally enters continuous polling mode.

## 6. `scripts/run_scribblehub_sync.ps1` and `scripts/register_scribblehub_sync_task.ps1` (Windows Helpers)

### Runtime Bootstrap
- `run_scribblehub_sync.ps1` - Loads key/value pairs from the repo-local `.env`, exposes them to the current process, and launches the Node-based ScribbleHub autosync worker with optional `-Once`, `-DryRun`, and `-Backfill` switches.

### Scheduled Task Registration
- `register_scribblehub_sync_task.ps1` - Registers a Windows Scheduled Task named `AbstractoTales-ScribbleHubSync` by default, configured to launch the PowerShell runner hidden at user logon with basic auto-restart settings.

## 7. ScribbleHub Autosync Updates (Backfill)
- `scripts/scribblehub_autosync.js` now supports `--backfill` to crawl full ScribbleHub TOC pages (`?toc=N`), resequence `chapters.chapter_order`, and insert missing earlier chapters ahead of already-imported recent chapters.
- Additional env knobs: `SCRIBBLEHUB_TOC_PAGES_MAX`, `CHAPTER_ORDER_START`, and `ALLOW_MIXED_CHAPTERS`.
