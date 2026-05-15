# 🔬 Performance & Optimization Audit — [index.html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html) SPA

> **Target:** Aether Archives Reader Frontend (2688-line Vanilla JS / HTML / CSS SPA)
> **Methodology:** Network vs. Main Thread bottleneck framework
> **Date:** 2026-03-25

---

## 1. Network & Data Fetching (Supabase Integration)

### 1.1 — `Cache` Object: Memory Leaks & Staleness

**Location:** [Cache object](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1337-L1340)

```js
const Cache = {
    stories: null,
    hubs: {} // grows unbounded
};
```

| Finding | Severity |
|---------|----------|
| **Unbounded growth** — `Cache.hubs` accumulates entries per slug with no eviction. A user navigating many stories leaks memory. | 🟡 Medium |
| **No TTL / staleness** — cached `hubs` data never expires. If the author publishes new content, returning users see stale data until hard-refresh. | 🟡 Medium |
| **No invalidation on auth state change** — vote caches, comments, and profile renders may be stale after sign-in/out. | 🟢 Low |

> [!IMPORTANT]
> **Recommendation:** Implement an LRU-cache with a configurable TTL (e.g. 5 min slot). For a lightweight solution, timestamp each cache entry and check freshness on read. Cap `Cache.hubs` to ~5 entries to prevent unbounded memory growth.

---

### 1.2 — `DB.getStoryHubData`: N+1 Query Waterfall

**Location:** [getStoryHubData](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1378-L1420)

The initial `Promise.all` on line 1391 is well-structured — 5 parallel queries execute concurrently. **However**, the immediately following loop on **line 1401** introduces a classic **N+1 waterfall**:

```js
for (let event of timelineEvents) {                     // ← serial loop
    const { data: charLinks } = await supabaseClient     // ← await per event
        .from('timeline_event_characters')
        .select('character_id, characters(...)')
        .eq('event_id', event.id);
    event.characters = charLinks ? charLinks.map(cl => cl.characters) : [];
}
```

For 20 timeline events, this fires **20 sequential HTTP requests** taking ~2-4 seconds on 3G.

> [!CAUTION]
> **Critical fix:** Replace the serial loop with a single batched query:
> ```js
> const eventIds = timelineEvents.map(e => e.id);
> const { data: allCharLinks } = await supabaseClient
>     .from('timeline_event_characters')
>     .select('event_id, character_id, characters(...)')
>     .in('event_id', eventIds);
>
> // Group by event_id in JS
> timelineEvents.forEach(event => {
>     event.characters = (allCharLinks || [])
>         .filter(cl => cl.event_id === event.id)
>         .map(cl => cl.characters);
> });
> ```
> This reduces N+1 to **1 query** regardless of event count.

---

### 1.3 — Missing Data Pre-fetching for Predictable Navigation

**Finding:** The `Router.navigate()` method only initiates a CSS fade-out (400ms delay) before changing the hash. No data pre-fetching occurs during this window.

```js
navigate: (h) => {
    document.getElementById('content-stage').style.opacity = '0';
    setTimeout(() => window.location.hash = h, 400);  // wasted 400ms
}
```

> [!TIP]
> **Recommendation:** Use the 400ms fade-out window to start fetching the target route's data:
> ```js
> navigate: (h) => {
>     document.getElementById('content-stage').style.opacity = '0';
>     // Pre-fetch based on target route
>     const parts = h.split('/');
>     if (parts[0] === 'story' && parts[1]) DB.getStoryHubData(parts[1]);
>     setTimeout(() => window.location.hash = h, 400);
> }
> ```
> This effectively hides network latency behind the transition animation.

---

### 1.4 — `LorePrefetcher.init()` Blocks Initialization

**Location:** [DOMContentLoaded](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2677-L2684)

```js
window.addEventListener('DOMContentLoaded', async () => {
    await LorePrefetcher.init(); // ← BLOCKS everything
    UserAuth.init();
    Router.handle();
    // ...
});
```

`LorePrefetcher.init()` is `await`ed before UserAuth and initial route rendering. The lore data **is purely cosmetic** (loading screen garnish), yet it delays the critical rendering path by 200-500ms.

> [!WARNING]
> **Fix:** Remove `await` — fire it non-blocking:
> ```js
> LorePrefetcher.init(); // fire-and-forget
> UserAuth.init();
> Router.handle();
> ```

---

### 1.5 — [getAuthorProfile](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1355-1376): Sequential Waterfall

