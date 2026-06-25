# Shared Conventions

### Initialization & Auth Pattern
Across all three files, Supabase is initialized via the CDN script: `window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` with a generic public anon key.

The authentication pattern is strictly **Session-Based**:
- **`index.html`**: Users log in (`signInWithPassword`) or register. Their session cookie determines permissions (e.g., leaving comments, liking gallery images).
- **`admin.html`**: Enforces strict role-based access control. Upon gaining a session, it queries `profiles` to check if `role === 'admin'`. If not, access isn't granted locally. `admin.html` relies on Supabase Row Level Security (RLS) to physically protect data on the backend.
- **`writer.html`**: Doesn't explicitly check or manage auth, implicitly relying on the active session cookie established by `admin.html` allowing the DB queries to pass RLS.
- **`cartographer.html`**: Enforces role-based access control, accepting `role IN ('cartographer', 'admin')`. It now uses the shared `maps` table as the parent source for hub/editor records, alongside `map_nodes`, `map_edges`, and `map_changelog` for topology/editor data.

### Database Query Conventions
In all files, Supabase data access is encapsulated in module objects (`DB` object).
- **`DB` Object Wrapper**: Supabase `.from()` calls are grouped into asynchronous methods (e.g., `DB.getStories()`, `DB.saveStory()`).
- **CRUD Operations**: Rigorously follows the standard `.select()`, `.insert()`, `.update()`, `.delete()` chain using `.eq('id', ...)` for targeting records.
- **Batched Queries**: Uses `.in('column', [...ids])` for bulk lookups (e.g., timeline character links) to avoid N+1 query waterfalls.
- **Client-Side Caching**: `Cache` implements TTL (5-min expiry) + LRU (5-entry cap) for story hub data. Stories and author profiles are also cached with TTL timestamps.
- **Error Handling**: Database calls throw errors that are caught by UI or form functions, utilizing a centralized `toast(message, 'error')` or `UI.showToast()` to alert the user.
- **Relationships**: Relational queries pull nested sub-records (e.g., `lore_entries(..., lore_categories(id, name))`) to avoid N+1 queries.

### Operational Worker Conventions
- **Service-role only for offline tooling:** `scripts/scribblehub_autosync.js` runs outside the browser and must use `SUPABASE_SERVICE_ROLE_KEY` from the environment instead of any client publishable key.
- **No schema fork:** The worker writes directly into `public.chapters`, preserving the existing reader/admin/writer flows instead of introducing a separate import table.
- **Import provenance marker:** Imported chapter bodies begin with an HTML comment marker in the format `<!-- imported-from:scribblehub {chapterUrl} -->`. This keeps the source URL attached to the chapter for idempotent sync checks while staying invisible in the reader render.
- **Recent-window polling:** The worker inspects the most recent ScribbleHub entries (default 15) so it can run continuously on a local machine or scheduler without needing a full historical crawl every pass.
- **Fetch throttling and skips:** The worker rate-limits chapter fetches by a small delay and skips individual chapters that fail to fetch/parse (e.g., `403 Forbidden` due to R18/login gating) so a single blocked page does not abort the whole sync pass.
- **Full backfill + resequencing:** When run with `--backfill`, the worker crawls the ScribbleHub series TOC pages (`?toc=N`), sorts chapters oldest-to-newest, then resequences `chapters.chapter_order` for already-imported ScribbleHub chapters and inserts any missing earlier chapters before the newer ones. This path is designed specifically for "import the last few chapters first, then backfill everything earlier" without losing ordering.
- **Parallel Image Downloader:** `scripts/download_timeline_images.py` downloads all external event-linked image URLs mapped in `data/timeline/page_image_lookup.json`. It runs multi-threaded (default 16 workers), sanitizes filenames/directories, organizes files into a nested directory structure (`data/timeline/downloaded_images/Era/Sub-Era/`), and displays a live terminal progress bar using standard output.


### Storage Conventions
Media assets are managed using Supabase Storage buckets.
- **Immutable upload paths:** New application-managed image uploads use unique timestamp/randomized names and `cacheControl: '31536000'`. Upload helpers retain a short-cache branch for any future intentional `upsert`/stable-path replacement so immutable caching is not applied to mutable objects.
- **Admin image optimization:** `admin.html` converts ordinary PNG/JPG/JPEG cover, background, character, gallery, lore, wallpaper, icon, and avatar uploads to bounded WebP files in the browser when conversion succeeds and is smaller/useful. GIF/WebP/unknown formats pass through untouched, and decode/canvas failures fall back to the original file.
- **Reader avatar optimization:** `js/auth.js` applies the same fail-safe pattern with a 1024px bound before writing uniquely named files to the `Reader` bucket.
- **Map fidelity boundary:** Map uploads in `admin.html` and `cartographer.html` preserve the original file bytes and dimensions instead of applying lossy conversion because coordinate alignment, pixel sampling, and OCR depend on the source image. They still receive immutable cache metadata when newly uploaded.
- **Existing objects:** Cache metadata and file encoding changes apply only to new uploads; existing Supabase Storage objects are not rewritten retroactively.

### Image Delivery Conventions
- Above-the-fold story covers, featured gallery art, lore-detail art, and active reader maps remain eager and may use high fetch priority.
- Offscreen reader/admin/cartographer thumbnails use native lazy loading, asynchronous decoding, and low fetch priority where appropriate.
- `UI.setBg()` and the gallery lightbox avoid reassigning an unchanged URL, preventing needless CSS/image reload or revalidation work.
- `cartographer.html` reuses the existing Leaflet base-image overlay when reloading the same map with unchanged dimensions, while still rebuilding topology layers.
