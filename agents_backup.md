````md id="8s1fqt"
# Project Instructions

## Overview
This is a web-based fiction publishing platform built on Supabase (PostgreSQL + Auth + Storage).

The project now has four main application surfaces:
- A modular public reader frontend rooted at `index.html`
- A single-file admin CMS in `admin.html`
- A single-file writer IDE in `writer.html`
- A single-file collaborative map editor in `cartographer.html`

There is no build step, no bundler, and no framework. The frontend uses plain JavaScript with the Supabase JS client loaded via CDN.

---

# Working Modes

The assistant operates in two different modes depending on the task.

---

## 1. Project Mode (Default)

Used for:
- Features integrated into the main platform
- Changes touching shared state
- Supabase/database work
- Auth flows
- Existing UI systems
- Cross-file interactions
- Refactors
- Anything affecting architecture or conventions

In Project Mode:
- Read all required documentation files first
- Maintain existing architectural patterns
- Update documentation after changes
- Consider system-wide implications
- Preserve consistency across the application

---

## 2. Isolated Component Mode

Used when the task is explicitly marked with one of these keywords:

- `[ISOLATED]`
- `[COMPONENT]`
- `[SANDBOX]`

Examples:
- `[ISOLATED] Build a draggable timeline widget`
- `[COMPONENT] Create a standalone chapter stats panel`
- `[SANDBOX] Prototype a new comment UI`

In Isolated Component Mode:
- Treat the task as self-contained unless integration is explicitly requested
- Do NOT load unrelated architecture or database context
- Do NOT assume connection to existing global state
- Avoid modifying shared systems unless requested
- Prefer minimal dependencies
- Documentation updates are NOT required unless the component becomes integrated into the main project
- The component may use simplified mock data or local state
- Focus on iteration speed and clean encapsulation

The purpose of this mode is to prevent unnecessary context pollution and reduce architectural overhead for experimental, isolated, or standalone work.

---

## Isolation Boundary Rules

In Isolated Component Mode, avoid:
- Reading entire large HTML files unless necessary
- Scanning unrelated functions
- Loading unrelated sections from `FUNCTION_INDEX.md`
- Loading `DATABASE_CONTEXT.md` unless the task explicitly uses Supabase
- Refactoring systems outside the isolated scope
- Making assumptions about wider app architecture

Only expand scope if integration is explicitly requested.

---

## Returning To Project Mode

Any task without an isolation keyword automatically uses full Project Mode.

You may also explicitly force full-context behavior using:
`[PROJECT]`

Example:
`[PROJECT] Integrate the timeline widget into writer.html`

---

# Testing & Verification Policy

Automated browser testing should NOT be run by default.

Do NOT:
- Launch browser automation tools automatically
- Run Playwright/Cypress/browser-agent workflows automatically
- Perform repeated automated UI testing unless explicitly requested

Reason:
Automated browser sessions consume excessive context and quota for this project.

Instead:
- Explain exactly how the user should manually verify the change
- Provide clear step-by-step reproduction/testing instructions
- Mention expected behavior
- Mention edge cases worth checking
- Mention which file/page/feature was affected

Example:

```txt
Manual verification:
1. Open writer.html
2. Create a new lore node
3. Drag it between two existing nodes
4. Reload the page
5. Confirm the hierarchy persists correctly
6. Confirm no console errors appear
```

Only use automated browser testing if the user explicitly asks for it.

---

# Primary Application Files

| File | Audience | Purpose |
| --- | --- | --- |
| `index.html` | Public readers | Modularized reader shell for story browsing, chapter reading, comments, character gallery, lore, timeline, and maps. Loads `styles.css` plus the ES6 module reader app rooted in `js/main.js`. |
| `admin.html` | Admin only | Full CMS for managing stories, chapters, characters, lore, wallpapers, site settings, moderation, and admin workflows. |
| `writer.html` | Admin only | Writer IDE for hierarchical drafting, rich text editing, and world-building node management. |
| `cartographer.html` | Cartographers and admins | Collaborative map editor and hub for story-linked maps, node placement, hyperlane editing, contribution review flows, and map activity history. |

---

# Documentation Files (Selective Reading In Project Mode)

Before starting any Project Mode task, you must read the mandatory overview. Then, selectively read the app-specific or shared documents relevant to your task to optimize context usage.

| File / Folder | When to read |
| --- | --- |
| `/docs_v2/CODEBASE_OVERVIEW.md` | **Mandatory** for every Project Mode task. Read this first. |
| `/docs_v2/reader/` | Read `architecture.md`, `functions.md`, and `api_map.md` if working on the public reader (`index.html`, `js/` modules). |
| `/docs_v2/admin/` | Read `architecture.md` and `functions.md` if working on the admin CMS (`admin.html`). |
| `/docs_v2/writer/` | Read `architecture.md` and `functions.md` if working on the writer IDE (`writer.html`). |
| `/docs_v2/cartographer/` | Read `architecture.md` and `functions.md` if working on the map editor (`cartographer.html`). |
| `/docs_v2/shared/database.md` | Read if working on database schema, tables, triggers, RLS, or Supabase queries. |
| `/docs_v2/shared/conventions.md` | Read if working on shared codebase rules, styling, or uploading conventions. |

These files are the source of truth for understanding the codebase.

Do not rely solely on grep or symbol search - read the relevant documentation sections first.

---

# Mandatory: Keeping Documentation Up To Date

This is mandatory for all Project Mode tasks.

All documentation updates must be written directly to the modular files in `docs_v2/`. 
After making edits in `docs_v2/`, you MUST compile them to update the legacy `/docs/` directory.

