# DATABASE CONTEXT â€” AI Agent Reference

> **Purpose:** This document provides complete context for any AI agent working with this Supabase PostgreSQL database. It covers schema, relationships, RLS policies, storage buckets, enums, triggers, and architectural notes.

---

## 1. PLATFORM & ARCHITECTURE

- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (`auth.users` table managed by Supabase)
- **Storage:** Supabase Storage (public buckets)
- **Schema:** `public` (all application tables live here)
- **Security Model:** Row Level Security (RLS) enabled on all tables
- **Role System:** Three roles â€” `admin`, `cartographer`, and `reader` (stored in `public.profiles.role`)
- **Admin check:** The `public.is_admin()` helper function is used in all write policies
- **New User Flow:** Every new Supabase Auth user automatically gets a `public.profiles` row created via the `on_auth_user_created` trigger. New users are assigned the `reader` role by default. Admin role must be granted manually via SQL.

---

## 2. ENUM TYPES

```sql
CREATE TYPE node_type_enum AS ENUM (
  'folder',
  'document',
  'note',
  'trash',
  'character',
  'location',
  'item'
);
```

Used by: `writer_nodes.type`

---

## 3. DATABASE SCHEMA

### 3.1 `public.profiles`

Extends `auth.users`. One row per authenticated user.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users(id)` |
| `username` | TEXT UNIQUE | Auto-generated on signup as `emailPrefix_first4charsOfUUID` |
| `display_name` | TEXT | Auto-generated on signup as email prefix |
| `avatar_url` | TEXT | |
| `bio` | TEXT | |
| `role` | TEXT | `'reader'` (default), `'cartographer'`, or `'admin'` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key notes:**
- This table is the source of truth for roles. To promote a user to admin, run: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user_uuid>';`
- The `is_admin()` function queries this table using `auth.uid()`

---

### 3.2 `public.author_links`

Social/external links for the author profile page.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `profile_id` | UUID | FK â†’ `profiles(id)` CASCADE DELETE |
| `platform_name` | TEXT | e.g. "Twitter", "Patreon" |
| `url` | TEXT | |
| `icon_url` | TEXT | Optional icon image |
| `note` | TEXT | Optional display note |
| `sort_order` | INTEGER | Default 0, used for ordering |

---

### 3.3 `public.site_settings`

Key-value store for global site configuration.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `setting_key` | TEXT UNIQUE | Identifier for the setting |
| `setting_value` | JSONB | Flexible value storage |

---

### 3.4 `public.stories`

Top-level story/series entries.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `slug` | TEXT UNIQUE | URL-safe identifier |
| `title` | TEXT | |
| `short_description` | TEXT | |
| `synopsis` | TEXT | Long-form description |
| `genre` | TEXT | |
| `status` | TEXT | e.g. "ongoing", "complete" |
| `cover_image_url` | TEXT | From `covers` storage bucket |
| `background_image_url` | TEXT | From `backgrounds` storage bucket |
| `theme_color` | TEXT | Hex color, default `'#ffd700'` |
| `loader_theme` | TEXT | Custom loader theme (e.g. `'lightsaber'`, `'primary'`, `'anomaly_flesh'`, `'anomaly_hex'`, `'anomaly_cyber'`, `'anomaly_kinetic'`, `'anomaly_crystal'`), default `'lightsaber'` |
| `world_title` | TEXT | Name of the story's world |
| `sort_order` | INTEGER | Default 0 |
| `is_published` | BOOLEAN | Default FALSE. Controls public visibility |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key notes:**
- Public readers can only see rows where `is_published = TRUE`
- Admins can see and modify all rows regardless of publish status

---

### 3.5 `public.chapters`

Individual chapters belonging to a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `title` | TEXT | |
| `content` | TEXT | Full chapter body text |
| `chapter_order` | INTEGER | Ordering within story. Unique per story |
| `word_count` | INTEGER | Default 0 |
| `is_published` | BOOLEAN | Default FALSE. Controls public visibility |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Constraint:** `UNIQUE(story_id, chapter_order)` â€” no two chapters in the same story can have the same order value.

---

### 3.6 `public.characters`

Characters belonging to a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `name` | TEXT | |
| `role_title` | TEXT | e.g. "Protagonist", "Antagonist" |
| `biography` | TEXT | |
| `profile_image_url` | TEXT | From `characters` storage bucket |
| `sort_order` | INTEGER | Default 0 |
| `created_at` | TIMESTAMPTZ | |

---

### 3.7 `public.character_gallery_images`

