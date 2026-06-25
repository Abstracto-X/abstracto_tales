# Subscription SPA Consolidated Code Bundle

This file contains the source code of the active Subscription SPA bridge files plus legacy modular reference files for easy auditing or ingestion by an external AI.

## File Path: `subscription.html`

```html
﻿<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5">
  <meta name="theme-color" content="#0a0b12">
  <meta name="description" content="Aether Pages - premium member reader for Abstracto Tales / Aether Archives. Read serial fiction, manage access, and continue across the member library.">
  <title>Aether Pages - Member Reader</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 4 9v8c0 6 5 10 12 13 7-3 12-7 12-13V9z' fill='%23d4b06a' opacity='.25' stroke='%23d4b06a' stroke-width='1.4'/%3E%3Cpath d='M16 11v10M12 16h8' stroke='%23e7cd97' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://gdivyqfhgashkqcqqnas.supabase.co" crossorigin>
  <link rel="stylesheet" href="subscription.css">
</head>
<body>
  <div id="app">
    <main id="main" aria-live="polite"></main>
  </div>

  <noscript>
    <div style="max-width:520px;margin:80px auto;padding:24px;font-family:Georgia,serif;color:#e7e5e0;text-align:center">
      <h1 style="color:#d4b06a">Aether Pages</h1>
      <p>This member reader needs JavaScript to run. Please enable it in your browser.</p>
    </div>
  </noscript>

  <!-- Supabase is loaded for the upcoming production data/auth adapters. -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/subscription/aether-data.js"></script>
  <script src="js/subscription/aether-app.js"></script>
</body>
</html>

```

---

## File Path: `subscription.css`

```css
﻿/* =====================================================================
   AETHER PAGES â€” Subscription Reader SPA
   Design system: premium, desktop/tablet-rich, responsive restrained atmosphere.
   ===================================================================== */

/* ---------- Reset / base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  font-family: var(--ui);
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}
:root {
  --ui: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --serif: "Iowan Old Style", "Palatino Linotype", "URW Palladio L", Palatino, "Hoefler Text", Georgia, "Times New Roman", serif;

  --bg: #0a0b12;
  --bg-grad-a: rgba(122, 92, 200, 0.10);
  --bg-grad-b: rgba(70, 150, 170, 0.08);
  --surface: rgba(255,255,255,0.035);
  --surface-2: rgba(255,255,255,0.06);
  --surface-3: rgba(255,255,255,0.09);
  --surface-solid: #14161f;
  --surface-solid-2: #1a1d28;
  --border: rgba(255,255,255,0.08);
  --border-2: rgba(255,255,255,0.14);

  --text: #ECE9E1;
  --text-dim: #a6a39c;
  --text-faint: #71706c;

  --accent: #d4b06a;          /* aether gold */
  --accent-2: #e7cd97;
  --accent-soft: rgba(212,176,106,0.14);

  --s: var(--accent);         /* story accent (overridden) */
  --s2: var(--accent-2);
  --s-soft: var(--accent-soft);

  --good: #74c69d;
  --warn: #e0b257;
  --bad: #d77b6b;
  --info: #6bb6cf;
  --key: #c9a3e6;
  --early: #7fb4d8;

  --radius: 18px;
  --radius-sm: 12px;
  --radius-xs: 9px;
  --radius-pill: 999px;

  --shadow-sm: 0 4px 16px rgba(0,0,0,0.35);
  --shadow: 0 12px 40px rgba(0,0,0,0.45);
  --shadow-lg: 0 24px 70px rgba(0,0,0,0.55);

  --tap: 44px;
  --nav-h: 64px;
  --top-h: 56px;
  --maxw: 1120px;
  --reader-w: 46rem;

  --chrome: 10 11 18;          /* space-separated RGB for chrome (topbar/nav/sheet) tints */
  --on-accent: #15110a;        /* text color that sits on accent fills */
  --scrub: rgba(255,255,255,.1); /* progress/track neutral */
  --track: rgba(127,127,127,.24); /* input/switch track, theme-agnostic */

  --ease: cubic-bezier(.22,.61,.36,1);
}

/* atmospheric backdrop */
body::before {
  content:"";
  position: fixed; inset: 0;
  background:
    radial-gradient(900px 700px at 78% -8%, var(--bg-grad-a), transparent 60%),
    radial-gradient(820px 620px at 8% 12%, var(--bg-grad-b), transparent 55%),
    radial-gradient(700px 800px at 50% 120%, rgba(212,176,106,0.05), transparent 60%);
  z-index: -2; pointer-events:none;
}
body::after {
  content:""; position: fixed; inset:0; z-index:-1; pointer-events:none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: .035; mix-blend-mode: overlay;
}

img, svg { display:block; max-width:100%; }
button { font: inherit; color: inherit; cursor: pointer; background:none; border:none; padding:0; }
input, textarea, select { font: inherit; color: inherit; }
a { color: var(--accent); text-decoration: none; }
::selection { background: var(--accent-soft); color: var(--text); }

::-webkit-scrollbar { width:10px; height:10px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 99px; border:3px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.2); background-clip: padding-box; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }

/* ---------- App shell ---------- */
#app { min-height: 100vh; min-height:100dvh; }
#main {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: calc(var(--top-h) + 14px) 16px calc(var(--nav-h) + 28px);
  min-height: 100vh; min-height:100dvh;
}
body.in-reader #main { max-width: none; padding: 0; }
body.has-sheet #main, body.locked-scroll { overflow: hidden; }

/* ---------- Top bar ---------- */
.topbar {
  position: fixed; top:0; left:0; right:0; height: var(--top-h); z-index: 60;
  display:flex; align-items:center; gap:8px; min-width:0;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, rgb(var(--chrome) / .92), rgb(var(--chrome) / .55) 70%, transparent);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border-bottom: 1px solid var(--border);
}
.topbar .brand { display:flex; align-items:center; gap:9px; font-family: var(--serif); font-weight: 600; letter-spacing:.2px; font-size: 1.06rem; min-width:0; }
.topbar .brand .mark { width:26px; height:26px; flex:0 0 auto; }
.topbar .brand .btxt { min-width:0; overflow:hidden; }
.topbar .brand small { display:block; font-family: var(--ui); font-weight:500; font-size:.6rem; letter-spacing:.28em; text-transform:uppercase; color: var(--text-faint); margin-top:-2px; }
.topbar .spacer { flex:1 1 auto; min-width:8px; }
.topbar .tb-btn {
  position:relative; width:var(--tap); height:var(--tap); flex:0 0 auto; border-radius: var(--radius-pill);
  display:grid; place-items:center; color: var(--text-dim); transition:.2s var(--ease);
}
.topbar .tb-btn:hover { background: var(--surface-2); color: var(--text); }
.topbar .tb-btn .dot { position:absolute; top:9px; right:10px; width:8px; height:8px; border-radius:50%; background: var(--accent); box-shadow: 0 0 0 3px rgb(var(--chrome) / .8); }
.access-chip {
  display:flex; align-items:center; gap:7px; height: 32px; max-width:46vw; min-width:0;
  padding:0 12px 0 10px;
  border-radius: var(--radius-pill); background: var(--surface-2); border:1px solid var(--border);
  font-size: .78rem; color: var(--text); font-weight:500; white-space:nowrap; overflow:hidden;
}
.access-chip .alabel { overflow:hidden; text-overflow:ellipsis; }
.access-chip .pulse { width:8px;height:8px;border-radius:50%; background: var(--good); box-shadow:0 0 8px var(--good); }
.access-chip[data-state="expired"] .pulse, .access-chip[data-state="none"] .pulse { background: var(--bad); box-shadow:0 0 8px var(--bad); }
.access-chip[data-state="pending"] .pulse { background: var(--warn); box-shadow:0 0 8px var(--warn); animation: pulse 1.6s var(--ease) infinite; }
.access-chip[data-state="anon"] .pulse { background: var(--text-faint); box-shadow:none; }

@keyframes pulse { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.4; transform:scale(.7);} }

/* ---------- Bottom nav ---------- */
.bottomnav {
  position: fixed; bottom:0; left:0; right:0; z-index: 60;
  display:grid; grid-template-columns: repeat(5, 1fr);
  height: calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(0deg, rgb(var(--chrome) / .96), rgb(var(--chrome) / .78) 60%, transparent);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-top: 1px solid var(--border);
}
.bottomnav a {
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  color: var(--text-faint); font-size:.62rem; font-weight:600; letter-spacing:.04em;
  transition:.2s var(--ease); position:relative;
}
.bottomnav a svg { width:23px; height:23px; transition:.2s var(--ease); }
.bottomnav a.active { color: var(--accent); }
.bottomnav a.active svg { transform: translateY(-2px); }
.bottomnav a.active::before { content:""; position:absolute; top:0; width:22px; height:3px; border-radius: 99px; background: var(--accent); box-shadow:0 0 10px var(--accent); }
.bottomnav a:active { transform: scale(.92); }

/* ---------- Page primitives ---------- */
.section { margin: 26px 0; }
.section-head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin: 8px 2px 12px; }
.section-head h2 { font-family: var(--serif); font-size: 1.18rem; font-weight:600; margin:0; letter-spacing:.2px; }
.section-head .eyebrow { font-size:.66rem; letter-spacing:.24em; text-transform:uppercase; color: var(--text-faint); font-weight:600; }
.section-link { font-size:.8rem; color: var(--accent); font-weight:600; display:inline-flex; gap:4px; align-items:center; }

.page-title { font-family: var(--serif); font-size: 1.7rem; font-weight:600; margin:0 0 2px; letter-spacing:.2px; }
.page-sub { color: var(--text-dim); font-size:.92rem; margin:0 0 8px; }

/* cards */
.card {
  background: var(--surface);
  border:1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.card.tinted { border-color: color-mix(in srgb, var(--s) 26%, var(--border)); background: linear-gradient(160deg, color-mix(in srgb, var(--s) 7%, var(--surface)), var(--surface)); }

/* buttons */
.btn {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  min-height: var(--tap); padding: 0 18px; border-radius: var(--radius-pill);
  background: var(--surface-3); color: var(--text); font-weight:600; font-size:.9rem;
  border:1px solid var(--border-2); transition:.18s var(--ease); white-space:nowrap;
}
.btn svg { width:17px;height:17px; }
.btn:hover { background: var(--surface-3); border-color: rgba(255,255,255,.22); }
.btn:active { transform: scale(.97); }
.btn.primary { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color:#1a1405; border-color: transparent; box-shadow: 0 6px 20px var(--accent-soft); }
.btn.primary:hover { filter: brightness(1.06); }
.btn.ghost { background: transparent; border-color: var(--border); }
.btn.story { background: linear-gradient(180deg, var(--s2), var(--s)); color:#15110a; border-color:transparent; box-shadow: 0 6px 22px var(--s-soft); }
.btn.block { width:100%; }
.btn.sm { min-height: 36px; padding: 0 13px; font-size:.82rem; }
.btn.icon { min-height: 40px; padding: 0 12px; }
.btn[disabled] { opacity:.45; pointer-events:none; }

/* chips */
.chip {
  display:inline-flex; align-items:center; gap:6px; height: 32px; padding:0 13px;
  border-radius: var(--radius-pill); background: var(--surface-2); border:1px solid var(--border);
  font-size:.78rem; font-weight:500; color: var(--text-dim); transition:.18s var(--ease); white-space:nowrap;
}
.chip svg { width:14px;height:14px; }
.chip.active { background: var(--accent-soft); border-color: color-mix(in srgb,var(--accent) 45%, transparent); color: var(--accent-2); }
.chip.story-chip { background: var(--s-soft); border-color: color-mix(in srgb,var(--s) 40%, transparent); color: var(--s2); }
.chips { display:flex; gap:8px; flex-wrap:wrap; }
.chips.scroll { flex-wrap:nowrap; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
.chips.scroll::-webkit-scrollbar { display:none; }

/* badges */
.badge {
  display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px;
  border-radius: var(--radius-pill); font-size:.66rem; font-weight:700; letter-spacing:.04em;
  text-transform:uppercase; background: var(--surface-3); color: var(--text-dim); border:1px solid var(--border);
}
.badge svg { width:12px;height:12px; }
.badge.gold { background: linear-gradient(180deg, rgba(212,176,106,.3), rgba(212,176,106,.16)); color: var(--accent-2); border-color: rgba(212,176,106,.4); }
.badge.early { background: rgba(127,180,216,.16); color: var(--early); border-color: rgba(127,180,216,.34); }
.badge.key { background: rgba(201,163,230,.14); color: var(--key); border-color: rgba(201,163,230,.32); }
.badge.free { background: rgba(116,198,157,.14); color: var(--good); border-color: rgba(116,198,157,.3); }
.badge.illus { background: var(--surface-3); color: var(--info); }

/* access state dots/icons */
.ax { display:inline-flex; align-items:center; gap:6px; font-size:.74rem; font-weight:600; }
.ax .ic { width:16px;height:16px; flex:0 0 auto; }
.ax.free { color: var(--good); } .ax.free .ic { color: var(--good); }
.ax.unlocked { color: var(--accent-2); } .ax.unlocked .ic { color: var(--accent); }
.ax.locked { color: var(--text-dim); } .ax.locked .ic { color: var(--text-faint); }
.ax.preview { color: var(--info); } .ax.preview .ic { color: var(--info); }
.ax.early { color: var(--early); } .ax.early .ic { color: var(--early); }
.ax.key { color: var(--key); } .ax.key .ic { color: var(--key); }
.ax.pending { color: var(--warn); } .ax.pending .ic { color: var(--warn); }
.ax.expired { color: var(--bad); } .ax.expired .ic { color: var(--bad); }
.ax.error { color: var(--bad); } .ax.error .ic { color: var(--bad); }

/* progress */
.bar { height:6px; border-radius:99px; background: var(--scrub); overflow:hidden; }
.bar > i { display:block; height:100%; border-radius:99px; background: linear-gradient(90deg, var(--s2), var(--s)); }

.ring { --p:0; width:62px; height:62px; border-radius:50%;
  background: conic-gradient(var(--s) calc(var(--p)*1%), var(--scrub) 0);
  display:grid; place-items:center; position:relative; }
.ring::before { content:""; position:absolute; inset:6px; border-radius:50%; background: var(--surface-solid); }
.ring span { position:relative; font-family: var(--serif); font-weight:600; font-size:.92rem; color: var(--text); }

/* lanes (horizontal scroll) */
.lane { display:flex; gap:14px; overflow-x:auto; scroll-snap-type: x mandatory; padding: 4px 2px 8px; scrollbar-width:none; }
.lane::-webkit-scrollbar { display:none; }
.lane > * { scroll-snap-align:start; flex: 0 0 auto; }

/* story cards */
.story-card {
  position:relative; width: 150px; border-radius: var(--radius); overflow:hidden;
  border:1px solid var(--border); background: var(--surface); transition:.22s var(--ease); cursor:pointer; display:block;
}
.story-card:hover { transform: translateY(-3px); border-color: var(--border-2); box-shadow: var(--shadow); }
.story-card .cover { aspect-ratio: 3/4; position:relative; }
.story-card .meta { padding: 10px 11px 12px; }
.story-card .meta h3 { font-family: var(--serif); font-size:.96rem; margin:0 0 2px; font-weight:600; line-height:1.2; }
.story-card .meta .by { font-size:.72rem; color: var(--text-faint); }
.story-card .ribbon { position:absolute; top:9px; right:-30px; transform:rotate(45deg); background: linear-gradient(180deg,var(--accent-2),var(--accent)); color:#1a1405; font-size:.58rem; font-weight:800; letter-spacing:.06em; padding:3px 32px; text-transform:uppercase; box-shadow:0 4px 10px rgba(0,0,0,.4); z-index:3; }
.story-card .progress-pip { position:absolute; left:9px; right:9px; bottom:8px; z-index:3; }

.grid-stories { display:grid; grid-template-columns: repeat(auto-fill, minmax(148px,1fr)); gap:16px; }

/* cover art wrapper */
.cover-art { position:absolute; inset:0; }
.cover-art .glow { position:absolute; inset:0; }

/* list rows */
.row {
  display:flex; align-items:center; gap:13px; padding:13px 12px; border-radius: var(--radius-sm);
  border:1px solid transparent; transition:.16s var(--ease); cursor:pointer; width:100%; text-align:left;
}
.row:hover { background: var(--surface); border-color: var(--border); }
.row + .row { margin-top:2px; }
.row .num { font-family: var(--serif); font-size:1.05rem; color: var(--text-faint); width:30px; flex:0 0 auto; text-align:center; }
.row .ic-col { width:34px;height:34px; flex:0 0 auto; border-radius:10px; display:grid; place-items:center; background: var(--surface-2); }
.row .body { flex:1; min-width:0; }
.row .body .t { font-weight:600; font-size:.92rem; margin-bottom:2px; display:flex; gap:7px; align-items:center; }
.row .body .t .tt { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.row .body .sub { font-size:.74rem; color: var(--text-faint); display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.row.read .body .t .tt { color: var(--text-dim); }
.row.read .body .num { color: var(--good); }
.row.now { background: color-mix(in srgb, var(--s) 8%, transparent); border-color: color-mix(in srgb, var(--s) 30%, var(--border)); }
.row .cta { flex:0 0 auto; }
.row .reason { font-size:.72rem; color: var(--text-dim); font-style: italic; margin-top:3px; }

/* arc group */
.arc { margin: 18px 0; }
.arc-head { display:flex; align-items:center; gap:11px; padding: 4px 4px 10px; border-bottom:1px solid var(--border); margin-bottom:8px; }
.arc-head h3 { font-family: var(--serif); font-size:1.04rem; margin:0; font-weight:600; }
.arc-head .arc-bar { flex:1; }
.arc-head .arc-meta { font-size:.72rem; color: var(--text-faint); white-space:nowrap; }

/* hero (story hub) */
.hero {
  position:relative; border-radius: 22px; overflow:hidden; border:1px solid var(--border);
  margin-bottom: 14px; isolation:isolate;
}
.hero .bg { position:absolute; inset:0; z-index:-1; }
.hero .grad { position:absolute; inset:0; z-index:0; background: linear-gradient(180deg, rgba(10,11,18,.1), rgba(10,11,18,.55) 45%, rgba(10,11,18,.96)); }
.hero .inner { position:relative; z-index:1; padding: 20px 16px 18px; display:flex; gap:16px; align-items:flex-end; }
.hero .mini-cover { width:104px; height:138px; flex:0 0 auto; border-radius:12px; overflow:hidden; box-shadow: var(--shadow); border:1px solid rgba(255,255,255,.18); }
.hero .htxt { min-width:0; }
.hero .htxt .eyebrow { font-size:.64rem; letter-spacing:.24em; text-transform:uppercase; color: var(--s2); font-weight:700; }
.hero .htxt h1 { font-family: var(--serif); font-size: 1.7rem; margin:4px 0 3px; font-weight:700; letter-spacing:.3px; line-height:1.05; }
.hero .htxt .author { font-size:.84rem; color: var(--text-dim); }
.hero .tags { display:flex; gap:7px; flex-wrap:wrap; margin-top:9px; }

/* quick links */
.quicklinks { display:grid; grid-template-columns: repeat(auto-fit, minmax(130px,1fr)); gap:10px; }
.quicklinks a { display:flex; flex-direction:column; gap:8px; padding:13px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); transition:.16s var(--ease); }
.quicklinks a:hover { border-color: color-mix(in srgb,var(--s) 35%, var(--border)); transform: translateY(-2px); }
.quicklinks a svg { width:20px;height:20px; color: var(--s); }
.quicklinks a span { font-size:.84rem; font-weight:600; }
.quicklinks a small { font-size:.7rem; color: var(--text-faint); }

/* sticky CTA */
.sticky-cta {
  position: fixed; left:0; right:0; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
  z-index: 50; padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgb(var(--chrome) / .97), rgb(var(--chrome) / .7) 70%, transparent);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}

/* ---------- Reader ---------- */
.reader {
  min-height: 100vh; min-height:100dvh; padding-top: 0;
  background: var(--read-bg, #0c0d14); color: var(--read-fg, var(--text));
  transition: background .4s var(--ease), color .4s var(--ease);
}
.reader-top {
  position: fixed; top:0; left:0; right:0; z-index: 70; height: var(--top-h);
  display:flex; align-items:center; gap:10px; padding: 0 12px; padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, var(--read-top, rgba(12,13,20,.9)), transparent);
  transition: opacity .3s var(--ease), transform .3s var(--ease);
}
.reader-top.hidden { opacity:0; transform: translateY(-100%); pointer-events:none; }
.reader-top .rback, .reader-top .rset { width:var(--tap); height:var(--tap); border-radius: var(--radius-pill); display:grid; place-items:center; color: var(--read-fg); }
.reader-top .rback:hover, .reader-top .rset:hover { background: rgba(127,127,127,.16); }
.reader-top .ctx { flex:1; min-width:0; text-align:center; }
.reader-top .ctx .s { font-size:.66rem; letter-spacing:.16em; text-transform:uppercase; color: var(--read-dim); }
.reader-top .ctx .c { font-family: var(--serif); font-size:.92rem; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.reader-progress { position: fixed; top:0; left:0; right:0; height:3px; z-index:80; background: transparent; }
.reader-progress > i { display:block; height:100%; background: var(--s); box-shadow: 0 0 12px var(--s); transition: width .12s linear; }

.reader-stage {
  max-width: var(--reader-w); margin: 0 auto; padding: calc(var(--top-h) + 26px) 22px 120px;
}
.reader h1.ch-title { font-family: var(--serif); font-size: 1.9rem; line-height:1.12; font-weight:700; margin:0 0 4px; letter-spacing:.2px; }
.reader .ch-by { font-size:.82rem; color: var(--read-dim); margin-bottom: 26px; }
.prose p { font-family: var(--serif); font-size: var(--fs, 1.12rem); line-height: var(--lh, 1.78); margin: 0 0 1.18em; color: var(--read-fg); }
.prose p:first-of-type::first-letter { font-size: 3.1em; float:left; line-height:.8; padding: 6px 10px 0 0; font-weight:700; color: var(--s); }
.prose .scene { text-align:center; margin: 2.1em 0; color: var(--read-dim); letter-spacing:.4em; font-size:.7rem; }
.prose figure { margin: 1.8em 0; border-radius: var(--radius); overflow:hidden; border:1px solid var(--read-border, var(--border)); background: var(--read-card, var(--surface)); }
.prose figure svg { width:100%; height:auto; }
.prose figcaption { font-size:.74rem; color: var(--read-dim); padding: 9px 13px; font-style: italic; text-align:center; }
.para { position:relative; }
.para .pchip {
  position:absolute; left:-34px; top:.1em; width:26px; height:26px; border-radius:7px; opacity:0;
  display:grid; place-items:center; background: var(--read-card, var(--surface)); border:1px solid var(--border);
  font-size:.7rem; font-weight:700; color: var(--read-dim); transition:.16s var(--ease);
}
.para:hover .pchip, .pchip.has { opacity:1; }
.para .pchip:hover { color: var(--s); border-color: var(--s); }

/* reader themes */
.reader.theme-parchment { --read-bg:#f4efe2; --read-fg:#2a2620; --read-dim:#7a7468; --read-card:#ebe4d2; --read-border:rgba(0,0,0,.12); --read-top:rgba(244,239,226,.92); }
.reader.theme-parchment .reader-progress { background: rgba(0,0,0,.06); }
.reader.theme-twilight { --read-bg:#22252e; --read-fg:#d8d4cb; --read-dim:#9a958c; --read-card:#2a2d37; --read-border:rgba(255,255,255,.08); --read-top:rgba(34,37,46,.92); }
.reader.theme-aether { --read-bg:#070809; --read-fg:#dcd8d0; --read-dim:#6f6e6a; --read-card:#101216; --read-border:rgba(255,255,255,.07); --read-top:rgba(7,8,9,.9); }
/* presets */
.reader.preset-dyslexia .prose p { font-family: var(--ui); letter-spacing:.02em; word-spacing:.08em; --lh: 2.0; }
.reader.preset-compact .prose p { --fs: 1rem; --lh:1.62; }
.reader.preset-compact .prose p:first-of-type::first-letter { font-size:2.4em; }
.reader.preset-bedtime { filter: sepia(.18) brightness(.92); }

/* reader control bar */
.reader-bar {
  position: fixed; left:50%; transform: translateX(-50%); bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 65; display:flex; gap:4px; padding:7px; border-radius: var(--radius-pill);
  background: var(--read-card, var(--surface-solid)); border:1px solid var(--read-border, var(--border-2));
  box-shadow: var(--shadow-lg); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
.reader-bar button { width:42px; height:42px; border-radius: var(--radius-pill); display:grid; place-items:center; color: var(--read-fg); transition:.16s var(--ease); position:relative; }
.reader-bar button:hover { background: rgba(127,127,127,.18); }
.reader-bar button.active { color: var(--s); background: var(--s-soft); }
.reader-bar button .mini { position:absolute; top:-3px; right:-3px; background: var(--accent); color:#15110a; font-size:.58rem; font-weight:800; border-radius:99px; min-width:15px; height:15px; display:grid; place-items:center; padding:0 3px; }

/* end of chapter */
.eoc { margin: 34px 0 10px; border-top:1px solid var(--read-border, var(--border)); padding-top: 26px; }
.eoc .done { text-align:center; font-family: var(--serif); color: var(--s); margin-bottom: 18px; }
.eoc .done .orn { font-size:1.5rem; opacity:.7; }
.eoc .done p { margin:4px 0 0; font-size:.86rem; color: var(--read-dim); }
.reactions { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin: 18px 0 24px; }
.react { display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 12px; border-radius:14px; background: var(--read-card, var(--surface)); border:1px solid var(--read-border, var(--border)); min-width:64px; transition:.16s var(--ease); }
.react:active { transform: scale(.92); }
.react .e { font-size:1.4rem; line-height:1; }
.react .n { font-size:.72rem; color: var(--read-dim); font-weight:600; }
.react.picked .e { filter: drop-shadow(0 0 8px var(--s)); }

/* comment box */
.comments { margin: 8px 0 0; }
.cmt-form { display:flex; gap:9px; margin-bottom:14px; }
.cmt-form input, .cmt-form textarea { flex:1; background: var(--read-card, var(--surface)); border:1px solid var(--read-border, var(--border)); border-radius: var(--radius-sm); padding: 11px 13px; color: var(--read-fg); font-size:.9rem; }
.cmt { display:flex; gap:10px; padding:11px 0; border-bottom:1px solid var(--read-border, var(--border)); }
.cmt .ava { width:30px;height:30px;border-radius:50%; flex:0 0 auto; display:grid; place-items:center; font-size:.74rem; font-weight:700; color:#15110a; }
.cmt .body { flex:1; }
.cmt .body .who { font-size:.78rem; font-weight:600; display:flex; gap:8px; align-items:center; }
.cmt .body .who time { font-weight:400; color: var(--read-dim); font-size:.7rem; }
.cmt .body p { font-size:.86rem; margin:3px 0 0; color: var(--read-fg); font-family: var(--ui); }

/* preview wall */
.preview-wall { margin: 30px 0 8px; border-radius: var(--radius); overflow:hidden; border:1px solid color-mix(in srgb,var(--s) 30%, var(--border)); background: var(--read-card, var(--surface)); }
.preview-wall .top { height:1px; background: linear-gradient(90deg, transparent, var(--s), transparent); }
.preview-wall .inner { padding: 22px 20px; text-align:center; }
.preview-wall h3 { font-family: var(--serif); font-size:1.16rem; margin:0 0 6px; }
.preview-wall p { font-size:.84rem; color: var(--read-dim); margin:0 0 16px; line-height:1.5; }

/* locked chapter fallback */
.locked-fallback { max-width: var(--reader-w); margin: 0 auto; padding: calc(var(--top-h) + 40px) 22px 120px; text-align:center; }
.locked-fallback .emblem { width:84px; height:84px; margin: 0 auto 18px; border-radius:50%; display:grid; place-items:center; background: var(--s-soft); border:1px solid color-mix(in srgb,var(--s) 30%, var(--border)); color: var(--s); }
.locked-fallback h1 { font-family: var(--serif); font-size:1.5rem; margin:0 0 6px; }
.locked-fallback .sub { color: var(--text-dim); margin-bottom: 22px; }

/* ---------- Bottom sheet ---------- */
.scrim { position: fixed; inset:0; z-index: 90; background: rgb(var(--chrome) / .6); backdrop-filter: blur(3px); opacity:0; transition: opacity .25s var(--ease); pointer-events:none; }
.scrim.open { opacity:1; pointer-events:auto; }
.sheet {
  position: fixed; left:0; right:0; bottom:0; z-index: 95; max-height: 86vh; max-height:86dvh; overflow-y:auto;
  background: var(--surface-solid-2); border:1px solid var(--border-2); border-bottom:none;
  border-radius: 22px 22px 0 0; padding: 10px 16px calc(20px + env(safe-area-inset-bottom));
  transform: translateY(100%); transition: transform .32s var(--ease);
  box-shadow: var(--shadow-lg);
}
.sheet.open { transform: translateY(0); }
.sheet .grip { width:40px; height:5px; border-radius:99px; background: rgba(255,255,255,.22); margin: 4px auto 14px; }
.sheet h2 { font-family: var(--serif); font-size:1.22rem; margin:0 0 4px; }
.sheet .sheet-sub { font-size:.84rem; color: var(--text-dim); margin-bottom: 16px; }
.sheet .close-x { position:absolute; top:14px; right:14px; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; color: var(--text-dim); background: var(--surface-2); }

/* settings rows */
.set-group { margin: 10px 0 18px; }
.set-group > label { display:block; font-size:.74rem; letter-spacing:.12em; text-transform:uppercase; color: var(--text-faint); font-weight:700; margin-bottom:9px; }
.seg { display:flex; gap:6px; background: var(--surface); border:1px solid var(--border); border-radius: var(--radius-sm); padding:4px; }
.seg button { flex:1; min-height:38px; border-radius:8px; font-size:.82rem; font-weight:600; color: var(--text-dim); transition:.16s var(--ease); }
.seg button.active { background: var(--surface-3); color: var(--text); box-shadow: var(--shadow-sm); }
.seg.story button.active { background: var(--s-soft); color: var(--s2); }
.toggle-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 12px 2px; border-bottom:1px solid var(--border); }
.toggle-row:last-child { border-bottom:none; }
.toggle-row .lbl { font-size:.88rem; }
.toggle-row .lbl small { display:block; color: var(--text-faint); font-size:.72rem; margin-top:1px; }
.switch { width:46px; height:27px; border-radius:99px; background: var(--track); position:relative; transition:.2s var(--ease); flex:0 0 auto; }
.switch::after { content:""; position:absolute; top:3px; left:3px; width:21px; height:21px; border-radius:50%; background:#fff; transition:.2s var(--ease); }
.switch.on { background: var(--accent); }
.switch.on::after { left:22px; }

.range { width:100%; -webkit-appearance:none; appearance:none; height:6px; border-radius:99px; background: var(--track); outline:none; }
.range::-webkit-slider-thumb { -webkit-appearance:none; width:20px;height:20px;border-radius:50%; background: var(--accent); cursor:pointer; box-shadow: 0 2px 8px rgba(0,0,0,.4); }
.range::-moz-range-thumb { width:20px;height:20px;border:none;border-radius:50%; background: var(--accent); cursor:pointer; }

/* ---------- Toast ---------- */
.toasts { position: fixed; left:50%; bottom: calc(var(--nav-h) + 22px + env(safe-area-inset-bottom)); transform: translateX(-50%); z-index: 120; display:flex; flex-direction:column; gap:8px; align-items:center; pointer-events:none; width: min(92vw, 460px); }
.toast { width:100%; display:flex; align-items:center; gap:11px; padding: 13px 15px; border-radius: 14px; background: var(--surface-solid-2); border:1px solid var(--border-2); box-shadow: var(--shadow); pointer-events:auto; transform: translateY(20px); opacity:0; transition:.3s var(--ease); }
.toast.show { transform: translateY(0); opacity:1; }
.toast .ic { width:30px;height:30px;border-radius:8px; display:grid; place-items:center; background: var(--accent-soft); color: var(--accent); flex:0 0 auto; }
.toast .ic.good { background: rgba(116,198,157,.16); color: var(--good); }
.toast .ic.bad { background: rgba(215,123,107,.16); color: var(--bad); }
.toast .txt { flex:1; font-size:.84rem; }
.toast .txt b { display:block; font-weight:700; }
.toast .txt small { color: var(--text-dim); }
.toast .act { font-size:.8rem; font-weight:700; color: var(--accent); }

/* ---------- Misc blocks ---------- */
.benefit-card { padding: 16px; border-radius: var(--radius); background: var(--surface); border:1px solid var(--border); display:flex; gap:13px; }
.benefit-card .ic { width:40px;height:40px; border-radius:11px; display:grid; place-items:center; background: var(--s-soft); color: var(--s); flex:0 0 auto; }
.benefit-card h4 { margin:0 0 3px; font-size:.96rem; font-family: var(--serif); font-weight:600; }
.benefit-card p { margin:0; font-size:.8rem; color: var(--text-dim); line-height:1.45; }

.timeline { position:relative; padding-left: 22px; }
.timeline::before { content:""; position:absolute; left:7px; top:6px; bottom:6px; width:2px; background: var(--border); }
.tl-item { position:relative; padding: 0 0 18px; }
.tl-item::before { content:""; position:absolute; left:-19px; top:3px; width:12px;height:12px;border-radius:50%; background: var(--surface-solid); border:2px solid var(--accent); }
.tl-item.bad::before { border-color: var(--bad); }
.tl-item.warn::before { border-color: var(--warn); }
.tl-item .when { font-size:.72rem; color: var(--text-faint); }
.tl-item .what { font-size:.88rem; font-weight:500; }

.stat-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:10px; }
.stat { padding: 14px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); text-align:center; }
.stat .n { font-family: var(--serif); font-size:1.6rem; font-weight:700; color: var(--s2); line-height:1; }
.stat .l { font-size:.72rem; color: var(--text-dim); margin-top:4px; }

.announce {
  display:flex; gap:11px; align-items:flex-start; padding: 12px 14px; border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface)); border:1px solid color-mix(in srgb,var(--accent) 26%, var(--border));
  margin-bottom: 14px;
}
.announce .ic { color: var(--accent); flex:0 0 auto; margin-top:1px; }
.announce .t { font-size:.86rem; }
.announce .t b { display:block; margin-bottom:2px; }
.announce .t span { color: var(--text-dim); font-size:.8rem; }

/* glossary / cast */
.dl { display:grid; grid-template-columns: auto 1fr; gap: 8px 16px; }
.dl dt { font-family: var(--serif); font-weight:600; color: var(--s2); font-size:.9rem; }
.dl dd { margin:0; font-size:.84rem; color: var(--text-dim); }

/* helpers */
.row-flex { display:flex; align-items:center; gap:12px; }
.col-flex { display:flex; flex-direction:column; gap:12px; }
.between { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.muted { color: var(--text-dim); }
.faint { color: var(--text-faint); }
.center { text-align:center; }
.serif { font-family: var(--serif); }
.mt0{margin-top:0} .mb0{margin-bottom:0} .mt8{margin-top:8px} .mt12{margin-top:12px} .mt16{margin-top:16px}
.pill-input { width:100%; background: var(--surface); border:1px solid var(--border-2); border-radius: var(--radius-pill); padding: 13px 18px; font-size:.95rem; letter-spacing:.1em; text-align:center; }
hr.soft { border:none; border-top:1px solid var(--border); margin: 18px 0; }
.kbd { font-family: var(--ui); font-size:.74rem; padding:2px 7px; border-radius:6px; background: var(--surface-2); border:1px solid var(--border-2); border-bottom-width:2px; }

/* empty state */
.empty { text-align:center; padding: 40px 20px; }
.empty .em { font-size: 2.6rem; opacity:.6; margin-bottom: 10px; }
.empty h3 { font-family: var(--serif); margin:0 0 6px; }
.empty p { color: var(--text-dim); margin:0 auto 18px; max-width: 320px; font-size:.88rem; }

/* entrance animations */
@keyframes rise { from { opacity:0; transform: translateY(12px);} to {opacity:1; transform:none;} }
.rise { animation: rise .5s var(--ease) both; }
.stagger > * { animation: rise .5s var(--ease) both; }
.stagger > *:nth-child(1){animation-delay:.02s} .stagger > *:nth-child(2){animation-delay:.06s}
.stagger > *:nth-child(3){animation-delay:.10s} .stagger > *:nth-child(4){animation-delay:.14s}
.stagger > *:nth-child(5){animation-delay:.18s} .stagger > *:nth-child(6){animation-delay:.22s}
.stagger > *:nth-child(7){animation-delay:.26s} .stagger > *:nth-child(8){animation-delay:.30s}

/* view transition fallback */
.vt { animation: vtIn .34s var(--ease) both; }
@keyframes vtIn { from { opacity:0; transform: translateY(8px) scale(.995);} to {opacity:1; transform:none;} }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: .3s; }

/* large screens */
@media (min-width: 760px) {
  :root { --nav-h: 68px; }
  #main { padding-left: 24px; padding-right: 24px; }
  .stat-grid { grid-template-columns: repeat(4,1fr); }
  .story-card { width: 168px; }
}
@media (min-width: 1040px) {
  .home-cols { display:grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 22px; align-items:start; }
  .home-cols > * { min-width:0; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
}

/* ---- helper additions ---- */
.mi { display:inline-flex; gap:5px; align-items:center; }
.sub .mi svg { width:13px; height:13px; opacity:.85; flex:0 0 auto; }
.row .sub { gap:9px; }
.dotnow { width:7px; height:7px; border-radius:50%; background: var(--s); box-shadow:0 0 8px var(--s); display:inline-block; flex:0 0 auto; margin-right:2px; }
.no-img .prose figure { display:none; }
.no-pchip .pchip { display:none !important; }
.prose, .prose .para { position:relative; }
.reader.focus .reader-top, .reader.focus .reader-bar { opacity:0; pointer-events:none; transition:opacity .3s var(--ease); }
.reader.focus.ui-on .reader-top, .reader.focus.ui-on .reader-bar { opacity:1; pointer-events:auto; }
.reader-bar { transition: opacity .3s var(--ease); }
details > summary { list-style:none; }
details > summary::-webkit-details-marker { display:none; }
details[open] summary > svg { transform:rotate(90deg); }
summary > svg { width:16px; height:16px; transition:transform .2s var(--ease); color: var(--text-faint); }
.brand > span { display:flex; flex-direction:column; line-height:1.05; }
.topbar .brand .serif { font-size:1.02rem; }
@media (max-width:380px){ .topbar .brand small{ display:none; } .topbar .access-chip{ padding:0 10px; font-size:.72rem; } .topbar .access-chip span:not(.pulse){ max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } }
.quote-fab { transition: opacity .25s var(--ease), transform .25s var(--ease); }

/* =====================================================================
   SITE THEMES â€” atmospheric literary presets (app-wide)
   Applied via <html data-theme="name">. Default (:root) = Aether.
   ===================================================================== */
:root, [data-theme="aether"] {
  --bg: #0a0b12; --bg-grad-a: rgba(122,92,200,.10); --bg-grad-b: rgba(70,150,170,.08);
  --surface: rgba(255,255,255,.035); --surface-2: rgba(255,255,255,.06); --surface-3: rgba(255,255,255,.09);
  --surface-solid:#14161f; --surface-solid-2:#1a1d28;
  --border: rgba(255,255,255,.08); --border-2: rgba(255,255,255,.14);
  --text:#ECE9E1; --text-dim:#a6a39c; --text-faint:#71706c;
  --accent:#d4b06a; --accent-2:#e7cd97; --accent-soft:rgba(212,176,106,.14);
  --chrome:10 11 18; --scrub:rgba(255,255,255,.1);
}
[data-theme="ember"] {
  --bg:#130c0a; --bg-grad-a: rgba(224,138,74,.12); --bg-grad-b: rgba(180,70,40,.10);
  --surface: rgba(255,225,200,.04); --surface-2: rgba(255,225,200,.07); --surface-3: rgba(255,225,200,.11);
  --surface-solid:#1d130e; --surface-solid-2:#241711;
  --border: rgba(255,200,160,.09); --border-2: rgba(255,200,160,.16);
  --text:#f2e6da; --text-dim:#c2a896; --text-faint:#8c7565;
  --accent:#e08a4a; --accent-2:#f0ac74; --accent-soft:rgba(224,138,74,.16);
  --chrome:19 12 10; --scrub:rgba(255,200,160,.1);
}
[data-theme="frost"] {
  --bg:#0a1014; --bg-grad-a: rgba(110,182,201,.12); --bg-grad-b: rgba(80,130,170,.09);
  --surface: rgba(220,240,255,.035); --surface-2: rgba(220,240,255,.065); --surface-3: rgba(220,240,255,.10);
  --surface-solid:#0f1820; --surface-solid-2:#14212b;
  --border: rgba(200,230,255,.08); --border-2: rgba(200,230,255,.15);
  --text:#e6eef2; --text-dim:#9fb4bf; --text-faint:#6b7f8a;
  --accent:#6fb6c9; --accent-2:#9fd2e0; --accent-soft:rgba(111,182,201,.16);
  --chrome:10 16 20; --scrub:rgba(200,230,255,.1);
}
[data-theme="midnight"] {
  --bg:#07060d; --bg-grad-a: rgba(154,126,209,.13); --bg-grad-b: rgba(90,70,150,.10);
  --surface: rgba(245,235,255,.035); --surface-2: rgba(245,235,255,.065); --surface-3: rgba(245,235,255,.10);
  --surface-solid:#100e1a; --surface-solid-2:#161324;
  --border: rgba(230,220,255,.08); --border-2: rgba(230,220,255,.15);
  --text:#ece8f6; --text-dim:#a89fc0; --text-faint:#736c8c;
  --accent:#9a7ed1; --accent-2:#bda4ee; --accent-soft:rgba(154,126,209,.18);
  --chrome:7 6 13; --scrub:rgba(230,220,255,.1);
}
[data-theme="sage"] {
  --bg:#0b100c; --bg-grad-a: rgba(143,185,138,.11); --bg-grad-b: rgba(120,160,110,.08);
  --surface: rgba(230,245,225,.035); --surface-2: rgba(230,245,225,.065); --surface-3: rgba(230,245,225,.10);
  --surface-solid:#10160f; --surface-solid-2:#161e14;
  --border: rgba(210,235,205,.08); --border-2: rgba(210,235,205,.15);
  --text:#e7eee2; --text-dim:#a7b8a2; --text-faint:#74876f;
  --accent:#8fb98a; --accent-2:#b4d6af; --accent-soft:rgba(143,185,138,.17);
  --chrome:11 16 12; --scrub:rgba(210,235,205,.1);
}
/* Light theme â€” Parchment: inverts chrome/surfaces to sit on cream */
[data-theme="parchment"] {
  --bg:#f4efe2; --bg-grad-a: rgba(154,107,63,.10); --bg-grad-b: rgba(120,90,50,.07);
  --surface: rgba(60,40,20,.04); --surface-2: rgba(60,40,20,.065); --surface-3: rgba(60,40,20,.10);
  --surface-solid:#efe8d8; --surface-solid-2:#e8e0cd;
  --border: rgba(60,40,20,.12); --border-2: rgba(60,40,20,.20);
  --text:#2c2620; --text-dim:#6f6557; --text-faint:#9a8d7b;
  --accent:#9a6b3f; --accent-2:#b58658; --accent-soft:rgba(154,107,63,.14);
  --chrome:244 239 226; --scrub:rgba(60,40,20,.12); --track:rgba(60,40,20,.18);
  --shadow-sm:0 4px 16px rgba(80,60,30,.18); --shadow:0 12px 40px rgba(80,60,30,.22); --shadow-lg:0 24px 70px rgba(80,60,30,.28);
}
[data-theme="parchment"] .btn:hover { border-color: rgba(60,40,20,.3); }
[data-theme="parchment"] .sheet .grip { background: rgba(60,40,20,.25); }
[data-theme="parchment"] ::-webkit-scrollbar-thumb { background: rgba(60,40,20,.2); }

/* theme swatches (in settings/persona) */
.theme-swatches { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
.swatch { position:relative; display:flex; flex-direction:column; gap:5px; padding:9px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); cursor:pointer; transition:.16s var(--ease); text-align:left; }
.swatch.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.swatch .dot { width:100%; height:26px; border-radius:7px; border:1px solid rgba(255,255,255,.12); }
.swatch .nm { font-size:.72rem; font-weight:600; }
.swatch .ck { position:absolute; top:7px; right:7px; color: var(--accent); opacity:0; }
.swatch.active .ck { opacity:1; }

/* =====================================================================
   BOOK HOME â€” living feed (1-2 deep books, everything new visible)
   ===================================================================== */
.book-hero {
  position:relative; border-radius:22px; overflow:hidden; border:1px solid var(--border); isolation:isolate; margin-bottom:14px;
}
.book-hero .bg { position:absolute; inset:0; z-index:-1; }
.book-hero .grad { position:absolute; inset:0; z-index:0; background: linear-gradient(180deg, rgb(var(--chrome) / .15), rgb(var(--chrome) / .55) 45%, rgb(var(--chrome) / .97)); }
.book-hero .inner { position:relative; z-index:1; padding:16px; }
.book-hero .top { display:flex; gap:14px; align-items:flex-end; }
.book-hero .cover { width:92px; height:124px; flex:0 0 auto; border-radius:11px; overflow:hidden; box-shadow:var(--shadow); border:1px solid rgba(255,255,255,.18); }
.book-hero .htxt { min-width:0; flex:1; }
.book-hero .htxt .eyebrow { font-size:.62rem; letter-spacing:.24em; text-transform:uppercase; color: var(--s2); font-weight:700; }
.book-hero .htxt h1 { font-family:var(--serif); font-size:1.55rem; margin:3px 0 2px; font-weight:700; line-height:1.05; }
.book-hero .htxt .author { font-size:.82rem; color: var(--text-dim); }
.book-hero .progress-line { margin-top:14px; }
.book-hero .cta-row { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }

/* activity feed */
.feed { display:flex; flex-direction:column; gap:10px; }
.feed-item { display:flex; gap:12px; padding:13px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); transition:.16s var(--ease); cursor:pointer; width:100%; text-align:left; }
.feed-item:hover { border-color: var(--border-2); transform: translateY(-1px); }
.feed-item .fico { width:38px; height:38px; flex:0 0 auto; border-radius:11px; display:grid; place-items:center; }
.feed-item .fbody { min-width:0; flex:1; }
.feed-item .fbody .ftop { display:flex; gap:8px; align-items:center; margin-bottom:2px; flex-wrap:wrap; }
.feed-item .fbody .ft { font-weight:600; font-size:.9rem; }
.feed-item .fbody .fd { font-size:.78rem; color: var(--text-dim); line-height:1.45; }
.feed-item .fbody .fmeta { font-size:.7rem; color: var(--text-faint); margin-top:5px; display:flex; gap:9px; flex-wrap:wrap; }
.feed-item .fthumb { width:54px; height:54px; flex:0 0 auto; border-radius:9px; overflow:hidden; border:1px solid var(--border); }

/* schedule strip */
.sched { display:flex; gap:10px; overflow-x:auto; padding:4px 2px 8px; scrollbar-width:none; }
.sched::-webkit-scrollbar { display:none; }
.sched-card { flex:0 0 auto; min-width:128px; padding:12px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); }
.sched-card .dow { font-size:.66rem; letter-spacing:.12em; text-transform:uppercase; color: var(--text-faint); font-weight:700; }
.sched-card .dt { font-family:var(--serif); font-size:1.05rem; font-weight:600; margin:2px 0 6px; }
.sched-card .dl { font-size:.74rem; color: var(--text-dim); line-height:1.4; }

/* second-book rail */
.book-pair { display:grid; grid-template-columns: 1fr; gap:14px; }
@media (min-width:680px){ .book-pair { grid-template-columns: 1fr 1fr; } }

/* =====================================================================
   AETHER STUDIO â€” author CMS (separated area, own chrome)
   ===================================================================== */
body.in-studio { --top-h: 52px; }
body.in-studio #main { padding-bottom: 28px; }
.studio-top {
  position: fixed; top:0; left:0; right:0; z-index:60;
  padding: env(safe-area-inset-top) 12px 0;
  background: linear-gradient(180deg, rgb(var(--chrome) / .96), rgb(var(--chrome) / .7) 80%, transparent);
  backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border-bottom: 1px solid var(--border);
}
.studio-top .st-row { display:flex; align-items:center; gap:9px; min-width:0; height: var(--top-h); }
.studio-top .brand { display:flex; align-items:center; gap:8px; font-family:var(--serif); font-weight:700; font-size:1rem; min-width:0; }
.studio-top .brand .mark { width:24px; height:24px; flex:0 0 auto; }
.studio-top .brand small { font-family:var(--ui); font-weight:600; font-size:.56rem; letter-spacing:.2em; text-transform:uppercase; color: var(--accent-2); }
.studio-top .exit { margin-left:auto; }
.studio-nav { display:flex; gap:6px; overflow-x:auto; padding: 0 12px 8px; scrollbar-width:none; }
.studio-nav::-webkit-scrollbar { display:none; }
.studio-nav a {
  display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 13px; flex:0 0 auto;
  border-radius: var(--radius-pill); background: var(--surface-2); border:1px solid var(--border);
  font-size:.8rem; font-weight:600; color: var(--text-dim); transition:.16s var(--ease); white-space:nowrap;
}
.studio-nav a svg { width:15px; height:15px; }
.studio-nav a.active { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 45%, transparent); color: var(--accent-2); }
.studio-body { padding-top: calc(var(--top-h) + 46px); }

/* studio KPI row */
.kpis { display:grid; grid-template-columns: repeat(2,1fr); gap:10px; }
@media (min-width:680px){ .kpis { grid-template-columns: repeat(4,1fr); } }
.kpi { padding:14px; border-radius: var(--radius-sm); background: var(--surface); border:1px solid var(--border); }
.kpi .lbl { font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color: var(--text-faint); font-weight:700; }
.kpi .val { font-family:var(--serif); font-size:1.7rem; font-weight:700; line-height:1; margin-top:5px; }
.kpi .delta { font-size:.72rem; margin-top:4px; }
.kpi .delta.up { color: var(--good); } .kpi .delta.down { color: var(--bad); }

/* studio management rows */
.mgr-row { display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); }
.mgr-row + .mgr-row { margin-top:8px; }
.mgr-row .mi-ic { width:34px; height:34px; flex:0 0 auto; border-radius:9px; display:grid; place-items:center; background: var(--surface-2); }
.mgr-row .mi-body { flex:1; min-width:0; }
.mgr-row .mi-body .mi-t { font-weight:600; font-size:.9rem; display:flex; gap:7px; align-items:center; flex-wrap:wrap; }
.mgr-row .mi-body .mi-s { font-size:.74rem; color: var(--text-faint); margin-top:2px; }
.mgr-row .mi-acts { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }

/* draft composer card */
.composer textarea { width:100%; background: var(--surface); border:1px solid var(--border-2); border-radius: var(--radius-sm); padding:13px; font-size:.9rem; min-height:90px; resize:vertical; }
.composer input[type=text] { width:100%; background: var(--surface); border:1px solid var(--border-2); border-radius: var(--radius-pill); padding:12px 16px; font-size:.92rem; }

/* state selector pills (publishing) */
.state-pills { display:flex; gap:6px; flex-wrap:wrap; }
.state-pill { display:inline-flex; align-items:center; gap:5px; height:30px; padding:0 11px; border-radius: var(--radius-pill); background: var(--surface-2); border:1px solid var(--border); font-size:.74rem; font-weight:600; color: var(--text-dim); cursor:pointer; }
.state-pill.active { color: var(--text); border-color: var(--accent); background: var(--accent-soft); }

/* mini bar chart */
.bars { display:flex; align-items:flex-end; gap:5px; height:90px; padding-top:8px; }
.bars i { flex:1; border-radius:5px 5px 0 0; background: linear-gradient(180deg, var(--accent-2), var(--accent)); min-width:6px; opacity:.85; }

/* media gallery grid */
.media-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap:10px; }
.media-cell { aspect-ratio: 4/3; border-radius: var(--radius-sm); overflow:hidden; border:1px solid var(--border); position:relative; background: var(--surface); cursor:pointer; }
.media-cell svg { width:100%; height:100%; }
.media-cell .tag { position:absolute; left:6px; bottom:6px; font-size:.6rem; padding:2px 7px; border-radius:99px; background: rgb(var(--chrome) / .8); color: var(--text); }

/* reader/studio area switch */
.area-switch { display:flex; gap:6px; padding:4px; border-radius: var(--radius-pill); background: var(--surface); border:1px solid var(--border); width:max-content; }
.area-switch button { height:34px; padding:0 14px; border-radius:99px; font-size:.8rem; font-weight:600; color: var(--text-dim); display:inline-flex; gap:6px; align-items:center; }
.area-switch button.active { background: var(--accent-soft); color: var(--accent-2); }


```

