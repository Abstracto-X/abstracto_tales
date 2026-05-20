Viewed CODEBASE_ARCHITECTURE.md:192-202

Great question. Yeah, the docs are starting to show their age structurally. The core issue is that they were built as **flat reference sheets** — which was perfect when the project had 3 files and a handful of features. But now you've got map routing engines, cross-map search, cartographer hubs, sandbox moderation workflows… and every new feature just appends more lines to the same flat docs.

The problem this creates for me specifically:

**I read all 15-20k tokens at the start of every conversation**, even if you're asking me to fix a typo in the comments drawer. That's wasteful. 80% of what I load on any given task is irrelevant context.

---

### What I think the upgrade should look like

The key insight is that your docs serve **two distinct jobs** right now, and they're tangled together:

1. **Navigation** — "where is this thing and what's it called?"
2. **Understanding** — "how does this system work in detail?"

Navigation needs to be **always loaded and compact**. Understanding should be **loaded on-demand per task**.

---

### The structure I'd propose

**A slim spine doc** (~2-3k tokens max) that I always read. It covers:
- File purposes (one-liner each)
- Key conventions & patterns (toast pattern, auth pattern, error handling)
- A feature-to-doc routing table — literally just "if your task involves X, read `docs/features/X.md`"

**Per-feature detail docs** that I only load when relevant:
```
docs/
  OVERVIEW.md                    ← always read (~2k tokens)
  FUNCTION_INDEX.md              ← stays as a pure lookup table, but trimmed to name + one-liner
  DATABASE_CONTEXT.md            ← stays as-is (it's already a reference sheet)
  
  features/
    reader-navigation.md         ← Router, Render, Cache, Particles
    reader-maps.md               ← MapViewer, MapHub, cross-map search, routing engine
    reader-auth-social.md        ← UserAuth, CommentsManager, profiles
    admin-cms.md                 ← Views, Forms, Modal, DB CRUD
    cartographer.md              ← Hub, Editor, SaveManager, MapEngine, PathDrawer
    writer-ide.md                ← Tree, Quill, Inspector, snapshots
    lightsaber-loader.md         ← SaberController, anomaly loader component
```

### How this changes my workflow

**Before (now):** Read 15-20k tokens → grep → edit → update the same big docs

**After:** Read 2k overview → identify which feature doc I need → read just that 2-3k doc → grep → edit → update only the relevant feature doc

Total context per task drops from ~15-20k to ~5-8k. That's meaningful — it means I have more working memory left for actually reasoning about your code.

---

### One thing to be careful about

The `FUNCTION_INDEX.md` is currently pulling double duty as both a lookup table AND a changelog (those inline `[2026-05-17] FIX:` notes). Those historical notes are useful but they inflate the index. They could live in the feature docs instead, keeping the index strictly as a compact routing table.

---

### What I would NOT do

- Split `DATABASE_CONTEXT.md` — it's already a self-contained reference and the schema is interconnected enough that splitting by domain would cause more cross-referencing pain than it saves.
- Over-fragment the feature docs. Seven is probably the right number. More than that and I spend time figuring out *which* doc to open.

Want me to draft the new structure?