Gallery images for individual characters.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `character_id` | UUID | FK â†’ `characters(id)` CASCADE DELETE |
| `image_url` | TEXT | From `characters` storage bucket |
| `caption` | TEXT | |
| `image_tags` | TEXT[] | Default `'{}'` (empty array) |
| `is_published` | BOOLEAN | Default TRUE. Controls whether the image should render in reader gallery surfaces; hidden images can still remain database-readable under your existing policies |
| `sort_order` | INTEGER | Default 0 |
| `created_at` | TIMESTAMPTZ | |

---

### 3.8 `public.image_votes`

Upvote/downvote system for character gallery images.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK â†’ `profiles(id)` CASCADE DELETE |
| `image_id` | UUID | FK â†’ `character_gallery_images(id)` CASCADE DELETE |
| `vote_value` | INTEGER | Must be exactly `1` or `-1` (CHECK constraint) |
| `created_at` | TIMESTAMPTZ | |

**Constraint:** `UNIQUE(user_id, image_id)` â€” one vote per user per image (upsert to change vote).

---

### 3.9 `public.story_wallpapers`

Downloadable wallpapers associated with a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `image_url` | TEXT | From `characters` or other storage bucket |
| `label` | TEXT | Display label |
| `sort_order` | INTEGER | Default 0 |
| `created_at` | TIMESTAMPTZ | |

---

### 3.10 `public.lore_categories`

Categories for grouping lore entries within a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `name` | TEXT | Display name |
| `slug` | TEXT | URL-safe identifier |
| `sort_order` | INTEGER | Default 0 |

**Constraint:** `UNIQUE(story_id, slug)` â€” slugs are unique within a story.

---

### 3.11 `public.lore_entries`

Individual lore/world-building entries.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `slug` | TEXT | URL-safe identifier |
| `title` | TEXT | |
| `category_id` | UUID | FK â†’ `lore_categories(id)` SET NULL on delete |
| `description` | TEXT | |
| `image_url` | TEXT | From `lore` storage bucket |
| `sort_order` | INTEGER | Default 0 |
| `created_at` | TIMESTAMPTZ | |

---

### 3.12 `public.timeline_events`

In-universe timeline events for a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `event_date` | TEXT | In-universe date string (not a real date type) |
| `title` | TEXT | |
| `description` | TEXT | |
| `event_order` | INTEGER | Controls display order |
| `created_at` | TIMESTAMPTZ | |

---

### 3.13 `public.timeline_event_characters`

Join table linking characters to timeline events (many-to-many).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `event_id` | UUID | FK â†’ `timeline_events(id)` CASCADE DELETE |
| `character_id` | UUID | FK â†’ `characters(id)` CASCADE DELETE |

---

### 3.14 `public.maps`

Map images associated with a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `slug` | TEXT UNIQUE | URL-safe identifier for the cartographer tool |
| `map_name` | TEXT | |
| `image_url` | TEXT | From `maps` storage bucket |
| `is_primary` | BOOLEAN | Default FALSE |
| `width` | INTEGER | Cartographer coordinate width. Default `4000` |
| `height` | INTEGER | Cartographer coordinate height. Default `4000` |
| `is_published` | BOOLEAN | Default FALSE. Controls public visibility of the interactive map |
| `sort_order` | INTEGER | Default 0 |
| `map_type` | TEXT | One of: `galactic`, `regional`, `local`. Default `'galactic'` |
| `created_by` | UUID | FK â†’ `profiles(id)`. Identifies the original map creator |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key notes:**
- This is the canonical parent table for both reader-facing maps and `cartographer.html`.
- `story_id` should be treated as required for cartographer-created maps so they appear in the main Reader/Admin flows.
- `width` and `height` are required by the cartographer editor to restore the correct coordinate space for uploaded maps.
- The advanced route demo in `index.html` can still consume a separate high-fidelity static JSON file at `/data/map_project.json`.

---

### 3.15 `public.comments`

Reader comments on chapters, lore entries, gallery images, etc.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK â†’ `profiles(id)` CASCADE DELETE |
| `target_id` | UUID | ID of the thing being commented on |
| `target_type` | TEXT | e.g. `'chapter'`, `'lore'`, `'gallery'` |
| `content` | TEXT | Comment body |
| `referenced_image_url` | TEXT | Optional, for gallery comments |
| `metadata` | JSONB | Default `'{}'`. Used for paragraph IDs, image context, etc. |
| `created_at` | TIMESTAMPTZ | |

**Key note:** `target_id` + `target_type` is a polymorphic reference â€” not a hard FK. Filter by both fields when querying.

---

### 3.16 `public.writer_nodes`