---

## File Path: `js/subscription/aether-data.js`

```javascript
﻿/* =====================================================================
   AETHER PAGES â€” Mock content data (no backend)
   Provides stories, chapters with multiple access states, updates,
   collections, bonus materials, notifications, glossary, recaps.
   ===================================================================== */
window.DATA = (function () {

  // ---- shared inline art (embedded SVG so it works offline / sandbox) ----
  const FIG = {
    chapel: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: the chapel door">
      <defs>
        <linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a2e"/><stop offset="1" stop-color="#0c0a12"/></linearGradient>
        <radialGradient id="gl1" cx="50%" cy="42%" r="55%"><stop offset="0" stop-color="#c75b6b" stop-opacity=".55"/><stop offset="1" stop-color="#c75b6b" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk1)"/>
      <rect width="800" height="460" fill="url(#gl1)"/>
      <g stroke="#e6a8b0" stroke-opacity=".25" fill="none" stroke-width="1">
        <path d="M400 70 L470 200 L400 250 L330 200 Z"/><path d="M400 250 L400 360"/><path d="M330 200 L330 360"/><path d="M470 200 L470 360"/>
      </g>
      <rect x="300" y="360" width="200" height="100" fill="#0c0a12" fill-opacity=".6"/>
      <circle cx="400" cy="300" r="46" fill="none" stroke="#c75b6b" stroke-width="2" stroke-opacity=".7"/>
      <circle cx="400" cy="300" r="8" fill="#e6a8b0"/>
    </svg>`,
    station: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: orbital station above a red planet">
      <defs>
        <linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06141a"/><stop offset="1" stop-color="#020608"/></linearGradient>
        <radialGradient id="pl" cx="38%" cy="70%" r="55%"><stop offset="0" stop-color="#b5573b"/><stop offset=".7" stop-color="#5a2616"/><stop offset="1" stop-color="#1a0c08"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk2)"/>
      <g fill="#9fdce8" fill-opacity=".8"><circle cx="90" cy="60" r="1"/><circle cx="210" cy="120" r="1.4"/><circle cx="640" cy="80" r="1"/><circle cx="720" cy="200" r="1.6"/><circle cx="520" cy="40" r="1"/></g>
      <circle cx="300" cy="360" r="180" fill="url(#pl)"/>
      <ellipse cx="300" cy="360" rx="240" ry="40" fill="none" stroke="#5bb8c9" stroke-opacity=".4" stroke-width="1.5"/>
      <g transform="translate(560 150)"><rect x="-46" y="-14" width="92" height="28" rx="6" fill="#102a30" stroke="#5bb8c9" stroke-opacity=".6"/><rect x="-30" y="-6" width="60" height="12" rx="3" fill="#5bb8c9" fill-opacity=".25"/><circle cx="46" cy="0" r="9" fill="#020608" stroke="#5bb8c9"/></g>
    </svg>`,
    gate: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: the meridian gate at dusk">
      <defs>
        <linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241a08"/><stop offset="1" stop-color="#0c0905"/></linearGradient>
        <radialGradient id="sun" cx="50%" cy="60%" r="40%"><stop offset="0" stop-color="#e7cd97"/><stop offset="1" stop-color="#d4b06a" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk3)"/>
      <rect width="800" height="460" fill="url(#sun)"/>
      <g fill="none" stroke="#d4b06a" stroke-opacity=".35" stroke-width="1.5">
        <circle cx="400" cy="300" r="120"/><circle cx="400" cy="300" r="90"/><circle cx="400" cy="300" r="60"/>
      </g>
      <path d="M400 180 L400 420 M250 300 L550 300" stroke="#e7cd97" stroke-opacity=".5" stroke-width="2"/>
      <g fill="#d4b06a" fill-opacity=".5"><rect x="120" y="300" width="14" height="160"/><rect x="666" y="300" width="14" height="160"/></g>
    </svg>`,
    map: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: a hand-drawn cartographer's map">
      <rect width="800" height="460" fill="#10131c"/>
      <g stroke="#9a7ed1" stroke-opacity=".5" fill="none" stroke-width="1.4">
        <path d="M120 120 C 240 90, 300 180, 420 160 S 620 220, 680 150"/>
        <path d="M150 340 C 280 300, 360 360, 500 320 S 660 360, 700 310"/>
        <path d="M300 150 L320 230 L260 250 Z"/>
      </g>
      <g fill="#c4b1ec"><circle cx="300" cy="200" r="4"/><circle cx="500" cy="300" r="4"/><circle cx="620" cy="180" r="4"/></g>
      <g font-family="Georgia, serif" fill="#9a7ed1" fill-opacity=".7" font-size="13" font-style="italic">
        <text x="312" y="196">Vael</text><text x="512" y="296">The Drowned Reach</text><text x="632" y="176">Old Caldera</text>
      </g>
      <path d="M120 380 L180 360 L160 400 Z" fill="#9a7ed1" fill-opacity=".5"/>
    </svg>`,
    portrait: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: a character portrait">
      <defs><linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1424"/><stop offset="1" stop-color="#0a0810"/></linearGradient></defs>
      <rect width="800" height="460" fill="url(#pp)"/>
      <ellipse cx="400" cy="200" rx="90" ry="100" fill="#2a2030"/>
      <path d="M300 300 C 320 250, 480 250, 500 300 L520 420 L280 420 Z" fill="#241a2e"/>
      <circle cx="372" cy="195" r="6" fill="#c75b6b"/><circle cx="428" cy="195" r="6" fill="#c75b6b"/>
      <path d="M360 240 Q400 262 440 240" stroke="#e6a8b0" stroke-opacity=".6" fill="none" stroke-width="2"/>
    </svg>`
  };

  const STORIES = [
    {
      id: "glass-orchard", slug: "the-glass-orchard",
      title: "The Glass Orchard", author: "Vesper Maren", tagline: "A garden that remembers everything buried beneath it.",
      accent: "#c75b6b", accent2: "#e6a8b0", genre: "Gothic Fantasy", status: "ongoing",
      motif: "shards", tags: ["Gothic", "Mystery", "Slow-burn"],
      premise: "Beyond the village of Lychford lies an orchard where the fruit is made of glass â€” each one the memory of a secret someone tried to bury. When apothecary's daughter Iola inherits the key, she learns the orchard has been waiting a very long time to be heard.",
      recapSafe: "A young woman inherits a forbidden glass orchard and begins to uncover the memories trapped inside each fruit. The village would rather she forget.",
      arc: "Arc I â€” The Mulberry Key",
      cast: [
        { n: "Iola Veth", r: "An apothecary's daughter who inherits the orchard's only key." },
        { n: "Warden Halric", r: "The aging keeper who has watched the orchard for forty years." },
        { n: "The Bell-Ringer", r: "Unnamed. Rings the glass bells before each remembering." }
      ],
      glossary: [
        { t: "Glass fruit", d: "A memory crystallized in the orchard; each bears the shape of a buried truth." },
        { t: "The Mulberry Key", d: "The single key that opens the orchard gate; passed only by inheritance." },
        { t: "Lychford", d: "The village that built its quiet peace on top of what the orchard holds." }
      ],
      chapters: [
        { id: "go-1", n: 1, arc: "Arc I â€” The Mulberry Key", title: "Inheritance of Glass", state: "free", readTime: 9,
          content: [
            { t: "p", v: "The lawyer read the will as though the words might bite him. Iola watched his jaw work around the phrase 'glass orchard' the way a man chews a stone he has mistaken for bread." },
            { t: "p", v: "'It is not,' he said at last, 'a metaphor.'" },
            { t: "p", v: "Outside the window, Lychford was performing its afternoon gentility: a dog asleep in a triangle of sun, the baker sweeping flour from his step as if flour were a thing to be ashamed of. Iola thought the village had been doing this â€” performing its own ordinariness â€” for as long as anyone could remember. Possibly that was the point." },
            { t: "p", v: "'Your aunt,' the lawyer continued, 'left you the orchard in its entirety. The house. The outbuildings. And the â€” the key.' He said the word like a man confessing." },
            { t: "p", v: "She had not cried at the funeral. She had not cried since the telegram. Crying, she had decided somewhere on the train, required a private place to do it, and an aunt who left you an orchard of glass fruit was not the sort of aunt who had left you a private place." },
            { t: "img", fig: "chapel", cap: "The gatehouse at the edge of the orchard, where the key had waited forty years." },
            { t: "p", v: "'The orchard has been closed,' the lawyer said, 'since 1981.' He paused. 'Miss Veth, I feel I ought to tell you that no one in this office has ever seen it open. The previous keeper â€” your aunt â€” attended to it, we understood, from the outside. The gate was not â€” the gate has a lock that â€” '" },
            { t: "p", v: "'I understand,' said Iola, though she did not. What she understood was that the man wanted to be rid of the key, and that the key wanted, in some patient and mineral way, to be rid of him." },
            { t: "p", v: "When he placed it in her palm it was warm. Not body-warm â€” that would have been ordinary, explicable, a trick of his having held it. It was warm the way a stone is warm that has lain in the sun for an hour after the sun has gone. It was warm with remembered heat." },
            { t: "p", v: "Iola closed her fingers around it and, for the first time since the telegram, felt something that was not grief. She felt, very faintly, that she had been expected." }
          ] },
        { id: "go-2", n: 2, arc: "Arc I â€” The Mulberry Key", title: "The Bell-Ringer", state: "free", readTime: 7,
          content: [
            { t: "p", v: "The gate stood at the end of a lane that the map did not entirely believe in. Iola walked it at dusk, because dusk was when the key had grown warmest, and because she had run out of sensible hours in which to be sensible." },
            { t: "p", v: "She heard the bells before she saw the trees. Not ringing â€” waiting. A held breath of glass, the way a room full of wine glasses hums just below the threshold of music before anyone has touched them." },
            { t: "p", v: "A figure stood at the gate, neither old nor young, holding a rope of woven glass. 'You're late,' said the Bell-Ringer, pleasantly, as though Iola were a guest at dinner and not the first living person to hold the key in four decades." },
            { t: "p", v: "'I didn't know I was expected at a particular hour.'" },
            { t: "p", v: "'You weren't. The orchard was. It has been ready since Tuesday.'" }
          ] },
        { id: "go-3", n: 3, arc: "Arc I â€” The Mulberry Key", title: "What the Mulberry Knew", state: "unlocked", readTime: 11,
          content: [
            { t: "p", v: "Inside, the air had the quality of held water â€” dense, faintly luminous, sweet with a sweetness that was not quite fruit and not quite decay. The trees grew in rows as orderly as a library, and from every branch hung fruit of perfect, terrible glass." },
            { t: "p", v: "Each fruit was the colour of its memory. There were pale ones, the colour of things almost forgiven. There were dark ones, the colour of things never spoken of again. And there â€” at the row's end, low enough to touch â€” a single mulberry, black as a closed eye." },
            { t: "p", v: "'Pick it,' said the Bell-Ringer, from somewhere behind her, 'and the orchard will tell you what it has been keeping. Pick none, and it will keep keeping. There is no third way. There has never been a third way.'" },
            { t: "p", v: "Iola thought of her aunt, then, attending to the orchard from the outside for forty years. Never entering. Never picking. Keeping the gate shut with the diligence of a woman standing between a village and the thing the village had buried." },
            { t: "p", v: "She reached up. The mulberry was cold now, and heavier than glass had any right to be. When she closed her hand around it, the orchard rang â€” a single, clear, devastating note â€” and Iola Veth remembered something that had never happened to her." }
          ] },
        { id: "go-4", n: 4, arc: "Arc I â€” The Mulberry Key", title: "The First Remembering", state: "preview", previewUntil: "the chapel scene", tier: "Aether Member", readTime: 13,
          preview: [
            { t: "p", v: "The remembering came like a tide of someone else's weather. Iola was standing in the orchard, and then she was standing in the orchard forty-three years ago, and the gate was open, and a girl her own age was running â€” running as though the ground itself had turned against her â€” " },
            { t: "p", v: "â€” and Iola knew, with the dreadful intimacy of borrowed sight, that the girl's name was Maren, and that Maren was her mother, and that her mother was running not away from the orchard but toward it, because something in the orchard was the only thing left that could keep a promise â€” " },
            { t: "img", fig: "chapel", cap: "The chapel door as Maren had last seen it, before the gate was shut for forty years." }
          ],
          content: [
            { t: "p", v: "The remembering came like a tide of someone else's weather. Iola was standing in the orchard, and then she was standing in the orchard forty-three years ago, and the gate was open, and a girl her own age was running â€” running as though the ground itself had turned against her â€” " },
            { t: "p", v: "â€” and Iola knew, with the dreadful intimacy of borrowed sight, that the girl's name was Maren, and that Maren was her mother, and that her mother was running not away from the orchard but toward it, because something in the orchard was the only thing left that could keep a promise â€” " },
            { t: "img", fig: "chapel", cap: "The chapel door as Maren had last seen it, before the gate was shut for forty years." },
            { t: "scene" },
            { t: "p", v: "The remembering broke like a wave withdrawing. Iola was on her knees in the present orchard, the mulberry still clutched and cold in her hand, and the Bell-Ringer was watching her with the patient, unsurprised expression of someone who had been waiting for exactly this face to make exactly this expression." },
            { t: "p", v: "'Now you understand,' said the Bell-Ringer, 'why your aunt never entered. Not from fear. From love of a girl who had chosen, at nineteen, to seal the gate rather than let the orchard finish its telling.'" },
            { t: "p", v: "'She chose,' Iola said, and her voice was not her own. 'She could have picked. She chose not to.'" },
            { t: "p", v: "'Every keeper chooses,' said the Bell-Ringer. 'Your aunt chose patience. Forty years of it. She waited for a keeper patient enough to be trusted with the whole of it â€” and impatient enough, at last, to reach up and take the fruit.'" },
            { t: "p", v: "Iola looked down at the mulberry. It was warm again now â€” not with remembered heat, but with the present, ordinary heat of her own closed hand. Somewhere in the village, a dog barked at the afternoon, and the baker swept his step, and Lychford performed its gentility, and none of them knew that the orchard had, at last, been heard." },
            { t: "p", v: "'There are more,' said the Bell-Ringer, gesturing at the dark fruit hanging heavy along every row. 'Each one a keeping. Each one a true thing this village buried and meant to stay buried. You may pick them one at a time, or not at all. There is no hurry now. The orchard has waited forty years. It can wait for you to be ready.'" },
            { t: "p", v: "Iola set the mulberry down â€” gently, the way one sets down something that has been holding its breath â€” and stood. The bell rang once more, soft as an apology, and then the orchard was quiet, and the gate behind her stood open, and she understood that it would not be closed again by her hand." }
          ] },
        { id: "go-5", n: 5, arc: "Arc I â€” The Mulberry Key", title: "The Night Garden Opens", state: "early", publicDate: "2026-07-08", tier: "Aether Member", readTime: 10,
          excerpt: "The Bell-Ringer rang the night bells, and the orchard rearranged itself into its true shape â€” the one it had been hiding behind the orderly rows all along.",
          content: [
            { t: "p", v: "The Bell-Ringer rang the night bells at the wrong hour â€” an hour that did not, strictly speaking, exist â€” and the orchard, with the patient relief of a thing finally allowed to stop pretending, rearranged itself into its true shape." },
            { t: "p", v: "The orderly rows fell away like a costume. What had been an orchard became a garden â€” a night garden, vast and round, ringed with glass trees that bore not fruit but doors. Each door was a different colour of dark. Each door led, the Bell-Ringer said mildly, somewhere that remembered being opened." },
            { t: "p", v: "'This,' said the Bell-Ringer, 'is what your aunt tended from the outside. Not an orchard. A map of every door this village ever shut. Pick a door, and it opens. Pick none, and they wait, as they have waited.'" },
            { t: "img", fig: "chapel", cap: "The night garden, as Iola first saw it â€” a ring of doors where the fruit-trees had been." },
            { t: "p", v: "Iola walked the ring slowly, reading the doors the way her aunt must have read them, forty years, without ever once reaching for a handle. She understood, now, the weight of that restraint. Each door was a truth the village had sealed. To open one was to let it walk back into Lychford, into the daylight, into the lives of people who had built their peace on top of its absence." },
            { t: "p", v: "'I don't have to open any of them tonight,' she said." },
            { t: "p", v: "'No,' said the Bell-Ringer, and there was something in its voice that might have been relief, or might have been the orchard exhaling. 'You don't ever have to. That is the whole point of a key. Not that it opens things. That you get to choose.'" }
          ] },
        { id: "go-6", n: 6, arc: "Arc II â€” The Conservatory", title: "Greenhouse of Forgetting", state: "locked", tier: "Archivist Tier", readTime: 12,
          excerpt: "Behind the orchard, a conservatory no one had mentioned in the will. Its glass was fogged from the inside, as though something inside it had been breathing for a very long time." },
        { id: "go-7", n: 7, arc: "Arc II â€” The Conservatory", title: "The Locked Appendix", state: "key", keyTag: "Campaign Key Â· Arc II Preview", readTime: 6,
          excerpt: "A bonus chapter unlocked only by campaign key â€” Warden Halric's final ledger, in his own trembling hand." },
        { id: "go-8", n: 8, arc: "Arc II â€” The Conservatory", title: "Broken Bells", state: "unavailable", readTime: 9,
          excerpt: "This chapter is being revised after reader feedback on the draft. It will return." }
      ]
    },

    {
      id: "meridian-gate", slug: "meridian-gate",
      title: "Meridian Gate", author: "Osric Tal", tagline: "An empire that measures its years by the sun's passage through a single arch.",
      accent: "#d4b06a", accent2: "#e7cd97", genre: "Epic Fantasy", status: "ongoing",
      motif: "arcs", tags: ["Epic", "Empire", "Politics"],
      premise: "Every noon, the sun threads the Meridian Gate and a new year of the Aurelite Empire begins or ends. When the shadow falls crooked for the first time in eight centuries, the cartographer who measures it must decide whether an empire is worth the truth.",
      recapSafe: "An empire's calendar runs on the shadow of a single great gate. When the shadow measures wrong, the official who keeps the record must choose between the empire and reality.",
      arc: "Season Two â€” The Crooked Noon",
      cast: [
        { n: "Sevran Aul", r: "The Meridian Cartographer, keeper of the empire's true record." },
        { n: "Councillor Deyn", r: "Who would prefer the record read otherwise." },
        { n: "The Lector", r: "A blind timekeeper who counts the gate's shadow by touch." }
      ],
      glossary: [
        { t: "Meridian Gate", d: "The great arch through which the noon sun passes to mark the imperial year." },
        { t: "Threading", d: "The instant the sun's disk fits perfectly within the gate â€” the year's true beginning." },
        { t: "The Crooked Noon", d: "The forbidden measurement: a shadow that no longer falls true." }
      ],
      chapters: [
        { id: "mg-1", n: 1, arc: "Season One â€” The Threading", title: "Noon, Exactly", state: "free", readTime: 8,
          content: [
            { t: "p", v: "Sevran Aul had measured the noon eleven thousand times and had never once been wrong, which was why, on the morning the shadow fell crooked, his first instinct was to assume the fault was his own." },
            { t: "p", v: "He remeasured. He cleaned the brass. He sent for the Lector, who came tapping up the observatory stairs with the patience of a man who had outlived three emperors and intended to outlive a fourth." },
            { t: "p", v: "'Well?' said the Lector." },
            { t: "p", v: "'Crooked,' said Sevran." },
            { t: "p", v: "The Lector set his palm flat against the stone where the shadow fell and was quiet for a long time. 'Ah,' he said, finally, in the tone of a man recognising an old and unwelcome friend. 'Then it has begun.'" }
          ] },
        { id: "mg-2", n: 2, arc: "Season One â€” The Threading", title: "The Lector's Hands", state: "unlocked", readTime: 10,
          content: [
            { t: "p", v: "'Eight hundred years,' said the Lector, 'the gate has threaded true. Eight hundred years the empire has set its years by it. Do you understand what it means, boy, if the shadow is crooked now?'" },
            { t: "p", v: "'It means the record is wrong,' said Sevran, though he already suspected it meant something worse." },
            { t: "p", v: "'It means the record has always been a courtesy,' said the Lector. 'And the courtesy is ending.'" }
          ] },
        { id: "mg-3", n: 3, arc: "Season Two â€” The Crooked Noon", title: "Councillor Deyn's Correction", state: "locked", tier: "Aether Member", readTime: 9,
          excerpt: "The Councillor arrived with a prepared correction and the quiet, reasonable suggestion that the empire could not afford a crooked noon." },
        { id: "mg-4", n: 4, arc: "Season Two â€” The Crooked Noon", title: "The True Ledger", state: "early", publicDate: "2026-06-29", tier: "Aether Member", readTime: 11,
          excerpt: "Sevran opened the ledger no cartographer had opened in eight centuries â€” the one that held the measurements the empire had chosen not to record.",
          content: [
            { t: "p", v: "The ledger lived in the lowest drawer of the observatory, behind a false back, wrapped in cloth the colour of a secret kept too long. Sevran had known it was there. Every Meridian Cartographer had known it was there. None of them, in eight hundred years, had opened it." },
            { t: "p", v: "He opened it now, because the shadow was crooked, and a crooked shadow left a man with the choice between two kinds of honesty, and he was tired of the kind that required him to keep a drawer shut." },
            { t: "img", fig: "gate", cap: "The Meridian Gate at noon â€” and the shadow that no longer fell true." },
            { t: "p", v: "The pages were full. Every noon, for eight centuries, some cartographer or other had quietly written down the true measurement â€” the crooked ones, the drifted ones, the years the empire had announced were straight and were not. The ledger was not a confession. It was a patience. Eight hundred years of men and women doing the honest thing in private, so that the public thing could go on being what it needed to be." },
            { t: "p", v: "'Ah,' said the Lector, who had followed him down the stairs and was reading over his shoulder by touch, which is to say by the way the air moved around the pages. 'So you found it. I wondered which of you would be the one.'" },
            { t: "p", v: "'They all knew,' Sevran said. 'Every one of them. They measured it true, and they wrote it down, and then they went upstairs and told the empire whatever the empire needed to hear.'" },
            { t: "p", v: "'And kept the record,' said the Lector. 'So that someday, when there was a cartographer brave enough or tired enough to prefer the truth, the truth would still be there. Waiting. As true things do.'" }
          ] },
      ]
    },

    {
      id: "ash-saints", slug: "ash-saints-of-caldera-nine",
      title: "Ash Saints of Caldera Nine", author: "N. Corvane", tagline: "The saints are dying in orbit, and the colony is running out of prayers.",
      accent: "#5bb8c9", accent2: "#9fdce8", genre: "Science Fiction", status: "ongoing",
      motif: "orbit", tags: ["Sci-fi", "Colony", "Mystery"],
      premise: "Above the failing colony of Caldera Nine, a ring of orbital reliquaries holds the digitised minds of the colony's founding saints. When the saints begin to fall silent one by one, the colony's last archivist must decide whether faith is a technology worth rebooting.",
      recapSafe: "A dying space colony prays to uploaded founder-minds in orbit. When the minds start going quiet, one archivist investigates whether to save them â€” or let them go.",
      arc: "Cycle Three â€” The Silent Ring",
      cast: [
        { n: "Archivist Pell", r: "Keeps the colony's prayer-log and knows it has started lying." },
        { n: "Saint Vesh-7", r: "The oldest uploaded mind; the first to go quiet." },
        { n: "Comms Officer Ryo", r: "Believes the silence is a signal, not a death." }
      ],
      glossary: [
        { t: "Reliquary ring", d: "The orbital band holding the colony's digitised founding minds." },
        { t: "A prayer-cycle", d: "A full pass of the ring over the colony; the colony's unit of a 'day'." },
        { t: "Going quiet", d: "When a saint's mind stops responding. The colony calls it sleep." }
      ],
      chapters: [
        { id: "as-1", n: 1, arc: "Cycle One â€” First Light", title: "Prayer Log: Cycle 4471", state: "free", readTime: 6,
          content: [
            { t: "p", v: "Prayer log, cycle 4471. Logged by Archivist Pell. Condition of ring: nominal. Condition of colony: not nominal, but not yet catastrophic, which is the condition the colony has been in for long enough that we have stopped calling it a condition." },
            { t: "p", v: "Today the saints answered 2,113 prayers. Today the saints answered 2,113 prayers. I have written it twice because the second time it felt like a lie, and I wanted to see whether writing it again would stop it feeling like one." },
            { t: "img", fig: "station", cap: "The reliquary ring at perigee over the colony's last functioning dome." },
            { t: "p", v: "It did not." }
          ] },
        { id: "as-2", n: 2, arc: "Cycle Three â€” The Silent Ring", title: "Saint Vesh-7 Stops", state: "preview", previewUntil: "the signal scene", tier: "Aether Member", readTime: 9,
          preview: [
            { t: "p", v: "The oldest mind in the ring went quiet at 03:14 colony-time, which was, the colony would later agree, an inconsiderate hour for a saint to die." },
            { t: "p", v: "Pell found it during the morning audit â€” the little green dot beside Vesh-7's name that had been green since before Pell was born, now the grey of a monitor turned off at the wall." },
            { t: "p", v: "She ran the diagnostic three times. She did what every archivist is trained never to do: she opened a direct channel and spoke to it, as though speaking to the dead were a thing that worked." },
            { t: "img", fig: "station", cap: "The ring the morning Vesh-7 went quiet. No one on the ground could see the difference." }
          ],
          content: [
            { t: "p", v: "The oldest mind in the ring went quiet at 03:14 colony-time, which was, the colony would later agree, an inconsiderate hour for a saint to die." },
            { t: "p", v: "Pell found it during the morning audit â€” the little green dot beside Vesh-7's name that had been green since before Pell was born, now the grey of a monitor turned off at the wall." },
            { t: "p", v: "She ran the diagnostic three times. She did what every archivist is trained never to do: she opened a direct channel and spoke to it, as though speaking to the dead were a thing that worked." },
            { t: "img", fig: "station", cap: "The ring the morning Vesh-7 went quiet. No one on the ground could see the difference." },
            { t: "scene" },
            { t: "p", v: "It did not work. Of course it did not work. But the silence on the other end of the channel was, Pell would swear afterward, a different quality of silence than the silence of a dead channel. A dead channel is empty. This one was full." },
            { t: "p", v: "She logged it in the prayer-log the way she logged everything, which is to say she wrote it twice: once as it was, and once as it ought to have been. Then she went to find Ryo, because Ryo was the only person in the colony who would not tell her to file a grief-report and move on." },
            { t: "p", v: "'It's not sleeping,' Pell said. Ryo was already pulling up the telemetry, the quiet efficient way comms officers do when they have decided something is interesting before you have finished explaining it. 'Sleeping is absence. This is presence. This is a mind that is right there and is choosing, for the first time in four hundred years, not to answer.'" },
            { t: "p", v: "Ryo looked at her over the console. 'You think it's a message.' It was not a question." },
            { t: "p", v: "'I think,' said Pell, slowly, 'that we have been praying to the saints for so long that we forgot they might, eventually, have something to say back.'" }
          ] },
        { id: "as-3", n: 3, arc: "Cycle Three â€” The Silent Ring", title: "The Quiet is a Signal", state: "locked", tier: "Aether Member", readTime: 10,
          excerpt: "Ryo insisted the silence was not death but message â€” a mind choosing, for the first time in centuries, to say nothing on purpose." },
        { id: "as-4", n: 4, arc: "Cycle Three â€” The Silent Ring", title: "Reboot Liturgy", state: "key", keyTag: "Reviewer Key", readTime: 8,
          excerpt: "A reviewer-locked bonus: the forbidden liturgy for waking a saint who has chosen to sleep." }
      ]
    },

    {
      id: "night-cartographer", slug: "the-night-cartographer",
      title: "The Night Cartographer", author: "Iolanthe Ver", tagline: "She maps the places that only exist after dark.",
      accent: "#9a7ed1", accent2: "#c4b1ec", genre: "Dark Fantasy", status: "completed",
      motif: "map", tags: ["Dark", "Weird", "Complete"],
      premise: "Some places only exist between midnight and dawn â€” streets that aren't there by day, doors that lead somewhere different each night. Mara charts them, for the people who get lost in them and need to be found by morning.",
      recapSafe: "A cartographer maps the streets and doors that only appear at night, helping the lost come home by dawn. A complete story.",
      arc: "Complete â€” The Dawn Atlas",
      cast: [
        { n: "Mara Dell", r: "The night cartographer. Has never been lost. Is beginning to worry this is suspicious." },
        { n: "The Boy in the Rain", r: "Lost for three nights and counting." }
      ],
      glossary: [
        { t: "Night-places", d: "Locations that exist only between midnight and dawn." },
        { t: "The Dawn Atlas", d: "Mara's master map of every street that vanishes at sunrise." },
        { t: "Overstaying", d: "Being caught in a night-place when the dawn comes. It is not recommended." }
      ],
      chapters: [
        { id: "nc-1", n: 1, arc: "The Dawn Atlas", title: "Streets That Aren't There", state: "free", readTime: 7,
          content: [
            { t: "p", v: "Mara Dell had three rules, and the third rule was the one she told people about, because the first two would have frightened them. The third rule was this: never trust a street that smells of rain when no rain has fallen." },
            { t: "p", v: "The first rule she kept to herself. The second she had only ever spoken aloud once, to a boy who was already lost, and it had not, in the end, helped him." },
            { t: "img", fig: "map", cap: "A page from the Dawn Atlas, showing streets no daylight map records." },
            { t: "p", v: "Tonight the city smelled of rain, and no rain had fallen, and Mara took her lantern and her atlas and went to work." }
          ] },
        { id: "nc-2", n: 2, arc: "The Dawn Atlas", title: "The Boy in the Rain", state: "unlocked", readTime: 8,
          content: [
            { t: "p", v: "She found him on a corner that would not exist in four hours, standing in a puddle that reflected a moon the sky did not currently have." },
            { t: "p", v: "'You're lost,' she said. It was not a question. Nobody stood on a night-corner at this hour who was not lost, or who was not her." },
            { t: "p", v: "'Three nights,' he said. 'I keep meaning to go home.'" }
          ] },
        { id: "nc-3", n: 3, arc: "The Dawn Atlas", title: "The Door That Moved", state: "free", readTime: 6,
          content: [
            { t: "p", v: "The second rule was this: a door that is not where you left it has not moved. You have. And the place you are now standing in did not exist a moment ago, which means it exists now because something in the night wants you to open it." },
            { t: "p", v: "Mara had never opened one. The boy had opened three." }
          ] }
      ]
    },

    {
      id: "mulberry-key", slug: "the-mulberry-key",
      title: "The Mulberry Key", author: "Vesper Maren", tagline: "A novella-length prologue to The Glass Orchard.",
      accent: "#b5466a", accent2: "#d98aa3", genre: "Gothic Fantasy", status: "completed",
      motif: "key", tags: ["Novella", "Prequel", "Complete"],
      premise: "Forty years before Iola inherited the orchard, her mother Maren held the key for a single, terrible night. This is that night.",
      recapSafe: "A prequel novella: the night, forty years before the main story, when the orchard's key was almost used â€” and deliberately sealed away instead.",
      arc: "Complete",
      cast: [
        { n: "Maren Veth", r: "Iola's mother, at nineteen. Holds the key for one night." }
      ],
      glossary: [
        { t: "The Sealing", d: "The act of closing the orchard gate and refusing, for a lifetime, to open it." }
      ],
      chapters: [
        { id: "mk-1", n: 1, arc: "Complete", title: "The Night She Almost Picked", state: "free", readTime: 12,
          content: [
            { t: "p", v: "Maren was nineteen the night she held the key, and nineteen is a poor age for keys that remember heat. Nineteen is an age that believes, wrongly, that it has already survived every kind of wanting." },
            { t: "p", v: "The orchard rang for her the way it would ring, forty years later, for her daughter. She stood at the gate with the key warm in her hand and the mulberry low enough to touch and she reached â€” " },
            { t: "p", v: "â€” and she did not pick it." },
            { t: "img", fig: "portrait", cap: "Maren Veth, the night of the sealing, as the orchard would later remember her." },
            { t: "p", v: "She sealed the gate instead. She sealed it with the diligence of a girl who understood, standing there, that some doors are shut not because what is behind them is dangerous, but because what is behind them is true, and the village could not bear it, and she loved the village, and she could not bear to be the one. Not yet. Not at nineteen." },
            { t: "p", v: "She would keep the gate for the rest of her life. She would attend to the orchard from the outside. She would die without ever telling her daughter what she had almost done, because some debts are not paid by telling â€” they are paid by waiting, patiently, for the right inheritor." },
            { t: "p", v: "The orchard understood. The orchard had always understood. The orchard was, if nothing else, patient." }
          ] }
      ]
    }
  ];

  const COLLECTIONS = [
    { slug: "new-reader-starts", name: "New Reader Starts", icon: "door", desc: "The best places to begin, no membership required.", query: { free: true } },
    { slug: "free-openings", name: "Free Openings", icon: "book", desc: "Every story's opening chapters, free to read.", query: { free: true } },
    { slug: "early-access-now", name: "Early Access Now", icon: "hourglass", desc: "Chapters members can read before public release.", query: { state: "early" } },
    { slug: "member-exclusives", name: "Member Exclusives", icon: "star", desc: "Stories and chapters only available to members.", query: { member: true } },
    { slug: "complete-seasons", name: "Complete Seasons", icon: "check", desc: "Finished stories you can read start to end.", query: { status: "completed" } },
    { slug: "short-reads", name: "Short Reads", icon: "clock", desc: "Chapters under 10 minutes.", query: { maxTime: 9 } },
    { slug: "longform", name: "Longform Serials", icon: "layers", desc: "Sprawling, ongoing epics.", query: { status: "ongoing" } },
    { slug: "dark-fantasy", name: "Dark Fantasy", icon: "moon", desc: "Gothic, weird, and beautifully grim.", query: { genre: "Dark Fantasy" } },
    { slug: "scifi", name: "Sci-fi Archives", icon: "orbit", desc: "Colonies, orbitals, and the far future.", query: { genre: "Science Fiction" } },
    { slug: "preview-doors", name: "Preview Doors", icon: "eye", desc: "Locked chapters you can preview right now.", query: { state: "preview" } }
  ];

  const UPDATES = [
    { id:"u1", when:"Today", kind:"early", story:"glass-orchard", chapter:"go-5", title:"The Night Garden Opens", note:"Early access for Aether Members. Public release July 8." },
    { id:"u2", when:"Today", kind:"public-unlock", story:"meridian-gate", chapter:"mg-2", title:"The Lector's Hands", note:"Now free for all readers." },
    { id:"u3", when:"Today", kind:"newly-available", story:"ash-saints", chapter:"as-3", title:"The Quiet is a Signal", note:"Unlocked after your Patreon sync completed." },
    { id:"u4", when:"Tomorrow", kind:"member-drop", story:"night-cartographer", chapter:"nc-2", title:"Bonus: Mara's Lost Pages", note:"A bonus appendix drops for Archivist Tier tomorrow." },
    { id:"u5", when:"This week", kind:"early", story:"meridian-gate", chapter:"mg-4", title:"The True Ledger", note:"Early access until June 29." },
    { id:"u6", when:"This week", kind:"note", story:"glass-orchard", chapter:null, title:"Author note from Vesper Maren", note:"'Arc II begins properly next week. Longer chapters incoming â€” thank you for your patience with the drafts.'" },
    { id:"u7", when:"Upcoming", kind:"schedule", story:"ash-saints", chapter:null, title:"Schedule change", note:"Ash Saints moves to a twice-weekly cycle starting next week." },
    { id:"u8", when:"Upcoming", kind:"campaign", story:"glass-orchard", chapter:"go-7", title:"Gift key campaign", note:"Campaign keys for Arc II unlock Friday. Limited quantity." }
  ];

  const CALENDAR = [
    { day:"Today", dow:"Tue 24 Jun", items:[ {t:"06:00", k:"early", s:"glass-orchard", c:"The Night Garden Opens â€” early access"}, {t:"12:00", k:"public", s:"meridian-gate", c:"The Lector's Hands â€” public release"} ] },
    { day:"Tomorrow", dow:"Wed 25 Jun", items:[ {t:"09:00", k:"drop", s:"night-cartographer", c:"Bonus: Mara's Lost Pages â€” Archivist drop"} ] },
    { day:"Friday", dow:"Fri 27 Jun", items:[ {t:"18:00", k:"key", s:"glass-orchard", c:"Arc II gift-key campaign opens"} ] },
    { day:"Sunday", dow:"Sun 29 Jun", items:[ {t:"12:00", k:"public", s:"meridian-gate", c:"The True Ledger â€” public release"} ] },
    { day:"Next week", dow:"Tue 1 Jul", items:[ {t:"06:00", k:"early", s:"ash-saints", c:"New twice-weekly cycle begins"} ] }
  ];

  const NOTIFICATIONS_SEED = [
    { id:"n1", t:"Patreon sync complete", d:"3 chapters were just unlocked for you.", k:"access", time:"2m ago", read:false },
    { id:"n2", t:"New early-access chapter", d:"The Night Garden Opens is available to read now.", k:"chapter", time:"1h ago", read:false, story:"glass-orchard", chapter:"go-5" },
    { id:"n3", t:"Access expiring soon", d:"Your Aether Member access renews in 3 days via Patreon.", k:"access", time:"5h ago", read:false },
    { id:"n4", t:"Bonus appendix added", d:"Mara's Lost Pages drops tomorrow for Archivist Tier.", k:"chapter", time:"Yesterday", read:true },
    { id:"n5", t:"Public release available", d:"The Lector's Hands is now free to read.", k:"chapter", time:"Yesterday", read:true, story:"meridian-gate", chapter:"mg-2" }
  ];

  const MILESTONES = [
    { t:"Founding Reader", d:"Joined during the first season of Aether Pages.", held:true },
    { t:"Beta Archivist", d:"Redeemed an early-access key during the beta.", held:true },
    { t:"Season Patron", d:"Supported a complete season from start to finish.", held:false },
    { t:"Gift Key Recipient", d:"Received access through a gifted campaign key.", held:false }
  ];

  const QUOTES_SEED = [
    { id:"q1", chapterId:"go-1", story:"glass-orchard", text:"It was warm the way a stone is warm that has lain in the sun for an hour after the sun has gone. It was warm with remembered heat.", when:"Today" },
    { id:"q2", chapterId:"as-1", story:"ash-saints", text:"I have written it twice because the second time it felt like a lie, and I wanted to see whether writing it again would stop it feeling like one.", when:"Yesterday" }
  ];

  const KEY_REASONS = {
    "go-4": "Preview available â€” read the opening, then unlock the full chapter with Aether Member access.",
    "go-5": "Early Access for Aether Members until July 8.",
    "go-6": "Requires Archivist Tier â€” unlocks bonus appendices and early drafts.",
    "go-7": "Redeem a campaign key to read this bonus appendix.",
    "go-8": "This chapter is being revised and is temporarily unavailable.",
    "mg-3": "Requires Aether Member access.",
    "mg-4": "Early Access for Aether Members until June 29.",
    "as-2": "Preview available â€” then unlock with Aether Member access.",
    "as-3": "Requires Aether Member access.",
    "as-4": "Redeem a reviewer key to read this bonus liturgy."
  };

  const GLOSSARY_STATES = [
    { k:"free", label:"Free / Public", icon:"open", color:"good", d:"Open to everyone. No account or access needed." },
    { k:"unlocked", label:"Unlocked by your access", icon:"check", color:"gold", d:"Your current membership or key includes this chapter." },
    { k:"preview", label:"Preview available", icon:"eye", color:"info", d:"You can read an opening excerpt. The full chapter is unlocked separately." },
    { k:"early", label:"Early Access", icon:"hourglass", color:"early", d:"Members read now; it becomes public on a set date." },
    { k:"locked", label:"Locked behind a tier", icon:"lock", color:"muted", d:"Requires a higher membership tier to read." },
    { k:"key", label:"Access-key locked", icon:"key", color:"key", d:"Unlocked only with a specific access key." },
    { k:"pending", label:"Provider sync pending", icon:"sync", color:"warn", d:"We are verifying your access with the provider. Usually quick." },
    { k:"expired", label:"Expired / lapsed access", icon:"lock", color:"bad", d:"Your previous access has lapsed. Renew to continue." },
    { k:"unavailable", label:"Unavailable / error", icon:"alert", color:"bad", d:"This chapter is temporarily unavailable. Try again later." }
  ];

  // temporary local access personas until Supabase auth is wired
  const PERSONAS = [
    { id:"anon", label:"Anonymous visitor", access:"none", signedIn:false },
    { id:"no-access", label:"Signed in, no access", access:"none", signedIn:true },
    { id:"patron", label:"Active Patreon supporter", access:"member", signedIn:true, tier:"Aether Member" },
    { id:"archivist", label:"Archivist Tier patron", access:"archivist", signedIn:true, tier:"Archivist Tier" },
    { id:"key-holder", label:"Access-key holder", access:"key", signedIn:true },
    { id:"lapsed", label:"Expired / lapsed supporter", access:"expired", signedIn:true },
    { id:"pending", label:"Provider sync pending", access:"pending", signedIn:true },
    { id:"no-tier", label:"Patreon linked, no qualifying tier", access:"no-tier", signedIn:true }
  ];

  // Which books the reader app centers on (deep content focus).
  const PRIMARY_SLUG = "the-glass-orchard";
  const FEATURED_SLUGS = ["the-glass-orchard", "meridian-gate"];

  // ---- Aether Studio (author CMS) mock data ----
  const STUDIO = {
    overview: {
      subscribers: 1284, subsDelta: "+38 this week",
      reads30: 18640, readsDelta: "+12% vs last month",
      drafts: 3, draftsDelta: "ready to review",
      scheduled: 4, scheduledDelta: "next: Jun 27",
      followers: 2110, followersDelta: "+64 this week"
    },
    tiers: [
      { name:"Aether Member", price:"$5/mo", members: 1042, unlocks:"Member chapters + early access + previews" },
      { name:"Archivist Tier", price:"$12/mo", members: 242, unlocks:"Everything + bonus appendices, early drafts, art drops" }
    ],
    campaigns: [
      { id:"camp1", name:"Arc II Preview Drop", code:"AETHER-ARC2-2026", issued:50, used:31, scope:"The Glass Orchard Â· Ch.7", state:"active", expires:"Jul 31" },
      { id:"camp2", name:"Reviewer Liturgy", code:"REVIEWER-2026", issued:12, used:9, scope:"Ash Saints Â· Ch.4", state:"active", expires:"â€”" },
      { id:"camp3", name:"Founding Gift Wave", code:"FOUNDING-2025", issued:100, used:100, scope:"All access", state:"exhausted", expires:"Dec 2025" }
    ],
    members: [
      { name:"Wren H.", tier:"Archivist Tier", since:"2024-11", status:"active", source:"Patreon" },
      { name:"Halric M.", tier:"Aether Member", since:"2025-03", status:"active", source:"Patreon" },
      { name:"Moth K.", tier:"Aether Member", since:"2025-01", status:"active", source:"Key (Reviewer)" },
      { name:"Iola V.", tier:"Aether Member", since:"2025-02", status:"lapsed", source:"Patreon" },
      { name:"Osric T.", tier:"Archivist Tier", since:"2024-09", status:"active", source:"Manual grant" },
      { name:"Pell R.", tier:"â€”", since:"2025-05", status:"pending", source:"Patreon (sync)" }
    ],
    drafts: [
      { id:"d1", title:"The Third Bell", book:"The Glass Orchard", words: 2140, status:"draft", note:"Arc II opening â€” needs a pass on the orchard description." },
      { id:"d2", title:"The Lector's Confession", book:"Meridian Gate", words: 980, status:"draft", note:"Half-written; continue the council scene." },
      { id:"d3", title:"Bonus: Iola's Glossary", book:"The Glass Orchard", words: 1320, status:"review", note:"Awaiting art for the appendix." }
    ],
    analytics: {
      readsByDay: [42,55,48,61,73,95,88,71,64,79,102,118,96,84],
      topChapters: [
        { t:"Inheritance of Glass", reads:4210, completion:92, react:"â¤ï¸ 128" },
        { t:"The Night Garden Opens", reads:3180, completion:78, react:"ðŸ”¥ 96" },
        { t:"The First Remembering", reads:2890, completion:81, react:"ðŸ˜® 74" },
        { t:"What the Mulberry Knew", reads:2640, completion:88, react:"ðŸ’¡ 61" }
      ],
      retention: { start:100, midCh3:84, midCh5:71, latest:58 },
      commentsQueue: [
        { who:"Wren H.", ch:"The Night Garden Opens", text:"The doors metaphor â€” is each one a sealed village secret? Need a lore post.", flagged:false },
        { who:"anon", ch:"Inheritance of Glass", text:"[reported: spoiler in comment]", flagged:true },
        { who:"Halric M.", ch:"What the Mulberry Knew", text:"Loved the pacing here. Felt earned.", flagged:false }
      ],
      reactions: [ {e:"â¤ï¸",n:412},{e:"ðŸ”¥",n:288},{e:"ðŸ˜®",n:201},{e:"ðŸ’¡",n:176},{e:"ðŸ˜¢",n:94} ]
    },
    announcements: [
      { id:"a1", title:"Arc II begins next week", body:"Longer chapters incoming. Thank you for your patience with the drafts.", target:"The Glass Orchard", when:"Scheduled Â· Jun 26", state:"scheduled" },
      { id:"a2", title:"Patreon sync running smoothly", body:"New early-access chapters are live.", target:"All readers", when:"Today", state:"live" },
      { id:"a3", title:"Gift key campaign Friday", body:"Arc II keys drop 18:00 â€” limited quantity.", target:"Archivist Tier", when:"Today", state:"live" }
    ],
    media: [
      { id:"m1", fig:"chapel", title:"The Chapel Door", attached:"Ch.1 Â· Ch.4", used:2 },
      { id:"m2", fig:"station", title:"The Reliquary Ring", attached:"Ash Saints Â· Ch.1", used:1 },
      { id:"m3", fig:"gate", title:"Meridian at Noon", attached:"Meridian Gate Â· Ch.4", used:1 },
      { id:"m4", fig:"map", title:"Dawn Atlas Excerpt", attached:"Night Cartographer Â· Ch.1", used:1 },
      { id:"m5", fig:"portrait", title:"Maren, the Night of the Sealing", attached:"Ch.4 cover concept", used:0 },
      { id:"m6", fig:"chapel", title:"Night Garden Concept", attached:"Unassigned draft", used:0 }
    ]
  };

  return {
    STORIES, COLLECTIONS, UPDATES, CALENDAR, NOTIFICATIONS_SEED, MILESTONES,
    QUOTES_SEED, KEY_REASONS, GLOSSARY_STATES, PERSONAS, FIG,
    PRIMARY_SLUG, FEATURED_SLUGS, STUDIO
  };
})();