After completing any task that changes the integrated codebase, you MUST:
1. Update the modular documentation in `docs_v2/` before considering the task complete.
2. Run `npm run compile-docs` (which calls `node scripts/compile_docs.js`) to regenerate the legacy `/docs/` files.
3. Log a summary of your updates in `CHANGELOG.md`, including the current date and time.

---

## When You ADD a New Function

* Add it to the corresponding app-specific function file (e.g. `/docs_v2/reader/functions.md`).
* Place it under the correct feature group.
* If it introduces a new architectural pattern, document it in the corresponding app-specific architecture file (e.g. `/docs_v2/reader/architecture.md`).

Examples:

* New modal pattern
* New upload flow
* New editor interaction pattern
* New state synchronization pattern

---

## When You RENAME or DELETE a Function

* Update or remove its entry in `/docs_v2/<app>/functions.md`.
* Search `docs_v2/` for references to the old name and update them.

---

## When You ADD or CHANGE a Supabase Query

If the change affects anything not already documented:

* Update `/docs_v2/shared/database.md`.

This includes:

* Tables
* Columns
* Policies
* Storage buckets
* Triggers
* Enums
* Functions
* Indexes

---

## When You ADD or CHANGE a Reader Module API Contract

If the change affects the exported surface, shared state shape, side effects, DOM dependencies, or backend touchpoints of documented reader modules:

* Update `/docs_v2/reader/api_map.md`.

Examples:

* New export in `js/config.js`
* New `DB` method or changed return shape in `js/db.js`
* New `UserAuth` behavior, dependency, or DOM contract in `js/auth.js`

---

## When You ADD New Global State

Add the variable to the Global State section in:
`/docs_v2/<app>/architecture.md`

---

## When You CHANGE Initialization Flow

Update the Initialization Flow section for the relevant file in:
`/docs_v2/<app>/architecture.md`

---

## Documentation Rule Of Thumb

If someone read only the updated `docs_v2/` files, would anything feel missing, confusing, or outdated?

If yes:
update the docs in `docs_v2/` and recompile.

---

# Tech Stack & Constraints

* No build step
* No npm
* No bundler
* No compilation step
* All JS runs directly in the browser

---

## Framework Rules

* No React
* No Vue
* No Angular
* Plain JavaScript only

---

## Supabase Usage

* Supabase JS client is loaded via CDN
* Each application surface initializes its client according to the documented architecture for that file

---

## File Architecture Rules

* Single-file architecture is enforced for `admin.html`, `writer.html`, and `cartographer.html`.
* The public reader (`index.html`) is modularized into external ES6 modules under `js/` and a unified stylesheet in `styles.css`.
* For `admin.html`, `writer.html`, and `cartographer.html`, do not split files or create additional JS/CSS files unless explicitly instructed; all changes belong inline inside those respective files.
* For reader work, preserve the modular ES6 structure rather than moving logic back into `index.html`.

---

## CSS Rules

* For `admin.html`, `writer.html`, and `cartographer.html`, CSS lives inside a `<style>` block within the same file.
* The public reader (`index.html`) imports `styles.css` at the project root directory. No other external stylesheets are allowed unless approved via CDN.

---

# Supabase Conventions

* Auth state is checked on load
* Behavior differs per file - see `docs_v2/<app>/architecture.md`
* Admin operations are protected by:

  * RLS (`is_admin()`)
  * Client-side auth checks

Storage URLs follow this pattern:

```txt
{SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}
```

See `/docs_v2/shared/database.md` for:

* Full schema
* RLS policies
* Storage rules
* Bucket structure

---

# Code Style & Conventions

* Use `const` and `let`
* Never use `var`

---

## Async Rules

* Use async/await for Supabase calls
* Always use try/catch around async operations

---

## Error Handling

Use the existing toast/notification pattern.

Do not invent a new error UI pattern.

See:
`docs_v2/shared/conventions.md`

---

## DOM Query Rules

* Use `document.getElementById` for unique elements
* Use `document.querySelector` for dynamic/repeated elements

---

## Dependency Rules

Do not add:

* External libraries
* New CDN scripts

unless explicitly requested.

---

## Patch Note `[if you are ChatGPT/Codex]`

When using `apply_patch`, remember that patch matching is literal and context-sensitive.

Common failure reasons:

* The target lines changed after you last read the file
* The file contains encoding noise or mojibake characters that do not byte-match what you typed
* Line endings, tabs, spaces, or duplicated nearby lines make the hunk context ambiguous
* The patch tries to match too much surrounding text instead of a small stable anchor

Correct `apply_patch` workflow:

1. Re-read the exact file content immediately before patching
2. Use the smallest stable hunk possible
3. Copy existing lines exactly when matching, especially punctuation or unusual characters
4. Prefer nearby plain-ASCII anchor lines if special characters keep failing to match
5. Keep the patch syntax strictly valid and limited to the intended file

Do not assume a visually similar line will match if the underlying bytes differ.

---

# Before Starting Any Project Mode Task

1. Read `docs_v2/CODEBASE_OVERVIEW.md`
2. Selectively read only the relevant app-specific or shared files in `docs_v2/` (e.g. `docs_v2/reader/` for reader-related changes, `docs_v2/shared/database.md` for DB tasks, etc.)
3. Locate the exact function(s) or module surface to modify before writing code
4. Understand the existing pattern before introducing new patterns

---

# After Finishing Any Project Mode Task

1. Verify the change follows existing patterns

   * modal patterns
   * toast patterns
   * auth patterns
   * editor patterns
   * upload flows
   * reader module boundaries

2. Update documentation

3. Provide manual verification instructions to the user

4. Final validation:
   Would the documentation accurately describe the codebase after your change?

If not:
update the docs before finishing.
````
