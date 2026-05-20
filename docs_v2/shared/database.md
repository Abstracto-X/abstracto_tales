# DATABASE CONTEXT — Shared Database Reference

This document provides a complete context of the Supabase PostgreSQL database utilized across the Abstracto Tales platform. It details the schema, relationships, Row Level Security (RLS) policies, storage buckets, enums, triggers, and common query patterns.

---

## 1. Platform & Architecture

- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (`auth.users` table managed by Supabase)
- **Storage:** Supabase Storage (public buckets)
- **Schema:** `public` (all application tables live here)
- **Security Model:** Row Level Security (RLS) enabled on all tables
- **Role System:** Three roles — `admin`, `cartographer`, and `reader` (stored in `public.profiles.role`)
- **Admin check:** The `public.is_admin()` helper function is used in all write policies
- **New User Flow:** Every new Supabase Auth user automatically gets a `public.profiles` row created via the `on_auth_user_created` trigger. New users are assigned the `reader` role by default. Admin role must be granted manually via SQL.

---

## 2. Enum Types

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
*Used by:* `writer_nodes.type`

---

## 3. Database Schema

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
- The `is_admin()` function queries this table using `auth.uid()`.

---

### 3.2 `public.author_links`
Social/external links for the author profile page.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `profile_id` | UUID | FK → `profiles(id)` CASCADE DELETE |
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
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
| `title` | TEXT | |
| `content` | TEXT | Full chapter body text |
| `chapter_order` | INTEGER | Ordering within story. Unique per story |
| `word_count` | INTEGER | Default 0 |
| `is_published` | BOOLEAN | Default FALSE. Controls public visibility |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Constraint:** `UNIQUE(story_id, chapter_order)` — no two chapters in the same story can have the same order value.

---

### 3.6 `public.characters`
Characters belonging to a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
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
| `character_id` | UUID | FK → `characters(id)` CASCADE DELETE |
| `image_url` | TEXT | From `characters` storage bucket |
| `caption` | TEXT | |
| `image_tags` | TEXT[] | Default `'{}'` (empty array) |
| `sort_order` | INTEGER | Default 0 |
| `created_at` | TIMESTAMPTZ | |

---

### 3.8 `public.image_votes`
Upvote/downvote system for character gallery images.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles(id)` CASCADE DELETE |
| `image_id` | UUID | FK → `character_gallery_images(id)` CASCADE DELETE |
| `vote_value` | INTEGER | Must be exactly `1` or `-1` (CHECK constraint) |
| `created_at` | TIMESTAMPTZ | |

**Constraint:** `UNIQUE(user_id, image_id)` — one vote per user per image (upsert to change vote).

---

### 3.9 `public.story_wallpapers`
Downloadable wallpapers associated with a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
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
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
| `name` | TEXT | Display name |
| `slug` | TEXT | URL-safe identifier |
| `sort_order` | INTEGER | Default 0 |

**Constraint:** `UNIQUE(story_id, slug)` — slugs are unique within a story.

---

### 3.11 `public.lore_entries`
Individual lore/world-building entries.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
| `slug` | TEXT | URL-safe identifier |
| `title` | TEXT | |
| `category_id` | UUID | FK → `lore_categories(id)` SET NULL on delete |
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
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
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
| `event_id` | UUID | FK → `timeline_events(id)` CASCADE DELETE |
| `character_id` | UUID | FK → `characters(id)` CASCADE DELETE |

---

### 3.14 `public.maps`
Map images associated with a story.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
| `slug` | TEXT UNIQUE | URL-safe identifier for the cartographer tool |
| `map_name` | TEXT | |
| `image_url` | TEXT | From `maps` storage bucket |
| `is_primary` | BOOLEAN | Default FALSE |
| `width` | INTEGER | Cartographer coordinate width. Default `4000` |
| `height` | INTEGER | Cartographer coordinate height. Default `4000` |
| `is_published` | BOOLEAN | Default FALSE. Controls public visibility of the interactive map |
| `sort_order` | INTEGER | Default 0 |
| `map_type` | TEXT | One of: `galactic`, `regional`, `local`. Default `'galactic'` |
| `created_by` | UUID | FK → `profiles(id)`. Identifies the original map creator |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**Key notes:**
- This is the canonical parent table for both reader-facing maps and `cartographer.html`.
- `story_id` should be treated as required for cartographer-created maps so they appear in the main Reader/Admin flows.
- `width` and `height` are required by the cartographer editor to restore the correct coordinate space for uploaded maps.

---

### 3.15 `public.comments`
Reader comments on chapters, lore entries, gallery images, etc.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles(id)` CASCADE DELETE |
| `target_id` | UUID | ID of the thing being commented on |
| `target_type` | TEXT | e.g. `'chapter'`, `'lore'`, `'gallery'` |
| `content` | TEXT | Comment body |
| `referenced_image_url` | TEXT | Optional, for gallery comments |
| `metadata` | JSONB | Default `'{}'`. Used for paragraph IDs, image context, etc. |
| `created_at` | TIMESTAMPTZ | |