**Location:** [getAuthorProfile](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1355-L1375)

The two queries (profile + links) run sequentially. The links query depends on `profile.id`, so they can't fully parallelize — but this function **is never cached**. Repeated visits to `#home` re-fetch both queries.

> **Recommendation:** Cache the author profile in `Cache`, or use a Supabase relational join (if the schema permits) to fetch both in one query.

---

## 2. Main Thread Execution & DOM Manipulation

### 2.1 — innerHTML-Based Full-View Swaps

**Location:** Every `Render.*` method (e.g., [Render.home](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2230), [Render.reader](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2418))

Each route change assigns `Render.stage.innerHTML = html` where [html](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html) is a massive concatenated string. This forces the browser to:

1. **Parse** the entire HTML string
2. **Destroy** the existing DOM tree (GC pressure)
3. **Construct** a new DOM tree
4. **Recalculate** all styles
5. **Trigger** a full layout/reflow

| Metric | Impact |
|--------|--------|
| Longest Interaction to Next Paint (INP) | 🔴 High — string concatenation + full reparse |
| Garbage Collection pauses | 🟡 Medium — old nodes become garbage every route change |
| Time to Interactive | 🟡 Medium — blocks main thread during parsing |

> [!IMPORTANT]
> **Recommended mitigations (no framework required):**
> 1. Use `DocumentFragment` or `template.content.cloneNode(true)` for complex views
> 2. Use `insertAdjacentHTML('beforeend', chunk)` to append in batches for list views
> 3. For the gallery grid (which can have 50+ images), consider a `requestIdleCallback` chunking strategy

---

### 2.2 — `mousemove` Event: Dynamic Transparency

**Location:** [initDynamicTransparency](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1050-L1078)

The implementation **already uses `requestAnimationFrame` gating** (the `ticking` flag pattern), which is positive. However:

| Issue | Detail |
|-------|--------|
| **`e.target.closest()` on every frame** | Two `.closest()` DOM traversals per animation frame (~16ms budget). These trigger layout checks. |
| **Filter + brightness calculations** | `bgLayer.style.filter` changes trigger full composited layer repaint each frame |
| **Never unbound** | The `mousemove` listener is attached once globally and never removed, even on mobile where it's not used |

> **Recommendation:** 
> - Cache the `closest` result and debounce the background filter changes to every ~100ms instead of every rAF tick
> - Use CSS `will-change: filter` on `.background-layer` to hint to the compositor
> - Store handler reference so it can be removed if needed

---

### 2.3 — Card Tilt `mousemove` per Card

**Location:** [initCardTilt](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1079-L1092)

Each `.char-card` gets its own `mousemove` + `mouseleave` listener. For 20+ characters, this is 40+ listeners. The `requestAnimationFrame` wrapper is smart, but:

> [!NOTE]
> **Better pattern:** Use a **single delegated listener** on the `.char-grid` parent:
> ```js
> charGrid.addEventListener('mousemove', (e) => {
>     const card = e.target.closest('.char-card');
>     if (!card) return;
>     requestAnimationFrame(() => { /* tilt logic */ });
> });
> ```
> This reduces from N listeners to 1, and is automatically cleaned up when the view is swapped.

---

### 2.4 — Particle Engine: Unintentional Immortality

**Location:** [Particles.init()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1025-L1044)

```js
function animate() {
    ctx.clearRect(0,0, width, height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);  // ← never stops
}
```

The animation loop runs **forever** with no visibility checks. When the tab is backgrounded, `requestAnimationFrame` throttles naturally, but  it never fully stops. Additionally, only ~30 particles are drawn, so the actual performance cost here is low.

> **Recommendation (low priority):** Add `document.visibilitychange` listener to pause when tab is hidden. Also store the rAF ID so it can be cancelled during page teardown if needed.

---

## 3. Memory Management & Lifecycle

### 3.1 — MapViewer Event Listener Leak

**Location:** [MapViewer.init()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1227-L1247) vs [MapViewer.destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1248-L1251)

[init()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1184-1191) attaches 7 event listeners. [destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1248-1252) only removes **2 of 7**:

| Listener | Added in [init()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1184-1191) | Removed in [destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1248-1252) |
|----------|:-:|:-:|
| `viewer.mousedown` | ✅ | ❌ |
| `window.mousemove` | ✅ | ✅ |
| `window.mouseup` | ✅ | ✅ |
| `viewer.wheel` | ✅ | ❌ |
| `viewer.touchstart` | ✅ | ❌ |
| `viewer.touchmove` | ✅ | ❌ |
| `viewer.touchend` | ✅ | ❌ |

