# Codebase Overview & Agent Routing Map

Welcome to **Abstracto Tales / The Aether Archives** project. This document serves as the primary entry point and routing guide for all developers and AI agents working on this codebase.

---

## 1. Overview of Application Surfaces

The platform is a web-based fiction publishing interface built on a serverless Supabase backend (PostgreSQL + Auth + Storage). There is no bundler, build step, or framework compilation; the frontends consume vanilla HTML, CSS, and ES6 JavaScript directly in the browser.

The codebase consists of four major application surfaces:

| File | Audience | Purpose |
| --- | --- | --- |
| [index.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html) | Public Readers | Modular public reader SPA for story browsing, reading, character gallery, interactive maps, and chronological timelines. Imports [styles.css](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/styles.css) and ES6 modules in [js/main.js](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/js/main.js). |
| [admin.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/admin.html) | Admins | Single-file administrative portal (CMS) for stories, chapters, character info, lore uploads, and moderation. |
| [writer.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/writer.html) | Writer (Author) | Single-file writing environment with a binder tree, Quill.js rich text editing, auto-saves, and split-pane reference sheets. |
| [cartographer.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/cartographer.html) | Cartographers & Admins | Single-file collaborative map editor built on Leaflet.js with a planet autocomplete engine and moderation queue. |

---

## 2. Directory Structure

```
├── docs_v2/                # Modular codebase documentation (Source of Truth)
│   ├── CODEBASE_OVERVIEW.md# This file (universal entry point)
│   ├── admin/              # CMS admin-panel specific docs
│   ├── cartographer/       # Collaborative map editor specific docs
│   ├── reader/             # Public reader SPA specific docs (incl. api_map.md)
│   ├── writer/             # Writer's IDE specific docs
│   └── shared/             # Shared database.md and conventions.md
├── docs/                   # Legacy unified docs (Compiled automatically from docs_v2)
├── js/                     # ES6 modules for index.html (Reader SPA)
├── scripts/                # Sync utilities and Windows tasks
├── styles.css              # Universal styles (mostly index.html)
└── AGENTS.md               # Core system prompt instructions for AI coding assistants
```

---

## 3. Agent Routing Rules (Mandatory Reading)

To avoid cognitive overload and context bloat, you must selectively read the deeper documentation files based on the task description:

* **Always Read First:**
  - [docs_v2/CODEBASE_OVERVIEW.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/CODEBASE_OVERVIEW.md)

* **If Reader task (`index.html` or `js/` modules, including `subscription.html`):**
  - [docs_v2/reader/architecture.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/reader/architecture.md)
  - [docs_v2/reader/functions.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/reader/functions.md)
  - [docs_v2/reader/subscription_spa.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/reader/subscription_spa.md) (if working on the member library SPA)
  - [docs_v2/reader/api_map.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/reader/api_map.md) (if touching `config.js`, `db.js`, or `auth.js` APIs)

* **If Admin task (`admin.html`):**
  - [docs_v2/admin/architecture.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/admin/architecture.md)
  - [docs_v2/admin/functions.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/admin/functions.md)

* **If Writer task (`writer.html`):**
  - [docs_v2/writer/architecture.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/writer/architecture.md)
  - [docs_v2/writer/functions.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/writer/functions.md)

* **If Cartographer task (`cartographer.html`):**
  - [docs_v2/cartographer/architecture.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/cartographer/architecture.md)
  - [docs_v2/cartographer/functions.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/cartographer/functions.md)

* **If Database, Storage, RLS, or SQL Schema task:**
  - [docs_v2/shared/database.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/shared/database.md)

* **If General Architecture or Conventions task:**
  - [docs_v2/shared/conventions.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/shared/conventions.md)

---

## 4. Key Platform Conventions

1. **Vanilla Stack:** No React, Vue, Angular, or bundlers. JavaScript runs directly. Admin/Writer/Cartographer pages are single-file monoliths containing inline `<style>` and scripts.
2. **Supabase Integration:** Auth states, storage buckets, database tables, and RLS policies govern CRUD.
3. **Documentation Sync:** All documentation updates MUST be written to the modular `docs_v2/` files first, followed by running `npm run compile-docs` to rebuild the legacy `/docs` directory.

---

## 5. Subscription Reader Surface

A fifth reader-oriented application surface now exists:

| File | Audience | Purpose |
| --- | --- | --- |
| [subscription.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/subscription.html) | Members / supporters | Lightweight mobile-first member library for published stories, tier-aware chapter catalogs, secure chapter reading via subscription RPCs, Patreon connection flow, access-key redemption, and account entitlement status. Loads `subscription.css` plus ES modules under `js/subscription/`. |

Use the reader documentation set (specifically [docs_v2/reader/subscription_spa.md](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/docs_v2/reader/subscription_spa.md)) for subscription reader work, plus `docs_v2/shared/database.md` for entitlement, tier, access-key, provider, and RLS changes.
