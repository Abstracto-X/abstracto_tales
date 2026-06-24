# Subscription Reader SPA Documentation Index

This folder is the full planning/specification pack for the separate subscription reader SPA. The original top-level plan in `PLANS/Subscription_Reader_SPA.md` is the executive summary; this folder is the implementation-grade product, UX, layout, access, backend, admin, and rollout documentation.

## Reading order

1. [`00_Product_Brief.md`](00_Product_Brief.md) - product direction, audience, principles, non-goals, MVP/final definitions.
2. [`01_Information_Architecture.md`](01_Information_Architecture.md) - route hierarchy, navigation model, journeys, redirects, auth/access behavior.
3. [`02_Route_Page_Spec.md`](02_Route_Page_Spec.md) - every SPA route, page content, layout anatomy, states, CTAs, and data needs.
4. [`03_Design_System_And_Mobile.md`](03_Design_System_And_Mobile.md) - visual language, responsive rules, mobile bottom nav, reader controls, accessibility.
5. [`04_Access_Entitlements_Backend.md`](04_Access_Entitlements_Backend.md) - entitlement model, chapter access states, provider adapters, RPC/RLS boundaries, admin workflow.
6. [`05_Reader_Experience.md`](05_Reader_Experience.md) - chapter reader, previews, reader controls, resume/progress, end-of-chapter logic.
7. [`06_States_Errors_Loading.md`](06_States_Errors_Loading.md) - loading, empty, error, auth, access, provider, key, and degraded-network states.
8. [`07_Feature_Backlog_And_Acceptance.md`](07_Feature_Backlog_And_Acceptance.md) - phased implementation backlog, route-level acceptance criteria, manual verification matrix.
9. [`08_Aether_Pages_Backend_Integration_Action_Plan.md`](08_Aether_Pages_Backend_Integration_Action_Plan.md) - practical refactor/backend integration plan using `aether-pages/` as the UI base.

## Intent

The target is not a basic paywall screen. The target is a premium member-library SPA: lighter than the cinematic archive, but still rich enough to feel like a dedicated product for serial-fiction supporters.

The SPA should be:

- separate from `index.html`;
- desktop/tablet-rich with clean responsive mobile support and comfortable long-reading sessions;
- multi-page, not a cramped one-screen dashboard;
- provider-neutral after entitlement normalization;
- Patreon-first for production provider UX;
- access-key and manual-grant friendly from day one;
- secure by architecture, meaning locked chapter content is not fetched unless the backend authorizes it.

## Source-of-truth relationship

- `PLANS/Subscription_Reader_SPA.md` remains the concise executive summary.
- This folder is the detailed planning pack.
- When implementation changes the integrated app, mirror the relevant architectural truth into `docs_v2/reader/subscription_spa.md`, `docs_v2/shared/database.md`, and compiled `docs/` files.


