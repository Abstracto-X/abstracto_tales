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