**Key note:** `target_id` + `target_type` is a polymorphic reference — not a hard FK. Filter by both fields when querying.

---

### 3.16 `public.writer_nodes`
File-tree nodes for an internal Writer IDE (private authoring tool).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `story_id` | UUID | FK → `stories(id)` CASCADE DELETE |
| `parent_id` | UUID | Self-referencing FK → `writer_nodes(id)` CASCADE DELETE |
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
| `source_node_id` | UUID | FK → `writer_nodes(id)` CASCADE DELETE |
| `target_node_id` | UUID | FK → `writer_nodes(id)` CASCADE DELETE |
| `link_type` | TEXT | e.g. `'mentions'`, `'related'`, `'appears_in'` |
| `created_at` | TIMESTAMPTZ | |

**Constraint:** `UNIQUE(source_node_id, target_node_id, link_type)`

---

### 3.18 `public.map_nodes` (Cartographer Tables)
Node coordinates and metadata for story maps.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `map_id` | UUID | FK → `maps(id)` CASCADE |
| `name` | TEXT | Planet/location name |
| `x` | DOUBLE PRECISION | True Cartesian X coordinate |
| `y` | DOUBLE PRECISION | True Cartesian Y coordinate |
| `region` | TEXT | Galactic region |
| `sector` | TEXT | Galactic sector |
| `color` | TEXT | Contributor's assigned display color |
| `created_by` | UUID | FK → `profiles(id)` |

---

### 3.19 `public.map_edges` (Cartographer Tables)
Polyline or spline links (hyperlanes) connecting nodes.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `map_id` | UUID | FK → `maps(id)` CASCADE |
| `source_node_id` | UUID | FK → `map_nodes(id)` CASCADE |
| `target_node_id` | UUID | FK → `map_nodes(id)` CASCADE |
| `source_name` | TEXT | Denormalized source name |
| `target_name` | TEXT | Denormalized target name |
| `geometry` | JSONB | Array of `{x, y}` coordinates representing vertices |
| `edge_type` | TEXT | `'straight'` or `'curved'`. Default `'straight'` |
| `color` | TEXT | Contributor's assigned color |
| `created_by` | UUID | FK → `profiles(id)` |

---

### 3.20 `public.map_changelog` (Cartographer Tables)
Audit log tracking edits to maps.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `map_id` | UUID | FK → `maps(id)` CASCADE |
| `user_id` | UUID | FK → `profiles(id)` |
| `action` | TEXT | `'add_node'`, `'edit_node'`, `'delete_node'`, `'add_edge'`, `'delete_edge'` |
| `entity_type` | TEXT | `'node'` or `'edge'` |
| `entity_id` | UUID | ID of the affected element |
| `old_data` | JSONB | Previous state data |
| `new_data` | JSONB | New state data |

---

### 3.21 `public.map_requests` (Moderation Queue)
Map revision tickets submitted by contributors.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID | FK → `profiles(id)` |
| `map_id` | UUID | FK → `maps(id)`. Nullable for new map requests. |
| `title` | TEXT | Title of the request |
| `reason` | TEXT | Justification or contributor comments |
| `status` | TEXT | `'pending'`, `'approved'`, `'rejected'`. Default `'pending'` |
| `feedback` | TEXT | Admin response/rejection reason |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 3.22 `public.map_request_items` (Moderation Queue)
Individual atomic mutations proposed within a map request ticket.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `request_id` | UUID | FK → `map_requests(id)` CASCADE |
| `action` | TEXT | `'ADD'`, `'UPDATE'`, `'DELETE'` |
| `entity_type` | TEXT | `'NODE'`, `'EDGE'` |
| `entity_id` | UUID | Affected element ID |
| `proposed_data` | JSONB | Proposed complete record payload |
| `created_at` | TIMESTAMPTZ | |

---

## 4. Functions & Triggers

### `public.is_admin()` → `BOOLEAN`
```sql
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin'
);
```
- **Definition:** `SECURITY DEFINER, STABLE`
- Used in write/delete RLS policies on critical tables to verify the active user has the `'admin'` role.

### `public.is_cartographer()` → `BOOLEAN`
```sql
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role IN ('cartographer', 'admin')
);
```
- **Definition:** `SECURITY DEFINER, STABLE`
- Used in map-related tables to allow certified cartographers or admins to query or staging operations.

### `public.handle_new_user()`
- Trigger function fired `AFTER INSERT ON auth.users`.
- Spawns a standard profile in `public.profiles` for each new registrant, setting `role` to `'reader'` by default.
- Formats username as `emailPrefix_first4charsOfUUID` and sets display name to the email prefix.