File-tree nodes for an internal Writer IDE (private authoring tool).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK â†’ `stories(id)` CASCADE DELETE |
| `parent_id` | UUID | Self-referencing FK â†’ `writer_nodes(id)` CASCADE DELETE |
| `title` | TEXT | Default `'New Document'` |
| `content` | TEXT | Document body |
| `type` | node_type_enum | `folder`, `document`, `note`, `trash`, `character`, `location`, `item` |
| `status` | TEXT | Default `'outline'`. e.g. `'draft'`, `'final'` |
| `sort_order` | INTEGER | Default 0 |
| `word_count` | INTEGER | Default 0 |
| `image_url` | TEXT | Optional image for world-building nodes |
| `metadata` | JSONB | Default `'{}'`. Flexible extra data |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Key note:** This is a recursive tree structure. Root nodes have `parent_id = NULL`. Folders contain documents; documents can contain notes.

---

### 3.17 `public.writer_node_links`

Relational links between writer nodes (e.g. a character referenced in a location doc).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `source_node_id` | UUID | FK â†’ `writer_nodes(id)` CASCADE DELETE |
| `target_node_id` | UUID | FK â†’ `writer_nodes(id)` CASCADE DELETE |
| `link_type` | TEXT | e.g. `'mentions'`, `'related'`, `'appears_in'` |
| `created_at` | TIMESTAMPTZ | |

**Constraint:** `UNIQUE(source_node_id, target_node_id, link_type)`

---

### 3.18 `public.map_requests`

Handles map change requests submitted by contributors.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `map_id` | UUID | FK â†’ `maps(id)` CASCADE DELETE. Nullable for "New Map" proposals. |
| `user_id` | UUID | FK â†’ `profiles(id)` CASCADE DELETE |
| `title` | TEXT | Title of the request |
| `reason` | TEXT | Justification for the request |
| `status` | TEXT | `pending`, `approved`, `rejected`, `conflict` |
| `feedback` | TEXT | Admin feedback |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 3.19 `public.map_request_items`

Tracks individual changes within a map request.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `request_id` | UUID | FK â†’ `map_requests(id)` CASCADE DELETE |
| `action` | TEXT | `ADD`, `UPDATE`, `DELETE` |
| `entity_type` | TEXT | `NODE`, `EDGE`, `MAP` |
| `entity_id` | UUID | ID of the affected entity |
| `proposed_data` | JSONB | Details of the proposed change |
| `created_at` | TIMESTAMPTZ | |

### Row Level Security (RLS) Policies

#### `map_requests`
- **Admins:** Full access.
- **Contributors:** Can read and insert their own requests.
- **Cartographers:** Can see any Request Ticket linked to a map they have access to.

#### `map_request_items`
- **Admins:** Full access.
- **Contributors:** Can read and insert items linked to their own requests.
- **Cartographers:** Can see the specific items/data inside tickets linked to maps they have access to.

---

## 4. FUNCTIONS & TRIGGERS

### `public.is_admin()` â†’ BOOLEAN
```sql
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin'
);
```
- SECURITY DEFINER, STABLE
- Used in all admin RLS policies
- Returns `TRUE` only if the calling user's profile has `role = 'admin'`

---

### `public.handle_new_user()` (Trigger Function)
- Fires `AFTER INSERT ON auth.users`
- Creates a `public.profiles` row for every new signup
- Assigns `role = 'reader'` by default
- Sets `username` = `emailPrefix_first4charsOfUUID`
- Sets `display_name` = email prefix
- Uses `ON CONFLICT (id) DO NOTHING` to prevent duplicate errors

---

### `public.update_timestamp()` (Trigger Function)
- Sets `updated_at = NOW()` on `BEFORE UPDATE`
- Applied to: `profiles`, `stories`, `chapters`

---

### Triggers Summary

| Trigger | Table | Event | Function |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |
| `set_profiles_updated_at` | `profiles` | BEFORE UPDATE | `update_timestamp()` |
| `set_stories_updated_at` | `stories` | BEFORE UPDATE | `update_timestamp()` |
| `set_chapters_updated_at` | `chapters` | BEFORE UPDATE | `update_timestamp()` |

---

## 5. ROW LEVEL SECURITY (RLS) POLICIES

RLS is enabled on all tables. Unauthenticated reads are allowed on most public content. Writes require either ownership or admin role.

### Public Read Policies (no auth required)

| Table | Policy | Condition |
|---|---|---|
| `profiles` | Public read | `true` (all rows) |
| `author_links` | Public read | `true` |
| `site_settings` | Public read | `true` |
| `stories` | Public read | `is_published = true` only |
| `chapters` | Public read | `is_published = true` only |
| `characters` | Public read | `true` |
| `character_gallery_images` | Public read | `true` |
| `image_votes` | Public read | `true` |
| `story_wallpapers` | Public read | `true` |
| `lore_categories` | Public read | `true` |
| `lore_entries` | Public read | `true` |
| `timeline_events` | Public read | `true` |
| `timeline_event_characters` | Public read | `true` |
| `maps` | Public read | `true` |
| `comments` | Public read | `true` |

---