> [!CAUTION]
> The viewer-local listeners (`mousedown`, `wheel`, `touchstart/move/end`) are **lost** when the DOM node is destroyed via `innerHTML` swap. Since event listeners hold closures that reference `MapViewer.viewer` and `MapViewer.canvas`, each navigation to the maps view creates **ghost closures** pointing to dead DOM nodes.
>
> **Fix:** Update [destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1248-1252) to remove all 7 listeners. Better yet, use an `AbortController` signal for all listeners attached in [init()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1184-1191), then call `controller.abort()` in [destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1248-1252).

---

### 3.2 — `URL.createObjectURL` Memory Leak

**Location:** [uploadAvatar](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1670)

```js
const previewUrl = URL.createObjectURL(file);
document.getElementById('profile-avatar-preview').src = previewUrl;
// Never calls URL.revokeObjectURL(previewUrl)
```

Each avatar upload creates a blob URL that is never revoked, causing a small but accumulating memory leak.

> **Fix:** Revoke after the image loads:
> ```js
> const img = document.getElementById('profile-avatar-preview');
> img.onload = () => URL.revokeObjectURL(previewUrl);
> img.src = previewUrl;
> ```

---

### 3.3 — Global Comment Button [onclick](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1245-1246) Re-binding

**Location:** Multiple views ([reader L2415](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2415), [gallery L2339](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2339), [loreDetail L2506](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2506))

```js
globalBtn.onclick = () => CommentsManager.openDrawer(charId, 'gallery', ...);
```