### `public.update_timestamp()`
- Fired `BEFORE UPDATE` to sync the `updated_at` timestamp with `NOW()`. Applied to `profiles`, `stories`, `chapters`, `maps`, `map_nodes`, and `map_edges`.

---

## 5. Row Level Security (RLS) Policies

### Public Reads (No Auth Required)
All reader-facing data allows unauthenticated SELECT.

| Table | Policy | Condition / Rule |
|---|---|---|
| `profiles` | Public read | `true` |
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
| `maps` | Public read | `is_published = true` only |
| `comments` | Public read | `true` |
| `map_nodes` | Public read | If mapped map `is_published = true` |
| `map_edges` | Public read | If mapped map `is_published = true` |

### Admin Writes (Requires `is_admin() = true`)
Admins have full CRUD privileges for all operational and public entity tables.

- `stories` (can also view unpublished rows)
- `chapters` (can also view unpublished rows)
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

### Contributor & Role-Based Policies

- **`map_nodes` / `map_edges`**:
  - `SELECT`: Allowed for public if map published. Certified cartographers/admins can select all.
  - `INSERT/UPDATE/DELETE`: Admins only. (Contributors and cartographers must use `map_requests`).
- **`map_requests` / `map_request_items`**:
  - `SELECT`: Admins full access. Contributors can read their own submissions. Cartographers can read requests bound to projects they can access.
  - `INSERT`: Authenticated users can insert to request edits.
- **`writer_nodes` / `writer_node_links`**:
  - `ALL`: Open to all authenticated users (single-author/small-team context; RLS checks `auth.role() = 'authenticated'`).
- **User-Owned Profiles, Comments, & Votes**:
  - `profiles`: `UPDATE` only if `id = auth.uid()`.
  - `comments`: `INSERT` and `DELETE` only if `user_id = auth.uid()`.
  - `image_votes`: `INSERT`, `UPDATE`, and `DELETE` only if `user_id = auth.uid()`.

---

## 6. Storage Buckets

All buckets are public (publicly readable URLs). Writes are restricted to authenticated users at the storage layer; administrative enforcement resides at the application layer.

| Bucket ID | Purpose | Associated Table / Column |
|---|---|---|
| `covers` | Story cover images | `stories.cover_image_url` |
| `backgrounds` | Story background/banner images | `stories.background_image_url` |
| `characters` | Character profile + gallery images | `characters.profile_image_url`, `character_gallery_images.image_url` |
| `lore` | Lore entry images | `lore_entries.image_url` |
| `maps` | Map background images | `maps.image_url` |
| `author` | Author profile images | `profiles.avatar_url` |
| `Reader` | Reader-uploaded comment attachments | `comments.metadata`, `profiles.avatar_url` |

### Reader Bucket Rules
- **Restrictions:** Max size 5MB. MIME types restricted to standard image formats.
- **Access:** Public read.
- **Writes/Deletes:** Enforced by checking `auth.uid()::text` against the prefix of the storage filename (must match `{user_id}-{timestamp}.{ext}`).

---

## 7. Database Indexes

| Index Name | Table | Columns | Purpose |
|---|---|---|---|
| `idx_stories_slug` | `stories` | `slug` | Fast story lookup by URL slug |
| `idx_chapters_story_order` | `chapters` | `(story_id, chapter_order)` | Ordered chapter list per story |
| `idx_characters_story` | `characters` | `story_id` | All characters for a story |
| `idx_gallery_images_character` | `character_gallery_images` | `character_id` | Gallery images per character |
| `idx_lore_story` | `lore_entries` | `story_id` | Lore entries per story |
| `idx_timeline_story_order` | `timeline_events` | `(story_id, event_order)` | Ordered timeline per story |
| `idx_maps_story` | `maps` | `story_id` | Maps per story |
| `idx_writer_nodes_story` | `writer_nodes` | `story_id` | File tree per story |
| `idx_writer_nodes_parent` | `writer_nodes` | `parent_id` | Children of a folder node |
| `idx_node_links_source` | `writer_node_links` | `source_node_id` | Links from a node |
| `idx_node_links_target` | `writer_node_links` | `target_node_id` | Links to a node |

---

## 8. Query Patterns & Best Practices

1. **Gate Public Content:** Public views should query with `.eq('is_published', true)` when fetching `stories`, `chapters`, or `maps`.
2. **Handle Comments Polymorphically:** A comment target is represented by `target_id` (UUID) and `target_type` (`'chapter'`, `'lore'`, `'gallery'`). Always filter by both attributes.
3. **Recursive Writer Tree:** Retrieve all writer nodes for a given `story_id` in a single query, then assemble the hierarchy recursively in-memory on the client side: root elements carry `parent_id = NULL`.
4. **Construct Storage URLs:** Construct public URLs manually following this format:
   `{SUPABASE_URL}/storage/v1/object/public/{bucket_id}/{filename}`