### Admin Write Policies (requires `is_admin() = true`)

Applies to ALL operations (INSERT, UPDATE, DELETE, SELECT of unpublished):

- `stories` â€” full access including unpublished
- `chapters` â€” full access including unpublished
- `characters`
- `character_gallery_images`
- `story_wallpapers`
- `lore_categories`
- `lore_entries`
- `timeline_events`
- `timeline_event_characters`
- `maps`
- `site_settings`
- `author_links`

---

### User-Scoped Policies (authenticated, own data only)

| Table | Operation | Condition |
|---|---|---|
| `profiles` | UPDATE | `id = auth.uid()` |
| `comments` | INSERT | `user_id = auth.uid()` |
| `comments` | DELETE | `user_id = auth.uid()` |
| `image_votes` | INSERT | `user_id = auth.uid()` |
| `image_votes` | UPDATE | `user_id = auth.uid()` |
| `image_votes` | DELETE | `user_id = auth.uid()` |

---

### Writer IDE Policies (authenticated users only)

| Table | Policy |
|---|---|
| `writer_nodes` | Authenticated users have full access (INSERT, SELECT, UPDATE, DELETE) |
| `writer_node_links` | Authenticated users have full access |

> âš ï¸ Writer IDE tables are not scoped to ownership â€” any authenticated user can read/write all writer nodes. This is intended for a single-author/small-team setup.

---

## 6. STORAGE BUCKETS

All buckets are **public** (publicly readable URLs). Writes are restricted to authenticated users only.

| Bucket ID | Purpose | Used By |
|---|---|---|
| `covers` | Story cover images | `stories.cover_image_url` |
| `backgrounds` | Story background/banner images | `stories.background_image_url` |
| `characters` | Character profile + gallery images | `characters.profile_image_url`, `character_gallery_images.image_url` |
| `lore` | Lore entry images | `lore_entries.image_url` |
| `maps` | Map images | `maps.image_url` |
| `author` | Author profile images | `profiles.avatar_url` |
| `Reader` | Reader-uploaded images (avatars, comment attachments) | `comments.metadata`, `profiles.avatar_url` |

### Storage Policy Pattern (all buckets except `Reader`)

- **SELECT:** Public (no auth required)
- **INSERT:** `auth.role() = 'authenticated'`
- **UPDATE:** `auth.role() = 'authenticated'`
- **DELETE:** `auth.role() = 'authenticated'`

> âš ï¸ Storage policies check `auth.role() = 'authenticated'` only â€” they do NOT check `is_admin()`. Any logged-in user (reader or admin) can technically upload. Enforce admin-only uploads at the application layer.

### Application Upload Metadata

- New uniquely named image objects uploaded by `admin.html`, `cartographer.html`, and `js/auth.js` use `cacheControl: '31536000'` so Supabase's public object response can remain cached for one year.
- Admin and reader avatar upload paths convert eligible PNG/JPG/JPEG files to bounded WebP client-side when beneficial. GIF animation and unsupported formats are preserved by uploading the original bytes.
- Map files deliberately skip conversion/resizing to preserve exact pixels, image dimensions, coordinate alignment, canvas sampling, and OCR quality.
- Long-lived metadata is safe only for immutable unique paths. The admin helper's explicit upsert branch defaults to short cache metadata for any future stable-path replacement.
- These rules affect new uploads only. Existing Storage objects retain their current content type and cache metadata unless separately migrated or re-uploaded.

### `Reader` Bucket (special rules)

- **File size limit:** 5MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/gif`, `image/webp`
- **SELECT:** Public
- **INSERT:** `auth.role() = 'authenticated'`
- **UPDATE/DELETE:** Only by the file's owner â€” enforced by checking that `auth.uid()::text` matches the first segment of the filename (filenames must be formatted as `{user_id}-{timestamp}.{ext}`)

---

## 7. INDEXES

| Index Name | Table | Columns | Purpose |
|---|---|---|---|
| `idx_stories_slug` | `stories` | `slug` | Fast story lookup by URL slug |
| `idx_chapters_story_order` | `chapters` | `(story_id, chapter_order)` | Ordered chapter list per story |
| `idx_characters_story` | `characters` | `story_id` | All characters for a story |
| `idx_gallery_images_character` | `character_gallery_images` | `character_id` | Gallery images per character |
| `idx_gallery_images_character_published` | `character_gallery_images` | `(character_id, is_published, sort_order)` | Published/hidden gallery fetches per character |
| `idx_lore_story` | `lore_entries` | `story_id` | Lore entries per story |
| `idx_timeline_story_order` | `timeline_events` | `(story_id, event_order)` | Ordered timeline per story |
| `idx_maps_story` | `maps` | `story_id` | Maps per story |
| `idx_writer_nodes_story` | `writer_nodes` | `story_id` | File tree per story |
| `idx_writer_nodes_parent` | `writer_nodes` | `parent_id` | Children of a folder node |
| `idx_node_links_source` | `writer_node_links` | `source_node_id` | Links from a node |
| `idx_node_links_target` | `writer_node_links` | `target_node_id` | Links to a node |

---

## 8. ENTITY RELATIONSHIP OVERVIEW

```
auth.users
  â””â”€â”€ profiles (1:1)
        â””â”€â”€ author_links (1:many)

