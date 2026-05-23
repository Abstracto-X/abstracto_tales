# Changelog

All notable changes to this project will be documented in this file.
Agents MUST update this file whenever they complete a task or make significant updates, including the date, time, and a summary of the changes.

## [2026-05-23]
### Added
- 11:45 +05:30: Added [`docs/READER_API_MAP.md`](docs/READER_API_MAP.md) with a dedicated API reference for `js/config.js`, `js/db.js`, and `js/auth.js`, covering exports, shared state, database touchpoints, side effects, and UI dependencies.

### Changed
- 12:00 +05:30: Rewrote `AGENTS.md` to match the current architecture, including the modularized `index.html` reader, the addition of `cartographer.html` as a primary application surface, and explicit instructions for using and maintaining `docs/READER_API_MAP.md`.
- Modularized `index.html` (the Reader SPA) into a clean HTML shell importing a unified `styles.css` and a modular ES6 JavaScript architecture located in the `js/` directory (`main.js`, `config.js`, `db.js`, `auth.js`, `router.js`, `render.js`, `ui.js`, `comments.js`, `maps/`).
- Fixed dynamic import pathways for modular loaders (`primary_loader` and `anomaly_loader`) to resolve correctly relative to `js/ui.js`.
- Created separate detailed architecture documentation for the modularized `index.html`.
- Completely rewrote and updated `docs_v2/reader/functions.md` with a comprehensive and highly-detailed mapping of all the new ES6 modules, functions, and objects.