Each view re-assigns [onclick](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1245-1246), creating a new closure each time. Previous closures may still hold references to old route context. While [onclick](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1245-1246) assignment replaces the old handler (so there's no listener accumulation), the closure captures variables like `charId` and `character.name` from the render scope.

> **Low severity** — no listener leak, but worth noting for clarity.

---

### 3.4 — Route Transition Cleanup Gaps

**Location:** [Router.handle()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L2627-L2670)

The cleanup in `Router.handle()` does call `CommentsManager.closeDrawer()` and `MapViewer.destroy()`, which is good. However:

- The `Visuals.initCardTilt()` per-card listeners are **not** cleaned up (they get garbage-collected when DOM nodes are replaced, but the GC timing is unpredictable)
- `Actions.currentGalleryImages` and `Actions.votesCache` persist indefinitely across route changes
- `State.currentChars` accumulates the last loaded character set with no cleanup

> **Recommendation:** Add a cleanup hook at the top of `Router.handle()`:
> ```js
> Actions.currentGalleryImages = [];
> Actions.votesCache = {};
> ```

---

## 4. Asset Delivery & Rendering

### 4.1 — `loading="lazy"` Usage Audit

| View | Implementation | Assessment |
|------|---------------|------------|
| Home (story cards) | `loading="lazy"` on cover images | 🟡 **Wrong** — above-the-fold hero cards should use `loading="eager"` or `fetchpriority="high"` |
| Gallery grid | `loading="lazy"` on all images | ✅ Correct for below-the-fold masonry grid |
| Character cards | `loading="lazy"` on portraits | 🟡 First 4-6 cards visible on load should be eager |
| Lore cards | `loading="lazy"` on images | 🟡 Same issue — first row visible immediately |

> **Recommendation:** For grid views, use `loading="eager"` (or omit the attribute) on the **first N items** that are initially visible. A simple heuristic:
> ```js
> stories.forEach((s, idx) => {
>     const lazy = idx < 4 ? '' : 'loading="lazy"';
>     html += `<img src="${s.cover_image_url}" ${lazy}>`;
> });
> ```

---

### 4.2 — Canvas Particle Engine: Compositing Cost

The `<canvas id="particle-canvas">` is positioned `fixed` with `z-index: -1`. It repaints every frame. This creates a **separate composited layer** that the GPU must composite with every other layer.

Cost: ~0.5ms per frame on desktop, ~2-4ms on low-end mobile.

> **Low priority** — 30 particles is efficient. If needed, reduce to `requestAnimationFrame` every other frame on mobile.

---

### 4.3 — CSS `backdrop-filter: blur(20px)` Performance

**Location:** [.glass-box](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L63)

```css
.glass-box {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
```

Every `.glass-box` element triggers a GPU compositing operation. The app uses `glass-box` extensively — story hub layout, reader content, header, lore cards, timeline content, etc. Each instance creates its own composited layer.

| Metric | Impact |
|--------|--------|
| GPU memory usage | 🟡 Medium — each layer occupies VRAM |
| Compositing time | 🟡 Medium — multiple blur passes per frame |
| Low-end device FPS | 🔴 High — can drop to 30fps on budget Android |

> [!WARNING]
> **Recommendations:**
> 1. **Reduce blur radius** from `20px` to `10-12px` (halves GPU work)
> 2. **Limit glass-box usage** — apply only to floating/overlay elements (header, modals, drawer). Use a simple semi-transparent `background` for static content containers
> 3. **Add `will-change: backdrop-filter`** ONLY to elements that animate

---

### 4.4 — Render-Blocking Resources in `<head>`

**Location:** [Head tag](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L3-L15)

```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

Both Google Fonts and Font Awesome CSS are **render-blocking**. The browser cannot paint until these are downloaded and parsed.

> **Recommendations:**
> 1. Add `font-display: swap` via the Google Fonts URL parameter: `&display=swap` (already present ✅)
> 2. **Preconnect** to external origins:
>    ```html
>    <link rel="preconnect" href="https://fonts.googleapis.com">
>    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
>    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
>    ```
> 3. Consider **loading Font Awesome asynchronously** (it's only used for icons, not critical first paint):
>    ```html
>    <link rel="stylesheet" href="..." media="print" onload="this.media='all'">
>    ```

---

### 4.5 — Supabase SDK: Large Blocking Script

**Location:** [Supabase CDN import](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#L1010)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

This is a **synchronous, parser-blocking script** (~80KB gzipped). It blocks HTML parsing until fully downloaded and executed.

> **Recommendation:** Add `defer` or move after the body. Since the inline `<script>` depends on `window.supabase`, the simplest fix is:
> ```html
> <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
> ```
> However, the inline script runs before `DOMContentLoaded`, so `defer` works naturally since DOMContentLoaded fires after deferred scripts execute.

---

## 5. Prioritized Recommendation Matrix

Ranked by **impact on Core Web Vitals** vs. **implementation effort**:

| # | Recommendation | CWV Impact | Effort | Metric |
|---|---|----|----|----|
| 1 | Fix N+1 waterfall in [getStoryHubData](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1377-1421) timeline loop | 🔴 **High** | 🟢 Low | LCP, TTFB |
| 2 | Remove `await` from `LorePrefetcher.init()` | 🔴 **High** | 🟢 Low | FCP, LCP |
| 3 | Pre-fetch data during 400ms route fade-out | 🟡 **Medium** | 🟢 Low | LCP |
| 4 | Add `preconnect` hints for CDN origins | 🟡 **Medium** | 🟢 Low | FCP, TTFB |
| 5 | Fix MapViewer event listener leak (full [destroy()](file:///c:/Users/admis/OneDrive/Documents/GitHub/abstracto_tales/index.html#1248-1252)) | 🟡 **Medium** | 🟢 Low | Memory / INP |
| 6 | Set `loading="eager"` on first N visible images | 🟡 **Medium** | 🟢 Low | LCP |
| 7 | Revoke `ObjectURL` after avatar upload | 🟢 **Low** | 🟢 Low | Memory |
| 8 | Delegate card tilt to single parent listener | 🟡 **Medium** | 🟡 Medium | INP |
| 9 | Reduce `backdrop-filter` blur from 20px to 10px | 🟡 **Medium** | 🟢 Low | CLS, FPS |
| 10 | Implement TTL + LRU for `Cache.hubs` | 🟡 **Medium** | 🟡 Medium | Correctness |
| 11 | Cache author profile data | 🟢 **Low** | 🟢 Low | LCP (home) |
| 12 | Load Font Awesome asynchronously | 🟡 **Medium** | 🟡 Medium | FCP |
| 13 | Pause particle engine on `document.hidden` | 🟢 **Low** | 🟢 Low | Battery / CPU |
| 14 | Chunk gallery grid rendering via `requestIdleCallback` | 🟡 **Medium** | 🔴 High | INP, TBT |
| 15 | Replace `innerHTML` swaps with `DocumentFragment` | 🟡 **Medium** | 🔴 High | INP, TBT |

> [!NOTE]
> **Quick wins (items 1-7)** can be implemented in ~1-2 hours and will measurably improve FCP, LCP, and memory stability. Items 8-15 are architectural improvements for long-term maintainability.