stories
  â”œâ”€â”€ chapters (1:many)
  â”œâ”€â”€ characters (1:many)
  â”‚     â””â”€â”€ character_gallery_images (1:many)
  â”‚           â””â”€â”€ image_votes (1:many, via user)
  â”œâ”€â”€ story_wallpapers (1:many)
  â”œâ”€â”€ lore_categories (1:many)
  â”‚     â””â”€â”€ lore_entries (1:many, category optional)
  â”œâ”€â”€ timeline_events (1:many)
  â”‚     â””â”€â”€ timeline_event_characters (many:many â†’ characters)
  â”œâ”€â”€ maps (1:many)
  â”‚     â”œâ”€â”€ map_nodes (1:many)
  â”‚     â”œâ”€â”€ map_edges (1:many)
  â”‚     â””â”€â”€ map_changelog (1:many)
  â””â”€â”€ writer_nodes (tree, 1:many recursive)
        â””â”€â”€ writer_node_links (many:many between nodes)

comments (polymorphic â†’ chapters, lore, gallery, etc.)
site_settings (global key-value)
```

---

## 9. COMMON QUERY PATTERNS

### Fetch a published story with its chapters
```sql
SELECT s.*, c.*
FROM public.stories s
LEFT JOIN public.chapters c ON c.story_id = s.id AND c.is_published = true
WHERE s.slug = 'your-story-slug' AND s.is_published = true
ORDER BY c.chapter_order ASC;
```

### Fetch comments for a chapter
```sql
SELECT cm.*, p.display_name, p.avatar_url
FROM public.comments cm
JOIN public.profiles p ON p.id = cm.user_id
WHERE cm.target_id = '<chapter_uuid>' AND cm.target_type = 'chapter'
ORDER BY cm.created_at ASC;
```

### Fetch characters with gallery and vote totals
```sql
SELECT ch.*, 
  json_agg(gi.*) AS gallery,
  COALESCE(SUM(iv.vote_value), 0) AS total_votes
FROM public.characters ch
LEFT JOIN public.character_gallery_images gi ON gi.character_id = ch.id
LEFT JOIN public.image_votes iv ON iv.image_id = gi.id
WHERE ch.story_id = '<story_uuid>'
  AND gi.is_published = true
