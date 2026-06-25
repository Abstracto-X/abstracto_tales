## 2026-06-25 17:55 Asia/Kolkata - Subscription-Only Starter Package

Status: NEEDS REVIEW

Area:
- reader
- database
- docs
- shared

Files touched:
- handoff_packages/subscription-only-site/
- handoff_packages/subscription-only-site.zip
- CHANGELOG.md
- PROJECT_STATE.md

Summary:
- Created a portable starter package for building a new independent subscription-only site with a fresh Supabase database.
- Package includes active subscription runtime files, full admin reference, subscription SQL migrations/hotfix/check queries, Patreon Supabase Edge Functions, environment template, setup requirements, database schema guide, TODO list, independence scanner, and a ready-to-use prompt for the next AI.

Remaining work:
- In the new project, wire `site/js/subscription/site-config.template.js` into the runtime as real config.
- Replace hardcoded old Supabase/project/brand references in `aether-app.js` and `admin.html`.
- Decide whether to keep full `admin.html` temporarily or extract a subscription-only admin.
- Run the SQL migrations against the new Supabase project and deploy Edge Functions if Patreon is enabled.
- Disable production fixture fallback and main archive links for a true subscription-only site.

Risks / notes:
- The package intentionally contains old references so the next AI can find and replace them; run `tools/check_independence.ps1` in the new project.
- The zip excludes real `.env` secrets; use `ENV.example`.
- Current runtime is still the Aether bridge monolith and should be split only after the standalone site works.

Verification needed:
- Inspect `handoff_packages/subscription-only-site/README.md` and `NEW_PROJECT_AI_PROMPT.md`.
- Extract `handoff_packages/subscription-only-site.zip` in a scratch folder and confirm the expected files are present.
- In the new project, complete the TODO and acceptance tests listed in the package docs.

## 2026-06-25 16:43 Asia/Kolkata - Subscription Site Handover Follow-ups

Status: NEEDS REVIEW

Area:
- reader
- database
- docs

Files touched:
- docs/reader/SUBSCRIPTION_HANDOVER.md
- PROJECT_STATE.md
- CHANGELOG.md

Summary:
- Created a comprehensive handover for the `subscription.html` Aether Pages member reader after the latest CSS/main-site integration and backend bridge updates.
- The handover records current working areas, active boot path, Supabase Auth/access flows, Patreon status, admin workflow, demo/local-only surfaces, and remaining launch blockers.

Remaining work:
- Verify Google OAuth on deployed GitHub Pages after the latest implicit-token callback parser.
- Perform a live Patreon end-to-end test with real provider tier mappings.
- Decide and implement production behavior when backend catalog loading fails instead of silently falling back to fixtures.
- Split `js/subscription/aether-app.js` into maintainable modules before adding major new features.
- Resolve documentation-process mismatch between updated `AGENTS.md` (`docs/` as durable docs) and older docs that still reference `docs_v2/` as source-of-truth.

Risks / notes:
- The active subscription runtime is still a large bridge monolith with demo/local features mixed with real Supabase code.
- Some `external-archive` actions still show concept toasts instead of opening real `index.html` routes.
- Do not log or paste OAuth callback URLs containing `access_token`.

Verification needed:
- Read `docs/reader/SUBSCRIPTION_HANDOVER.md` and confirm it matches intended launch scope.
- Use its manual verification matrix when testing OAuth, keys, Patreon, chapter gates, and visual/background modes.

## 2026-06-25 13:50 Asia/Kolkata — Glassmorphic Card Layout & Banner Crop Fix

Status: DONE

Area:
- reader

Files touched:
- subscription.css
- js/subscription/aether-app.js

Summary:
- Replaced the cropped cover art background banner in `.book-hero` and `.hero` with a grid-based columns layout (imported from the main reader SPA's story hub).
- Styled the cards as clean glassmorphic panels (`backdrop-filter`) with borders.
- Placed the portrait cover image in a dedicated left column (`.book-hero-cover`) with a border and shadow to prevent any cropping.
- Moved the metadata, title, author, tags, tagline, progress bar, and actions to the right column (`.book-hero-details`).
- Set responsive vertical stacking for mobile screens (≤ 600px).

Remaining work:
- None.

Risks / notes:
- Tagline length: Long taglines fit well on desktop grids but stack cleanly on mobile.

Verification needed:
- Open `subscription.html`. Verify that both the Home page banner and the Story details page banner render the cover art as a clean portrait card on the left and detail texts/buttons on the right without cropping or stretching.