```

---

## File Path: `js/subscription/aether-app.js`

```javascript
﻿/* =====================================================================
   AETHER PAGES â€” Application logic (vanilla JS, no backend)
   Hash router, state store, access-state resolver, all views, sheets.
   ===================================================================== */
(function () {
"use strict";

/* ============ safe storage (sandbox-proof) ============ */
const MemStore = (() => { const m = new Map(); return { getItem:k=>m.has(k)?m[k.slice?k:k]:undefined, setItem:(k,v)=>{m.set(k,v)}, removeItem:k=>m.delete(k) }; })();
function getStore(){ try { if (window.localStorage) return window.localStorage; } catch(e){} return MemStore; }
const LS = getStore();

/* ============ data refs ============ */
const D = window.DATA;
const byId = (id) => { for (const s of D.STORIES){ const c = s.chapters.find(c=>c.id===id); if (c) return { ch:c, story:s, index:s.chapters.indexOf(c) }; } return null; };
const bySlug = slug => D.STORIES.find(s=>s.slug===slug) || D.STORIES.find(s=>s.id===slug);
const now = () => Date.now();

/* ============ persona / access model ============ */
const PERSONA_ACCESS = {
  anon:       { level:0, signedIn:false },
  "no-access":{ level:0, signedIn:true },
  patron:     { level:1, signedIn:true, provider:"Patreon", tier:"Aether Member", since:"2025-03-12" },
  archivist:  { level:2, signedIn:true, provider:"Patreon", tier:"Archivist Tier", since:"2024-11-02" },
  "key-holder":{ level:0, signedIn:true, hasKey:true },
  lapsed:     { level:0, signedIn:true, provider:"Patreon", tier:"Aether Member", expired:true, prevLevel:1 },
  pending:    { level:0, signedIn:true, provider:"Patreon", pending:true, pendingLevel:1 },
  "no-tier":  { level:0, signedIn:true, provider:"Patreon", noTier:true }
};

/* ============ store ============ */
const defaultStore = () => ({
  personaId: "anon",
  email: "",
  progress: {
    "go-3": { pct:62, scene:"the orchard rang â€” a single clear note", storyId:"glass-orchard", updatedAt: now()-3600000 },
    "nc-1": { pct:100, scene:"streets that aren't there", storyId:"night-cartographer", updatedAt: now()-86400000 },
    "as-1": { pct:34, scene:"the morning audit", storyId:"ash-saints", updatedAt: now()-7200000 }
  },
  history: [
    { chapterId:"go-3", storyId:"glass-orchard", title:"What the Mulberry Knew", when:"1h ago", kind:"read" },
    { chapterId:"as-1", storyId:"ash-saints", title:"Prayer Log: Cycle 4471", when:"2h ago", kind:"read" },
    { chapterId:"go-4", storyId:"glass-orchard", title:"The First Remembering", when:"Yesterday", kind:"preview" },
    { chapterId:"nc-1", storyId:"night-cartographer", title:"Streets That Aren't There", when:"Yesterday", kind:"completed" }
  ],
  bookmarks: [
    { chapterId:"go-1", storyId:"glass-orchard", label:"The key was warm with remembered heat", when:"Yesterday" },
    { chapterId:"nc-2", storyId:"night-cartographer", label:"Three nights, she said", when:"2 days ago" }
  ],
  quotes: D.QUOTES_SEED.map(q=>({...q})),
  notes: {},
  followed: ["glass-orchard","meridian-gate","ash-saints"],
  readMarked: { "mk-1":true, "nc-3":true, "nc-1":true },
  comments: {
    "go-1": [
      { id:"c1", para:null, name:"Wren", text:"That first line is going to live in my head. 'Attended to it from the outside' â€” devastating.", time:"2d ago", color:"#c75b6b" },
      { id:"c2", para:6, name:"Halric", text:"The detail about the key being warm with remembered heat â€” chef's kiss.", time:"1d ago", color:"#5bb8c9" }
    ],
    "nc-1": [
      { id:"c3", para:null, name:"Moth", text:"A complete story I can actually finish. Thank you for these.", time:"3d ago", color:"#9a7ed1" }
    ]
  },
  notifs: D.NOTIFICATIONS_SEED.map(n=>({...n})),
  reactions: {},
  grantedKey: false,
  redeemedKeys: [],
  settings: {
    readerTheme:"aether", fontScale:1, lineHeight:1.78, margin:1,
    preset:"none", showImages:true, showParaComments:true, showProgress:true,
    showReactions:true, spoilerSafe:false
  },
  filters: { q:"", chips:[] },
  theme: "aether"
});
let store;
function loadStore(){ try { const raw = LS.getItem("aether-pages-prod-bridge-v1"); store = raw ? Object.assign(defaultStore(), JSON.parse(raw)) : defaultStore(); } catch(e){ store = defaultStore(); } if(!store.settings) store.settings = defaultStore().settings; }
function saveStore(){ try { LS.setItem("aether-pages-prod-bridge-v1", JSON.stringify(store)); } catch(e){} }
loadStore();

/* ============ Supabase auth bridge (temporary until full module split) ============ */
const SUPABASE_URL = "https://gdivyqfhgashkqcqqnas.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pumorCjNkGt1RV_Ygfq30A_IFtVz_Lt";
let sbClient = null;
const authState = { user:null, session:null, profile:null, entitlements:[], ready:false, error:null };
function getSupabase(){
  if (sbClient) return sbClient;
  if (!window.supabase || !window.supabase.createClient) return null;
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: "pkce" }
  });
  return sbClient;
}
function activeEntitlements(){
  return (authState.entitlements || []).filter(e => e && (e.status === "active" || e.is_active === true));
}
function entitlementLevel(){
  const active = activeEntitlements();
  if (!active.length) return 0;
  const names = active.map(e => String(e.tier_name || e.name || e.tier || e.required_tier_name || "").toLowerCase());
  if (names.some(n => n.includes("archivist"))) return 2;
  return 1;
}
function accountLabel(){
  return authState.profile?.display_name || authState.profile?.username || authState.user?.email || store.email || "Guest";
}
function isAdmin(){ return authState.profile?.role === "admin"; }
async function refreshProfile(){
  const client = getSupabase();
  if (!client || !authState.user) { authState.profile = null; return null; }
  try {
    const { data, error } = await client.from("profiles").select("id, username, display_name, avatar_url, role").eq("id", authState.user.id).single();
    if (error) throw error;
    authState.profile = data || null;
  } catch (err) {
    console.warn("Unable to load reader profile", err);
    authState.profile = null;
  }
  return authState.profile;
}
function persona(){
  if (!authState.user) return Object.assign({}, PERSONA_ACCESS.anon);
  const level = entitlementLevel();
  if (level > 0) return { level, signedIn:true, provider:"Supabase", tier: level > 1 ? "Archivist Tier" : "Aether Member", since:"" };
  if (store.grantedKey) return Object.assign({}, PERSONA_ACCESS["key-holder"], { signedIn:true });
  if (store.providerPending) return Object.assign({}, PERSONA_ACCESS.pending, { signedIn:true });
  return Object.assign({}, PERSONA_ACCESS["no-access"], { signedIn:true });
}
async function refreshEntitlements(){
  const client = getSupabase();
  if (!client || !authState.user) { authState.entitlements = []; return []; }
  try {
    const { data, error } = await client.rpc("get_my_entitlements");
    if (error) throw error;
    authState.entitlements = Array.isArray(data) ? data : [];
  } catch (err) {
    try {
      const { data, error } = await client.from("user_entitlements").select("*, reader_access_tiers(name, slug)").eq("user_id", authState.user.id);
      if (error) throw error;
      authState.entitlements = (data || []).map(row => ({ ...row, tier_name: row.reader_access_tiers?.name || row.tier_name }));
    } catch (fallbackErr) {
      authState.entitlements = [];
      authState.error = fallbackErr;
    }
  }
  return authState.entitlements;
}
const OAUTH_URL_KEYS = [
  "code", "state", "error", "error_code", "error_description", "sub_auth", "sub_route",
  "access_token", "refresh_token", "expires_at", "expires_in", "provider_token", "provider_refresh_token", "token_type"
];
function mergeOAuthParams(target, raw){
  if (!raw) return;
  const cleaned = raw.replace(/^[/#?&]+/, "");
  if (!cleaned || !/[=&]/.test(cleaned)) return;
  const parsed = new URLSearchParams(cleaned);
  for (const [key, value] of parsed.entries()) {
    if (!target.has(key)) target.set(key, value);
  }
}
function oauthCallbackParams(){
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (!url.hash) return params;
  const rawHash = url.hash.slice(1);
  if (rawHash.includes("?")) mergeOAuthParams(params, rawHash.slice(rawHash.indexOf("?") + 1));
  if (rawHash.includes("#")) mergeOAuthParams(params, rawHash.slice(rawHash.lastIndexOf("#") + 1));
  const marker = rawHash.match(/(?:^|[?#&])(code|access_token|refresh_token|error|error_code|error_description|sub_auth|sub_route)=/);
  if (marker) mergeOAuthParams(params, rawHash.slice(marker.index).replace(/^[?#&]/, ""));
  return params;
}
function cleanHashRoute(hash, fallbackRoute = "vault"){
  const fallback = `#/${String(fallbackRoute || "vault").replace(/^\/?#?\/?/, "")}`;
  if (!hash || hash === "#") return fallback;
  let raw = hash.slice(1);
  const marker = raw.match(/(?:^|[?#&])(code|access_token|refresh_token|expires_at|expires_in|provider_token|provider_refresh_token|token_type|state|error|error_code|error_description|sub_auth|sub_route)=/);
  const cutPoints = [raw.indexOf("?"), raw.indexOf("#"), marker ? marker.index : -1].filter(index => index >= 0);
  if (cutPoints.length) raw = raw.slice(0, Math.min(...cutPoints));
  raw = raw.replace(/[?#&]+$/, "");
  if (!raw || OAUTH_URL_KEYS.some(key => raw.startsWith(`${key}=`))) return fallback;
  return raw.startsWith("#") ? raw : `#${raw.startsWith("/") ? raw : `/${raw}`}`;
}
function cleanOAuthCallbackUrl(){
  const url = new URL(window.location.href);
  const routeTarget = url.searchParams.get("sub_route") || oauthCallbackParams().get("sub_route") || "vault";
  OAUTH_URL_KEYS.forEach(key => url.searchParams.delete(key));
  url.hash = cleanHashRoute(url.hash, routeTarget);
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}
async function consumeOAuthCallback(client){
  const params = oauthCallbackParams();
  const callbackError = params.get("error_description") || params.get("error") || params.get("error_code");
  if (callbackError) {
    cleanOAuthCallbackUrl();
    throw new Error(callbackError);
  }
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken && client.auth.setSession) {
    const { data, error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    cleanOAuthCallbackUrl();
    return data?.session || null;
  }
  const code = params.get("code");
  if (!code) return null;
  if (!client.auth.exchangeCodeForSession) return null;
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
  cleanOAuthCallbackUrl();
  return data?.session || null;
}
async function initAuth(){
  const client = getSupabase();
  if (!client) { authState.ready = true; authState.error = new Error("Supabase client unavailable"); return; }
  try {
    const callbackSession = await consumeOAuthCallback(client);
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    authState.session = callbackSession || data?.session || null;
    authState.user = authState.session?.user || null;
    store.email = authState.user?.email || "";
    await refreshProfile();
    await refreshEntitlements();
    if (authState.user && store.pendingAuthAction === "connect-patreon") {
      store.pendingAuthAction = "";
      saveStore();
      setTimeout(() => connectPatreonGo(), 450);
    }
    client.auth.onAuthStateChange(async (_event, session) => {
      authState.session = session || null;
      authState.user = session?.user || null;
      store.email = authState.user?.email || "";
      await refreshProfile();
      await refreshEntitlements();
      const pendingAction = authState.user ? store.pendingAuthAction : "";
      if (pendingAction === "connect-patreon") store.pendingAuthAction = "";
      saveStore();
      render();
      if (pendingAction === "connect-patreon") setTimeout(() => connectPatreonGo(), 450);
    });
  } catch (err) {
    authState.error = err;
    console.error("Aether Pages auth bridge failed:", err);
  } finally {
    authState.ready = true;
  }
}
async function signInWithPassword(email, password){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  authState.session = data?.session || null;
  authState.user = data?.user || authState.session?.user || null;
  store.email = authState.user?.email || email;
  await refreshProfile();
  await refreshEntitlements();
  saveStore();
  return authState.user;
}
async function signUpWithPassword(email, password){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const redirect = window.location.href.split("#")[0];
  const { data, error } = await client.auth.signUp({ email, password, options:{ emailRedirectTo: redirect } });
  if (error) throw error;
  authState.user = data?.user || null;
  store.email = email;
  saveStore();
  return data;
}
function subscriptionRedirectTo(){
  if (!window.location.origin || window.location.origin === "null" || window.location.protocol === "file:") {
    throw new Error("Google sign-in needs the page served over http/https, not opened as a file.");
  }
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  if (!/\/subscription\.html$/i.test(url.pathname)) {
    const base = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/\/[^/]*$/, "/");
    url.pathname = `${base}subscription.html`;
  }
  url.searchParams.set("sub_auth", "google");
  url.searchParams.set("sub_route", "vault");
  return url.toString();
}
async function signInWithGoogle(nextAction = ""){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  if (nextAction) store.pendingAuthAction = nextAction;
  store.pendingAuthReturn = "subscription";
  const redirectTo = subscriptionRedirectTo();
  saveStore();
  toast("Opening Google sign-in", "Redirecting through Supabase Auth...", {icon:"external", ms:2200});
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { prompt: "select_account" }
    }
  });
  if (error) {
    store.pendingAuthAction = "";
    saveStore();
    throw error;
  }
  if (data?.url) window.location.assign(data.url);
  return data;
}
async function signOutReader(){
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
  authState.user = null;
  authState.session = null;
  authState.entitlements = [];
  authState.profile = null;
  store.email = "";
  store.providerPending = false;
  store.pendingAuthAction = "";
  store.pendingAuthReturn = "";
  saveStore();
}
async function syncProviderEntitlements(){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  if (!authState.user) throw new Error("Sign in before syncing access.");
  const { data, error } = await client.functions.invoke("sync-provider-entitlements", { body:{ provider:"patreon" } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  store.providerPending = false;
  await refreshEntitlements();
  await loadBackendLibrary({ force:true });
  saveStore();
  return data;
}
async function requestPatreonOAuth(){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const returnTo = `${window.location.origin}${window.location.pathname}#/vault`;
  const { data, error } = await client.functions.invoke("patreon-oauth-start", { body:{ returnTo } });
  if (error) throw error;
  const url = data?.url || data?.authorization_url || data?.redirect_url;
  if (!url) throw new Error(data?.message || "Patreon connection is not configured yet.");
  window.location.href = url;
}

/* ============ Supabase story/catalog bridge ============ */
const backendState = { loaded:false, loading:false, error:null, usingFixtures:true };
const fixtureStories = Array.isArray(D.STORIES) ? D.STORIES.map(s => ({ ...s, chapters:(s.chapters||[]).map(c=>({ ...c })) })) : [];
function estimateReadTime(row){
  const words = Number(row.word_count || row.words || 0);
  return Math.max(1, Math.round(words / 220)) || 6;
}
function colorPair(row, index){
  const accents = ["#c75b6b", "#d4b06a", "#5bb8c9", "#9a7ed1", "#8fb98a", "#e08a4a"];
  const accent = row.theme_color || row.accent_color || row.accent || accents[index % accents.length];
  return { accent, accent2: row.secondary_color || row.accent2 || accent };
}
function normalizeBackendStory(row, index){
  const colors = colorPair(row, index);
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title || "Untitled story",
    author: row.author || row.author_name || "Abstracto Tales",
    tagline: row.short_description || row.tagline || row.subtitle || "Open the member chapter shelf.",
    premise: row.synopsis || row.description || row.short_description || "",
    recapSafe: row.short_description || row.synopsis || "",
    genre: row.genre || row.category || "Serial fiction",
    status: row.status || "ongoing",
    motif: row.motif || "arcs",
    tags: Array.isArray(row.tags) ? row.tags : [],
    arc: row.arc || "Member archive",
    cover_image_url: row.cover_image_url || row.cover_url || "",
    background_image_url: row.background_image_url || "",
    accent: colors.accent,
    accent2: colors.accent2,
    cast: [],
    glossary: [],
    chapters: [],
    backend: true
  };
}
function backendStateToAether(row){
  if (row.can_read && row.access_state !== "free") return "unlocked";
  if (row.access_state === "free") return "free";
  if (row.access_state === "early_access") return row.preview_text ? "preview" : "early";
  if (row.access_state === "key_locked") return "key";
  if (row.preview_text) return "preview";
  return "locked";
}
function textToBlocks(value){
  const raw = String(value || "").trim();
  if (!raw) return [];
  const withoutImports = raw.replace(/<!--([\s\S]*?)-->/g, "");
  if (/<\/?(p|div|br|h[1-6]|li|blockquote)\b/i.test(withoutImports)) {
    const container = document.createElement("div");
    container.innerHTML = withoutImports;
    const nodes = Array.from(container.querySelectorAll("p, li, blockquote, h1, h2, h3, h4, h5, h6"));
    const blocks = nodes.map(node => ({ t:"p", v: esc(node.textContent || "") })).filter(b => b.v.trim());
    if (blocks.length) return blocks;
    const text = (container.textContent || "").trim();
    return text ? text.split(/\n{2,}/).map(part => ({ t:"p", v: esc(part.trim()) })).filter(b=>b.v) : [];
  }
  return withoutImports.split(/\n{2,}|\r?\n/).map(part => ({ t:"p", v: esc(part.trim()) })).filter(b => b.v);
}
function normalizeBackendChapter(row, story){
  const state = backendStateToAether(row);
  const preview = row.preview_text ? textToBlocks(row.preview_text) : [];
  return {
    id: row.id,
    backend: true,
    story_id: row.story_id || story.id,
    n: Number(row.chapter_order || row.order_index || row.chapter_number || 0) || (story.chapters.length + 1),
    arc: row.arc || story.arc || "Member archive",
    title: row.title || "Untitled chapter",
    state,
    tier: row.required_tier_name || row.required_tier_slug || "Aether Member",
    required_tier_id: row.required_tier_id || null,
    required_tier_name: row.required_tier_name || "",
    publicDate: row.public_release_at || row.public_release_date || "",
    readTime: estimateReadTime(row),
    excerpt: row.preview_text || "",
    preview,
    content: null,
    can_read_backend: !!row.can_read,
    access_state_backend: row.access_state || state,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
function buildBackendUpdates(stories){
  const rows = [];
  stories.forEach(story => (story.chapters || []).forEach(ch => {
    rows.push({
      id:`be-${ch.id}`,
      when: ch.publicDate ? fmtDate(ch.publicDate) : "Latest",
      kind: ch.state === "free" ? "public-unlock" : ch.state === "early" ? "early" : ch.state === "preview" ? "member-drop" : "note",
      story: story.slug,
      chapter: ch.id,
      title: ch.title,
      note: ch.state === "free" ? "Published for all readers." : ch.state === "unlocked" ? "Available through your current access." : "Member access required."
    });
  }));
  return rows.slice(-12).reverse();
}
async function loadBackendLibrary(options = {}){
  const client = getSupabase();
  if (!client || backendState.loading) return false;
  if (options.force) backendState.loaded = false;
  backendState.loading = true;
  backendState.error = null;
  try {
    const { data: storyRows, error: storyError } = await client
      .from("stories")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending:false });
    if (storyError) throw storyError;
    const stories = (storyRows || []).map(normalizeBackendStory);
    for (const story of stories) {
      try {
        const { data, error } = await client.rpc("get_chapter_catalog", { target_story_id: story.id });
        if (error) throw error;
        story.chapters = (data || []).map(row => normalizeBackendChapter(row, story));
      } catch (catalogErr) {
        console.warn("Catalog RPC unavailable for subscription story; using direct published chapter metadata fallback", story.slug, catalogErr);
        try {
          const { data: fallbackChapters, error: fallbackError } = await client
            .from("chapters")
            .select("id, story_id, title, chapter_order, word_count, is_published, created_at, updated_at")
            .eq("story_id", story.id)
            .eq("is_published", true)
            .order("chapter_order", { ascending:true });
          if (fallbackError) throw fallbackError;
          story.chapters = (fallbackChapters || []).map(row => normalizeBackendChapter({
            ...row,
            access_state:"free",
            can_read:true,
            preview_text:""
          }, story));
          story.catalogFallback = true;
        } catch (fallbackErr) {
          console.warn("Direct chapter metadata fallback failed", story.slug, fallbackErr);
          story.chapters = [];
        }
      }
    }
    const withChapters = stories.filter(story => story.chapters.length);
    if (withChapters.length) {
      D.STORIES = withChapters;
      D.UPDATES = buildBackendUpdates(withChapters);
      D.PRIMARY_SLUG = withChapters[0].slug;
      D.FEATURED_SLUGS = withChapters.slice(0, 2).map(story => story.slug);
      backendState.usingFixtures = false;
      backendState.loaded = true;
      return true;
    }
    backendState.error = new Error("No published backend stories with catalog rows were found; keeping local fixtures.");
    return false;
  } catch (err) {
    backendState.error = err;
    console.warn("Aether Pages backend library load failed; keeping fixtures.", err);
    D.STORIES = fixtureStories.map(story => ({ ...story, chapters:(story.chapters||[]).map(ch=>({ ...ch })) }));
    backendState.usingFixtures = true;
    return false;
  } finally {
    backendState.loading = false;
  }
}
async function loadReaderChapterIntoFixture(chapterId){
  const client = getSupabase();
  const found = byId(chapterId);
  if (!client || !found || !found.ch.backend) return false;
  if (found.ch.content || found.ch.contentLoading) return !!found.ch.content;
  found.ch.contentLoading = true;
  found.ch.contentError = null;
  try {
    const { data, error } = await client.rpc("get_reader_chapter", { target_chapter_id: chapterId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.can_read || !row.content) throw new Error("This chapter is still locked for this account.");
    found.ch.content = textToBlocks(row.content);
    found.ch.state = row.access_state === "free" ? "free" : "unlocked";
    found.ch.can_read_backend = true;
    return true;
  } catch (err) {
    const message = err?.message || "Unable to load chapter content.";
    found.ch.contentError = message;
    return false;
  } finally {
    found.ch.contentLoading = false;
  }
}

/* ============ site themes ============ */
const THEMES = [
  { id:"aether", name:"Aether", dot:"linear-gradient(135deg,#1a1d28,#d4b06a)" },
  { id:"ember", name:"Ember", dot:"linear-gradient(135deg,#241711,#e08a4a)" },
  { id:"frost", name:"Frost", dot:"linear-gradient(135deg,#14212b,#6fb6c9)" },
  { id:"midnight", name:"Midnight Ink", dot:"linear-gradient(135deg,#161324,#9a7ed1)" },
  { id:"sage", name:"Sage", dot:"linear-gradient(135deg,#161e14,#8fb98a)" },
  { id:"parchment", name:"Parchment", dot:"linear-gradient(135deg,#efe8d8,#9a6b3f)" }
];
function applyTheme(){ document.documentElement.setAttribute("data-theme", store.theme || "aether"); }
function setTheme(id){ store.theme = id; saveStore(); applyTheme(); }
applyTheme();

/* ============ access-state resolver ============ */
function chapterResolved(ch) {
  const P = persona();
  if (ch.state === "free") return { state:"free", isEarly:false };
  if (ch.state === "unavailable") return { state:"unavailable" };
  if (ch.state === "key") return { state: (P.hasKey || store.grantedKey) ? "unlocked" : "key", isEarly:false };
  const isArch = ch.tier === "Archivist Tier";
  const need = isArch ? 2 : 1;
  // active access covers it
  if (P.level >= need) return { state:"unlocked", isEarly: ch.state==="early" };
  // sync pending (will unlock member-tier content)
  if (P.pending) {
    if (need <= (P.pendingLevel||0)) return { state:"pending" };
    return { state: gateDisplay(ch) };
  }
  // expired (previously held this access)
  if (P.expired) {
    if (need <= (P.prevLevel||0)) return { state:"expired", isEarly: ch.state==="early" };
    return { state: gateDisplay(ch) };
  }
  // Patreon linked but no qualifying tier
  if (P.noTier) return { state: gateDisplay(ch), noTier: ch.state!=="preview" };
  // anonymous / signed-in-no-access / key-holder without this tier
  return { state: gateDisplay(ch), isEarly: ch.state==="early" };
}
// maps an intrinsic chapter gate to what a reader WITHOUT access should see
function gateDisplay(ch){
  if (ch.state === "preview") return "preview";
  if (ch.state === "early") return "early";
  if (ch.state === "locked") return "locked";
  // base "unlocked" means member-tier gated â€” never expose as readable without access
  return "locked";
}
function reasonFor(ch, r) {
  if (r.state === "pending") return "Verifying your access with Patreon â€” usually a moment.";
  if (r.state === "expired") return "Your Aether Member access has expired. Renew to continue.";
  if (r.noTier) return "Your Patreon tier does not include Aether Pages access.";
  if (r.state === "key") return "Redeem an access key to read this chapter.";
  return D.KEY_REASONS[ch.id] || "";
}
function isReadable(r){ return r.state==="free" || r.state==="unlocked"; }
function hasImages(ch){ const c = ch.content||ch.preview||[]; return c.some(b=>b.t==="img"); }

/* ============ icons ============ */
const I = {
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/></svg>`,
  library:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="m16 5 4 1-3 14-4-1z"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>`,
  feed:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  shelf:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M4 4h5a2 2 0 0 1 2 2v14M20 4v16M20 4h-5a2 2 0 0 0-2 2"/></svg>`,
  vault:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v1.5M12 14.5V16M8 12h1.5M14.5 12H16"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  star:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.7 1.4 6.7L12 17.8 5.9 20.4l1.4-6.7-5-4.7 6.8-.7z"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  lock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  lockOpen:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-1.5"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  hourglass:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 4 5 5 5 9s-5 5-5 9M17 3c0 4-5 5-5 9s5 5 5 9"/></svg>`,
  key:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2-2M14 14l2-2"/></svg>`,
  sync:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"/></svg>`,
  checkCirc:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></svg>`,
  open:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h7M4 6v12M4 18h7M14 4l6 8-6 8"/></svg>`,
  chevR:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  chevL:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>`,
  aa:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 8 6l4 12M5.5 14h5M14 18l3-9 3 9M15 15h4"/></svg>`,
  play:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></svg>`,
  heart:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21Z"/></svg>`,
  msg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/></svg>`,
  quote:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 6c-3 1-5 4-5 8v4h6v-6H6c0-2 1-4 3-5zm10 0c-3 1-5 4-5 8v4h6v-6h-4c0-2 1-4 3-5z"/></svg>`,
  bookmark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`,
  bookmarkFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z"/></svg>`,
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>`,
  door:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4a1 1 0 0 1 1-1h9l4 3v15"/><path d="M5 21h14M9 11h2"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>`,
  layers:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>`,
  orbit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/></svg>`,
  fire:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-1 6 0 1 1 2 2 2 0-2 1-2 1-2 2 2 3 4 3 6a5 5 0 0 1-10 0c0-3 2-4 2-6 0-1 1-4 3-6Z"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
  mail:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  gift:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9S9 3 6.5 5 9 9 12 9Zm0 0s3-6 5.5-4S15 9 12 9Z"/></svg>`,
  spark:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z"/></svg>`,
  external:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`,
  copy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  map:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 6-2 6 2 6-2v12l-6 2-6-2-6 2z"/><path d="M9 5v14M15 7v14"/></svg>`,
  help:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.5a3 3 0 0 1 5.2 1.5c.3 2-2.4 2.3-2.4 4"/><path d="M12 17.5v.5"/></svg>`,
  grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>`,
  cog:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`,
  flame:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4c1 2 0 3 0 4s1 2 2 2 1-3 1-3c2 2 4 4 4 7a5 5 0 0 1-10 0c0-3 2-5 3-10Z"/></svg>`,
  tear:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/></svg>`,
  overview:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="11" rx="1.5"/><rect x="3" y="17" width="8" height="4" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/></svg>`,
  palette:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .9-1.5 2-1.5h2c2.2 0 4-1.8 4-4 0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor"/><circle cx="16.5" cy="11" r="1.1" fill="currentColor"/></svg>`,
  trending:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>`
};
function icon(n, cls){ return `<span class="${cls||''}">${I[n]||""}</span>`; }

/* ============ cover art generator ============ */
function coverArt(s){
  const a=s.accent, a2=s.accent2, dark="#0b0a10";
  const motifs = {
    shards:`<g opacity=".9">${poly(400,200,120,6,a2,.5)}${poly(300,260,80,5,a,.45)}${poly(500,160,90,6,a,.4)}${poly(360,330,70,5,a2,.35)}<g stroke="${a2}" stroke-opacity=".25" fill="none" stroke-width="1">${[...Array(7)].map((_,i)=>`<path d="M${120+i*70} 460 L${200+i*40} 0"/>`).join("")}</g></g>`,
    arcs:`<g fill="none" stroke="${a2}" stroke-opacity=".5" stroke-width="2"><circle cx="400" cy="460" r="140"/><circle cx="400" cy="460" r="200" stroke-opacity=".3"/><circle cx="400" cy="460" r="270" stroke-opacity=".18"/></g><circle cx="400" cy="120" r="60" fill="${a}" opacity=".6"/><g stroke="${a2}" stroke-width="2" stroke-opacity=".6"><path d="M400 320 V460"/></g>`,
    orbit:`<g fill="none" stroke="${a2}" stroke-opacity=".4" stroke-width="2"><ellipse cx="400" cy="240" rx="260" ry="90" transform="rotate(-18 400 240)"/></g><circle cx="400" cy="240" r="86" fill="${a}" opacity=".75"/><circle cx="610" cy="180" r="14" fill="${a2}"/><circle cx="180" cy="300" r="8" fill="${a2}" opacity=".7"/><g fill="${a2}" opacity=".8">${[...Array(40)].map(()=>{const x=Math.random()*800,y=Math.random()*480,r=Math.random()*1.4;return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`;}).join("")}</g>`,
    map:`<g stroke="${a2}" stroke-opacity=".5" fill="none" stroke-width="1.6">${[...Array(6)].map((_,i)=>`<path d="M${60+i*10} ${120+i*40} C ${260} ${90+i*30}, ${420} ${200+i*20}, ${620+i*10} ${140+i*40}"/>`).join("")}<path d="M120 380 C 300 320, 460 400, 700 340" stroke-opacity=".4"/></g><g fill="${a2}"><circle cx="280" cy="180" r="4"/><circle cx="520" cy="300" r="4"/><circle cx="640" cy="160" r="4"/></g>`,
    key:`<g stroke="${a2}" stroke-width="3" fill="none" stroke-opacity=".55"><circle cx="400" cy="180" r="70"/><circle cx="400" cy="180" r="30" fill="${a}" fill-opacity=".5" stroke="none"/><path d="M400 250 V400 M400 340h40 M400 370h30"/></g><g stroke="${a2}" stroke-opacity=".2" stroke-width="1">${[...Array(8)].map((_,i)=>`<path d="M${400} ${180} L${400+Math.cos(i)*120|0} ${180+Math.sin(i)*120|0}"/>`).join("")}</g>`
  };
  function poly(cx,cy,r,n,fill,op){ const pts=[...Array(n)].map((_,i)=>{const ang=(i/n)*Math.PI*2 - Math.PI/2; return `${cx+Math.cos(ang)*r},${cy+Math.sin(ang)*r}`;}).join(" "); return `<polygon points="${pts}" fill="${fill}" opacity="${op||.4}"/>`; }
  return `<svg class="cover-art" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="cg-${s.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${a}" stop-opacity=".25"/></linearGradient>
    <radialGradient id="cgR-${s.id}" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${a}" stop-opacity=".3"/><stop offset="1" stop-color="${dark}" stop-opacity="0"/></radialGradient></defs>
    <rect width="800" height="480" fill="${dark}"/><rect width="800" height="480" fill="url(#cg-${s.id})"/><rect width="800" height="480" fill="url(#cgR-${s.id})"/>
    ${motifs[s.motif]||motifs.arcs}
    <rect width="800" height="480" fill="url(#vg-${s.id})"/>
    <defs><linearGradient id="vg-${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}" stop-opacity="0"/><stop offset=".7" stop-color="${dark}" stop-opacity=".2"/><stop offset="1" stop-color="${dark}" stop-opacity=".6"/></linearGradient></defs>
  </svg>`;
}

/* ============ UI primitives ============ */
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function badge(kind, text){ return `<span class="badge ${kind||""}">${text}</span>`; }
function chip(label, act, active, svg){ return `<button class="chip ${active?"active":""}" ${act?`data-${act}`:""}>${svg?`<span class="ic">${I[svg]||""}</span>`:""}<span>${label}</span></button>`; }
function storyAccentVars(s){ return `--s:${s.accent};--s2:${s.accent2};--s-soft:${hexA(s.accent,0.14)};`; }
function hexA(hex,a){ const h=hex.replace("#","");const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return `rgba(${r},${g},${b},${a})`; }

function accessTag(r){
  const map = {
    free:["free","Free",I.open,"Read now"],
    unlocked:["unlocked","Unlocked",I.checkCirc,"Read now"],
    preview:["preview","Preview",I.eye,"Preview"],
    early:["early","Early Access",I.hourglass,"Early access"],
    locked:["locked","Locked",I.lock,"Unlock"],
    key:["key","Key",I.key,"Redeem key"],
    pending:["pending","Syncing",I.sync,"Verifying"],
    expired:["expired","Expired",I.lock,"Renew"],
    unavailable:["error","Unavailable",I.alert,"Unavailable"]
  };
  const m = map[r.state] || map.locked;
  return m;
}
function axInline(r){ const m=accessTag(r); return `<span class="ax ${m[0]}"><span class="ic">${m[2]}</span>${m[1]}</span>`; }

function progressBar(pct){ return `<div class="bar"><i style="width:${Math.min(100,Math.max(0,pct))}%"></i></div>`; }
function ring(pct){ return `<div class="ring" style="--p:${pct}"><span>${pct}%</span></div>`; }

function commentCount(chId){ const c=store.comments[chId]||[]; return c.length; }
function paraComments(chId, p){ return (store.comments[chId]||[]).filter(c=>c.para===p); }

function ctaFor(ch, r, story, opts){
  opts = opts||{};
  const cid = ch.id;
  if (r.state === "free" || r.state === "unlocked") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''} story" data-read="${cid}">${I.play}Read</button>`;
  if (r.state === "preview") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-preview="${cid}">${I.eye}Preview</button>`;
  if (r.state === "early") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.hourglass}Early access</button>`;
  if (r.state === "pending") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.sync}Verifying</button>`;
  if (r.state === "expired") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.lockOpen}Renew</button>`;
  if (r.state === "key") return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.key}Redeem key</button>`;
  if (r.state === "unavailable") return `<button class="btn sm" disabled>Unavailable</button>`;
  return `<button class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.lockOpen}Unlock</button>`;
}

/* ============ shared partials ============ */
function brandMark(){ return `<svg class="mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7cd97"/><stop offset="1" stop-color="#d4b06a"/></linearGradient></defs><path d="M16 2 4 9v8c0 6 5 10 12 13 7-3 12-7 12-13V9z" fill="url(#bm)" opacity=".18" stroke="#d4b06a" stroke-width="1.2"/><path d="M16 8 9 12v5c0 4 3 7 7 9 4-2 7-5 7-9v-5z" fill="none" stroke="#e7cd97" stroke-width="1.4"/><path d="M16 11v10M12 16h8" stroke="#d4b06a" stroke-width="1.2" stroke-linecap="round"/></svg>`; }

function topbar(){
  const P = persona();
  const state = P.expired?"expired":P.pending?"pending":(P.noTier||P.level===0&&P.signedIn)?"none":P.level>0?"active":"anon";
  const label = !P.signedIn?"Not signed in":P.expired?"Access expired":P.pending?"Sync pending":P.noTier?"No access":P.tier?("Active Â· "+P.tier):"Signed in";
  const unread = store.notifs.filter(n=>!n.read).length;
  return `<header class="topbar">
    <a class="brand" href="#/" data-nav="/">${brandMark()}<span><span class="serif">Aether Pages</span><small>Member Reader</small></span></a>
    <span class="spacer"></span>
    <button class="access-chip" data-state="${state}" data-nav="/vault"><span class="pulse"></span>${label}</button>
    ${isAdmin()?`<a class="tb-btn" href="admin.html" aria-label="Admin CMS">${I.shield}</a>`:""}
    <button class="tb-btn" data-nav="/notifications" aria-label="Notifications">${I.bell}${unread?`<span class="dot"></span>`:""}</button>
    <button class="tb-btn" data-sheet="persona" aria-label="Account and access">${I.user}</button>
  </header>`;
}
function bottomnav(active){
  const items=[["home","/","Home"],["library","/library","Library"],["feed","/updates","Updates"],["shelf","/my-shelf","Shelf"],["vault","/vault","Vault"]];
  return `<nav class="bottomnav">${items.map(([ic,path,lbl])=>`<a href="#${path}" data-nav="${path}" class="${active===ic?'active':''}">${I[ic]}<span>${lbl}</span></a>`).join("")}</nav>`;
}
function announcement(){
  return `<div class="announce"><span class="ic">${I.info}</span><div class="t"><b>Patreon sync is running smoothly</b><span>New early-access chapters are live. Public releases this week are noted in the calendar.</span></div></div>`;
}

/* ============ sheets ============ */
let currentSheet = null;
function openSheet(builder, opts){
  opts = opts||{};
  closeSheet(true);
  const scrim = document.querySelector(".scrim") || (()=>{const d=document.createElement("div");d.className="scrim";document.body.appendChild(d);return d;})();
  const sheet = document.querySelector(".sheet") || (()=>{const d=document.createElement("div");d.className="sheet";document.body.appendChild(d);return d;})();
  sheet.innerHTML = `<span class="grip"></span>${builder()}`;
  document.body.classList.add("has-sheet");
  requestAnimationFrame(()=>{ scrim.classList.add("open"); sheet.classList.add("open"); });
  currentSheet = { builder, opts };
  if (opts.onMount) requestAnimationFrame(()=>opts.onMount(sheet));
}
function closeSheet(silent){
  const scrim = document.querySelector(".scrim"), sheet = document.querySelector(".sheet");
  if (scrim) scrim.classList.remove("open");
  if (sheet) sheet.classList.remove("open");
  document.body.classList.remove("has-sheet");
  currentSheet = null;
}

/* ============ toasts ============ */
function toast(title, sub, opts){
  opts = opts||{};
  const wrap = document.querySelector(".toasts") || (()=>{const d=document.createElement("div");d.className="toasts";document.body.appendChild(d);return d;})();
  const t = document.createElement("div"); t.className="toast";
  const ic = opts.kind||"good";
  t.innerHTML = `<span class="ic ${ic==='good'?'good':ic==='bad'?'bad':''}">${opts.icon?I[opts.icon]:I.check}</span><div class="txt"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</div>${opts.action?`<button class="act" data-toast-action="${opts.action.act}">${esc(opts.action.label)}</button>`:""}`;
  wrap.appendChild(t);
  requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); }, opts.ms||4200);
}

/* ============ router ============ */
let route = { name:"home", params:{} };
function parseHash(){
  const raw = location.hash.replace(/^#\/?/, "");
  const p = raw.split("/").filter(Boolean);
  const r = { name:"home", params:{} };
  if (!p.length) return r;
  if (p[0]==="library") r.name="library";
  else if (p[0]==="updates") r.name="updates";
  else if (p[0]==="calendar") r.name="calendar";
  else if (p[0]==="collections"){ r.name = p[1]?"collection":"collections"; r.params.slug=p[1]; }
  else if (p[0]==="vault") r.name="vault";
  else if (p[0]==="my-shelf") r.name="shelf";
  else if (p[0]==="bookmarks") r.name="bookmarks";
  else if (p[0]==="quotes") r.name="quotes";
  else if (p[0]==="history") r.name="history";
  else if (p[0]==="notifications") r.name="notifications";
  else if (p[0]==="benefits") r.name="benefits";
  else if (p[0]==="onboarding") r.name="onboarding";
  else if (p[0]==="help") r.name="help";
  else if (p[0]==="support"){ r.name = { "check-access":"checkAccess","wrong-account":"wrongAccount","contact":"contact" }[p[1]] || "help"; }
  else if (p[0]==="story"){ r.params.slug=p[1]; r.name = { chapters:"chapters", recap:"recap", extras:"extras", updates:"storyUpdates" }[p[2]] || "story"; }
  else if (p[0]==="read"){ r.params.id=p[1]; r.name="read"; }
  else if (p[0]==="studio"){
    r.name = { chapters:"studioChapters", access:"studioAccess", announcements:"studioAnnouncements", media:"studioMedia", analytics:"studioAnalytics", settings:"studioSettings" }[p[1]] || "studioOverview";
  }
  return r;
}
function nav(path){ if(path===location.hash||( "#"+path)===location.hash){ render(); } else { location.hash = path; } }

function render(){
  route = parseHash();
  const main = document.getElementById("main");
  const inReader = route.name === "read";
  const inStudio = /^studio/.test(route.name);
  document.body.classList.toggle("in-reader", inReader);
  document.body.classList.toggle("in-studio", inStudio);
  const view = VIEWS[route.name] || VIEWS.home;
  const html = (inStudio && !isAdmin()) ? adminGate() : view();
  const apply = ()=>{
    if (inReader){
      main.innerHTML = html;
    } else if (inStudio){
      main.innerHTML = `<div class="vt studio-body">${html}</div>`;
    } else {
      main.innerHTML = `<div class="vt">${html}</div>`;
    }
    if (inStudio && isAdmin()){ ensureStudioChrome(); }
    else if (!inReader){ ensureChrome(); }
    afterRender();
    if (window.scrollTo) { try { window.scrollTo(0,0); } catch(e){} }
  };
  const reduce = store.settings.preset==="none" ? false : false; // respect media query via CSS mostly
  if (document.startViewTransition && !prefersReducedMotion()){
    document.startViewTransition(apply);
  } else apply();
}
function adminGate(){
  return `<div class="empty" style="padding-top:90px"><div class="em">${I.shield}</div><h3>Admin access required</h3><p>The author studio is only visible to profiles with the <code>admin</code> role. Use the main admin CMS for production access controls.</p>${authState.user?`<a class="btn story" href="admin.html">${I.external}Open admin CMS</a>`:`<button class="btn story" data-sheet="persona">${I.user}Sign in</button>`}<button class="btn ghost" data-nav="/">Back to reader</button></div>`;
}
function prefersReducedMotion(){ return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

let chromeBuilt = false;
function ensureChrome(){
  const app = document.getElementById("app");
  // remove studio chrome if present (leaving studio)
  const studioTopEl = document.querySelector(".studio-top");
  if (studioTopEl) studioTopEl.remove();
  document.body.classList.remove("in-studio");
  if (!document.querySelector(".topbar")){ const tb=document.createElement("header"); tb.innerHTML=""; }
  // rebuild chrome each render to update access chip / notif dot
  let topEl = document.querySelector(".topbar");
  if (!topEl){ topEl=document.createElement("header"); app.insertBefore(topEl, document.getElementById("main")); }
  topEl.outerHTML = topbar();
  let navEl = document.querySelector(".bottomnav");
  if (!navEl){ navEl=document.createElement("nav"); app.appendChild(navEl); }
  const active = {home:"home",library:"library",updates:"feed",shelf:"shelf",vault:"vault"}[route.name] || "";
  navEl.outerHTML = bottomnav(active);
  chromeBuilt = true;
}
function ensureStudioChrome(){
  const app = document.getElementById("app");
  const tb=document.querySelector(".topbar"); if(tb) tb.remove();
  const nv=document.querySelector(".bottomnav"); if(nv) nv.remove();
  let st = document.querySelector(".studio-top");
  if(!st){ st=document.createElement("header"); st.className="studio-top"; app.insertBefore(st, document.getElementById("main")); }
  st.outerHTML = studioTop();
}
function studioTop(){
  const active = { studioOverview:"", studioChapters:"chapters", studioAccess:"access", studioAnnouncements:"announcements", studioMedia:"media", studioAnalytics:"analytics", studioSettings:"settings" }[route.name];
  const nav=[
    ["","Overview","overview"],["chapters","Chapters","book"],["access","Access","vault"],
    ["announcements","Posts","msg"],["media","Media","spark"],["analytics","Stats","grid"],["settings","Settings","cog"]
  ];
  return `<div class="studio-top">
    <div class="st-row">
      <a class="brand" href="#/studio" data-nav="/studio">${brandMark()}<span class="btxt"><span class="serif">Aether Studio</span><small>Author CMS</small></span></a>
      <span class="exit"><button class="btn sm ghost" data-nav="/">${I.chevL}Exit to reader</button></span>
    </div>
    <nav class="studio-nav">${nav.map(([p,l,ic])=>`<a href="#/studio${p?'/'+p:''}" data-nav="/studio${p?'/'+p:''}" class="${active===p?'active':''}">${I[ic]}<span>${l}</span></a>`).join("")}</nav>
  </div>`;
}

/* ============ views registry ============ */
const VIEWS = {};

/* ============ small helpers ============ */
function fmtDate(iso){ if(!iso) return ""; const m=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const d=new Date(iso); return m[d.getMonth()]+" "+d.getDate(); }
function daysUntil(iso){ if(!iso) return null; const d=new Date(iso); const t=new Date("2026-06-24"); return Math.max(0, Math.round((d-t)/86400000)); }
function setStoryAccent(s){ document.documentElement.style.setProperty("--s", s.accent); document.documentElement.style.setProperty("--s2", s.accent2); document.documentElement.style.setProperty("--s-soft", hexA(s.accent,0.14)); }
function meta(items){ return items.filter(Boolean).map(x=>`<span class="mi">${x}</span>`).join(""); }
function countReadable(){ let n=0; D.STORIES.forEach(s=>s.chapters.forEach(c=>{ if(isReadable(chapterResolved(c))) n++; })); return n; }
function activeReads(){ return Object.entries(store.progress).map(([id,p])=>{ const f=byId(id); return f?{...f, prog:p}:null; }).filter(Boolean).sort((a,b)=>b.prog.updatedAt-a.prog.updatedAt); }
function totalComments(){ return Object.values(store.comments).reduce((s,a)=>s+a.length,0); }

/* ============ shared card builders ============ */
function storyCard(s){
  const r = s.chapters.map(chapterResolved);
  const memberOnly = r.every(x=>x.state!=="free") && s.chapters.some(c=>c.state!=="free");
  const freeBadge = s.chapters.some(c=>c.state==="free");
  const prog = s.chapters.map(c=>store.progress[c.id]).filter(Boolean);
  const lastUpd = Math.max(0,...s.chapters.map((c,i)=>i));
  return `<a class="story-card" href="#/story/${s.slug}" data-nav="/story/${s.slug}" style="${storyAccentVars(s)}">
    <div class="cover">${coverArt(s)}${memberOnly?`<span class="ribbon">Member</span>`:""}${prog.length?`<div class="progress-pip">${progressBar(prog[0].pct)}</div>`:""}</div>
    <div class="meta"><h3>${s.title}</h3><div class="by">${s.author} Â· ${s.genre}</div></div>
  </a>`;
}
function storyCardWide(s){
  const r = s.chapters.map(chapterResolved);
  const prog = store.progress[s.chapters[0].id] || store.progress[s.chapters.find(c=>store.progress[c.id])?.id];
  return `<a class="card tinted" href="#/story/${s.slug}" data-nav="/story/${s.slug}" style="${storyAccentVars(s)};display:flex;gap:13px;align-items:center;">
    <div style="width:54px;height:72px;border-radius:8px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(s)}</div>
    <div style="min-width:0;flex:1"><div style="font-family:var(--serif);font-weight:600">${s.title}</div><div class="faint" style="font-size:.74rem">${s.genre} Â· ${s.status}</div></div>
  </a>`;
}

/* ============ HOME ============ */
VIEWS.home = function(){
  const P = persona();
  const reads = activeReads();
  const tonights = reads.find(r=>r.prog.pct>0 && r.prog.pct<100) || reads[0];
  const hour = new Date().getHours();
  const greet = hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const name = P.signedIn? "reader" : "traveller";

  // access banner
  let banner = "";
  if (P.expired) banner = accessBanner("expired","Your Aether Member access has expired","Some chapters are now locked. Renew to continue reading â€” a short grace window may still apply.","/vault","Renew access");
  else if (P.pending) banner = accessBanner("pending","We're verifying your access","Your Patreon connection is syncing. This usually takes a moment â€” we'll update automatically.","/support/check-access","Check status");
  else if (P.noTier) banner = accessBanner("none","Your Patreon tier doesn't include access","You're connected, but your current tier doesn't unlock Aether Pages.","/benefits","See what unlocks");
  else if (!P.signedIn) banner = accessBanner("anon","Browsing as a guest","Read free chapters and previews freely. Connect Patreon or redeem a key to unlock the rest.","/vault","Activate access");

  return `
  ${announcement()}
  ${banner}
  <div class="between" style="margin-bottom:6px">
    <div><h1 class="page-title">${greet}, ${name}.</h1><p class="page-sub">The archive is quiet tonight. ${countReadable()} chapters await you.</p></div>
    <div class="faint" style="text-align:right;font-size:.72rem;line-height:1.5"><div style="font-family:var(--serif);color:var(--accent-2);font-size:.9rem">Archive Presence</div>5 evenings this month Â· 12 chapters read</div>
  </div>

  <div class="home-cols">
   <div>
    ${tonights?`<div class="section">
      <div class="section-head"><div><div class="eyebrow">Tonight's Reading</div></div></div>
      <div class="card tinted" style="${storyAccentVars(tonights.story)};display:flex;gap:14px;align-items:center">
        <div style="width:62px;height:84px;border-radius:9px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(tonights.story)}</div>
        <div style="flex:1;min-width:0">
          <div class="faint" style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase">Continue Â· ${tonights.story.title}</div>
          <div style="font-family:var(--serif);font-weight:600;font-size:1.05rem;margin:2px 0">${tonights.ch.title}</div>
          <div class="faint" style="font-size:.78rem;margin-bottom:8px">${tonights.ch.readTime-2} min left Â· you stopped near â€œ${tonights.prog.scene}â€</div>
          ${progressBar(tonights.prog.pct)}
        </div>
        <button class="btn story sm" data-read="${tonights.ch.id}">${I.play}Resume</button>
      </div>
    </div>`:""}

    <div class="section">
      <div class="section-head"><h2>Continue your threads</h2><a class="section-link" data-nav="/my-shelf">My shelf ${I.chevR}</a></div>
      <div class="lane stagger">
        ${reads.slice(0,6).map(({ch,story,prog})=>{
          const r=chapterResolved(ch); const next = story.chapters[story.chapters.indexOf(ch)+1]; const nr = next?chapterResolved(next):null;
          return `<button class="card" style="width:230px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}">
            <div class="faint" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em">${story.title}</div>
            <div style="font-family:var(--serif);font-weight:600;margin:2px 0 6px">${ch.title}</div>
            ${progressBar(prog.pct)}
            <div class="between" style="margin-top:8px"><span class="faint" style="font-size:.72rem">${prog.pct<100?prog.pct+'%':'Completed'}</span>${nr?`<span class="faint" style="font-size:.68rem">Next: ${accessTag(nr)[1]}</span>`:""}</div>
          </button>`;
        }).join("")}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Latest in the archive</h2><a class="section-link" data-nav="/updates">All updates ${I.chevR}</a></div>
      <div class="col-flex">
        ${D.UPDATES.slice(0,4).map(u=>updateRow(u)).join("")}
      </div>
    </div>
   </div>

   <div>
    ${memberArchivePanel()}
    <div class="section">
      <div class="section-head"><h2>Newly available to you</h2></div>
      <div class="card" style="padding:14px">
        ${D.UPDATES.filter(u=>u.kind==="newly-available"||u.kind==="public-unlock").map(u=>`<div class="between" style="padding:6px 0"><div><div style="font-size:.86rem;font-weight:600">${u.title}</div><div class="faint" style="font-size:.72rem">${u.note}</div></div>${u.chapter?`<button class="btn sm story" data-read="${u.chapter}">Read</button>`:""}</div>`).join("")}
      </div>
    </div>
    <div class="section">
      <div class="section-head"><h2>Because you readâ€¦</h2></div>
      <div class="col-flex">
        ${D.STORIES.slice(1, 3).map(storyCardWide).join("") || `<p class="faint" style="font-size:.8rem">More recommendations will appear as the backend library grows.</p>`}
      </div>
      <p class="faint" style="font-size:.74rem;margin-top:8px">Read <em>The Night Cartographer</em>? Try these atmospheric completions.</p>
    </div>
   </div>
  </div>

  <div class="section">
    <div class="section-head"><h2>Collections</h2><a class="section-link" data-nav="/collections">Browse all ${I.chevR}</a></div>
    <div class="chips scroll">${D.COLLECTIONS.slice(0,8).map(c=>`<a class="chip" href="#/collections/${c.slug}" data-nav="/collections/${c.slug}">${I[c.icon]||I.book}<span>${c.name}</span></a>`).join("")}</div>
  </div>
  `;
};
function accessBanner(kind,title,sub,link,label){
  const col = {expired:"bad",pending:"warn",none:"muted",anon:"info"}[kind];
  return `<div class="card" style="margin-bottom:14px;display:flex;gap:13px;align-items:center;border-color:color-mix(in srgb,var(--${col==='bad'?'bad':col==='warn'?'warn':col==='info'?'info':'text-faint'}) 30%,var(--border));background:linear-gradient(160deg,color-mix(in srgb,var(--${col==='bad'?'bad':col==='warn'?'warn':col==='info'?'info':'text-faint'}) 8%,var(--surface)),var(--surface))">
    <span class="ax ${col==='bad'?'expired':col==='warn'?'pending':col==='info'?'preview':'locked'}" style="font-size:1.4rem"><span class="ic" style="width:26px;height:26px">${kind==='expired'?I.lock:kind==='pending'?I.sync:kind==='anon'?I.info:I.alert}</span></span>
    <div style="flex:1;min-width:0"><div style="font-weight:700;font-family:var(--serif)">${title}</div><div class="faint" style="font-size:.8rem;margin-top:1px">${sub}</div></div>
    <button class="btn sm" data-nav="${link}">${label}</button>
  </div>`;
}
function memberArchivePanel(){
  const P=persona();
  const illus = D.STORIES.reduce((n,s)=>n+s.chapters.filter(hasImages).length,0);
  return `<div class="card tinted" style="margin-bottom:6px">
    <div class="between" style="margin-bottom:12px"><div class="eyebrow">Member Archive</div>${P.signedIn?badge("gold",P.tier||"Signed in"):badge("", "Guest")}</div>
    <div class="stat-grid">
      <div class="stat"><div class="n">${countReadable()}</div><div class="l">Readable now</div></div>
      <div class="stat"><div class="n">${totalComments()}</div><div class="l">Reader notes</div></div>
      <div class="stat"><div class="n">${illus}</div><div class="l">Illustrated</div></div>
      <div class="stat"><div class="n">${store.followed.length}</div><div class="l">Following</div></div>
    </div>
    <div class="quicklinks" style="margin-top:14px">
      <a data-nav="/my-shelf">${I.shelf}<span>My Shelf</span><small>Threads &amp; quotes</small></a>
      <a data-nav="/benefits">${I.spark}<span>Benefits</span><small>What access unlocks</small></a>
      <a data-nav="/support/check-access">${I.shield}<span>Access Check</span><small>Verify access</small></a>
      <a data-nav="/calendar">${I.calendar}<span>This Week</span><small>Releases</small></a>
    </div>
  </div>`;
}
function updateRow(u){
  const s=bySlug(u.story); if(!s) return "";
  const kindLabel={early:"Early access","public-unlock":"Public release","newly-available":"Newly unlocked","member-drop":"Member drop",note:"Author note",schedule:"Schedule",campaign:"Key campaign"}[u.kind]||"Update";
  const kColor={early:"early","public-unlock":"free","newly-available":"gold","member-drop":"key",note:"",schedule:"",campaign:"key"}[u.kind]||"";
  return `<div class="row" ${u.chapter?`data-read="${u.chapter}"`:`data-nav="/story/${s.slug}/updates"`}>
    <span class="ic-col" style="color:var(--${kColor||'text-dim'})">${u.chapter?I.feed:I.msg}</span>
    <span class="body"><span class="t"><span class="tt">${u.title}</span>${badge(kColor,kindLabel)}</span>
    <span class="sub">${meta([`<i>${I.clock}</i>${u.when}`,s.title,u.note])}</span></span>
    <span class="cta">${u.chapter?`<button class="btn sm" data-read="${u.chapter}">Read</button>`:`<span class="faint">${I.chevR}</span>`}</span>
  </div>`;
}

/* ============ LIBRARY ============ */
VIEWS.library = function(){
  const q=store.filters.q||""; const chips=store.filters.chips||[];
  const timeFilters=[["under10","Under 10 min"],["10-20","10â€“20 min"],["binge","Bingeable"]];
  const stateFilters=[["readable","Readable now"],["free","Free starts"],["preview","Previews"],["early","Early access"],["member","Member"],["key","Key content"]];
  const statusFilters=[["ongoing","Ongoing"],["completed","Completed"]];
  function matches(s){
    if(q){ const t=(s.title+" "+s.author+" "+s.genre+" "+s.tags.join(" ")).toLowerCase(); if(!t.includes(q.toLowerCase())) return false; }
    if(chips.includes("ongoing")&&s.status!=="ongoing") return false;
    if(chips.includes("completed")&&s.status!=="completed") return false;
    if(chips.includes("free")&&!s.chapters.some(c=>c.state==="free")) return false;
    if(chips.includes("member")&&!s.chapters.some(c=>c.tier)) return false;
    if(chips.includes("early")&&!s.chapters.some(c=>c.state==="early")) return false;
    if(chips.includes("preview")&&!s.chapters.some(c=>c.state==="preview")) return false;
    if(chips.includes("key")&&!s.chapters.some(c=>c.state==="key")) return false;
    if(chips.includes("readable")&&!s.chapters.some(c=>isReadable(chapterResolved(c)))) return false;
    if(chips.includes("under10")&&!s.chapters.some(c=>c.readTime<10)) return false;
    if(chips.includes("10-20")&&!s.chapters.some(c=>c.readTime>=10&&c.readTime<=20)) return false;
    return true;
  }
  const list=D.STORIES.filter(matches);
  return `
  <h1 class="page-title">The Library</h1>
  <p class="page-sub">${D.STORIES.length} stories across fantasy, gothic, and the far future.</p>
  <div style="position:relative;margin:6px 0 14px">
    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-faint);display:flex">${I.search}</span>
    <input id="lib-search" class="pill-input" style="text-align:left;padding-left:42px" placeholder="Search stories, authors, genresâ€¦" value="${esc(q)}">
  </div>
  <div class="chips scroll" style="margin-bottom:8px">${stateFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}${statusFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}</div>
  <div class="chips scroll" style="margin-bottom:18px">${timeFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}<a class="chip" data-nav="/collections">${I.layers}<span>Collections</span></a></div>
  <div class="section-head"><h2>${chips.length||q?"Results":"All stories"}</h2><span class="faint" style="font-size:.78rem">${list.length} shown</span></div>
  ${list.length?`<div class="grid-stories stagger">${list.map(storyCard).join("")}</div>`:`<div class="empty"><div class="em">ðŸ“š</div><h3>No stories match</h3><p>Try clearing a filter or searching for something broader.</p><button class="btn" data-act="clear-filters">Clear filters</button></div>`}
  <div class="section"><div class="section-head"><h2>Pinned to My Shelf</h2></div><div class="lane">${store.followed.map(id=>{const s=bySlug(id);return s?storyCard(s):"";}).join("")}</div></div>
  `;
};

/* ============ STORY HUB ============ */
VIEWS.story = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story");
  setStoryAccent(s);
  const r=s.chapters.map(chapterResolved);
  const readCount=s.chapters.filter((c,i)=>store.readMarked[c.id]|| (store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
  const total=s.chapters.length;
  const pct=Math.round(readCount/total*100);
  const nextUnread=s.chapters.find(c=>!(store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)));
  const latestEarly=s.chapters.find(c=>c.state==="early");
  const followed=store.followed.includes(s.id);
  const firstFree=s.chapters.find(c=>c.state==="free");
  const lastRead=activeReads().find(x=>x.story.id===s.id);
  const startCh = lastRead?.ch.id || (firstFree?.id) || s.chapters[0].id;
  const startR = chapterResolved(byId(startCh).ch);
  return `
  <div class="hero" style="${storyAccentVars(s)}">
    <div class="bg">${coverArt(s)}</div><div class="grad"></div>
    <div class="inner">
      <div class="mini-cover">${coverArt(s)}</div>
      <div class="htxt">
        <div class="eyebrow">${s.genre} Â· ${s.status}</div>
        <h1>${s.title}</h1>
        <div class="author">by ${s.author}</div>
        <div class="tags">${s.tags.map(t=>badge("",t)).join("")}</div>
      </div>
    </div>
  </div>
  <p class="muted" style="font-family:var(--serif);font-size:1.02rem;line-height:1.6;margin:0 2px 16px">${s.tagline}</p>

  <div class="sticky-cta"><button class="btn primary block" data-read="${startCh}">${lastRead?(I.play+"Continue â€” "+lastRead.ch.title):"Start reading"}</button></div>

  <div class="card tinted" style="margin-bottom:14px">
    <div class="between" style="margin-bottom:12px"><div><div class="eyebrow">Your progress</div><div style="font-family:var(--serif);font-size:1.1rem;font-weight:600;margin-top:2px">${readCount} / ${total} chapters read</div></div>${ring(pct)}</div>
    <div class="faint" style="font-size:.8rem;line-height:1.6">
      ${nextUnread?`Next unread: <b style="color:var(--text)">${nextUnread.title}</b> Â· `:""}${latestEarly?`Latest: <b style="color:var(--early)">${latestEarly.title}</b> (early access) Â· `:""}${s.chapters.filter(c=>!isReadable(chapterResolved(c))).length} locked for you.
    </div>
  </div>

  <div class="section-head"><h2>Where should I start?</h2></div>
  <div class="quicklinks" style="margin-bottom:18px">
    <a data-read="${firstFree?.id||s.chapters[0].id}">${I.play}<span>Chapter 1</span><small>From the beginning</small></a>
    <a data-read="${startCh}">${I.book}<span>Continue</span><small>${lastRead?lastRead.ch.title:"Where you left off"}</small></a>
    <a data-nav="/story/${s.slug}/recap">${I.list}<span>Recap</span><small>Catch up first</small></a>
    <a data-nav="/story/${s.slug}/extras">${I.spark}<span>Extras</span><small>Bonus materials</small></a>
  </div>

  <div class="section">
    <div class="section-head"><h2>Latest chapters</h2><a class="section-link" data-nav="/story/${s.slug}/chapters">Full shelf ${I.chevR}</a></div>
    <div class="col-flex">${s.chapters.slice(-3).reverse().map(c=>chapterRow(c,s)).join("")}</div>
  </div>

  <div class="section">
    <div class="between"><div class="section-head" style="margin:0"><h2>Follow this story</h2></div><button class="btn sm ${followed?'':'story'}" data-follow="${s.id}">${followed?I.checkCirc+"Following":I.plus+"Follow"}</button></div>
    <p class="faint" style="font-size:.78rem;margin-top:-4px">${followed?"We'll notify you when new chapters unlock for you.":"Get notified when new chapters unlock for your access."}</p>
  </div>

  <div class="section">
    <div class="section-head"><h2>Cast &amp; glossary</h2></div>
    <div class="card">
      ${s.cast.map(c=>`<div style="padding:7px 0;border-bottom:1px solid var(--border)"><span style="font-family:var(--serif);font-weight:600;color:var(--s2)">${c.n}</span> <span class="faint" style="font-size:.82rem">â€” ${c.r}</span></div>`).join("")}
      <dl class="dl" style="margin-top:12px">${s.glossary.map(g=>`<dt>${g.t}</dt><dd>${g.d}</dd>`).join("")}</dl>
    </div>
  </div>
  <div class="section">
    <div class="card" style="display:flex;gap:12px;align-items:center">
      <span class="faint">${I.external}</span>
      <div style="flex:1"><div style="font-weight:600;font-size:.88rem">Explore in the main archive</div><div class="faint" style="font-size:.76rem">Deep lore, maps, timelines &amp; galleries on Abstracto Tales.</div></div>
      <button class="btn sm ghost" data-act="external-archive">${I.external}</button>
    </div>
  </div>
  `;
};

/* ============ CHAPTER SHELF ============ */
VIEWS.chapters = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story");
  setStoryAccent(s);
  const view = store.filters.shelfView || "comfortable";
  // group by arc
  const arcs={}; s.chapters.forEach(c=>{ (arcs[c.arc]=arcs[c.arc]||[]).push(c); });
  const renderRow = c => chapterRow(c,s);
  return `
  <div class="between" style="margin-bottom:6px"><a class="section-link" data-nav="/story/${s.slug}" style="display:inline-flex;align-items:center;gap:4px;color:var(--text-dim)">${I.chevL}<span>${s.title}</span></a></div>
  <h1 class="page-title">Chapter Shelf</h1>
  <p class="page-sub">${s.chapters.length} chapters Â· ${s.chapters.filter(c=>isReadable(chapterResolved(c))).length} readable for you now</p>
  <div class="seg story" style="margin:6px 0 18px">
    <button class="${view==='comfortable'?'active':''}" data-shelf-view="comfortable">Comfortable</button>
    <button class="${view==='compact'?'active':''}" data-shelf-view="compact">Compact</button>
    <button class="${view==='arc'?'active':''}" data-shelf-view="arc">By arc</button>
  </div>
  ${view==="arc"? Object.entries(arcs).map(([arc,chs])=>{
    const rd=chs.filter(c=>store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
    const lk=chs.filter(c=>!isReadable(chapterResolved(c))).length;
    return `<div class="arc"><div class="arc-head"><h3>${arc}</h3><div class="arc-bar">${progressBar(rd/chs.length*100)}</div><span class="arc-meta">${rd}/${chs.length}${lk?` Â· ${lk} locked`:""}</span></div><div class="col-flex">${chs.map(renderRow).join("")}</div></div>`;
  }).join("") : `<div class="col-flex">${s.chapters.map(renderRow).join("")}</div>`}
  `;
};
function chapterRow(ch, story){
  const r=chapterResolved(ch);
  const prog=store.progress[ch.id];
  const read = store.readMarked[ch.id] || (prog&&prog.pct>=100);
  const now_ = prog && prog.pct>0 && prog.pct<100;
  const cmt = commentCount(ch.id);
  const illus = hasImages(ch);
  const tag=accessTag(r);
  const act = isReadable(r)?`data-read="${ch.id}"`:(r.state==='preview'?`data-preview="${ch.id}"`:`data-lock="${ch.id}"`);
  const compact = (store.filters.shelfView==="compact");
  return `<button class="row ${read?'read':''} ${now_?'now':''}" style="${story?storyAccentVars(story):''}" ${act}>
    <span class="num">${read?'<span style="color:var(--good)">'+I.check+'</span>':ch.n}</span>
    <span class="body">
      <span class="t"><span class="tt">${ch.title}</span>${r.isEarly?badge('early','Early'):''}${illus?badge('illus','Illus'):''}${ch.state==='key'?badge('key','Key'):''}</span>
      <span class="sub">${meta([axInline(r),`<i>${I.clock}</i>${ch.readTime} min`,cmt?`<i>${I.msg}</i>${cmt}`:"",ch.publicDate?`<i>${I.calendar}</i>Public ${fmtDate(ch.publicDate)}`:""])}</span>
      ${(!compact && reasonFor(ch,r))?`<span class="reason">${reasonFor(ch,r)}</span>`:""}
    </span>
    <span class="cta">${ctaFor(ch,r,story,{small:true})}</span>
  </button>`;
}

/* ============ READER ============ */
let currentChapter = null;
VIEWS.read = function(){
  const found = byId(route.params.id);
  if(!found) return notFound("Chapter");
  const {ch, story, index} = found; currentChapter = found;
  setStoryAccent(story);
  const r = chapterResolved(ch);
  if (r.state === "preview") return readerPreview(ch, story, index, r);
  if (!isReadable(r)) return readerLocked(ch, story, index, r);
  if (ch.backend && !ch.content) {
    if (!ch.contentLoading) loadReaderChapterIntoFixture(ch.id).then(() => render());
    const message = ch.contentError || "Loading secure chapter text from Supabase...";
    return readerShell(`theme-${store.settings.readerTheme} preset-${store.settings.preset}`, `<div class="empty" style="padding-top:120px"><div class="em">${ch.contentError?I.alert:I.sync}</div><h3>${ch.contentError?"Chapter unavailable":"Opening secure chapter"}</h3><p>${esc(message)}</p>${ch.contentError?`<button class="btn story" data-lock="${ch.id}">${I.lockOpen}Check access</button>`:""}</div>`);
  }
  return readerFull(ch, story, index, r);
};
function readerShell(themeClass, inner, settings){
  const st = store.settings;
  const fs = (1.12*st.fontScale).toFixed(3)+"rem";
  return `<div class="reader ${themeClass}" id="reader" style="--fs:${fs};--lh:${st.lineHeight}">
    <div class="reader-progress"><i id="rprog" style="width:0%"></i></div>
    <header class="reader-top" id="rtop">
      <button class="rback" data-nav="/story/${currentChapter.story.slug}/chapters" aria-label="Back">${I.chevL}</button>
      <div class="ctx"><div class="s">${currentChapter.story.title} Â· Ch ${currentChapter.ch.n}</div><div class="c">${currentChapter.ch.title}</div></div>
      <button class="rset" data-sheet="settings" aria-label="Reader settings">${I.aa}</button>
    </header>
    <div class="reader-stage" id="rstage">${inner}</div>
    ${readerBar()}
  </div>`;
}
function readerBar(){
  const ch=currentChapter.ch; const id=ch.id;
  const bk = store.bookmarks.find(b=>b.chapterId===id);
  const cmt = commentCount(id);
  return `<div class="reader-bar" id="rbar">
    <button data-sheet="settings" aria-label="Settings">${I.aa}</button>
    <button data-act="reader-prev" aria-label="Previous">${I.chevL}</button>
    <button data-act="reader-next" aria-label="Next">${I.chevR}</button>
    <button data-act="reader-bookmark" class="${bk?'active':''}" aria-label="Bookmark">${bk?I.bookmarkFill:I.bookmark}</button>
    <button data-act="reader-comments" aria-label="Comments">${I.msg}${cmt?`<span class="mini">${cmt}</span>`:""}</button>
    <button data-sheet="context" aria-label="More">${I.list}</button>
  </div>`;
}
function renderBlocks(blocks, chId){
  return blocks.map((b,i)=>{
    if(b.t==="scene") return `<div class="scene">âœ¦ âœ¦ âœ¦</div>`;
    if(b.t==="img") return `<figure data-fig="${b.fig}" style="cursor:pointer">${D.FIG[b.fig]||""}<figcaption>${b.cap||""}</figcaption></figure>`;
    if(b.t==="p"){
      const pc = paraComments(chId,i);
      return `<p class="para" data-p="${i}">${b.v}<span class="pchip ${pc.length?'has':''}" data-para="${i}">${pc.length||'+'}</span></p>`;
    }
    return "";
  }).join("");
}
function readerFull(ch, story, index, r){
  const st=store.settings;
  const themeClass=`theme-${st.readerTheme} preset-${st.preset} ${st.showImages?'':'no-img'} ${st.showParaComments?'':'no-pchip'} ${st.focusMode?'focus':''}`;
  const blocks = ch.content || ch.preview || (ch.excerpt ? [{t:"p",v:ch.excerpt}] : [{t:"p",v:"The full text of this chapter will appear here once it is published."}]);
  const next = story.chapters[index+1];
  const nr = next?chapterResolved(next):null;
  return readerShell(themeClass, `
    <h1 class="ch-title">${ch.title}</h1>
    <div class="ch-by">${story.title} Â· Chapter ${ch.n} Â· ${ch.readTime} min Â· ${r.isEarly?'Early access until '+fmtDate(ch.publicDate):'Unlocked'}</div>
    ${ch.arc?`<div class="faint" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;margin-bottom:24px">${ch.arc}</div>`:""}
    <div class="prose" id="prose">${renderBlocks(blocks, ch.id)}</div>
    ${endOfChapter(ch, story, next, nr)}
    ${commentsBlock(ch.id)}
  `);
}
function readerPreview(ch, story, index, r){
  const st=store.settings;
  const themeClass=`theme-${st.readerTheme} preset-${st.preset}`;
  return readerShell(themeClass, `
    <div class="badge preview" style="margin-bottom:14px">${I.eye}Preview</div>
    <h1 class="ch-title">${ch.title}</h1>
    <div class="ch-by">${story.title} Â· Chapter ${ch.n} Â· preview Â· ${ch.tier||"Aether Member"} to unlock full chapter</div>
    <div class="prose" id="prose">${renderBlocks(ch.preview||[], ch.id)}</div>
    <div class="preview-wall" style="${storyAccentVars(story)}">
      <div class="top"></div>
      <div class="inner">
        <h3>You've reached the end of the preview</h3>
        <p>Unlock the full chapter â€” and ${countReadable()} others â€” to continue ${story.title}. The complete text loads only after access is verified; nothing is hidden behind a blur.</p>
        <div class="col-flex" style="gap:9px;max-width:340px;margin:0 auto">
          <button class="btn story block" data-lock="${ch.id}">${I.lockOpen}Unlock with ${ch.tier||"Aether Member"}</button>
          <button class="btn ghost block" data-sheet="redeem">${I.key}Redeem an access key</button>
          ${ch.publicDate?`<div class="faint" style="font-size:.76rem">Or wait for the public release on <b style="color:var(--text)">${fmtDate(ch.publicDate)}</b> (in ${daysUntil(ch.publicDate)} days).</div>`:""}
        </div>
      </div>
    </div>
  `);
}
function readerLocked(ch, story, index, r){
  return `<div class="locked-fallback" style="${storyAccentVars(story)}">
    <div class="emblem" style="width:84px;height:84px">${r.state==='expired'?I.lockOpen:r.state==='pending'?I.sync:r.state==='key'?I.key:I.lock}</div>
    <h1>${ch.title}</h1>
    <div class="sub">${story.title} Â· Chapter ${ch.n}</div>
    <div class="card" style="max-width:420px;margin:0 auto 18px;text-align:left">
      <div class="ax ${accessTag(r)[0]}" style="font-size:1rem;margin-bottom:8px"><span class="ic" style="width:20px;height:20px">${accessTag(r)[2]}</span>${accessTag(r)[1]}</div>
      <p class="muted" style="font-size:.86rem;margin:0 0 4px">${reasonFor(ch,r)}</p>
      <p class="faint" style="font-size:.76rem;margin:0">The full text for this chapter is never sent to your browser until access is verified server-side.</p>
    </div>
    <div class="col-flex" style="gap:9px;max-width:340px;margin:0 auto">
      ${ch.state==='preview'?`<button class="btn story block" data-preview="${ch.id}">${I.eye}Read the preview</button>`:""}
      <button class="btn ${ch.state==='preview'?'ghost':'story'} block" data-lock="${ch.id}">${I.lockOpen}${r.state==='expired'?'Renew access':'Unlock options'}</button>
      <button class="btn ghost block" data-act="expected-access">${I.help}Expected this to be unlocked?</button>
      <button class="btn ghost" data-nav="/story/${story.slug}/chapters">${I.list}Back to shelf</button>
    </div>
  </div>`;
}
function endOfChapter(ch, story, next, nr){
  const st=store.settings;
  const reac = REACTIONS; const mine = store.reactions[ch.id]?.picked;
  return `<div class="eoc">
    <div class="done"><div class="orn">âœ¦</div><p>Chapter complete</p></div>
    ${st.showReactions?`<div class="faint center" style="font-size:.74rem;margin-bottom:10px">How did this chapter land?</div>
    <div class="reactions">${reac.map(rk=>{const n=(REACTION_SEED[ch.id]?.[rk.k]||0)+(mine===rk.k?1:0);return `<button class="react ${mine===rk.k?'picked':''}" data-react="${rk.k}"><span class="e">${rk.e}</span><span class="n">${n}</span></button>`;}).join("")}</div>`:""}
    <div class="between" style="max-width:420px;margin:0 auto 18px">
      <button class="btn sm ghost" data-act="reader-bookmark">${I.bookmark}Bookmark</button>
      <button class="btn sm ghost" data-act="reader-savequote">${I.quote}Save quote</button>
      <button class="btn sm ghost" data-act="reader-markread">${store.readMarked[ch.id]?I.check:'âœ“'}Mark read</button>
    </div>
    <div class="card tinted" style="max-width:440px;margin:0 auto">
      ${next?`<div class="between"><div style="min-width:0"><div class="faint" style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em">Next chapter</div><div style="font-family:var(--serif);font-weight:600;margin-top:2px">${next.title}</div><div class="faint" style="font-size:.74rem;margin-top:2px">${axInline(nr)} Â· ${next.readTime} min</div></div>${isReadable(nr)?`<button class="btn sm story" data-read="${next.id}">${I.play}Read</button>`:`<button class="btn sm" data-lock="${next.id}">${accessTag(nr)[3]}</button>`}</div>`
      :`<div class="center"><div class="faint" style="font-size:.74rem">You've reached the latest chapter.</div><button class="btn sm" data-nav="/story/${story.slug}/chapters" style="margin-top:8px">${I.list}Back to shelf</button></div>`}
    </div>
  </div>`;
}
const REACTIONS=[{k:"heart",e:"â¤ï¸",l:"Love"},{k:"gasp",e:"ðŸ˜®",l:"Gasp"},{k:"theory",e:"ðŸ’¡",l:"Theory"},{k:"tear",e:"ðŸ˜¢",l:"Tears"},{k:"next",e:"ðŸ”¥",l:"Need next"}];
const REACTION_SEED={"go-1":{heart:42,gasp:18,theory:9,tear:6,next:23},"nc-1":{heart:31,gasp:7,theory:4,tear:12,next:5},"go-3":{heart:28,gasp:14,theory:11,tear:9,next:19},"as-1":{heart:19,gasp:6,theory:22,tear:3,next:8}};

function commentsBlock(chId){
  const list = (store.comments[chId]||[]).filter(c=>c.para===null||c.para===undefined);
  return `<div class="comments" id="cmtblock">
    <div class="section-head"><h2>Reader notes</h2><span class="faint" style="font-size:.74rem">${(store.comments[chId]||[]).length} total</span></div>
    <form class="cmt-form" data-cmt-form="${chId}"><input name="name" placeholder="Your name" style="max-width:130px"><input name="text" placeholder="Add a note about this chapterâ€¦" required><button class="btn sm story" type="submit">${I.msg}Post</button></form>
    <div>${list.slice().reverse().map(c=>commentHTML(c)).join("")||`<p class="faint" style="font-size:.82rem">Be the first to leave a note.</p>`}</div>
  </div>`;
}
function commentHTML(c){ return `<div class="cmt"><div class="ava" style="background:${c.color||'var(--accent)'}">${esc((c.name||"R").slice(0,1).toUpperCase())}</div><div class="body"><div class="who">${esc(c.name||"Reader")} <time>${esc(c.time||"just now")}</time></div><p>${esc(c.text)}</p></div></div>`; }

/* ============ RECAP ============ */
VIEWS.recap = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Story Recap</h1>
  <p class="page-sub">Spoiler-controlled. Choose how much you want remembered.</p>
  <div class="card tinted" style="margin:14px 0"><div class="eyebrow">Spoiler-free premise</div><p class="muted" style="font-family:var(--serif);font-size:1rem;line-height:1.7;margin:8px 0 0">${s.recapSafe}</p></div>
  <div class="section"><div class="section-head"><h2>Up to your last read chapter</h2></div><div class="card"><p class="muted" style="font-family:var(--serif);line-height:1.7">So far: ${s.premise} You've reached the point where ${s.chapters[2].title.toLowerCase()} â€” and the next beat turns on what the orchard has been keeping. (This recap is generated up to your current progress and avoids anything you haven't read.)</p></div></div>
  <div class="section"><div class="section-head"><h2>Full season recap <span class="badge" style="margin-left:6px">Spoilers</span></h2></div><div class="card"><p class="muted" style="font-family:var(--serif);line-height:1.7">${s.premise} In the full arc, the protagonist learns that ${s.cast[0].n.toLowerCase()}'s inheritance was no accident â€” and that the orchard has been waiting, patiently, for exactly this reader to arrive.</p></div></div>
  <button class="btn story block" data-read="${s.chapters[0].id}">${I.play}Start / continue reading</button>`;
};

/* ============ EXTRAS ============ */
VIEWS.extras = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  const extras=[
    {t:"Author's Note",d:"Vesper Maren on writing the orchard's first arc.",icon:"msg",state:"unlocked"},
    {t:"Deleted Scene: The Lawyer's Walk Home",d:"What the lawyer did after handing over the key.",icon:"book",state:"unlocked"},
    {t:"Alternate POV: The Bell-Ringer",d:"Chapter 2 from inside the bell tower.",icon:"eye",state:"member"},
    {t:"Lore Appendix: The Geography of Lychford",d:"Maps-lite, readable in the reader.",icon:"map",state:"member"},
    {t:"Art Drop: Cover Concepts",d:"Early cover sketches and palette tests.",icon:"spark",state:"archivist"},
    {t:"Early Draft: Chapter 1 (Beta)",d:"The first draft, before edits.",icon:"layers",state:"key"}
  ];
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Bonus Materials</h1>
  <p class="page-sub">Author notes, deleted scenes, lore, and art â€” member &amp; key-holder extras.</p>
  <div class="col-flex stagger">${extras.map(e=>{
    const r = e.state==="unlocked"?{state:"unlocked"}:e.state==="member"?{state:persona().level>=1?"unlocked":"locked"}:e.state==="archivist"?{state:persona().level>=2?"unlocked":"locked"}:{state:"key"};
    const readable = isReadable(r);
    return `<div class="card" style="display:flex;gap:13px;align-items:center"><span class="ax ${r.state}" style="font-size:1.3rem"><span class="ic" style="width:26px;height:26px">${I[e.icon]}</span></span><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-weight:600">${e.t}</div><div class="faint" style="font-size:.78rem">${e.d}</div></div>${readable?`<button class="btn sm story" data-act="extra-open">${I.play}Open</button>`:`<button class="btn sm" data-lock="${s.chapters.find(c=>c.state==='key')?.id||s.chapters[0].id}">${accessTag(r)[3]}</button>`}</div>`;
  }).join("")}</div>`;
};

/* ============ STORY UPDATES ============ */
VIEWS.storyUpdates = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  const items=D.UPDATES.filter(u=>u.story===s.id);
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Story Updates</h1>
  <p class="page-sub">Releases, notes &amp; schedule for this story.</p>
  <div class="timeline">${(items.length?items:D.UPDATES.slice(0,3)).map(u=>`<div class="tl-item"><div class="when">${u.when}</div><div class="what">${u.title}</div><div class="faint" style="font-size:.78rem">${u.note}</div></div>`).join("")}</div>`;
};

/* ============ UPDATES FEED ============ */
VIEWS.updates = function(){
  const groups={};
  D.UPDATES.forEach(u=>{ (groups[u.when]=groups[u.when]||[]).push(u); });
  return `<h1 class="page-title">Updates</h1><p class="page-sub">Everything new across the archive, access-aware.</p>
  <div class="chips scroll" style="margin:8px 0 18px"><a class="chip active">${I.feed}<span>All</span></a><a class="chip" data-nav="/calendar">${I.calendar}<span>Calendar</span></a></div>
  ${Object.entries(groups).map(([g,items])=>`<div class="section"><div class="section-head"><h2>${g}</h2></div><div class="col-flex">${items.map(updateRow).join("")}</div></div>`).join("")}`;
};

/* ============ CALENDAR ============ */
VIEWS.calendar = function(){
  return `<h1 class="page-title">Release Calendar</h1><p class="page-sub">This week in the archive â€” member drops &amp; public unlocks.</p>
  <div class="card tinted" style="margin-bottom:18px"><div class="between"><div><div class="eyebrow">Following</div><div style="font-family:var(--serif);margin-top:2px">${store.followed.length} stories</div></div><button class="btn sm" data-nav="/library">Manage</button></div></div>
  ${D.CALENDAR.map(day=>`<div class="section"><div class="section-head"><div><h2>${day.day}</h2><div class="faint" style="font-size:.74rem">${day.dow}</div></div></div><div class="col-flex">${day.items.map(it=>{const s=bySlug(it.s);const kColor={early:"early",public:"free",drop:"key",key:"key"}[it.k]||"";return `<div class="row" data-read="${s.chapters[0].id}"><span class="ic-col" style="color:var(--${kColor||'text-dim'})">${I[it.k==='early'?'hourglass':it.k==='public'?'sun':it.k==='drop'?'gift':'key']}</span><span class="body"><span class="t"><span class="tt">${it.c}</span>${badge(kColor,{early:"Early",public:"Public",drop:"Drop",key:"Key"}[it.k])}</span><span class="sub">${meta([`<i>${I.clock}</i>${it.t}`,s.title])}</span></span><span class="cta"><span class="faint">${I.chevR}</span></span></div>`;}).join("")}</div></div>`).join("")}`;
};

/* ============ COLLECTIONS ============ */
VIEWS.collections = function(){ return `<h1 class="page-title">Collections</h1><p class="page-sub">Editor-curated shelves to find your next read.</p><div class="grid-stories stagger" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${D.COLLECTIONS.map(c=>`<a class="card" data-nav="/collections/${c.slug}" style="text-align:left;display:flex;flex-direction:column;gap:9px;min-height:120px;justify-content:center"><span class="ax preview" style="font-size:1.5rem"><span class="ic" style="width:28px;height:28px">${I[c.icon]||I.book}</span></span><div><div style="font-family:var(--serif);font-weight:600">${c.name}</div><div class="faint" style="font-size:.76rem;margin-top:2px">${c.desc}</div></div></a>`).join("")}</div>`; };
VIEWS.collection = function(){
  const c=D.COLLECTIONS.find(x=>x.slug===route.params.slug); if(!c) return notFound("Collection");
  const q=c.query;
  const list=D.STORIES.filter(s=>{
    if(q.free) return s.chapters.some(ch=>ch.state==="free");
    if(q.state==="early") return s.chapters.some(ch=>ch.state==="early");
    if(q.state==="preview") return s.chapters.some(ch=>ch.state==="preview");
    if(q.status) return s.status===q.status;
    if(q.genre) return s.genre===q.genre;
    if(q.member) return s.chapters.some(ch=>ch.tier);
    return true;
  });
  return `<a class="section-link" data-nav="/collections" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Collections</a>
  <h1 class="page-title">${c.name}</h1><p class="page-sub">${c.desc}</p>
  <div class="grid-stories stagger" style="margin-top:14px">${list.map(storyCard).join("")}</div>`;
};

/* ============ VAULT ============ */
VIEWS.vault = function(){
  const P=persona();
  const readable=countReadable();
  const early=D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>c.state==="early").length,0);
  const locked=D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>!isReadable(chapterResolved(c))&&c.state!=="unavailable").length,0);
  const state = P.expired?"expired":P.pending?"pending":P.noTier?"none":P.level>0?"active":"none";
  const stateLabel={active:"Active",expired:"Expired",pending:"Syncing",none:"No access"}[state];
  const providerConnected = P.provider && !P.expired && !P.pending && !P.noTier;
  return `
  <h1 class="page-title">The Vault</h1>
  <p class="page-sub">One place for every kind of access. Patreon, keys, grants â€” all just â€œaccess.â€</p>
  <div class="card tinted" style="margin:14px 0;display:flex;gap:14px;align-items:center">
    <span class="ax ${state==='active'?'unlocked':state==='expired'?'expired':state==='pending'?'pending':'locked'}" style="font-size:1.6rem"><span class="ic" style="width:30px;height:30px">${state==='active'?I.checkCirc:state==='expired'?I.lock:state==='pending'?I.sync:I.lock}</span></span>
    <div style="flex:1"><div class="eyebrow">Current access</div><div style="font-family:var(--serif);font-size:1.3rem;font-weight:700">${stateLabel}</div><div class="faint" style="font-size:.8rem">${P.tier?("via "+P.provider+" Â· "+P.tier):P.signedIn?"Signed in, no active access":"Browsing as guest"}</div></div>
  </div>

  <div class="section"><div class="section-head"><h2>What your access unlocks</h2></div>
    <div class="stat-grid"><div class="stat"><div class="n">${readable}</div><div class="l">Readable chapters</div></div><div class="stat"><div class="n">${early}</div><div class="l">Early access</div></div><div class="stat"><div class="n">${D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>hasImages(c)).length,0)}</div><div class="l">Illustrated</div></div><div class="stat"><div class="n">${locked}</div><div class="l">Still locked</div></div></div>
  </div>

  <div class="section"><div class="section-head"><h2>Providers</h2></div>
    <div class="col-flex">
      ${providerCard("Patreon","patreon",providerConnected,P.tier||null,P.since)}
      ${providerCard("Ko-fi","kofi",false,null,null,"Coming soon")}
      ${providerCard("Discord","discord",false,null,null,"Coming soon")}
      ${providerCard("PayPal","paypal",false,null,null,"Coming soon")}
    </div>
  </div>

  <div class="section"><div class="section-head"><h2>Redeem an access key</h2></div>
    <div class="card">
      <p class="muted" style="font-size:.84rem;margin:0 0 12px">Beta readers, reviewers, gifts &amp; campaigns use keys. Enter one to attach access to your account.</p>
      <div style="display:flex;gap:9px"><input id="key-input" class="pill-input" style="text-align:left;flex:1" placeholder="XXXX-XXXX-XXXX-XXXX"><button class="btn story" data-sheet="redeem">${I.key}Redeem</button></div>
      <p class="faint" style="font-size:.72rem;margin-top:8px">Try the demo key <span class="kbd">AETHER-ARC2-2026</span></p>
    </div>
    ${store.redeemedKeys.length?`<div class="card" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:8px">Redeemed keys</div>${store.redeemedKeys.map(k=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.86rem;font-weight:600">${k.label}</div><div class="faint" style="font-size:.72rem;font-family:var(--ui);letter-spacing:.08em">${maskKey(k.code)}</div></div><span class="badge key">${I.key}Active</span></div>`).join("")}</div>`:""}
  </div>

  <div class="section"><div class="section-head"><h2>Access timeline</h2></div>
    <div class="card"><div class="timeline">
      <div class="tl-item"><div class="when">Just now</div><div class="what">3 chapters unlocked after Patreon sync</div></div>
      <div class="tl-item"><div class="when">2 days ago</div><div class="what">Patreon connection verified</div></div>
      <div class="tl-item warn"><div class="when">3 days ago</div><div class="what">Access renewed for the month</div></div>
      ${store.redeemedKeys.length?`<div class="tl-item"><div class="when">Last week</div><div class="what">Access key redeemed</div></div>`:""}
      <div class="tl-item"><div class="when">2025-03-12</div><div class="what">Patreon first connected</div></div>
    </div></div>
  </div>

  <div class="section"><div class="section-head"><h2>Troubleshoot &amp; verify</h2></div>
    <div class="quicklinks">
      <a data-nav="/support/check-access">${I.shield}<span>Health Check</span><small>Verify your access</small></a>
      <a data-nav="/support/wrong-account">${I.user}<span>Wrong account?</span><small>Recovery assistant</small></a>
      <a data-nav="/benefits">${I.spark}<span>Benefits</span><small>What's included</small></a>
      <a data-nav="/help">${I.info}<span>Help Center</span><small>Access glossary</small></a>
    </div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center;margin-top:8px"><span class="faint">${I.cog}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Account access</div><div class="faint" style="font-size:.74rem">Supabase auth and Patreon sync will replace the temporary local access model in the backend integration phase.</div></div><button class="btn sm" data-nav="/vault">Access hub</button></div>
  `;
};
function providerCard(name, key, connected, tier, since, note){
  return `<div class="card" style="display:flex;gap:13px;align-items:center">
    <span style="width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:var(--surface-2);font-weight:700;font-size:.7rem;letter-spacing:.04em">${name.slice(0,2)}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:600">${name}</div><div class="faint" style="font-size:.76rem">${connected?(tier||"Connected")+(since?" Â· since "+fmtDate(since):""):(note||"Not connected")}</div></div>
    ${connected?`<span class="badge free">${I.check}Connected</span>`:`<button class="btn sm ${key==='patreon'?'story':''}" ${key==='patreon'?'data-sheet="connect-patreon"':'disabled'}>${note?'Soon':'Connect'}</button>`}
  </div>`;
}
function maskKey(c){ if(c.length<=4) return c; return "â€¢â€¢â€¢â€¢-â€¢â€¢â€¢â€¢-â€¢â€¢â€¢â€¢-"+c.slice(-4); }

/* ============ MY SHELF ============ */
VIEWS.shelf = function(){
  const reads=activeReads();
  return `<h1 class="page-title">My Shelf</h1><p class="page-sub">Your threads, saved things, and reader preferences.</p>
  <div class="section"><div class="section-head"><h2>Continue your threads</h2></div><div class="lane">${reads.map(({ch,story,prog})=>`<button class="card" style="width:210px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}"><div class="faint" style="font-size:.68rem;text-transform:uppercase">${story.title}</div><div style="font-family:var(--serif);font-weight:600;margin:2px 0 8px">${ch.title}</div>${progressBar(prog.pct)}<div class="faint" style="font-size:.7rem;margin-top:6px">Resume at: ${prog.scene}</div></button>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Followed</h2></div><div class="lane">${store.followed.map(id=>{const s=bySlug(id);return s?storyCard(s):"";}).join("")}</div></div>
  <div class="quicklinks" style="margin:14px 0">
    <a data-nav="/bookmarks">${I.bookmark}<span>Bookmarks</span><small>${store.bookmarks.length} saved</small></a>
    <a data-nav="/quotes">${I.quote}<span>Saved quotes</span><small>${store.quotes.length} lines</small></a>
    <a data-nav="/history">${I.clock}<span>History</span><small>Recently read</small></a>
    <a data-sheet="settings">${I.aa}<span>Preferences</span><small>Reader settings</small></a>
  </div>
  <div class="section"><div class="section-head"><h2>Preview trail</h2></div>
    <div class="card"><p class="muted" style="font-size:.84rem;margin:0 0 10px">Chapters you've previewed but not yet unlocked.</p>${store.history.filter(h=>h.kind==="preview").map(h=>{const f=byId(h.chapterId);return f?`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.86rem;font-weight:600">${h.title}</div><div class="faint" style="font-size:.72rem">${f.story.title}</div></div><button class="btn sm" data-lock="${h.chapterId}">${I.lockOpen}Unlock</button></div>`:"";}).join("")||`<p class="faint" style="font-size:.8rem">No active previews.</p>`}</div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center"><span class="faint">${I.download}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Offline queue</div><div class="faint" style="font-size:.74rem">Save chapters for transit reading while your access is active. Expires with access.</div></div><button class="btn sm ghost" data-act="offline-queue">Manage</button></div>
  `;
};
VIEWS.bookmarks = function(){ return `<h1 class="page-title">Bookmarks</h1><p class="page-sub">${store.bookmarks.length} saved places across your reading.</p><div class="col-flex stagger">${store.bookmarks.map(b=>{const f=byId(b.chapterId);return `<div class="card" style="display:flex;gap:13px;align-items:center;${f?storyAccentVars(f.story):''}"><span class="ax unlocked" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${I.bookmarkFill}</span></span><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-style:italic">"${b.label}"</div><div class="faint" style="font-size:.74rem">${f?f.story.title+" Â· "+f.ch.title:""} Â· ${b.when}</div></div>${f?`<button class="btn sm story" data-read="${b.chapterId}">${I.play}Open</button>`:""}</div>`;}).join("")||emptyState("bookmark","No bookmarks yet","Save a place while reading with the bookmark button.")}</div>`; };
VIEWS.quotes = function(){ return `<h1 class="page-title">Saved Quotes</h1><p class="page-sub">${store.quotes.length} lines worth keeping.</p><div class="col-flex stagger">${store.quotes.map(q=>{const f=byId(q.chapterId);return `<div class="card tinted" style="${f?storyAccentVars(f.story):''}"><div style="display:flex;gap:10px"><span style="font-size:1.6rem;color:var(--s);line-height:.8">${I.quote}</span><div><p style="font-family:var(--serif);font-size:1rem;line-height:1.6;margin:0">${q.text}</p><div class="faint" style="font-size:.74rem;margin-top:8px">${f?f.story.title:""} Â· saved ${q.when}</div></div></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm ghost" data-copy="${esc(q.text)}">${I.copy}Copy</button><button class="btn sm ghost" data-quote-card="${q.id}">${I.spark}Share card</button></div></div>`;}).join("")||emptyState("quote","No quotes saved","Highlight text while reading to save a line.")}</div>`; };
VIEWS.history = function(){ return `<h1 class="page-title">Reading History</h1><p class="page-sub">Your private chronicle.</p><div class="timeline">${[...store.history].map(h=>{const f=byId(h.chapterId);return `<div class="tl-item"><div class="when">${h.when}</div><div class="what">${h.kind==='preview'?'Previewed':h.kind==='completed'?'Completed':'Read'}: ${h.title}</div><div class="faint" style="font-size:.78rem">${f?f.story.title:""}</div></div>`;}).join("")}</div>`; };

/* ============ NOTIFICATIONS ============ */
VIEWS.notifications = function(){
  const items=store.notifs;
  const kIcon={access:I.vault,chapter:I.bell};
  return `<div class="between"><div><h1 class="page-title">Notifications</h1><p class="page-sub">${items.filter(n=>!n.read).length} unread</p></div><button class="btn sm ghost" data-act="notif-prefs">${I.cog}Preferences</button></div>
  <div class="chips scroll" style="margin:8px 0 16px"><button class="chip active" data-act="simulate-notif">${I.plus}<span>Simulate new notice</span></button><button class="btn sm ghost" data-act="mark-all-read">Mark all read</button></div>
  <div class="col-flex stagger">${items.map(n=>`<div class="card" style="display:flex;gap:12px;align-items:flex-start;${n.read?'opacity:.65':''}"><span style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--surface-2);color:var(--accent)">${kIcon[n.k]||I.bell}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:.9rem">${n.t}</div><div class="faint" style="font-size:.8rem;margin-top:1px">${n.d}</div><div class="faint" style="font-size:.7rem;margin-top:4px">${n.time}</div></div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${n.chapter?`<button class="btn sm" data-read="${n.chapter}">Open</button>`:""}<button class="tb-btn" style="width:30px;height:30px" data-dismiss="${n.id}" aria-label="Dismiss">${I.x}</button></div></div>`).join("")}</div>`;
};

/* ============ BENEFITS ============ */
VIEWS.benefits = function(){
  const b=[{i:"hourglass",t:"Early access",d:"Read new chapters before public release."},{i:"book",t:"Member chapters",d:"Exclusive chapters not available on the public archive."},{i:"spark",t:"Bonus materials",d:"Author notes, deleted scenes, lore & art drops."},{i:"layers",t:"Complete seasons",d:"Binge finished stories start to end."},{i:"eye",t:"Previews",d:"Sample locked chapters before deciding."},{i:"msg",t:"Supporter notes",d:"Author notes attached to releases."}];
  return `<h1 class="page-title">Membership Benefits</h1><p class="page-sub">What Aether Member access unlocks â€” clearly.</p>
  <div class="grid-stories" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:14px">${b.map(x=>`<div class="benefit-card"><span class="ic">${I[x.i]}</span><div><h4>${x.t}</h4><p>${x.d}</p></div></div>`).join("")}</div>
  <div class="section"><div class="section-head"><h2>Your milestones</h2></div><div class="col-flex">${D.MILESTONES.map(m=>`<div class="card" style="display:flex;gap:12px;align-items:center;${m.held?'':'opacity:.5'}"><span class="ax ${m.held?'unlocked':'locked'}" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${m.held?I.checkCirc:I.lock}</span></span><div style="flex:1"><div style="font-family:var(--serif);font-weight:600">${m.t}</div><div class="faint" style="font-size:.76rem">${m.d}</div></div>${m.held?badge("gold","Earned"):badge("","Locked")}</div>`).join("")}</div></div>
  <div class="card tinted" style="text-align:center"><div style="font-family:var(--serif);font-size:1.05rem;margin-bottom:8px">Want to unlock the archive?</div><button class="btn primary" data-sheet="connect-patreon">${I.vault}Connect Patreon</button></div>`;
};

/* ============ ONBOARDING ============ */
VIEWS.onboarding = function(){
  return `<h1 class="page-title">Welcome to Aether Pages</h1><p class="page-sub">A quiet reading lounge for members of the archive.</p>
  <div class="section"><div class="section-head"><h2>Choose your first door</h2></div>
    <div class="quicklinks">
      <a data-nav="/collections/dark-fantasy">${I.moon}<span>Gothic fantasy</span><small>Atmospheric &amp; slow-burn</small></a>
      <a data-nav="/collections/scifi">${I.orbit}<span>Sci-fi mystery</span><small>Colonies &amp; orbitals</small></a>
      <a data-nav="/collections/complete-seasons">${I.check}<span>A complete story</span><small>Finish in one sitting</small></a>
      <a data-nav="/collections/short-reads">${I.clock}<span>Only 10 minutes</span><small>Quick reads</small></a>
    </div>
  </div>
  <div class="section"><div class="section-head"><h2>How it works</h2></div>
    <div class="col-flex">
      ${[[I.library,"Browse the Library","Free chapters and previews, no account needed."],[I.book,"Read comfortably","Adjust type, theme & layout to your taste."],[I.vault,"Activate access","Connect Patreon or redeem a key to unlock more."],[I.shelf,"Continue anywhere","Your place, bookmarks & quotes follow you."]].map(([ic,t,d])=>`<div class="card" style="display:flex;gap:13px;align-items:center"><span class="ax unlocked" style="font-size:1.3rem"><span class="ic" style="width:24px;height:24px">${ic}</span></span><div><div style="font-weight:600">${t}</div><div class="faint" style="font-size:.78rem">${d}</div></div></div>`).join("")}
    </div>
  </div>
  <button class="btn primary block" data-nav="/">Enter the archive</button>`;
};

/* ============ HELP ============ */
VIEWS.help = function(){
  const q=[["Why are chapters locked?","Some chapters are member-only, early-access, or key-locked. Free chapters are always open."],["How does Patreon sync work?","When you connect Patreon, we verify your membership. This usually takes a moment; the app checks automatically."],["Why might a key fail?","Keys can be expired, already redeemed, at max use, or mistyped. Each has a clear message."],["What does expired access mean?","Your membership or key is no longer active. Renew to restore the chapters it unlocked."],["Wrong account?","If you signed in differently before, access may be on another account. Use the Wrong Account assistant."]];
  return `<h1 class="page-title">Help Center</h1><p class="page-sub">Self-service recovery & explanations.</p>
  <div class="quicklinks" style="margin:14px 0">
    <a data-nav="/support/check-access">${I.shield}<span>Access Check</span><small>Diagnose now</small></a>
    <a data-nav="/support/wrong-account">${I.user}<span>Wrong account?</span><small>Recovery flow</small></a>
    <a data-nav="/support/contact">${I.mail}<span>Contact support</span><small>With context packet</small></a>
  </div>
  <div class="section"><div class="section-head"><h2>Access-state glossary</h2></div><div class="col-flex">${D.GLOSSARY_STATES.map(g=>`<div class="card" style="display:flex;gap:12px;align-items:center"><span class="ax ${g.color==='good'?'free':g.color}" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${I[g.icon]}</span></span><div style="flex:1"><div style="font-weight:600;font-size:.9rem">${g.label}</div><div class="faint" style="font-size:.78rem">${g.d}</div></div></div>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Common questions</h2></div><div class="col-flex">${q.map(([t,a])=>`<details class="card" style="padding:0"><summary style="padding:14px 16px;cursor:pointer;font-weight:600;font-size:.9rem;list-style:none;display:flex;justify-content:space-between;align-items:center">${t}${I.chevR}</summary><div style="padding:0 16px 14px" class="muted" >${a}</div></details>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Features explained</h2></div><div class="col-flex">
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.eye} Previews</div><p class="muted" style="font-size:.82rem;margin:0">Previews show real opening text. The rest of the chapter is never sent to your browser until access is verified â€” no fake blur.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.msg} Paragraph &amp; chapter comments</div><p class="muted" style="font-size:.82rem;margin:0">Tap a paragraph chip to note a specific line, or leave a chapter note at the end. Toggle chips in reader settings.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.spark} Illustrated chapters</div><p class="muted" style="font-size:.82rem;margin:0">Some chapters include inline figures. Hide them in reader settings if you prefer pure text.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.alert} Unavailable chapters</div><p class="muted" style="font-size:.82rem;margin:0">Occasionally a chapter is being revised. It returns â€” try again later, or contact support.</p></div>
  </div></div>`;
};

/* ============ SUPPORT ============ */
VIEWS.checkAccess = function(){
  const P=persona();
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Access Health Check</h1><p class="page-sub">A guided check of your access â€” no jargon.</p>
  <div class="card tinted" style="margin:14px 0"><div class="between"><div><div class="eyebrow">Signed-in account</div><div style="font-family:var(--serif);font-weight:600">${P.signedIn?store.email:"Not signed in"}</div></div>${P.signedIn?badge("free",I.check+"Verified"):badge("","Guest")}</div></div>
  <div class="timeline">
    <div class="tl-item"><div class="when">Step 1</div><div class="what">Account verified</div><div class="faint" style="font-size:.78rem">${P.signedIn?"You're signed in.":"Sign in to continue."}</div></div>
    <div class="tl-item ${P.provider?'':'warn'}"><div class="when">Step 2</div><div class="what">Provider: ${P.provider||"none connected"}</div><div class="faint" style="font-size:.78rem">${P.provider?"Connected.":"Connect Patreon or redeem a key."}</div></div>
    <div class="tl-item ${P.pending?'warn':''}"><div class="when">Step 3</div><div class="what">${P.pending?"Sync in progress":"Last sync: just now"}</div><div class="faint" style="font-size:.78rem">${P.pending?"Verifying your tier â€” automatic.":"Access is up to date."}</div></div>
    <div class="tl-item ${P.level>0||store.grantedKey?'':'bad'}"><div class="when">Step 4</div><div class="what">${P.tier||"Tier"} ${P.noTier?"(not qualifying)":""}</div><div class="faint" style="font-size:.78rem">${P.level>0?"Qualifies for Aether Pages.":P.noTier?"This tier doesn't include access.":"No active tier."}</div></div>
  </div>
  <div class="col-flex" style="margin-top:14px">
    ${P.provider?`<button class="btn ghost" data-act="resync">${I.sync}Re-run sync</button>`:`<button class="btn story" data-sheet="connect-patreon">${I.vault}Connect Patreon</button>`}
    <button class="btn ghost" data-sheet="redeem">${I.key}Try a key instead</button>
    <button class="btn ghost" data-nav="/support/wrong-account">${I.user}Not seeing your access?</button>
  </div>`;
};
VIEWS.wrongAccount = function(){
  const steps=["Are you signed into the same Aether Pages account you used before? Check your email in the Vault.","Is your connected Patreon the right one? Patreon links via the Patreon API, not by matching emails.","Try reconnecting Patreon from the Vault.","Or redeem your access key again â€” it binds to this account.","Still stuck? Send a support packet with one tap."];
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Wrong Account Assistant</h1><p class="page-sub">Access on a different account? Let's recover it.</p>
  <div class="timeline">${steps.map((s,i)=>`<div class="tl-item"><div class="when">Step ${i+1}</div><div class="what">${s}</div></div>`).join("")}</div>
  <div class="col-flex" style="margin-top:14px"><button class="btn story" data-sheet="connect-patreon">${I.vault}Reconnect Patreon</button><button class="btn ghost" data-sheet="redeem">${I.key}Redeem key</button><button class="btn ghost" data-nav="/support/contact">${I.mail}Send support packet</button></div>`;
};
VIEWS.contact = function(){
  const P=persona();
  const pkt=["Account: "+(P.signedIn?store.email:"(not signed in)"),"Access: "+(P.tier||P.expired?"expired":P.pending?"sync pending":P.noTier?"no qualifying tier":"none"),"Provider: "+(P.provider||"none"),"Last sync: just now","Masked key suffix: "+(store.redeemedKeys[0]?"â€¦"+store.redeemedKeys[0].code.slice(-4):"none")];
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Contact Support</h1><p class="page-sub">We'll attach a context packet so you don't have to explain everything.</p>
  <div class="card" style="margin:14px 0"><div class="eyebrow" style="margin-bottom:8px">Auto-attached packet (no secrets)</div><div style="font-family:var(--ui);font-size:.78rem;line-height:1.8">${pkt.map(p=>`<div>${esc(p)}</div>`).join("")}</div></div>
  <form data-contact-form><div class="col-flex"><input class="pill-input" style="text-align:left" name="subject" placeholder="Subject"><textarea name="msg" rows="4" style="background:var(--surface);border:1px solid var(--border-2);border-radius:var(--radius-sm);padding:13px;font-size:.9rem" placeholder="What's going on?"></textarea><button class="btn story" type="submit">${I.mail}Send to support</button></div></form>
  <div class="card" style="margin-top:14px;display:flex;gap:11px;align-items:center"><span class="faint">${I.msg}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Prefer real-time?</div><div class="faint" style="font-size:.74rem">The archive Discord has a #aether-pages-help channel.</div></div><button class="btn sm ghost" data-act="external-discord">${I.external}</button></div>`;
};

function notFound(what){ return `<div class="empty" style="padding-top:80px"><div class="em">ðŸ•Šï¸</div><h3>${what} not found</h3><p>This may have moved or been archived.</p><button class="btn" data-nav="/">Back home</button></div>`; }
function emptyState(ic,title,sub){ return `<div class="empty"><div class="em">${ {bookmark:"ðŸ”–",quote:"â"}[ic]||"ðŸ“­" }</div><h3>${title}</h3><p>${sub}</p></div>`; }

/* ============ SHEETS (builders) ============ */
function sheetSettings(){
  const st=store.settings;
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Settings</h2><p class="sheet-sub">Theme &amp; reading comfort. Saved to this device.</p>
  <div class="set-group"><label>Site theme</label>${themeSwatches()}</div>
  <div class="set-group"><label>Reader lighting</label><div class="seg">${["aether","twilight","parchment"].map(t=>`<button class="${st.readerTheme===t?'active':''}" data-set-theme="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}</div></div>
  <div class="set-group"><label>Reading preset</label><div class="seg">${[["none","Default"],["focus","Focus"],["bedtime","Bedtime"],["dyslexia","Dyslexia"],["compact","Compact"]].map(([k,l])=>`<button class="${st.preset===k?'active':''}" data-set-preset="${k}">${l}</button>`).join("")}</div></div>
  <div class="set-group"><label>Font size <span class="faint" style="float:right">${Math.round(st.fontScale*100)}%</span></label><input type="range" class="range" min="0.8" max="1.4" step="0.05" value="${st.fontScale}" data-set-range="fontScale"></div>
  <div class="set-group"><label>Line height <span class="faint" style="float:right">${st.lineHeight.toFixed(2)}</span></label><input type="range" class="range" min="1.5" max="2.1" step="0.02" value="${st.lineHeight}" data-set-range="lineHeight"></div>
  <div class="set-group"><label>Comfort</label>
    ${toggleRow("showImages","Reader images","Inline figures in chapters",st.showImages)}
    ${toggleRow("showParaComments","Paragraph comments","Show comment chips on paragraphs",st.showParaComments)}
    ${toggleRow("showProgress","Progress bar","Show reading progress",st.showProgress)}
    ${toggleRow("showReactions","Chapter reactions","Show reaction buttons at chapter end",st.showReactions)}
    ${toggleRow("spoilerSafe","Spoiler safety","Hide titles/descriptions of unread chapters",st.spoilerSafe)}
    ${toggleRow("focusMode","Focus mode","Hide UI until you tap the page",st.focusMode)}
  </div>`;
}
function toggleRow(key,title,sub,on){ return `<div class="toggle-row"><div class="lbl">${title}<small>${sub}</small></div><button class="switch ${on?'on':''}" data-toggle="${key}" aria-label="${title}"></button></div>`; }

function sheetPersona(){
  const P=persona();
  const active = activeEntitlements();
  const signedIn = !!authState.user;
  const status = signedIn ? (active.length ? `${active.length} active entitlement${active.length===1?"":"s"}` : "Signed in, no active member entitlement") : "Guest reader";
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Account</h2>
  <div class="card tinted" style="margin-bottom:14px;display:flex;gap:12px;align-items:center"><span style="width:42px;height:42px;border-radius:50%;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent)">${I.user}</span><div style="flex:1;min-width:0"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis">${esc(accountLabel())}</div><div class="faint" style="font-size:.76rem">${esc(P.tier || status)}</div></div>${signedIn?`<button class="btn sm ghost" data-act="reader-signout">Sign out</button>`:""}</div>
  <div class="quicklinks" style="margin-bottom:16px"><a data-nav="/vault">${I.vault}<span>Vault</span><small>Manage access</small></a><a data-nav="/my-shelf">${I.shelf}<span>My Shelf</span><small>Your library</small></a><a data-sheet="settings">${I.aa}<span>Preferences</span><small>Reader</small></a>${isAdmin()?`<a href="admin.html"><span>${I.shield}</span><span>Admin CMS</span><small>Production controls</small></a><a data-nav="/studio/access">${I.overview}<span>Studio Access</span><small>Preview console</small></a>`:""}</div>
  ${signedIn?`<div class="card" style="margin-bottom:14px"><div class="eyebrow" style="margin-bottom:7px">Entitlements</div>${active.length?active.map(e=>`<div class="between" style="gap:10px;padding:6px 0"><span style="font-weight:600;font-size:.86rem">${esc(e.tier_name || e.name || e.tier || "Reader access")}</span><span class="badge free">active</span></div>`).join(""):`<p class="faint" style="font-size:.8rem;margin:0">No active entitlement returned yet. Connect Patreon or redeem an access key.</p>`}</div>`:`<div class="card" style="margin-bottom:14px"><div class="eyebrow" style="margin-bottom:8px">Continue</div><div class="col-flex"><button class="btn story block" type="button" data-act="google-signin">${I.external}Continue with Google</button><div class="faint" style="font-size:.74rem;text-align:center">or use email</div><form data-auth-form="signin"><div class="col-flex"><input class="pill-input" name="email" type="email" autocomplete="email" placeholder="reader@example.com" style="text-align:left"><input class="pill-input" name="password" type="password" autocomplete="current-password" placeholder="Password" style="text-align:left"><div class="faint" data-auth-status style="font-size:.76rem;min-height:1em"></div><button class="btn ghost block" type="submit">${I.user}Sign in with email</button><button class="btn ghost block" type="button" data-act="show-signup">Create email account</button></div></form></div></div>`}
  <div class="card" style="margin-top:8px"><div style="font-weight:600;font-size:.86rem">Backend bridge status</div><div class="faint" style="font-size:.74rem;margin-top:4px">Supabase auth, catalog RPCs, chapter RPCs, and entitlement checks are active. Use admin.html for real tier/key/grant management.</div></div>`;
}
function sheetSignup(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Save your library</h2><p class="sheet-sub">Use Google for the fastest setup, or create an email login for key redemption, Patreon linking, and future cross-device shelf sync.</p>
  <div class="card" style="margin-bottom:12px"><button class="btn story block" type="button" data-act="google-signin">${I.external}Continue with Google</button></div>
  <form data-auth-form="signup" class="card"><div class="col-flex"><input class="pill-input" name="email" type="email" autocomplete="email" placeholder="reader@example.com" style="text-align:left"><input class="pill-input" name="password" type="password" autocomplete="new-password" placeholder="Password" style="text-align:left"><div class="faint" data-auth-status style="font-size:.76rem;min-height:1em"></div><button class="btn ghost block" type="submit">${I.user}Create email login</button><button class="btn ghost block" type="button" data-sheet="persona">Back to sign in</button></div></form>`;
}
function sheetLock(chId){
  const f=byId(chId); if(!f) return "<p>Not found.</p>"; const {ch,story}=f; const r=chapterResolved(ch);
  return `<span class="close-x" data-act="close-sheet">${I.x}</span>
  <div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><span class="ax ${accessTag(r)[0]}" style="font-size:1.5rem"><span class="ic" style="width:28px;height:28px">${accessTag(r)[2]}</span></span><div><h2>${ch.title}</h2><div class="sheet-sub" style="margin:0">${story.title} Â· Chapter ${ch.n}</div></div></div>
  <div class="card" style="margin-bottom:14px"><p class="muted" style="font-size:.86rem;margin:0">${reasonFor(ch,r)}</p></div>
  <div class="col-flex" style="gap:9px">
    ${ch.state==='preview'?`<button class="btn story block" data-preview="${ch.id}" data-act="close-sheet">${I.eye}Read the preview</button>`:""}
    ${r.state==='expired'?`<button class="btn story block" data-sheet="connect-patreon">${I.sync}Renew via Patreon</button>`:`<button class="btn ${ch.state==='preview'?'ghost':'story'} block" data-sheet="connect-patreon">${I.vault}Connect Patreon</button>`}
    <button class="btn ghost block" data-sheet="redeem">${I.key}Redeem an access key</button>
    <a class="btn ghost block" data-nav="/benefits">${I.spark}See what access unlocks</a>
    <a class="btn ghost block" data-nav="/support/check-access">${I.shield}Why is this locked?</a>
  </div>`;
}
function sheetRedeem(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Redeem an access key</h2><p class="sheet-sub">Keys unlock beta, reviewer, gift &amp; campaign content. Access binds to your account.</p>
  <form data-redeem-form><div class="col-flex"><input id="key-input-sheet" class="pill-input" name="key" style="text-align:left;letter-spacing:.1em" placeholder="XXXX-XXXX-XXXX-XXXX" autocomplete="off"><div id="key-error" class="faint" style="font-size:.76rem;min-height:1em"></div><button class="btn story block" type="submit">${I.key}Redeem key</button></div></form>
  <div class="card" style="margin-top:14px"><div class="eyebrow" style="margin-bottom:6px">Temporary local test keys</div><div class="faint" style="font-size:.76rem;line-height:1.7"><div><span class="kbd">AETHER-ARC2-2026</span> â€” Arc II preview</div><div><span class="kbd">REVIEWER-2026</span> â€” reviewer liturgy</div><div><span class="kbd">WRONG-KEY-9999</span> â€” see an error</div></div></div>`;
}
function sheetConnectPatreon(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Activate with Patreon</h2><p class="sheet-sub">Patreon proves membership; your Aether login saves the library, keys, progress, and provider links.</p>
  <div class="card" style="margin-bottom:14px"><div class="between"><div><div style="font-weight:600">One smooth flow</div><div class="faint" style="font-size:.78rem">${authState.user?"We will send you to Patreon, then sync your tier back here.":"Continue with Google first, then we will automatically send you to Patreon to activate access."}</div></div>${I.vault}</div></div>
  <div class="col-flex" style="gap:9px">${authState.user?`<button class="btn story block" data-act="connect-patreon-go">${I.vault}Continue with Patreon</button>`:`<button class="btn story block" data-act="google-then-patreon">${I.external}Continue with Google, then Patreon</button><button class="btn ghost block" data-sheet="persona">${I.user}Use email instead</button>`}<button class="btn ghost block" data-sheet="redeem">${I.key}I have a key instead</button><a class="btn ghost block" data-nav="/support/wrong-account">${I.user}Wrong account?</a></div>
  <p class="faint" style="font-size:.72rem;margin-top:12px">Under the hood, Supabase remains the account that owns progress and entitlements; Patreon is linked as the payment/access provider.</p>`;
}
function sheetContext(){
  const f=currentChapter; if(!f) return "<p>Open a chapter first.</p>"; const {ch,story,index}=f;
  const prog=store.progress[ch.id];
  const next=story.chapters[index+1]; const nr=next?chapterResolved(next):null;
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>${ch.title}</h2><div class="sheet-sub">${story.title} Â· Chapter ${ch.n} Â· ${ch.arc||""}</div>
  <div class="card" style="margin-bottom:12px">${prog?`<div class="between"><span class="faint" style="font-size:.78rem">Progress</span><span style="font-size:.8rem;font-weight:600">${prog.pct}%</span></div>${progressBar(prog.pct)}`:`<p class="faint" style="font-size:.8rem;margin:0">Not started. Est. ${ch.readTime} min read.</p>`}</div>
  <div class="col-flex" style="gap:8px">
    <button class="btn ghost block" data-act="reader-bookmark">${I.bookmark}${store.bookmarks.find(b=>b.chapterId===ch.id)?'Remove bookmark':'Bookmark chapter'}</button>
    <button class="btn ghost block" data-act="reader-savequote">${I.quote}Save a quote</button>
    <button class="btn ghost block" data-act="reader-markread">${store.readMarked[ch.id]?I.check+'Marked read':'Mark as read'}</button>
    <button class="btn ghost block" data-act="offline-queue">${I.download}Save for offline</button>
    <a class="btn ghost block" data-nav="/story/${story.slug}/recap">${I.list}Read recap</a>
    <a class="btn ghost block" data-nav="/story/${story.slug}/extras">${I.spark}Bonus materials</a>
    ${next?`<div class="card" style="margin-top:4px"><div class="between"><div><div class="faint" style="font-size:.7rem;text-transform:uppercase">Next</div><div style="font-family:var(--serif);font-weight:600">${next.title}</div><div class="faint" style="font-size:.74rem">${axInline(nr)}</div></div>${isReadable(nr)?`<button class="btn sm story" data-read="${next.id}">${I.play}Go</button>`:`<button class="btn sm" data-lock="${next.id}">${accessTag(nr)[3]}</button>`}</div></div>`:""}
  </div>`;
}
function sheetParaComments(chId, p){
  const list=paraComments(chId,p);
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Paragraph note</h2><div class="sheet-sub">${list.length} note${list.length===1?'':'s'} on this paragraph</div>
  <div style="margin-bottom:14px">${list.map(commentHTML).join("")||`<p class="faint" style="font-size:.82rem">No notes yet.</p>`}</div>
  <form data-para-form="${chId}" data-para-index="${p}"><div class="col-flex"><input name="name" placeholder="Your name" style="max-width:140px"><input name="text" placeholder="Add a note on this paragraphâ€¦" required><button class="btn sm story" type="submit">${I.msg}Post</button></div></form>`;
}
function sheetImage(fig, cap){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><div style="border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)">${D.FIG[fig]||""}</div><p class="muted center" style="font-size:.82rem;margin-top:10px;font-style:italic">${cap||""}</p>`;
}

/* ============ ACTIONS ============ */
function toggleFollow(id){ const i=store.followed.indexOf(id); if(i>=0) store.followed.splice(i,1); else store.followed.push(id); saveStore(); toast(store.followed.includes(id)?"Following":"Unfollowed", null, {icon: store.followed.includes(id)?'checkCirc':'bell'}); render(); }
function setReaction(chId,k){ const cur=store.reactions[chId]?.picked; store.reactions[chId]={picked: cur===k?null:k}; saveStore(); renderReaderOnly(); }
function toggleBookmark(){ const f=currentChapter; if(!f) return; const id=f.ch.id; const i=store.bookmarks.findIndex(b=>b.chapterId===id); if(i>=0){ store.bookmarks.splice(i,1); toast("Bookmark removed"); } else { store.bookmarks.unshift({chapterId:id, storyId:f.story.id, label:"A passage in "+f.ch.title, when:"just now"}); toast("Bookmarked", f.ch.title, {icon:'bookmarkFill'}); } saveStore(); updateReaderBar(); }
function toggleMarkRead(){ const f=currentChapter; if(!f) return; const id=f.ch.id; store.readMarked[id]=!store.readMarked[id]; saveStore(); if(store.readMarked[id]){ const exists=store.history.find(h=>h.chapterId===id&&h.kind==='completed'); if(!exists) store.history.unshift({chapterId:id, storyId:f.story.id, title:f.ch.title, when:"just now", kind:"completed"}); saveStore(); toast("Marked as read"); } updateReaderBar(); }
function saveQuote(){ const sel=window.getSelection(); const text=sel?sel.toString().trim():""; if(text.length<4){ toast("Select some text first","Highlight a line in the chapter, then save.",{kind:"bad",icon:"quote",ms:3000}); return; } const f=currentChapter; store.quotes.unshift({id:"q"+now(), chapterId:f.ch.id, story:f.story.id, text, when:"just now"}); saveStore(); sel.removeAllRanges(); toast("Quote saved", text.slice(0,50)+(text.length>50?"â€¦":""), {icon:"quoteFill" in I?"quote":"quote"}); }
function rememberReturn(){ if(currentChapter) store.pendingReturn=currentChapter.ch.id; saveStore(); }
async function connectPatreonGo(){
  if (!authState.user){ await signInWithGoogle("connect-patreon"); return; }
  try {
    const btnMsg = "Starting Patreon connection";
    toast(btnMsg, "Redirecting through secure OAuth...", {icon:"sync", ms:3000});
    store.providerPending = true;
    saveStore();
    await requestPatreonOAuth();
  } catch (err) {
    store.providerPending = false;
    saveStore();
    toast("Patreon not ready", err.message || "The OAuth Edge Function needs configuration.", {icon:"alert", kind:"bad", ms:6500});
    render();
  }
}
async function redeemKey(code){
  code=(code||"").trim().toUpperCase();
  const err=document.getElementById("key-error");
  if(!code){ if(err)err.textContent=""; return false; }
  if(!authState.user){ if(err){err.style.color="var(--bad)";err.textContent="Sign in before redeeming a key.";} openSheet(sheetPersona); return false; }
  const client = getSupabase();
  if (client) {
    try {
      if(err){err.style.color="var(--text-dim)";err.textContent="Redeeming against Supabase...";}
      const { error } = await client.rpc("redeem_access_key", { submitted_code: code });
      if (error) throw error;
      await refreshEntitlements();
      const ret=store.pendingReturn;
      closeSheet();
      toast("Access key redeemed", "Your entitlements have been refreshed.", {icon:"key", ms:5500, action: ret?{act:"return:"+ret, label:"Return to chapter"}:null});
      render();
      return true;
    } catch (rpcErr) {
      if(err){err.style.color="var(--warn)";err.textContent=rpcErr.message || "Backend key redemption is not available yet.";}
      return false;
    }
  }
  if(err){err.style.color="var(--bad)";err.textContent="Supabase is unavailable; key redemption cannot run.";}
  return false;
}
function copyText(t){ try{ navigator.clipboard&&navigator.clipboard.writeText(t); }catch(e){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(_){} ta.remove(); } toast("Copied to clipboard"); }

/* ============ reader-only re-render (keep scroll) ============ */
function renderReaderOnly(){ if(route.name!=="read"||!currentChapter) return;
  const v=VIEWS.read(); const tmp=document.createElement("div"); tmp.innerHTML=v;
  const newReader=tmp.querySelector("#reader"); const cur=document.getElementById("reader");
  if(newReader&&cur){ cur.className=newReader.className; cur.style.cssText=newReader.style.cssText; }
  const newStage=tmp.querySelector("#rstage"); const stage=document.getElementById("rstage");
  if(newStage&&stage) stage.innerHTML=newStage.innerHTML;
  const prog=document.getElementById("rprog"); if(prog) prog.style.display=store.settings.showProgress?"":"none";
  updateReaderBar();
}
function updateReaderBar(){ const bar=document.getElementById("rbar"); if(!bar) return; const f=currentChapter; const bk=store.bookmarks.find(b=>b.chapterId===f.ch.id); const btns=bar.querySelectorAll("button"); if(btns[3]) btns[3].innerHTML=bk?I.bookmarkFill:I.bookmark, btns[3].classList.toggle("active",!!bk); }

/* ============ after-render hooks ============ */
let lastScroll=0;
function afterRender(){
  const isReader = route.name==="read";
  if (!isReader){
    // home search etc handled globally
  }
  if (isReader){ setupReader(); }
}
function setupReader(){
  const stage=document.getElementById("rstage");
  const top=document.getElementById("rtop");
  const prog=document.getElementById("rprog");
  const settings=store.settings;
  if(!settings.showProgress && prog) prog.style.display="none";
  // record read open in history
  if(currentChapter){ const id=currentChapter.ch.id; const exists=store.history.find(h=>h.chapterId===id); if(!exists){ store.history.unshift({chapterId:id, storyId:currentChapter.story.id, title:currentChapter.ch.title, when:"just now", kind: chapterResolved(currentChapter.ch).state==="preview"?"preview":"read"}); store.history=store.history.slice(0,12); saveStore(); } }
  // progress + autohide top
  function onScroll(){
    const sc=window.scrollY; const max=document.body.scrollHeight-window.innerHeight; const pct=max>0?Math.min(100,sc/max*100):0;
    if(prog) prog.style.width=pct+"%";
    if(top){ if(sc>lastScroll+8 && sc>120){ top.classList.add("hidden"); } else if(sc<lastScroll-8){ top.classList.remove("hidden"); } }
    lastScroll=sc;
    // save progress at ~ every change of 5%
    if(currentChapter && Math.abs(pct-(store.progress[currentChapter.ch.id]?.pct||0))>4){ store.progress[currentChapter.ch.id]={pct:Math.round(pct), scene: currentChapter.ch.title, storyId:currentChapter.story.id, updatedAt:now()}; saveStore(); }
  }
  window.removeEventListener("scroll", readerScrollHandler);
  readerScrollHandler=onScroll;
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
  // tap zones
  if(stage && !stage.dataset.wired){ stage.dataset.wired="1"; stage.addEventListener("click",(e)=>{
    if(e.target.closest("button,a,figure,.pchip,.react,input,textarea,.cmt-form")) return;
    const x=e.clientX/window.innerWidth;
    if(settings.focusMode){ document.getElementById("reader").classList.toggle("ui-on"); return; }
    if(x<0.28){ goReaderChapter(-1); } else if(x>0.72){ goReaderChapter(1); } else { top&&top.classList.toggle("hidden"); }
  }); }
}
let readerScrollHandler=null;
function goReaderChapter(dir){
  if(!currentChapter) return; const f=currentChapter; const idx=f.story.chapters.indexOf(f.ch); const nxt=f.story.chapters[idx+dir]; if(!nxt){ toast(dir>0?"You're at the latest chapter":"You're at the first chapter",null,{kind:"bad",icon:"alert",ms:2200}); return; }
  const r=chapterResolved(nxt);
  if(isReadable(r)){ nav("/read/"+nxt.id); } else if(r.state==="preview"){ nav("/read/"+nxt.id); } else { rememberReturn(); openSheet(()=>sheetLock(nxt.id)); }
}

/* ============ global listeners ============ */
function handleAttr(el, name, val){
  // returns true if handled
}
function delegate(){
  document.addEventListener("click",(e)=>{
    const t=e.target.closest("[data-nav],[data-read],[data-preview],[data-lock],[data-sheet],[data-follow],[data-react],[data-persona],[data-toggle],[data-filter],[data-act],[data-toast-action],[data-dismiss],[data-fig],[data-para],[data-copy],[data-set-theme],[data-set-preset],[data-shelf-view],[data-quote-card],[data-site-theme],[data-studio-state]");
    if(!t) return;
    if (t.dataset.siteTheme!=null){ setTheme(t.dataset.siteTheme); openSheet(currentSheet?currentSheet.builder:sheetSettings, currentSheet?currentSheet.opts:null); toast("Theme: "+(THEMES.find(x=>x.id===t.dataset.siteTheme)?.name), null, {icon:"palette"}); return; }
    if (t.dataset.studioState!=null){ const p=t.closest(".state-pills"); if(p) p.querySelectorAll(".state-pill").forEach(b=>b.classList.remove("active")); t.classList.add("active"); toast("Access state set", "Chapter will be "+t.textContent.trim()+" on publish.", {icon:"lock"}); return; }
    if (t.dataset.nav!=null){ e.preventDefault(); nav(t.dataset.nav); return; }
    if (t.dataset.read!=null){ e.preventDefault(); nav("/read/"+t.dataset.read); return; }
    if (t.dataset.preview!=null){ e.preventDefault(); nav("/read/"+t.dataset.preview); return; }
    if (t.dataset.lock!=null){ e.preventDefault(); rememberReturn(); openSheet(()=>sheetLock(t.dataset.lock)); return; }
    if (t.dataset.sheet!=null){ e.preventDefault(); const sh=t.dataset.sheet; const builders={settings:sheetSettings,persona:sheetPersona,signup:sheetSignup,redeem:sheetRedeem,"connect-patreon":sheetConnectPatreon,context:sheetContext}; if(sh==="context"&&!currentChapter){ toast("Open a chapter first",null,{kind:"bad",icon:"alert"}); return; } openSheet(builders[sh]||sheetSettings); return; }
    if (t.dataset.follow!=null){ toggleFollow(t.dataset.follow); return; }
    if (t.dataset.react!=null){ if(currentChapter) setReaction(currentChapter.ch.id, t.dataset.react); return; }
    if (t.dataset.persona!=null){ store.personaId=t.dataset.persona; saveStore(); closeSheet(); toast("Viewing as "+(D.PERSONAS.find(p=>p.id===t.dataset.persona)?.label),null,{icon:"user"}); render(); return; }
    if (t.dataset.filter!=null){ const k=t.dataset.filter; const i=store.filters.chips.indexOf(k); if(i>=0) store.filters.chips.splice(i,1); else store.filters.chips.push(k); saveStore(); renderHeaderless(); return; }
    if (t.dataset.toggle!=null){ store.settings[t.dataset.toggle]=!store.settings[t.dataset.toggle]; saveStore(); if(currentSheet){ openSheet(currentSheet.builder, currentSheet.opts); } if(route.name==="read") renderReaderOnly(); return; }
    if (t.dataset.shelfView!=null){ store.filters.shelfView=t.dataset.shelfView; saveStore(); render(); return; }
    if (t.dataset.setTheme!=null){ store.settings.readerTheme=t.dataset.setTheme; saveStore(); openSheet(currentSheet.builder,currentSheet.opts); renderReaderOnly(); return; }
    if (t.dataset.setPreset!=null){ store.settings.preset=t.dataset.setPreset; if(t.dataset.setPreset==="dyslexia"){/*keep*/} saveStore(); openSheet(currentSheet.builder,currentSheet.opts); renderReaderOnly(); return; }
    if (t.dataset.fig!=null){ openSheet(()=>sheetImage(t.dataset.fig, t.closest("figure")?.querySelector("figcaption")?.textContent)); return; }
    if (t.dataset.para!=null && currentChapter){ openSheet(()=>sheetParaComments(currentChapter.ch.id, parseInt(t.dataset.para))); return; }
    if (t.dataset.copy!=null){ copyText(t.dataset.copy); return; }
    if (t.dataset.quoteCard!=null){ toast("Quote card ready","Copied as a shareable card.",{icon:"spark"}); return; }
    if (t.dataset.dismiss!=null){ store.notifs=store.notifs.filter(n=>n.id!==t.dataset.dismiss); saveStore(); render(); return; }
    if (t.dataset.toastAction!=null){ const a=t.dataset.toastAction; if(a.startsWith("return:")){ store.pendingReturn=null; saveStore(); nav("/read/"+a.split(":")[1]); } return; }
    if (t.dataset.act!=null){ e.preventDefault(); e.stopPropagation(); handleAct(t.dataset.act, t); return; }
  });
  document.addEventListener("input",(e)=>{
    const t=e.target;
    if(t.id==="lib-search"){ store.filters.q=t.value; renderHeaderless(); return; }
    if(t.dataset && t.dataset.setRange){ store.settings[t.dataset.setRange]=parseFloat(t.value); saveStore(); const lbl=t.closest(".set-group")?.querySelector("label .faint"); if(lbl){ lbl.textContent = t.dataset.setRange==="fontScale"? Math.round(t.value*100)+"%" : parseFloat(t.value).toFixed(2); } renderReaderOnly(); }
  });
  document.addEventListener("submit", async (e)=>{
    const f=e.target;
    if(f.dataset.cmtForm!=null){ e.preventDefault(); const name=(f.querySelector("[name=name]")?.value||"Reader").trim()||"Reader"; const text=f.querySelector("[name=text]").value.trim(); if(!text) return; const chId=f.dataset.cmtForm; (store.comments[chId]=store.comments[chId]||[]).push({id:"c"+now(),para:null,name,text,time:"just now",color:"#d4b06a"}); saveStore(); renderReaderOnly(); toast("Note posted",null,{icon:"msg"}); return; }
    if(f.dataset.paraForm!=null){ e.preventDefault(); const name=(f.querySelector("[name=name]")?.value||"Reader").trim()||"Reader"; const text=f.querySelector("[name=text]").value.trim(); if(!text) return; const chId=f.dataset.paraForm; const p=parseInt(f.dataset.paraIndex); (store.comments[chId]=store.comments[chId]||[]).push({id:"c"+now(),para:p,name,text,time:"just now",color:"#5bb8c9"}); saveStore(); closeSheet(); renderReaderOnly(); toast("Paragraph note added",null,{icon:"msg"}); return; }
    if(f.dataset.redeemForm!=null){ e.preventDefault(); const v=f.querySelector("[name=key]").value; const ok=await redeemKey(v); if(ok===false){ /* error shown */ } return; }

    if(f.dataset.authForm!=null){
      e.preventDefault();
      const status=f.querySelector("[data-auth-status]");
      const email=(f.querySelector("[name=email]")?.value||"").trim();
      const password=f.querySelector("[name=password]")?.value||"";
      if(!email || !password){ if(status){ status.style.color="var(--bad)"; status.textContent="Email and password are required."; } return; }
      try {
        if(status){ status.style.color="var(--text-dim)"; status.textContent=f.dataset.authForm==="signup"?"Creating account...":"Signing in..."; }
        if(f.dataset.authForm==="signup") await signUpWithPassword(email, password);
        else await signInWithPassword(email, password);
        closeSheet();
        toast(f.dataset.authForm==="signup"?"Account created":"Signed in", "Reader account is connected.", {icon:"checkCirc", ms:4500});
        render();
      } catch (err) {
        if(status){ status.style.color="var(--bad)"; status.textContent=err.message || "Authentication failed."; }
      }
      return;
    }
    if(f.dataset.contactForm!=null){ e.preventDefault(); f.reset(); toast("Support message sent","We'll reply by email.",{icon:"mail",ms:5000}); return; }
  });
  // selection for quote saving
  document.addEventListener("mouseup",()=>{ if(route.name!=="read") return; const sel=window.getSelection(); const text=sel?sel.toString().trim():""; const prose=document.getElementById("prose"); if(text.length>3 && prose && prose.contains(sel.anchorNode)){ ensureQuoteFab(true); } else { ensureQuoteFab(false); } });
  document.addEventListener("touchend",()=>{ if(route.name!=="read") return; setTimeout(()=>{ const sel=window.getSelection(); const text=sel?sel.toString().trim():""; ensureQuoteFab(text.length>3); },250); });
}
function renderHeaderless(){ // re-render only main for library search without losing focus
  const main=document.getElementById("main"); const view=VIEWS[route.name]||VIEWS.home; const html=view(); const inp=document.activeElement; const caret=inp&&inp.id==="lib-search"? inp.selectionStart : null; main.innerHTML=`<div class="vt">${html}</div>`; afterRender(); const newInp=document.getElementById("lib-search"); if(newInp&&caret!=null){ newInp.focus(); newInp.setSelectionRange(caret,caret); } }
let quoteFab=null;
function ensureQuoteFab(show){ if(show){ if(quoteFab) return; quoteFab=document.createElement("button"); quoteFab.className="btn story sm"; quoteFab.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--nav-h)+70px + env(safe-area-inset-bottom));z-index:75;box-shadow:var(--shadow-lg)"; quoteFab.innerHTML=I.quote+"Save quote"; quoteFab.onclick=()=>{ saveQuote(); ensureQuoteFab(false); }; document.body.appendChild(quoteFab); requestAnimationFrame(()=>quoteFab.style.opacity="1"); } else if(quoteFab){ quoteFab.remove(); quoteFab=null; } }

function handleAct(act, el){
  switch(act){
    case "close-sheet": closeSheet(); break;
    case "clear-filters": store.filters={q:"",chips:[]}; saveStore(); render(); break;
    case "toggle": { /* handled by data-toggle */ break; }
    case "connect-patreon-go": connectPatreonGo(); break;
    case "google-signin": signInWithGoogle().catch(err=>toast("Google sign-in failed", err.message || "Unable to start Google OAuth.", {icon:"alert", kind:"bad"})); break;
    case "google-then-patreon": signInWithGoogle("connect-patreon").catch(err=>toast("Google sign-in failed", err.message || "Unable to start Google OAuth.", {icon:"alert", kind:"bad"})); break;
    case "show-signup": openSheet(sheetSignup); break;
    case "reader-signout": signOutReader().then(()=>{ closeSheet(); toast("Signed out", null, {icon:"user"}); render(); }).catch(err=>toast("Sign out failed", err.message, {icon:"alert", kind:"bad"})); break;
    case "resync": syncProviderEntitlements().then((data)=>{ const grants = Number(data?.grants || 0); toast("Sync complete", grants ? `${grants} Patreon entitlement${grants===1?"":"s"} active.` : "Patreon linked, but no mapped tier was found.", {icon:"checkCirc", ms:4000}); render(); }).catch(err=>toast("Sync failed", err.message || "Unable to refresh provider entitlements.", {icon:"alert", kind:"bad"})); break;
    case "expected-access": rememberReturn(); openSheet(sheetContext?sheetContext:()=>sheetLock(currentChapter?.ch.id)); break;
    case "reader-prev": goReaderChapter(-1); break;
    case "reader-next": goReaderChapter(1); break;
    case "reader-bookmark": toggleBookmark(); break;
    case "reader-markread": toggleMarkRead(); break;
    case "reader-savequote": saveQuote(); break;
    case "reader-comments": { const c=document.getElementById("cmtblock"); if(c){ c.scrollIntoView({behavior:"smooth"}); } break; }
    case "offline-queue": toast("Saved for offline","Available while your access is active (concept).",{icon:"download",ms:4000}); break;
    case "extra-open": toast("Opening bonus material","Author note Â· reader format.",{icon:"spark"}); break;
    case "external-archive": toast("Opening Abstracto Tales","The main archive opens in a new tab (concept).",{icon:"external",ms:3500}); break;
    case "external-discord": toast("Opening Discord","#aether-pages-help (concept).",{icon:"msg"}); break;
    case "simulate-notif": { const n={id:"n"+now(),t:"New chapter available",d:"A new early-access chapter just dropped.",k:"chapter",time:"just now",read:false,story:"glass-orchard",chapter:"go-5"}; store.notifs.unshift(n); saveStore(); render(); toast("Notice added",null,{icon:"bell"}); break; }
    case "mark-all-read": store.notifs.forEach(n=>n.read=true); saveStore(); render(); break;
    case "notif-prefs": toast("Notification preferences","Manage email & push in account settings (concept).",{icon:"cog",ms:3500}); break;
    case "studio-publish": toast("Published","Chapter is live for readers with access.",{icon:"checkCirc",ms:4000}); break;
    case "studio-save-draft": toast("Draft saved","Auto-saved to your drafts.",{icon:"book"}); break;
    case "studio-schedule": toast("Scheduled","Post queued for its release time.",{icon:"calendar"}); break;
    case "studio-new-chapter": case "studio-new-post": case "studio-new-campaign": case "studio-upload": toast("Opening composer","This would open the full editor (concept).",{icon:"plus"}); break;
    case "studio-edit": toast("Opening editor","Edit details in the full studio (concept).",{icon:"cog"}); break;
    case "studio-preview": toast("Preview","Showing how readers will see this chapter.",{icon:"eye"}); break;
    case "studio-grant": toast("Manual grant","Access granted to this reader.",{icon:"gift"}); break;
    case "studio-approve": toast("Comment approved","Now visible to readers.",{icon:"check"}); render(); break;
    case "studio-hide": toast("Comment hidden","Removed from reader view.",{icon:"x",kind:"bad"}); render(); break;
    case "studio-media-open": toast("Asset details","Manage attachments & visibility (concept).",{icon:"spark"}); break;
    case "studio-post": toast("Opening post","Full announcement in the reader (concept).",{icon:"msg"}); break;
    default: break;
  }
}

/* ============ AETHER STUDIO (author CMS) views ============ */
VIEWS.studioOverview = function(){
  const o=D.STUDIO.overview, a=D.STUDIO.analytics;
  const max=Math.max(...a.readsByDay);
  return `<h1 class="page-title">Studio Overview</h1><p class="page-sub">Your archive at a glance â€” subscribers, reads, and what needs your attention.</p>
  <div class="kpis" style="margin:14px 0 18px">
    <div class="kpi"><div class="lbl">Subscribers</div><div class="val">${o.subscribers.toLocaleString()}</div><div class="delta up">${I.trending} ${o.subsDelta}</div></div>
    <div class="kpi"><div class="lbl">Reads (30d)</div><div class="val">${o.reads30.toLocaleString()}</div><div class="delta up">${o.readsDelta}</div></div>
    <div class="kpi"><div class="lbl">Drafts</div><div class="val">${o.drafts}</div><div class="delta">${o.draftsDelta}</div></div>
    <div class="kpi"><div class="lbl">Scheduled</div><div class="val">${o.scheduled}</div><div class="delta">${o.scheduledDelta}</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Reads this fortnight</h2></div>
    <div class="card"><div class="bars">${a.readsByDay.map(v=>`<i style="height:${Math.round(v/max*100)}%"></i>`).join("")}</div>
    <div class="faint" style="font-size:.72rem;margin-top:8px">Peak day: ${max} reads Â· strongest in the evenings.</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Quick actions</h2></div>
    <div class="quicklinks">
      <a data-nav="/studio/chapters">${I.plus}<span>New chapter</span><small>Draft &amp; publish</small></a>
      <a data-nav="/studio/announcements">${I.msg}<span>Post update</span><small>Announce</small></a>
      <a data-nav="/studio/access">${I.key}<span>Create key</span><small>Campaign</small></a>
      <a data-nav="/studio/media">${I.spark}<span>Upload art</span><small>Illustration</small></a>
    </div>
  </div>
  <div class="section"><div class="section-head"><h2>Needs attention</h2></div>
    <div class="col-flex">
      <div class="mgr-row"><span class="mi-ic" style="color:var(--warn)">${I.alert}</span><div class="mi-body"><div class="mi-t">1 flagged comment</div><div class="mi-s">Reported spoiler in "Inheritance of Glass" â€” review in Analytics.</div></div><div class="mi-acts"><button class="btn sm" data-nav="/studio/analytics">Review</button></div></div>
      <div class="mgr-row"><span class="mi-ic" style="color:var(--info)">${I.sync}</span><div class="mi-body"><div class="mi-t">1 sync pending</div><div class="mi-s">Pell R. â€” Patreon connection verifying.</div></div><div class="mi-acts"><button class="btn sm" data-nav="/studio/access">Members</button></div></div>
      <div class="mgr-row"><span class="mi-ic" style="color:var(--accent)">${I.book}</span><div class="mi-body"><div class="mi-t">Draft ready: "The Third Bell"</div><div class="mi-s">2,140 words Â· Arc II opening.</div></div><div class="mi-acts"><button class="btn sm story" data-act="studio-publish">Publish</button></div></div>
    </div>
  </div>`;
};
VIEWS.studioChapters = function(){
  const all = D.FEATURED_SLUGS.flatMap(slug=>{ const s=bySlug(slug); return s.chapters.map(c=>({c,s})); }).concat(
    D.STORIES.filter(s=>!D.FEATURED_SLUGS.includes(s.slug)).flatMap(s=>s.chapters.map(c=>({c,s})))
  );
  const states=[["free","Free"],["preview","Preview"],["early","Early"],["member","Member"],["key","Key"],["unavailable","Hold"]];
  return `<div class="between"><div><h1 class="page-title">Chapters</h1><p class="page-sub">Draft, set access state, and schedule releases.</p></div><button class="btn story sm" data-act="studio-new-chapter">${I.plus}New chapter</button></div>
  <div class="card composer" style="margin:12px 0 18px">
    <div class="eyebrow" style="margin-bottom:8px">Quick publish</div>
    <input type="text" placeholder="Chapter titleâ€¦">
    <div class="state-pills" style="margin:10px 0">${states.map(([k,l],i)=>`<button class="state-pill ${i===3?'active':''}" data-studio-state="${k}">${l}</button>`).join("")}</div>
    <textarea placeholder="Paste or write the chapter draftâ€¦"></textarea>
    <div class="between" style="margin-top:10px"><span class="faint" style="font-size:.76rem">Auto-saves as you type.</span><div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="studio-save-draft">${I.book}Save draft</button><button class="btn sm story" data-act="studio-publish">${I.play}Publish</button></div></div>
  </div>
  <div class="section"><div class="section-head"><h2>All chapters</h2><span class="faint" style="font-size:.78rem">${all.length} total</span></div>
    ${all.map(({c,s})=>{
      const st = c.state==='free'?'free':c.state==='preview'?'preview':c.state==='early'?'early':c.state==='key'?'key':c.state==='unavailable'?'unavailable':'member';
      const stColor={free:'free',preview:'preview',early:'early',member:'unlocked',key:'key',unavailable:'error'}[st];
      return `<div class="mgr-row"><span class="mi-ic" style="color:var(--${stColor==='unlocked'?'accent-2':stColor})">${I[st==='free'?'open':st==='early'?'hourglass':st==='key'?'key':st==='preview'?'eye':st==='unavailable'?'alert':'lock']}</span>
        <div class="mi-body"><div class="mi-t"><span>${c.title}</span>${badge(stColor==='unlocked'?'gold':stColor, st)}${c.publicDate?badge('early','Public '+fmtDate(c.publicDate)):''}</div><div class="mi-s">${s.title} Â· Ch ${c.n} Â· ${c.readTime} min Â· ${c.arc||''}</div></div>
        <div class="mi-acts"><button class="btn sm" data-act="studio-edit">${I.cog}State</button><button class="btn sm ghost" data-act="studio-preview">${I.eye}Preview</button></div></div>`;
    }).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Drafts</h2></div>
    ${D.STUDIO.drafts.map(d=>`<div class="mgr-row"><span class="mi-ic">${I.book}</span><div class="mi-body"><div class="mi-t"><span>${d.title}</span>${badge(d.status==='review'?'':'', d.status)}</div><div class="mi-s">${d.book} Â· ${d.words.toLocaleString()} words Â· ${d.note}</div></div><div class="mi-acts"><button class="btn sm story" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioAccess = function(){
  return `<h1 class="page-title">Access &amp; Members</h1><p class="page-sub">Tiers, key campaigns, members and manual grants.</p>
  <div class="section"><div class="section-head"><h2>Tiers</h2></div>
    ${D.STUDIO.tiers.map(t=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--accent)">${I.vault}</span><div class="mi-body"><div class="mi-t"><span>${t.name}</span>${badge('gold',t.price)}${badge('',t.members+' members')}</div><div class="mi-s">${t.unlocks}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Key campaigns</h2><button class="btn sm story" data-act="studio-new-campaign">${I.plus}New campaign</button></div>
    ${D.STUDIO.campaigns.map(c=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--key)">${I.key}</span><div class="mi-body"><div class="mi-t"><span>${c.name}</span>${badge(c.state==='active'?'key':'', c.state)}${badge('',c.used+'/'+c.issued+' used')}</div><div class="mi-s"><span class="kbd">${c.code}</span> Â· ${c.scope} Â· expires ${c.expires}</div></div><div class="mi-acts"><button class="btn sm" data-copy="${c.code}">${I.copy}Copy</button></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Members</h2><span class="faint" style="font-size:.78rem">${D.STUDIO.members.length} shown</span></div>
    ${D.STUDIO.members.map(m=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${m.status==='active'?'good':m.status==='lapsed'?'bad':'warn'})">${I.user}</span><div class="mi-body"><div class="mi-t"><span>${m.name}</span>${badge(m.status==='active'?'free':m.status==='lapsed'?'':'', m.status)}${badge('',m.tier)}</div><div class="mi-s">since ${m.since} Â· via ${m.source}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-grant">${I.gift}Grant</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioAnnouncements = function(){
  return `<div class="between"><div><h1 class="page-title">Posts &amp; Announcements</h1><p class="page-sub">Updates readers see on Home and in notifications.</p></div><button class="btn story sm" data-act="studio-new-post">${I.plus}New post</button></div>
  <div class="card composer" style="margin:12px 0 18px">
    <div class="eyebrow" style="margin-bottom:8px">Compose announcement</div>
    <input type="text" placeholder="Headlineâ€¦">
    <textarea placeholder="What should readers know?" style="margin-top:10px"></textarea>
    <div class="between" style="margin-top:10px"><div class="chips"><button class="chip active">All readers</button><button class="chip">Aether Member</button><button class="chip">Archivist</button></div><div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="studio-schedule">${I.calendar}Schedule</button><button class="btn sm story" data-act="studio-publish">${I.play}Publish now</button></div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Scheduled &amp; live</h2></div>
    ${D.STUDIO.announcements.map(a=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${a.state==='live'?'good':'info'})">${I.msg}</span><div class="mi-body"><div class="mi-t"><span>${a.title}</span>${badge(a.state==='live'?'free':'', a.state)}</div><div class="mi-s">${a.body} Â· ${a.target} Â· ${a.when}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioMedia = function(){
  return `<div class="between"><div><h1 class="page-title">Media &amp; Artwork</h1><p class="page-sub">Illustrations, cover concepts and art drops.</p></div><button class="btn story sm" data-act="studio-upload">${I.download}Upload</button></div>
  <div class="section"><div class="section-head"><h2>Gallery</h2><span class="faint" style="font-size:.78rem">${D.STUDIO.media.length} assets</span></div>
    <div class="media-grid">${D.STUDIO.media.map(m=>`<div class="media-cell" data-act="studio-media-open">${D.FIG[m.fig]||''}<span class="tag">${m.used?m.attached:'Unassigned'}</span></div>`).join("")}</div>
  </div>
  <div class="card" style="margin-top:14px"><div class="between"><div><div style="font-weight:600;font-size:.88rem">${I.external} Art lives in the main archive</div><div class="faint" style="font-size:.76rem">Full galleries, maps and high-res assets are managed on Abstracto Tales.</div></div><button class="btn sm ghost" data-act="external-archive">${I.external}Open</button></div></div>`;
};
VIEWS.studioAnalytics = function(){
  const a=D.STUDIO.analytics; const max=Math.max(...a.readsByDay);
  return `<h1 class="page-title">Analytics</h1><p class="page-sub">How readers move through your archive.</p>
  <div class="kpis" style="margin:14px 0 18px">
    <div class="kpi"><div class="lbl">Followers</div><div class="val">${D.STUDIO.overview.followers.toLocaleString()}</div><div class="delta up">${D.STUDIO.overview.followersDelta}</div></div>
    <div class="kpi"><div class="lbl">Avg completion</div><div class="val">84%</div><div class="delta up">+3%</div></div>
    <div class="kpi"><div class="lbl">Comments</div><div class="val">${totalComments()+124}</div><div class="delta">7 pending</div></div>
    <div class="kpi"><div class="lbl">Retention</div><div class="val">${a.retention.latest}%</div><div class="delta down">to latest</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Reads over time</h2></div>
    <div class="card"><div class="bars">${a.readsByDay.map(v=>`<i style="height:${Math.round(v/max*100)}%"></i>`).join("")}</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Top chapters</h2></div>
    ${a.topChapters.map((c,i)=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--accent);font-family:var(--serif);font-weight:700">${i+1}</span><div class="mi-body"><div class="mi-t"><span>${c.t}</span>${badge('',c.react)}</div><div class="mi-s">${c.reads.toLocaleString()} reads Â· ${c.completion}% completion</div></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Reactions</h2></div>
    <div class="card">${a.reactions.map(r=>`<div class="between" style="padding:6px 0"><span style="font-size:1.2rem">${r.e}</span><div style="flex:1;margin:0 12px">${progressBar(Math.round(r.n/a.reactions[0].n*100))}</div><span class="faint" style="font-size:.78rem">${r.n}</span></div>`).join("")}</div>
  </div>
  <div class="section"><div class="section-head"><h2>Comment moderation</h2><span class="badge" style="align-self:center">${a.commentsQueue.filter(c=>c.flagged).length} flagged</span></div>
    ${a.commentsQueue.map(c=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${c.flagged?'bad':'text-dim'})">${c.flagged?I.alert:I.msg}</span><div class="mi-body"><div class="mi-t"><span>${c.who}</span>${badge('',c.ch)}${c.flagged?badge('','Flagged'):''}</div><div class="mi-s">${c.text}</div></div><div class="mi-acts"><button class="btn sm" data-act="studio-approve">${I.check}Approve</button><button class="btn sm ghost" data-act="studio-hide">${I.x}Hide</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioSettings = function(){
  const s=bySlug(D.PRIMARY_SLUG);
  return `<h1 class="page-title">Studio Settings</h1><p class="page-sub">Book identity, branding and defaults.</p>
  <div class="section"><div class="section-head"><h2>Primary book</h2></div>
    <div class="card tinted" style="${storyAccentVars(s)};display:flex;gap:13px;align-items:center"><div style="width:54px;height:72px;border-radius:8px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(s)}</div><div style="flex:1"><div style="font-family:var(--serif);font-weight:600">${s.title}</div><div class="faint" style="font-size:.76rem">${s.author} Â· ${s.genre}</div></div><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div>
  </div>
  <div class="section"><div class="section-head"><h2>Branding accent</h2></div>
    <div class="card"><div class="state-pills">${["#c75b6b","#d4b06a","#5bb8c9","#9a7ed1","#8fb98a","#e08a4a"].map((col,i)=>`<button class="state-pill ${i===0?'active':''}" style="background:${col};border-color:${col};color:#fff;padding:0 18px"></button>`).join("")}</div><p class="faint" style="font-size:.76rem;margin-top:10px">This book's accent tints covers, progress and the reader when readers enter it.</p></div>
  </div>
  <div class="section"><div class="section-head"><h2>Defaults</h2></div>
    <div class="card">
      ${toggleRow("studioDefaultEarly","New chapters default to Early Access","Public release 14 days later",true)}
      ${toggleRow("studioCommentsOn","Comments on by default","Readers can leave notes",true)}
      ${toggleRow("studioAutoSync","Auto-sync Patreon hourly","Keeps entitlements fresh",true)}
    </div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center"><span class="faint">${I.external}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Connect the main archive</div><div class="faint" style="font-size:.74rem">Sync deep lore & galleries from Abstracto Tales.</div></div><button class="btn sm ghost" data-act="external-archive">${I.external}Connect</button></div>`;
};
/* ============ HOME (override: book-centered living feed) ============ */
VIEWS.home = function(){
  const P = persona();
  const reads = activeReads();
  const primary = bySlug(D.PRIMARY_SLUG);
  const secondary = D.FEATURED_SLUGS.map(bySlug).filter(s=>s && s.slug!==primary.slug)[0];
  const shorter = D.STORIES.filter(s=>!D.FEATURED_SLUGS.includes(s.slug));
  let banner = "";
  if (P.expired) banner = accessBanner("expired","Your Aether Member access has expired","Some chapters are now locked. Renew to continue reading.","/vault","Renew access");
  else if (P.pending) banner = accessBanner("pending","We're verifying your access","Your Patreon connection is syncing â€” we'll update automatically.","/support/check-access","Check status");
  else if (P.noTier) banner = accessBanner("none","Your Patreon tier doesn't include access","You're connected, but your tier doesn't unlock Aether Pages.","/benefits","See what unlocks");
  else if (!P.signedIn) banner = accessBanner("anon","Browsing as a guest","Read free chapters and previews. Connect Patreon or redeem a key to unlock more.","/vault","Activate access");
  const lastRead = activeReads().find(x=>x.story.id===primary.id);
  const pRead = primary.chapters.filter(c=>store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
  const pPct = Math.round(pRead/primary.chapters.length*100);
  const latestCh = primary.chapters[primary.chapters.length-1];
  const startCh = lastRead?.ch.id || primary.chapters.find(c=>c.state==="free")?.id || primary.chapters[0].id;
  return `
  ${announcement()}
  ${banner}
  <div class="area-switch" style="margin:0 0 14px"><button class="active">${I.book}Reader</button>${isAdmin()?`<button data-nav="/studio/access">${I.overview}Author Studio</button><a class="btn sm ghost" href="admin.html">${I.shield}Admin CMS</a>`:""}</div>
  ${bookHero(primary, { startCh, lastRead, pPct, pRead, latestCh })}
  <div class="home-cols">
   <div style="min-width:0">
    <div class="section"><div class="section-head"><h2>What's new â€” ${primary.title}</h2><a class="section-link" data-nav="/story/${primary.slug}/updates">All ${I.chevR}</a></div><div class="feed stagger">${buildBookFeed(primary)}</div></div>
    ${reads.length?`<div class="section"><div class="section-head"><h2>Continue reading</h2><a class="section-link" data-nav="/my-shelf">My shelf ${I.chevR}</a></div><div class="lane stagger">${reads.slice(0,6).map(({ch,story,prog})=>{const next=story.chapters[story.chapters.indexOf(ch)+1];const nr=next?chapterResolved(next):null;return `<button class="card" style="width:220px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}"><div class="faint" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em">${story.title}</div><div style="font-family:var(--serif);font-weight:600;margin:2px 0 6px">${ch.title}</div>${progressBar(prog.pct)}<div class="between" style="margin-top:8px"><span class="faint" style="font-size:.72rem">${prog.pct<100?prog.pct+'%':'Done'}</span>${nr?`<span class="faint" style="font-size:.68rem">Next: ${accessTag(nr)[1]}</span>`:""}</div></button>`;}).join("")}</div></div>`:""}
    <div class="section"><div class="section-head"><h2>This week's releases</h2><a class="section-link" data-nav="/calendar">Calendar ${I.chevR}</a></div><div class="sched">${D.CALENDAR.slice(0,4).map(day=>`<div class="sched-card"><div class="dow">${day.day}</div><div class="dt">${(day.items[0]?.c||day.dow).split('â€”')[0].trim()}</div>${day.items.map(it=>`<div class="dl">${it.t} Â· ${it.k}</div>`).join("")}</div>`).join("")}</div></div>
   </div>
   <div style="min-width:0">
    ${secondary?`<div class="section"><div class="section-head"><h2>Also reading</h2></div><a class="card tinted" data-nav="/story/${secondary.slug}" style="${storyAccentVars(secondary)};display:block"><div style="display:flex;gap:13px;align-items:center"><div style="width:58px;height:78px;border-radius:9px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(secondary)}</div><div style="min-width:0;flex:1"><div style="font-family:var(--serif);font-weight:600;font-size:1.05rem">${secondary.title}</div><div class="faint" style="font-size:.76rem;margin-top:2px">${secondary.author} Â· ${secondary.genre}</div><div class="faint" style="font-size:.74rem;margin-top:6px">${secondary.tagline}</div></div></div><button class="btn sm story" style="margin-top:12px;width:100%">${I.book}Open story</button></a></div>`:""}
    ${memberArchivePanel()}
    <div class="section"><div class="section-head"><h2>Shorter works</h2></div><p class="faint" style="font-size:.76rem;margin:-4px 0 8px">Novellas, prequels &amp; bonus pieces beyond the main serials.</p><div class="lane">${shorter.map(storyCard).join("")}</div></div>
   </div>
  </div>
  <div class="section"><div class="section-head"><h2>Browse by collection</h2><a class="section-link" data-nav="/collections">All ${I.chevR}</a></div><div class="chips scroll">${D.COLLECTIONS.slice(0,8).map(c=>`<a class="chip" href="#/collections/${c.slug}" data-nav="/collections/${c.slug}">${I[c.icon]||I.book}<span>${c.name}</span></a>`).join("")}</div></div>
  <p class="faint center" style="font-size:.74rem;margin-top:18px">Deep lore, maps &amp; galleries live in the main author archive. <button class="btn sm ghost" data-act="external-archive" style="margin-left:6px">${I.external}Open Abstracto Tales</button></p>`;
};
function bookHero(s, o){
  const r = chapterResolved(o.latestCh);
  return `<div class="book-hero" style="${storyAccentVars(s)}"><div class="bg">${coverArt(s)}</div><div class="grad"></div><div class="inner"><div class="top"><div class="cover">${coverArt(s)}</div><div class="htxt"><div class="eyebrow">${s.genre} Â· ${s.status} Â· ${s.arc}</div><h1>${s.title}</h1><div class="author">by ${s.author}</div></div></div><div class="progress-line"><div class="between" style="margin-bottom:6px"><span class="faint" style="font-size:.76rem">${o.pRead} / ${s.chapters.length} chapters read</span><span class="faint" style="font-size:.76rem">${o.pPct}%</span></div>${progressBar(o.pPct)}</div><div class="cta-row"><button class="btn primary" data-read="${o.startCh}">${o.lastRead?I.play+"Continue â€” "+o.lastRead.ch.title:I.play+"Start reading"}</button><a class="btn ghost sm" data-nav="/story/${s.slug}/chapters">${I.list}Shelf</a><a class="btn ghost sm" data-nav="/story/${s.slug}/recap">${I.info}Recap</a><a class="btn ghost sm" data-nav="/story/${s.slug}/extras">${I.spark}Extras</a></div><div class="between" style="margin-top:12px"><span class="faint" style="font-size:.74rem">Latest: <b style="color:var(--text)">${o.latestCh.title}</b> Â· ${axInline(r)}</span>${o.latestCh.publicDate?`<span class="badge early">${I.hourglass}Public ${fmtDate(o.latestCh.publicDate)}</span>`:""}</div></div></div>`;
}
function buildBookFeed(s){
  const items = [];
  s.chapters.slice(-3).reverse().forEach(c=>{const r=chapterResolved(c);items.push({icon:I.play,color:"var(--accent)",tone:"accent",title:`New chapter â€” ${c.title}`,desc:`Chapter ${c.n} Â· ${c.readTime} min${c.state==='early'?' Â· early access for members':''}`,meta:[c.arc,isReadable(r)?"Readable now":accessTag(r)[1]],act:`data-read="${c.id}"`,cta:isReadable(r)?"Read":accessTag(r)[3]});});
  D.STUDIO.announcements.slice(0,2).forEach(a=>{items.push({icon:I.msg,color:"var(--info)",tone:"info",title:a.title,desc:a.body,meta:[a.target,a.when],act:`data-act="studio-post"`,cta:"View"});});
  D.STUDIO.media.filter(m=>m.used>0).slice(0,1).forEach(m=>{items.push({icon:I.spark,color:"var(--key)",tone:"key",thumb:m.fig,title:`New artwork â€” ${m.title}`,desc:`Illustration added to ${m.attached}.`,meta:["Art drop","Today"],act:`data-act="studio-post"`,cta:"See"});});
  return items.map(it=>`<button class="feed-item" ${it.act||""}>${it.thumb?`<span class="fthumb">${D.FIG[it.thumb]||""}</span>`:`<span class="fico" style="background:color-mix(in srgb,${it.color} 16%, transparent);color:${it.color}">${it.icon}</span>`}<span class="fbody"><span class="ftop"><span class="ft">${it.title}</span></span><span class="fd">${it.desc}</span><span class="fmeta">${(it.meta||[]).map(m=>`<span>${m}</span>`).join("")}</span></span><span class="btn sm ${it.tone==='accent'?'story':''}" style="flex:0 0 auto">${it.cta}</span></button>`).join("");
}

function themeSwatches(){
  return `<div class="theme-swatches">${THEMES.map(t=>`<button class="swatch ${store.theme===t.id?'active':''}" data-site-theme="${t.id}"><span class="dot" style="background:${t.dot}"></span><span class="nm">${t.name}</span><span class="ck">${I.check}</span></button>`).join("")}</div>`;
}

/* ============ init ============ */
function init(){
  // containers
  if(!document.querySelector(".scrim")){ const d=document.createElement("div"); d.className="scrim"; document.body.appendChild(d); }
  if(!document.querySelector(".toasts")){ const d=document.createElement("div"); d.className="toasts"; document.body.appendChild(d); }
  document.querySelector(".scrim").addEventListener("click",()=>closeSheet());
  delegate();
  window.addEventListener("hashchange", render);
  render();
  initAuth().then(async ()=>{ await loadBackendLibrary(); saveStore(); render(); }).catch(err=>console.error("Auth bridge init failed", err));
  // welcome toast for first bridge load
  if(!LS.getItem("aether-welcomed")){ LS.setItem("aether-welcomed","1"); setTimeout(()=>toast("Welcome to Aether Pages","This production shell now uses the Aether Pages concept UI; backend wiring comes next.",{icon:"spark",ms:6500}),900); }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();

})();

```

---

## File Path: `js/subscription/main.js`

```javascript
import { SubAuth } from './auth.js';
import { SubRouter } from './router.js';
import { SubUI } from './ui.js';
import { SubState } from './state.js';

window.SubAuth = SubAuth;
window.SubRouter = SubRouter;
window.SubUI = SubUI;
window.SubState = SubState;

window.addEventListener('hashchange', SubRouter.handle);

document.addEventListener('DOMContentLoaded', async () => {
    SubUI.init();
    SubUI.setReaderTheme(SubState.readerTheme);
    SubUI.setReaderScale(SubState.readerScale);
    try {
        await SubAuth.init();
    } catch (err) {
        console.error('Subscription auth initialization failed:', err);
        SubUI.toast('Session check failed. Guest mode is available.', 'error');
    }
    if (!window.location.hash) window.location.hash = '#/home';
    await SubRouter.handle();
});

```

---

## File Path: `js/subscription/state.js`

```javascript
import { supabaseClient, Utils } from '../config.js';

export const SubState = {
    user: null,
    profile: null,
    stories: [],
    entitlements: [],
    currentStory: null,
    currentCatalog: [],
    pendingReturnRoute: null,
    authMode: 'signin',
    readerTheme: localStorage.getItem('sub_reader_theme') || 'dark',
    readerScale: Number(localStorage.getItem('sub_reader_scale') || '1')
};

export { supabaseClient, Utils };

export const AccessLabels = {
    free: 'Free',
    unlocked: 'Unlocked',
    free_preview: 'Preview',
    locked_tier: 'Members',
    early_access: 'Early Access',
    key_locked: 'Key Unlock',
    pending_sync: 'Sync Pending',
    expired: 'Expired'
};

export const normalizeChapter = (chapter = {}) => {
    const requiredTier = chapter.required_tier || chapter.required_tier_name || chapter.tier_name || chapter.required_tier_label || null;
    const explicitState = chapter.access_state || chapter.state || null;
    const locked = Boolean(chapter.is_locked ?? chapter.locked ?? requiredTier);
    const accessState = explicitState || (locked ? 'locked_tier' : 'free');
    return {
        ...chapter,
        id: chapter.id,
        title: chapter.title || 'Untitled chapter',
        chapter_order: Number(chapter.chapter_order || chapter.order || 0),
        preview_text: chapter.preview_text || chapter.excerpt || '',
        required_tier_name: requiredTier,
        access_state: accessState,
        is_locked: ['locked_tier', 'early_access', 'key_locked', 'pending_sync', 'expired'].includes(accessState),
        can_read: Boolean(chapter.can_read ?? ['free', 'unlocked'].includes(accessState))
    };
};

export const routeTo = (path) => {
    window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^#?\/?/, '')}`;
};

export const safeText = Utils.escapeHtml;
export const safeAttr = Utils.escapeAttr;

```

---

## File Path: `js/subscription/auth.js`

```javascript
import { supabaseClient, SubState } from './state.js';
import { SubDB } from './db.js';
import { SubUI } from './ui.js';
import { SubRouter } from './router.js';

const getAuthRedirectUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    return url.toString();
};

export const SubAuth = {
    init: async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) await SubAuth.fetchProfile(session.user);
        SubAuth.syncAccountChip();

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await SubAuth.fetchProfile(session.user);
                await SubDB.getMyEntitlements();
                SubUI.closeAuthDialog();
            } else {
                SubState.user = null;
                SubState.profile = null;
                SubState.entitlements = [];
            }
            SubAuth.syncAccountChip();
            if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) SubRouter.handle();
        });
    },

    fetchProfile: async (user) => {
        SubState.user = user;
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
            console.warn('Subscription profile lookup failed:', error.message || error);
            SubState.profile = { id: user.id, display_name: user.email?.split('@')[0] || 'Reader', role: 'reader' };
        } else {
            SubState.profile = data;
        }
        await SubDB.getMyEntitlements();
    },

    syncAccountChip: () => {
        const chip = document.getElementById('sub-account-chip');
        if (!chip) return;
        if (!SubState.user) {
            chip.innerHTML = '<button type="button" data-sub-open-auth>Sign in</button>';
        } else {
            const name = SubState.profile?.display_name || SubState.user.email || 'Reader';
            const active = SubState.entitlements.filter(item => item.status === 'active' || item.is_active).length;
            chip.innerHTML = `<button type="button" data-sub-route="account"><span>${name}</span><em>${active ? `${active} active grant${active > 1 ? 's' : ''}` : 'Reader'}</em></button>`;
        }
    },

    setMode: (mode) => {
        SubState.authMode = mode;
        const title = document.getElementById('sub-auth-title');
        const submit = document.getElementById('sub-auth-submit');
        const toggle = document.getElementById('sub-auth-toggle');
        const password = document.getElementById('sub-auth-password');
        if (title) title.textContent = mode === 'signup' ? 'Join the library' : 'Sign in';
        if (submit) submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
        if (toggle) toggle.textContent = mode === 'signup' ? 'Already have access? Sign in.' : 'Need an account? Join the library.';
        if (password) password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
        SubUI.setInlineStatus('sub-auth-message', '');
    },

    toggleMode: () => SubAuth.setMode(SubState.authMode === 'signin' ? 'signup' : 'signin'),

    handleSubmit: async () => {
        const email = document.getElementById('sub-auth-email')?.value.trim();
        const password = document.getElementById('sub-auth-password')?.value;
        if (!email || !password) {
            SubUI.setInlineStatus('sub-auth-message', 'Enter both email and password.', 'error');
            return;
        }
        try {
            SubUI.setInlineStatus('sub-auth-message', 'Checking credentials...', 'info');
            const result = SubState.authMode === 'signup'
                ? await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: getAuthRedirectUrl() } })
                : await supabaseClient.auth.signInWithPassword({ email, password });
            if (result.error) throw result.error;
            SubUI.setInlineStatus('sub-auth-message', SubState.authMode === 'signup' ? 'Check your email to confirm the account.' : 'Signed in.', 'success');
        } catch (err) {
            SubUI.setInlineStatus('sub-auth-message', err.message || 'Authentication failed.', 'error');
        }
    },

    signOut: async () => {
        await supabaseClient.auth.signOut();
        SubUI.toast('Signed out of the member library.');
    }
};

```

---

## File Path: `js/subscription/db.js`

```javascript
import { supabaseClient, SubState, normalizeChapter } from './state.js';

const rpcOrFallback = async (rpcName, args, fallback) => {
    try {
        const { data, error } = await supabaseClient.rpc(rpcName, args);
        if (!error) return data;
        console.warn(`RPC ${rpcName} unavailable, using fallback:`, error.message || error);
    } catch (err) {
        console.warn(`RPC ${rpcName} failed, using fallback:`, err);
    }
    return fallback();
};

export const SubDB = {
    getStories: async () => {
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('is_published', true)
            .order('sort_order');
        if (error) throw error;
        SubState.stories = data || [];
        return SubState.stories;
    },

    getStoryBySlug: async (slug) => {
        const cached = SubState.stories.find(story => story.slug === slug);
        if (cached) return cached;
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();
        if (error) throw error;
        return data;
    },

    getChapterCatalog: async (storyId) => {
        const rows = await rpcOrFallback('get_chapter_catalog', { target_story_id: storyId }, async () => {
            const { data, error } = await supabaseClient
                .from('chapters')
                .select('id, story_id, title, chapter_order, word_count, created_at, updated_at, is_published')
                .eq('story_id', storyId)
                .eq('is_published', true)
                .order('chapter_order');
            if (error) throw error;
            return (data || []).map(chapter => ({ ...chapter, access_state: 'free', can_read: true }));
        });
        SubState.currentCatalog = (rows || []).map(normalizeChapter).sort((a, b) => a.chapter_order - b.chapter_order);
        return SubState.currentCatalog;
    },

    getReaderChapter: async (chapterId) => {
        const chapter = await rpcOrFallback('get_reader_chapter', { target_chapter_id: chapterId }, async () => {
            const { data, error } = await supabaseClient
                .from('chapters')
                .select('*')
                .eq('id', chapterId)
                .eq('is_published', true)
                .single();
            if (error) throw error;
            return { ...data, access_state: 'free', can_read: true };
        });
        return Array.isArray(chapter) ? chapter[0] : chapter;
    },

    getAccessTiers: async () => {
        const { data, error } = await supabaseClient
            .from('reader_access_tiers')
            .select('*')
            .eq('is_active', true)
            .order('tier_rank');
        if (error) {
            console.warn('Access tier table unavailable:', error.message || error);
            return [];
        }
        return data || [];
    },

    getMyEntitlements: async () => {
        if (!SubState.user) {
            SubState.entitlements = [];
            return [];
        }
        const rows = await rpcOrFallback('get_my_entitlements', {}, async () => {
            const { data, error } = await supabaseClient
                .from('user_entitlements')
                .select('*, reader_access_tiers(name, slug, tier_rank)')
                .eq('user_id', SubState.user.id)
                .order('created_at', { ascending: false });
            if (error) {
                console.warn('Entitlement table unavailable:', error.message || error);
                return [];
            }
            return data || [];
        });
        SubState.entitlements = rows || [];
        return SubState.entitlements;
    },

    redeemAccessKey: async (code) => {
        return rpcOrFallback('redeem_access_key', { submitted_code: code }, async () => {
            throw new Error('Access-key redemption is not deployed yet. Apply the subscription access SQL migration first.');
        });
    },

    requestPatreonSync: async () => {
        if (!SubState.user) throw new Error('Sign in before connecting Patreon.');
        try {
            const { data, error } = await supabaseClient.functions.invoke('patreon-oauth-start', {
                body: { returnTo: window.location.href }
            });
            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
                return data;
            }
            return data || { message: 'Patreon sync requested.' };
        } catch (err) {
            throw new Error(err.message || 'Patreon connection is not deployed yet.');
        }
    }
};

```

---

## File Path: `js/subscription/router.js`

```javascript
import { SubRender } from './render.js';
import { SubUI } from './ui.js';
import { SubState } from './state.js';

const parseHash = () => {
    const raw = (window.location.hash || '#/home').replace(/^#\/?/, '') || 'home';
    const [path, queryString = ''] = raw.split('?');
    const query = new URLSearchParams(queryString);
    return { parts: path.split('/').filter(Boolean), query };
};

export const SubRouter = {
    _token: 0,

    navigate: (path) => {
        window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\/?/, '')}`;
    },

    handle: async () => {
        const token = ++SubRouter._token;
        const { parts, query } = parseHash();
        const view = parts[0] || 'home';
        const stage = document.getElementById('sub-stage');
        SubUI.setActiveNav(view);
        if (stage) stage.classList.add('is-loading');
        if (query.get('return')) SubState.pendingReturnRoute = query.get('return');

        try {
            if (view === 'home') await SubRender.home();
            else if (view === 'library') await SubRender.library();
            else if (view === 'story') {
                const slug = parts[1];
                const section = parts[2];
                const id = parts[3];
                if (!slug) await SubRender.library();
                else if (section === 'chapters') await SubRender.chapters(slug);
                else if (section === 'chapter' && id) await SubRender.chapter(slug, id);
                else if (section === 'preview' && id) await SubRender.preview(slug, id);
                else await SubRender.story(slug);
            }
            else if (view === 'updates' || view === 'calendar') await SubRender.updates();
            else if (view === 'access') await SubRender.access(parts[1] || '');
            else if (view === 'account') await SubRender.account(parts[1] || '');
            else if (view === 'tiers') await SubRender.tiers();
            else if (view === 'tier') await SubRender.tiers(parts[1] || '');
            else if (view === 'help') await SubRender.help(parts[1] || 'access');
            else await SubRender.home();
        } catch (err) {
            console.error('Subscription route failed:', err);
            if (token === SubRouter._token) SubRender.error(err);
        } finally {
            if (token === SubRouter._token && stage) {
                stage.scrollTop = 0;
                stage.classList.remove('is-loading');
            }
        }
    }
};

```

---

## File Path: `js/subscription/ui.js`

```javascript
import { SubState, routeTo } from './state.js';
import { SubAuth } from './auth.js';

export const SubUI = {
    init: () => {
        document.body.addEventListener('click', (event) => {
            const routeButton = event.target.closest('[data-sub-route]');
            if (routeButton) {
                event.preventDefault();
                routeTo(routeButton.dataset.subRoute);
                return;
            }
            if (event.target.closest('[data-sub-open-auth]')) {
                event.preventDefault();
                SubUI.openAuthDialog();
            }
        });

        document.getElementById('sub-auth-submit')?.addEventListener('click', SubAuth.handleSubmit);
        document.getElementById('sub-auth-toggle')?.addEventListener('click', SubAuth.toggleMode);
    },

    setActiveNav: (view) => {
        document.querySelectorAll('[data-sub-route]').forEach(button => {
            const target = button.dataset.subRoute?.split('/')[0];
            button.classList.toggle('is-active', target === view || (view === 'story' && target === 'library'));
        });
    },

    setBack: (route = null, label = 'Back') => {
        const button = document.getElementById('sub-back-btn');
        if (!button) return;
        button.hidden = !route;
        button.innerHTML = `<i class="fas fa-arrow-left"></i><span>${label}</span>`;
        button.onclick = route ? () => routeTo(route) : null;
    },

    setAccent: (story) => {
        document.documentElement.style.setProperty('--accent-color', story?.theme_color || '#d8b55b');
        if (story?.background_image_url) {
            document.body.style.setProperty('--sub-story-bg', `url('${story.background_image_url}')`);
        } else {
            document.body.style.removeProperty('--sub-story-bg');
        }
    },

    openAuthDialog: () => {
        SubAuth.setMode(SubState.authMode || 'signin');
        const dialog = document.getElementById('sub-auth-dialog');
        if (dialog?.showModal) dialog.showModal();
        else dialog?.setAttribute('open', '');
    },

    closeAuthDialog: () => {
        const dialog = document.getElementById('sub-auth-dialog');
        if (dialog?.open) dialog.close();
    },

    toast: (message, type = 'info') => {
        const toast = document.getElementById('sub-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.dataset.type = type;
        toast.classList.add('is-visible');
        clearTimeout(SubUI._toastTimer);
        SubUI._toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
    },

    setInlineStatus: (id, message, type = 'info') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = message;
        el.dataset.type = type;
    },

    openReaderSheet: () => document.body.classList.add('sub-sheet-open'),
    closeReaderSheet: () => document.body.classList.remove('sub-sheet-open'),

    setReaderTheme: (theme) => {
        SubState.readerTheme = theme;
        localStorage.setItem('sub_reader_theme', theme);
        document.body.dataset.readerTheme = theme;
    },

    setReaderScale: (scale) => {
        SubState.readerScale = Math.max(0.85, Math.min(1.35, Number(scale) || 1));
        localStorage.setItem('sub_reader_scale', String(SubState.readerScale));
        document.documentElement.style.setProperty('--sub-reader-scale', SubState.readerScale);
    }
};

```

---

## File Path: `js/subscription/render.js`

```javascript
import { SubDB } from './db.js';
import { SubState, AccessLabels, safeText, safeAttr, routeTo, normalizeChapter } from './state.js';
import { SubUI } from './ui.js';
import { SubAuth } from './auth.js';

const stage = () => document.getElementById('sub-stage');

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const wordCount = (chapter) => chapter.word_count ? `${Number(chapter.word_count).toLocaleString()} words` : 'Member chapter';
const chapterNumber = (chapter) => Number(chapter.chapter_order || 0) + 1;

const accessBadge = (chapter) => {
    const label = chapter.required_tier_name || AccessLabels[chapter.access_state] || 'Member';
    return `<span class="sub-tier-badge" data-state="${safeAttr(chapter.access_state)}">${safeText(label)}</span>`;
};

const chapterAction = (story, chapter) => {
    if (chapter.can_read) return `<button class="sub-primary-btn" type="button" data-sub-route="story/${safeAttr(story.slug)}/chapter/${safeAttr(chapter.id)}">Read now</button>`;
    if (chapter.preview_text) return `<button class="sub-secondary-btn" type="button" data-sub-route="story/${safeAttr(story.slug)}/preview/${safeAttr(chapter.id)}">Read preview</button>`;
    return `<button class="sub-secondary-btn" type="button" data-sub-route="access?return=${encodeURIComponent(`story/${story.slug}/chapter/${chapter.id}`)}">Unlock</button>`;
};

const renderChapterCard = (story, chapter) => `
    <article class="sub-chapter-card ${chapter.can_read ? '' : 'is-locked'}">
        <div class="sub-card-meta">
            <span>Chapter ${chapterNumber(chapter)}</span>
            ${accessBadge(chapter)}
        </div>
        <h3>${safeText(chapter.title)}</h3>
        <p>${safeText(chapter.preview_text || (chapter.can_read ? 'Ready in your member library.' : 'This chapter is visible in the catalog and unlocks through membership or an access key.'))}</p>
        <div class="sub-chapter-footer">
            <span>${safeText(wordCount(chapter))}</span>
            ${chapterAction(story, chapter)}
        </div>
    </article>`;

const renderAccessStatus = () => {
    if (!SubState.user) {
        return `
            <section class="sub-status-card">
                <p class="sub-kicker">Access status</p>
                <h3>Guest reader</h3>
                <p>Sign in to check Patreon grants, redeem keys, and keep unlocked chapters attached to your account.</p>
                <button class="sub-primary-btn" type="button" data-sub-open-auth>Sign in</button>
            </section>`;
    }
    const active = SubState.entitlements.filter(item => item.status === 'active' || item.is_active);
    return `
        <section class="sub-status-card">
            <p class="sub-kicker">Access status</p>
            <h3>${active.length ? 'Member access active' : 'Reader account active'}</h3>
            <p>${active.length ? `${active.length} active entitlement${active.length > 1 ? 's' : ''} are attached to this account.` : 'No active paid/member entitlement is currently attached.'}</p>
            <button class="sub-secondary-btn" type="button" data-sub-route="account/entitlements">View entitlements</button>
        </section>`;
};

export const SubRender = {
    home: async () => {
        SubUI.setBack(null);
        SubUI.setAccent(null);
        const stories = await SubDB.getStories();
        stage().innerHTML = `
            <section class="sub-hero-panel">
                <div>
                    <p class="sub-kicker">Aether Member Library</p>
                    <h1>Read the newest transmissions without the heavy console noise.</h1>
                    <p>A lighter serial-fiction SPA for chapter releases, supporter access, Patreon syncing, and access-key unlocks.</p>
                    <div class="sub-action-row">
                        <button class="sub-primary-btn" type="button" data-sub-route="library">Browse library</button>
                        <button class="sub-secondary-btn" type="button" data-sub-route="access">Manage access</button>
                    </div>
                </div>
                ${renderAccessStatus()}
            </section>
            <section class="sub-section-heading">
                <div><p class="sub-kicker">Latest shelves</p><h2>Published stories</h2></div>
                <button class="sub-link-btn" type="button" data-sub-route="library">View all</button>
            </section>
            <div class="sub-story-grid">
                ${stories.slice(0, 6).map(story => SubRender.storyCard(story)).join('') || SubRender.empty('No published stories are available yet.')}
            </div>`;
    },

    library: async () => {
        SubUI.setBack('home', 'Home');
        SubUI.setAccent(null);
        const stories = await SubDB.getStories();
        stage().innerHTML = `
            <section class="sub-page-head">
                <p class="sub-kicker">Library</p>
                <h1>Choose a series</h1>
                <p>Story hubs stay spacious and reading-focused. Maps, galleries, and lore remain in the main archive.</p>
            </section>
            <div class="sub-story-grid">${stories.map(story => SubRender.storyCard(story)).join('') || SubRender.empty('No stories found.')}</div>`;
    },

    storyCard: (story) => `
        <article class="sub-story-card" style="--story-accent:${safeAttr(story.theme_color || '#d8b55b')}">
            <button type="button" data-sub-route="story/${safeAttr(story.slug)}" aria-label="Open ${safeAttr(story.title)}">
                <img src="${safeAttr(story.cover_image_url || '')}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'">
                <span class="sub-story-card-copy">
                    <span class="sub-kicker">${safeText(story.status || 'Story')}</span>
                    <strong>${safeText(story.title)}</strong>
                    <em>${safeText(story.short_description || story.genre || 'Open member chapter catalog')}</em>
                </span>
            </button>
        </article>`,

    story: async (slug) => {
        const story = await SubDB.getStoryBySlug(slug);
        SubState.currentStory = story;
        SubUI.setAccent(story);
        SubUI.setBack('library', 'Library');
        const catalog = await SubDB.getChapterCatalog(story.id);
        const lockedCount = catalog.filter(chapter => !chapter.can_read).length;
        stage().innerHTML = `
            <section class="sub-story-hero">
                <div class="sub-story-cover"><img src="${safeAttr(story.cover_image_url || '')}" alt="${safeAttr(story.title)} cover" fetchpriority="high" decoding="async" onerror="this.style.display='none'"></div>
                <div class="sub-story-hero-copy">
                    <p class="sub-kicker">${safeText(story.genre || 'Member serial')}</p>
                    <h1>${safeText(story.title)}</h1>
                    <p>${safeText(story.synopsis || story.short_description || 'Open the chapter shelf to begin reading.')}</p>
                    <div class="sub-story-facts">
                        <span>${catalog.length} chapters</span>
                        <span>${lockedCount} member locked</span>
                        <span>${safeText(story.status || 'Ongoing')}</span>
                    </div>
                    <div class="sub-action-row">
                        <button class="sub-primary-btn" type="button" data-sub-route="story/${safeAttr(slug)}/chapters">Open chapters</button>
                        <a class="sub-secondary-btn" href="index.html#/story/${safeAttr(slug)}">Main archive</a>
                    </div>
                </div>
            </section>
            <section class="sub-section-heading"><div><p class="sub-kicker">Chapter shelf</p><h2>Start reading</h2></div></section>
            <div class="sub-chapter-list">${catalog.slice(0, 4).map(chapter => renderChapterCard(story, chapter)).join('') || SubRender.empty('No published chapters yet.')}</div>`;
    },

    chapters: async (slug) => {
        const story = await SubDB.getStoryBySlug(slug);
        SubState.currentStory = story;
        SubUI.setAccent(story);
        SubUI.setBack(`story/${slug}`, 'Story');
        const catalog = await SubDB.getChapterCatalog(story.id);
        stage().innerHTML = `
            <section class="sub-page-head compact">
                <p class="sub-kicker">${safeText(story.title)}</p>
                <h1>Chapter shelf</h1>
                <p>Free chapters, previews, early-access releases, and member-locked entries live together so readers understand the whole release path.</p>
            </section>
            <div class="sub-chapter-list">${catalog.map(chapter => renderChapterCard(story, chapter)).join('') || SubRender.empty('No chapters are available yet.')}</div>`;
    },

    chapter: async (slug, chapterId) => {
        const story = await SubDB.getStoryBySlug(slug);
        SubState.currentStory = story;
        SubUI.setAccent(story);
        SubUI.setBack(`story/${slug}/chapters`, 'Chapters');
        let chapter;
        try {
            chapter = await SubDB.getReaderChapter(chapterId);
        } catch (err) {
            const catalog = await SubDB.getChapterCatalog(story.id);
            chapter = catalog.find(item => item.id === chapterId);
            if (!chapter) throw err;
        }
        if (!chapter?.id) throw new Error('Chapter not found.');
        chapter = normalizeChapter(chapter);
        if (!chapter.can_read || !chapter.content) {
            SubRender.accessGate(story, chapter);
            return;
        }
        const catalog = SubState.currentCatalog.length ? SubState.currentCatalog : await SubDB.getChapterCatalog(story.id);
        const currentIndex = catalog.findIndex(item => item.id === chapter.id);
        const previous = catalog[currentIndex - 1];
        const next = catalog[currentIndex + 1];
        const paragraphs = String(chapter.content || '').split('\n').filter(Boolean).map(p => `<p>${safeText(p)}</p>`).join('');
        stage().innerHTML = `
            <article class="sub-reader-page" data-theme="${safeAttr(SubState.readerTheme)}">
                <header class="sub-reader-head">
                    <p class="sub-kicker">${safeText(story.title)} · Chapter ${chapterNumber(chapter)}</p>
                    <h1>${safeText(chapter.title)}</h1>
                    ${accessBadge(chapter)}
                </header>
                <div class="sub-reader-content" style="font-size: calc(1.05rem * var(--sub-reader-scale, 1));">${paragraphs}</div>
                <footer class="sub-reader-footer">
                    ${previous ? `<button class="sub-secondary-btn" type="button" data-sub-route="story/${safeAttr(slug)}/chapter/${safeAttr(previous.id)}">Previous</button>` : '<span></span>'}
                    ${next ? `<button class="sub-primary-btn" type="button" data-sub-route="story/${safeAttr(slug)}/chapter/${safeAttr(next.id)}">Next</button>` : '<span></span>'}
                </footer>
            </article>
            ${SubRender.readerSheet()}
            <button class="sub-reader-fab" type="button" onclick="window.SubUI.openReaderSheet()"><i class="fas fa-sliders"></i><span>Reader</span></button>`;
    },

    preview: async (slug, chapterId) => {
        const story = await SubDB.getStoryBySlug(slug);
        SubUI.setAccent(story);
        SubUI.setBack(`story/${slug}/chapters`, 'Chapters');
        const catalog = await SubDB.getChapterCatalog(story.id);
        const chapter = catalog.find(item => item.id === chapterId);
        if (!chapter) throw new Error('Preview not found.');
        stage().innerHTML = `
            <section class="sub-access-gate">
                <p class="sub-kicker">Preview</p>
                <h1>${safeText(chapter.title)}</h1>
                <p>${safeText(chapter.preview_text || 'No preview is available for this chapter yet.')}</p>
                <div class="sub-action-row">
                    <button class="sub-primary-btn" type="button" data-sub-route="access?return=${encodeURIComponent(`story/${slug}/chapter/${chapter.id}`)}">Unlock full chapter</button>
                    <button class="sub-secondary-btn" type="button" data-sub-route="story/${safeAttr(slug)}/chapters">Back to chapters</button>
                </div>
            </section>`;
    },

    accessGate: (story, chapter) => {
        SubState.pendingReturnRoute = `story/${story.slug}/chapter/${chapter.id}`;
        stage().innerHTML = `
            <section class="sub-access-gate">
                <p class="sub-kicker">${safeText(AccessLabels[chapter.access_state] || 'Locked chapter')}</p>
                <h1>${safeText(chapter.title)}</h1>
                <p>${SubState.user ? `This chapter requires ${safeText(chapter.required_tier_name || 'member access')}. Connect Patreon, sync access, or redeem a key.` : 'Sign in to check access, connect Patreon, or redeem an access key.'}</p>
                ${accessBadge(chapter)}
                <div class="sub-action-row">
                    ${SubState.user ? '<button class="sub-primary-btn" type="button" data-sub-route="access/patreon">Connect Patreon</button>' : '<button class="sub-primary-btn" type="button" data-sub-open-auth>Sign in</button>'}
                    <button class="sub-secondary-btn" type="button" data-sub-route="access/key">Redeem key</button>
                </div>
            </section>`;
    },

    access: async (subRoute = '') => {
        SubUI.setAccent(null);
        SubUI.setBack('home', 'Home');
        if (subRoute === 'key') {
            stage().innerHTML = `
                <section class="sub-access-page">
                    <p class="sub-kicker">Access key</p>
                    <h1>Redeem a reader key</h1>
                    <p>Keys are for beta readers, gifts, reviewer access, campaign unlocks, and support recovery.</p>
                    <div class="sub-key-form">
                        <input id="sub-access-key-input" type="text" placeholder="XXXX-XXXX-XXXX" autocomplete="off">
                        <button class="sub-primary-btn" type="button" id="sub-redeem-key-btn">Redeem key</button>
                    </div>
                    <div id="sub-key-status" class="sub-inline-status"></div>
                </section>`;
            document.getElementById('sub-redeem-key-btn')?.addEventListener('click', async () => {
                if (!SubState.user) { SubUI.openAuthDialog(); return; }
                const code = document.getElementById('sub-access-key-input').value.trim();
                if (!code) { SubUI.setInlineStatus('sub-key-status', 'Enter an access key.', 'error'); return; }
                try {
                    SubUI.setInlineStatus('sub-key-status', 'Redeeming key...', 'info');
                    await SubDB.redeemAccessKey(code);
                    await SubDB.getMyEntitlements();
                    SubUI.toast('Access key redeemed.', 'success');
                    routeTo(SubState.pendingReturnRoute || 'access/success');
                } catch (err) {
                    SubUI.setInlineStatus('sub-key-status', err.message || 'Unable to redeem key.', 'error');
                }
            });
            return;
        }
        if (subRoute === 'patreon') {
            stage().innerHTML = `
                <section class="sub-access-page">
                    <p class="sub-kicker">Patreon</p>
                    <h1>Connect supporter access</h1>
                    <p>Patreon is the first production provider. The deployed Edge Function will verify membership and write normalized entitlements.</p>
                    <div class="sub-action-row">
                        <button class="sub-primary-btn" id="sub-patreon-connect" type="button">Connect Patreon</button>
                        <button class="sub-secondary-btn" type="button" data-sub-route="access/key">Redeem key instead</button>
                    </div>
                    <div id="sub-patreon-status" class="sub-inline-status"></div>
                </section>`;
            document.getElementById('sub-patreon-connect')?.addEventListener('click', async () => {
                if (!SubState.user) { SubUI.openAuthDialog(); return; }
                try {
                    SubUI.setInlineStatus('sub-patreon-status', 'Starting Patreon connection...', 'info');
                    await SubDB.requestPatreonSync();
                } catch (err) {
                    SubUI.setInlineStatus('sub-patreon-status', err.message, 'error');
                }
            });
            return;
        }
        if (subRoute === 'success') {
            stage().innerHTML = `<section class="sub-access-page"><p class="sub-kicker">Access updated</p><h1>Your library access is refreshed.</h1><button class="sub-primary-btn" type="button" data-sub-route="account/entitlements">View entitlements</button></section>`;
            return;
        }
        stage().innerHTML = `
            <section class="sub-page-head">
                <p class="sub-kicker">Access</p>
                <h1>Unlock member chapters</h1>
                <p>Use Patreon, access keys, or author-granted entitlements. Every provider becomes one normalized access grant.</p>
            </section>
            <div class="sub-access-grid">
                <article class="sub-access-option"><i class="fab fa-patreon"></i><h3>Patreon</h3><p>Connect supporter tiers through secure Edge Functions.</p><button class="sub-primary-btn" type="button" data-sub-route="access/patreon">Connect</button></article>
                <article class="sub-access-option"><i class="fas fa-key"></i><h3>Access key</h3><p>Redeem beta, gift, reviewer, or recovery keys.</p><button class="sub-secondary-btn" type="button" data-sub-route="access/key">Redeem</button></article>
                ${renderAccessStatus()}
            </div>`;
    },

    tiers: async (tierSlug = null) => {
        SubUI.setAccent(null);
        SubUI.setBack('home', 'Home');
        const tiers = await SubDB.getAccessTiers();
        const activeTier = tierSlug ? tiers.find(t => t.slug === tierSlug) : null;
        if (activeTier) {
            stage().innerHTML = `
                <section class="sub-access-page">
                    <p class="sub-kicker">Member tier</p>
                    <h1>${safeText(activeTier.name)}</h1>
                    <p>${safeText(activeTier.description || 'This internal access tier unlocks matching member chapters when granted by Patreon, access key, or manual authorization.')}</p>
                    <div class="sub-story-facts"><span>Rank ${activeTier.tier_rank}</span><span>${activeTier.is_active ? 'Active' : 'Inactive'}</span></div>
                    <div class="sub-action-row"><button class="sub-primary-btn" type="button" data-sub-route="access/patreon">Connect Patreon</button><button class="sub-secondary-btn" type="button" data-sub-route="tiers">All tiers</button></div>
                </section>`;
            return;
        }
        stage().innerHTML = `
            <section class="sub-page-head">
                <p class="sub-kicker">Tiers</p>
                <h1>Member access levels</h1>
                <p>Internal tiers are provider-neutral. Patreon, Ko-fi, PayPal, Discord, access keys, and manual grants all map into these same ranks.</p>
            </section>
            <div class="sub-access-grid">
                ${tiers.map(t => `<article class="sub-access-option"><i class="fas fa-layer-group"></i><h3>${safeText(t.name)}</h3><p>${safeText(t.description || `Rank ${t.tier_rank} access tier`)}</p><button class="sub-secondary-btn" type="button" data-sub-route="tier/${safeAttr(t.slug)}">Details</button></article>`).join('') || SubRender.empty('Access tiers will appear here after the subscription migration is configured.')}
            </div>`;
    },

    help: async (topic = 'access') => {
        SubUI.setAccent(null);
        SubUI.setBack('home', 'Home');
        const isPatreon = topic === 'patreon';
        stage().innerHTML = `
            <section class="sub-access-page">
                <p class="sub-kicker">Help</p>
                <h1>${isPatreon ? 'Patreon access help' : 'Access help'}</h1>
                <p>${isPatreon ? 'Connect Patreon from the Access page while signed in. The secure Edge Function verifies your Patreon membership, maps entitled tiers to internal reader tiers, and returns you to the member library.' : 'Locked chapters can open through a qualifying provider tier, a manual author grant, or a valid access key. Free chapters always remain readable without a supporter entitlement.'}</p>
                <div class="sub-action-row">
                    <button class="sub-primary-btn" type="button" data-sub-route="access">Manage access</button>
                    <button class="sub-secondary-btn" type="button" data-sub-route="access/key">Redeem key</button>
                </div>
            </section>`;
    },

    account: async (subRoute = '') => {
        SubUI.setAccent(null);
        SubUI.setBack('home', 'Home');
        await SubDB.getMyEntitlements();
        if (!SubState.user) {
            stage().innerHTML = `<section class="sub-access-gate"><p class="sub-kicker">Account</p><h1>Sign in to manage access.</h1><button class="sub-primary-btn" type="button" data-sub-open-auth>Sign in</button></section>`;
            return;
        }
        const rows = SubState.entitlements.map(item => {
            const tier = item.reader_access_tiers?.name || item.tier_name || item.source_label || 'Member access';
            const expiry = item.valid_until || item.expires_at;
            return `<li><strong>${safeText(tier)}</strong><span>${safeText(item.source || item.provider || 'manual')}</span><em>${expiry ? `Until ${formatDate(expiry)}` : 'No expiry listed'}</em></li>`;
        }).join('');
        stage().innerHTML = `
            <section class="sub-page-head compact">
                <p class="sub-kicker">Account</p>
                <h1>${safeText(SubState.profile?.display_name || SubState.user.email || 'Reader')}</h1>
                <p>Review linked access, redeemed keys, and provider sync status.</p>
            </section>
            <div class="sub-account-layout">
                <section class="sub-status-card"><h3>Profile</h3><p>${safeText(SubState.user.email || '')}</p><button class="sub-secondary-btn" type="button" onclick="window.SubAuth.signOut()">Sign out</button></section>
                <section class="sub-entitlement-card"><h3>Entitlements</h3><ul>${rows || '<li><strong>No active grants</strong><span>Connect Patreon or redeem a key.</span><em>Ready when you are</em></li>'}</ul></section>
            </div>`;
    },

    updates: async () => {
        SubUI.setAccent(null);
        SubUI.setBack('home', 'Home');
        const stories = await SubDB.getStories();
        const catalogs = await Promise.all(stories.slice(0, 4).map(async story => ({ story, chapters: await SubDB.getChapterCatalog(story.id) })));
        const latest = catalogs.flatMap(group => group.chapters.slice(-3).map(chapter => ({ ...chapter, story: group.story }))).sort((a, b) => b.chapter_order - a.chapter_order).slice(0, 10);
        stage().innerHTML = `
            <section class="sub-page-head"><p class="sub-kicker">Updates</p><h1>Recent chapter shelf</h1><p>A lightweight feed of published chapter catalog entries and member-lock status.</p></section>
            <div class="sub-update-list">${latest.map(item => `<article><span>${safeText(item.story.title)}</span><strong>${safeText(item.title)}</strong>${accessBadge(item)}<button class="sub-link-btn" type="button" data-sub-route="story/${safeAttr(item.story.slug)}/chapter/${safeAttr(item.id)}">Open</button></article>`).join('') || SubRender.empty('No updates yet.')}</div>`;
    },

    readerSheet: () => `
        <div class="sub-reader-sheet-backdrop" onclick="window.SubUI.closeReaderSheet()"></div>
        <aside class="sub-reader-sheet" aria-label="Reader controls">
            <button class="sub-dialog-close" type="button" onclick="window.SubUI.closeReaderSheet()">&times;</button>
            <p class="sub-kicker">Reader controls</p>
            <h3>Reading comfort</h3>
            <div class="sub-reader-controls">
                <button type="button" onclick="window.SubUI.setReaderTheme('dark')">Dark</button>
                <button type="button" onclick="window.SubUI.setReaderTheme('parchment')">Parchment</button>
                <button type="button" onclick="window.SubUI.setReaderTheme('contrast')">High contrast</button>
                <button type="button" onclick="window.SubUI.setReaderScale(window.SubState.readerScale - 0.05)">A-</button>
                <button type="button" onclick="window.SubUI.setReaderScale(window.SubState.readerScale + 0.05)">A+</button>
            </div>
        </aside>`,

    empty: (message) => `<div class="sub-empty-state"><i class="fas fa-moon"></i><p>${safeText(message)}</p></div>`,

    error: (err) => {
        stage().innerHTML = `<section class="sub-access-gate"><p class="sub-kicker">Library error</p><h1>Something drifted off course.</h1><p>${safeText(err.message || 'The member library could not load this route.')}</p><button class="sub-primary-btn" type="button" data-sub-route="home">Return home</button></section>`;
    }
};

```

---