GROUP BY ch.id
ORDER BY ch.sort_order ASC;
```

### Get the writer file tree for a story
```sql
SELECT * FROM public.writer_nodes
WHERE story_id = '<story_uuid>'
ORDER BY sort_order ASC;
-- Build the tree client-side by nesting on parent_id
```

### Promote a user to admin
```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<user_uuid>';
```

---

## 10. IMPORTANT NOTES FOR AI AGENTS

1. **Never hardcode UUIDs.** Always query for IDs by slug, username, or other unique fields first.
2. **`is_published` gates public visibility** on `stories` and `chapters`. Always filter by this unless operating as an admin.
3. **`character_gallery_images.is_published` gates public gallery visibility**. Reader-facing gallery feeds and individual character galleries should only query published rows.
4. **`target_type` is a freeform string** on `comments`. Accepted values in use: `'chapter'`, `'lore'`, `'gallery'`. Always filter by both `target_id` AND `target_type`.
5. **`writer_nodes` is a recursive tree.** Reconstruct the tree client-side after fetching all nodes for a `story_id`. Root nodes have `parent_id = NULL`.
6. **`metadata` JSONB columns** exist on `comments` and `writer_nodes`. Structure is flexible â€” check application code for expected shape before writing.
7. **Storage URLs** are public Supabase Storage URLs. Construct them as: `{SUPABASE_URL}/storage/v1/object/public/{bucket_id}/{filename}`
8. **`Reader` bucket filenames** must follow `{user_id}-{timestamp}.{ext}` format for ownership policies to work.
9. **The `event_date` field** in `timeline_events` is a plain TEXT field, not a PostgreSQL date type. It stores in-universe fictional date strings.
10. **RLS applies to all queries**, including those made server-side via the Supabase client. Use the service role key (bypasses RLS) only for trusted admin operations.
11. **`image_votes`** uses upsert semantics. To change a vote, UPDATE the existing row (unique on `user_id + image_id`).

---

## 11. Cartographer Tables (Collaborative Map Editor)

### `map_nodes`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `map_id` | UUID NOT NULL | FK â†’ `maps(id)` CASCADE |
| `name` | TEXT NOT NULL | Planet/location name |
| `x` / `y` | DOUBLE PRECISION | Map coordinates |
| `region` / `sector` | TEXT | Optional metadata |
| `color` | TEXT | Contributor's assigned color |
| `created_by` | UUID | FK â†’ `profiles(id)` |

### `map_edges`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `map_id` | UUID NOT NULL | FK â†’ `maps(id)` CASCADE |
| `source_node_id` / `target_node_id` | UUID NOT NULL | FK â†’ `map_nodes(id)` CASCADE |
| `source_name` / `target_name` | TEXT | Denormalized for display |
| `geometry` | JSONB | Array of `{x, y}` waypoints |
| `edge_type` | TEXT DEFAULT 'straight' | `'straight'` or `'curved'` |
| `color` | TEXT | Contributor's color |
| `created_by` | UUID | FK â†’ `profiles(id)` |

### `map_changelog`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `map_id` | UUID NOT NULL | FK â†’ `maps(id)` CASCADE |
| `user_id` | UUID NOT NULL | FK â†’ `profiles(id)` |
| `action` | TEXT NOT NULL | `'add_node'`, `'edit_node'`, `'delete_node'`, `'add_edge'`, `'delete_edge'` |
| `entity_type` | TEXT NOT NULL | `'node'` or `'edge'` |
| `entity_id` | UUID | |
| `old_data` / `new_data` | JSONB | Previous/new state |

### `map_requests` (Moderation Queue)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | FK â†’ `profiles(id)` |
| `map_id` | UUID NOT NULL | FK â†’ `maps(id)` |
| `title` | TEXT | |
| `reason` | TEXT | Contributor notes |
| `status` | TEXT DEFAULT 'pending' | `'pending'`, `'approved'`, `'rejected'` |
| `feedback` | TEXT | Admin rejection reason |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `map_request_items`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `request_id` | UUID NOT NULL | FK â†’ `map_requests(id)` CASCADE |
| `action` | TEXT | `'ADD'`, `'UPDATE'`, `'DELETE'` |
| `entity_type` | TEXT | `'NODE'`, `'EDGE'` |
| `entity_id` | UUID | |
| `proposed_data` | JSONB | Full payload for the record |

### SQL Helper Function
- `is_cartographer()` â€” Returns TRUE if the authenticated user's profile role is `'cartographer'` or `'admin'`. Used in all RLS policies for map tables. Defined as `SECURITY DEFINER STABLE`.

### RLS Policies

    maps: Public SELECT for published maps. Admins: Full CRUD. Cartographers: SELECT all.

    map_nodes / map_edges: Public SELECT for nodes/edges belonging to published maps. Admins: Full CRUD. Cartographers: SELECT only (Writes must go through map_requests).

    map_requests / map_request_items: Admins: Full CRUD. Cartographers: SELECT (for maps they can access) and INSERT (to submit new requests).

### Storage Bucket: `maps`
- Public read, authenticated write. Used for story map images and cartographer base map uploads.

### Indexes
- `idx_maps_story`, `idx_maps_slug`, `idx_map_nodes_map`, `idx_map_edges_map`, `idx_map_edges_source`, `idx_map_edges_target`, `idx_map_changelog_map`, `idx_map_changelog_user`.

### Triggers
- `set_maps_updated_at`, `set_map_nodes_updated_at`, `set_map_edges_updated_at` â€” All reuse existing `update_timestamp()` function where present.

### Promote a user to cartographer
```sql
UPDATE public.profiles SET role = 'cartographer' WHERE id = '<user_uuid>';
```

---

## 12. Subscription Reader Access Model

The subscription reader SPA (`subscription.html`) is designed around normalized entitlements. The SQL migration is stored at:

```txt
sql/2026-06-23_reader_subscription_access.sql
```

Apply that migration before marking chapters as member-locked in production. Until the migration is applied, the subscription SPA can browse existing published stories/chapters through fallback reads, but production locked-content security depends on the RPC/RLS layer below.

### New / changed chapter columns

`public.chapters` gains optional access fields:

| Column | Type | Notes |
|---|---|---|
| `required_tier_id` | UUID NULL | FK to `reader_access_tiers(id)`. `NULL` means free/public when published. |
| `public_release_at` | TIMESTAMPTZ NULL | Optional early-access public release date. |
| `preview_text` | TEXT NULL | Safe public teaser text for locked chapters. Never store full locked content here. |

Existing chapters remain free by default because `required_tier_id` is `NULL`.

### `public.reader_access_tiers`

Internal tier definitions. Provider tier names/IDs map into these rows.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `slug` | TEXT UNIQUE | Internal tier slug. |
| `name` | TEXT | Reader-facing tier name. |
| `description` | TEXT | Optional copy. |
| `tier_rank` | INTEGER | Higher rank includes lower-rank access. |
| `is_active` | BOOLEAN | Public tier visibility. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `public.user_entitlements`

Normalized active/expired grants from any source.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID | FK to `profiles(id)`. |
| `tier_id` | UUID | FK to `reader_access_tiers(id)`. |
| `source` | TEXT | `patreon`, `access_key`, `manual`, `discord`, `kofi`, `paypal`, etc. |
| `provider` | TEXT | Optional provider name. |
| `provider_connection_id` | UUID | Optional FK to `provider_connections(id)`. |
| `status` | TEXT | Expected values include `active`, `expired`, `revoked`, `pending`. |
| `valid_from` / `valid_until` | TIMESTAMPTZ | Access window. `valid_until NULL` means no listed expiry. |
| `metadata` | JSONB | Source-specific details. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `public.provider_connections`

Links a Supabase reader account to an external provider identity.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID | FK to `profiles(id)`. |
| `provider` | TEXT | e.g. `patreon`, `discord`. |
| `provider_user_id` | TEXT | External account id. |
| `provider_account_label` | TEXT | Display label/email/handle when safe. |
| `status` | TEXT | `active`, `revoked`, `pending`, etc. |
| `metadata` | JSONB | Non-secret provider metadata. |
| `last_synced_at` | TIMESTAMPTZ | Last provider sync. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |


### `public.provider_oauth_tokens`

Trusted Edge Function token storage for OAuth providers. This table is created by:

```txt
sql/2026-06-24_provider_oauth_tokens.sql
```

It stores Patreon access/refresh tokens for server-side refresh and sync only. Browser roles (`anon`, `authenticated`) receive no grants; `service_role` receives SELECT/INSERT/UPDATE/DELETE for Edge Functions. Do not expose this table through admin UI or reader code.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID | FK to `profiles(id)`. |
| `provider` | TEXT | Currently `patreon`. |
| `provider_connection_id` | UUID | Optional FK to `provider_connections(id)`. |
| `provider_user_id` | TEXT | External provider user id. |
| `access_token` / `refresh_token` | TEXT | Secret OAuth tokens. Service-role Edge Functions only. |
| `token_type` | TEXT | Usually `Bearer`. |
| `scopes` | TEXT[] | Granted OAuth scopes. |
| `expires_at` | TIMESTAMPTZ | Access-token expiry. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `public.provider_tier_mappings`

Maps external provider tier/product/role IDs to internal access tiers.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `provider` | TEXT | Provider key. |
| `provider_tier_id` | TEXT | External tier/product/role id. |
| `provider_tier_label` | TEXT | Optional display label. |
| `tier_id` | UUID | FK to `reader_access_tiers(id)`. |
| `is_active` | BOOLEAN | Mapping enabled flag. |
| `metadata` | JSONB | Provider-specific non-secret details. |
| `created_at` | TIMESTAMPTZ | |

### `public.access_keys`

Stores hashed access keys. Plaintext keys must only be shown at creation time by trusted admin tooling and are never stored.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `key_hash` | TEXT UNIQUE | SHA-256 hash of normalized submitted key. |
| `key_prefix` | TEXT | Safe short prefix for admin identification. |
| `tier_id` | UUID | Entitlement tier granted by this key. |
| `label` / `campaign` | TEXT | Admin organization fields. |
| `status` | TEXT | `active`, `revoked`, etc. |
| `max_uses` / `uses_count` | INTEGER | Redemption limits. |
| `valid_from` / `valid_until` | TIMESTAMPTZ | Key validity window. |
| `entitlement_duration_days` | INTEGER NULL | Optional temporary grant length. |
| `metadata` | JSONB | Optional details. |
| `created_by` | UUID | Admin profile id when known. |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `public.access_key_redemptions`

Tracks key redemptions per user.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `key_id` | UUID | FK to `access_keys(id)`. |
| `user_id` | UUID | FK to `profiles(id)`. |
| `entitlement_id` | UUID | FK to granted `user_entitlements(id)`. |
| `redeemed_at` | TIMESTAMPTZ | |
| `metadata` | JSONB | |

### `public.entitlement_audit_log`

Append-only style event log for grants, redemptions, provider syncs, revokes, and admin actions.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID | Affected reader. |
| `actor_user_id` | UUID | Admin/actor when applicable. |
| `action` | TEXT | Event name. |
| `source` | TEXT | Source system. |
| `provider` | TEXT | Optional provider. |
| `entitlement_id` | UUID | Related entitlement. |
| `access_key_id` | UUID | Related access key. |
| `details` | JSONB | Event details. |
| `created_at` | TIMESTAMPTZ | |

### Subscription RPCs

| Function | Purpose |
|---|---|
| `has_active_entitlement(target_user_id, target_tier_id)` | Checks tier access, with higher `tier_rank` satisfying lower ranks. |
| `chapter_is_public(chapter_row)` | Returns whether a published chapter is public/free due to no tier requirement or elapsed public release date. |
| `get_chapter_catalog(target_story_id)` | Returns published chapter metadata plus access state, tier labels, preview text, and `can_read`; never returns full content. |
| `get_reader_chapter(target_chapter_id)` | Returns full content only when the chapter is public, the user is admin, or the user has entitlement. Locked responses return `content = NULL`. |
| `get_my_entitlements()` | Returns the signed-in reader's entitlement summary. |
| `redeem_access_key(submitted_code)` | Hashes the submitted key, validates status/expiry/uses, creates an entitlement, records redemption, and logs the audit event. |

### Subscription RLS and privilege notes

- `reader_access_tiers` are publicly readable when active; admin has full access.
- `provider_connections`, `user_entitlements`, and `access_key_redemptions` are readable by the owning user or admin.
- `access_keys`, `provider_tier_mappings`, and entitlement audit logs are admin-only through RLS.
- The migration explicitly revokes broad `anon` / `authenticated` grants on new subscription tables, then grants only the table privileges needed for RLS-backed reads/admin operations.
- The migration replaces only known `chapters` policies (`Public read chapters`, `Admin write chapters`, and subscription policy names). It does not blanket-drop every chapter policy.
- Raw `chapters` table policies require the parent story to be published, preventing chapter leakage from unpublished stories.
- Subscription RPC function execution is explicitly revoked from `PUBLIC` and then granted only for the browser-facing RPCs. Helper functions remain callable internally by policies/RPCs rather than becoming public frontend APIs.
- Direct chapter table reads expose only public/free published chapters or entitled/admin rows. Locked chapter reading must go through `get_reader_chapter`.
- Provider secrets live in Supabase Edge Function secrets. User OAuth tokens live in `provider_oauth_tokens`, which is service-role-only and not readable by browser roles.
- Access keys must be generated as long high-entropy random codes. The database stores only `key_hash`; plaintext keys are shown once by trusted admin tooling.

### Supabase Auth providers for subscription reader

The subscription reader uses Supabase Auth as the canonical site identity. Email/password and Google OAuth sign readers into the same `auth.users` / `profiles` account space. Patreon remains a linked provider in `provider_connections` and `user_entitlements`; it is not the primary login database. Google OAuth requires dashboard configuration under Supabase Authentication providers plus matching redirect allow-list entries for the `subscription.html#/vault` redirect target.

### Subscription Edge Functions

The repository includes initial Supabase Edge Function entrypoints under `supabase/functions/`:

- `patreon-oauth-start` - Verifies the signed-in Supabase user, signs short-lived OAuth state, and returns the Patreon authorization URL.
- `patreon-oauth-callback` - Exchanges the OAuth code server-side, fetches Patreon v2 identity/memberships/currently entitled tiers, stores provider connection/token rows, maps Patreon tiers to internal tiers, expires old Patreon entitlements, writes fresh `user_entitlements`, and redirects to the Vault.
- `sync-provider-entitlements` - Signed-in reader sync endpoint. It reads `provider_oauth_tokens`, refreshes Patreon tokens when needed, re-fetches membership state, and re-runs normalized entitlement sync.
- `provider-webhook` - Secret-protected normalized webhook boundary for Patreon/Ko-fi/PayPal/Discord/automation payloads. It resolves a user, maps `provider_tier_id` through `provider_tier_mappings`, writes `user_entitlements`, and logs audit events.
- `_shared/cors.ts` - Shared CORS/JSON/state helpers.
- `_shared/patreon.ts` - Shared Patreon token exchange, refresh, identity parsing, and entitlement sync helpers.

These functions intentionally keep provider-specific secrets and service-role writes out of browser JavaScript. Patreon webhook signature verification is still a later hardening step; OAuth connect and manual sync are the first production path. `supabase/config.toml` marks `patreon-oauth-callback` and `provider-webhook` as `verify_jwt = false` because those requests originate outside the signed-in browser session; both must validate their own state/signature secrets.

### Redeem-key pgcrypto search-path hotfix

If `redeem_access_key()` fails with `function digest(text, unknown) does not exist`, run `sql/hotfixes/2026-06-24_fix_redeem_access_key_pgcrypto_search_path.sql`. Supabase commonly installs `pgcrypto` functions in the `extensions` schema, while hardened SECURITY DEFINER functions use an explicit `search_path`. The migration and hotfix now set `redeem_access_key` to `SET search_path = public, extensions` so `digest(...)` resolves correctly.
