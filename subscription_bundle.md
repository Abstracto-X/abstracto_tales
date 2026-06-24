# Subscription SPA Consolidated Code Bundle

This file contains the complete source code of the Subscription SPA files (HTML, CSS, and JS modules) for easy auditing or ingestion by an external AI.

## File Path: `subscription.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Aether Library - Member Reader</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
    <link rel="preconnect" href="https://gdivyqfhgashkqcqqnas.supabase.co" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media='all'">
    <link rel="stylesheet" href="subscription.css">
</head>
<body class="subscription-body">
    <div class="sub-bg-orb sub-bg-orb-one"></div>
    <div class="sub-bg-orb sub-bg-orb-two"></div>

    <div id="subscription-app" class="subscription-app-shell">
        <aside class="sub-desktop-rail" aria-label="Subscription reader navigation">
            <button class="sub-brand" type="button" data-sub-route="home" aria-label="Aether Library home">
                <span>A</span>
            </button>
            <nav class="sub-rail-nav">
                <button type="button" data-sub-route="library"><i class="fas fa-book-open"></i><span>Library</span></button>
                <button type="button" data-sub-route="updates"><i class="fas fa-clock"></i><span>Updates</span></button>
                <button type="button" data-sub-route="access"><i class="fas fa-key"></i><span>Access</span></button>
                <button type="button" data-sub-route="account"><i class="fas fa-user-astronaut"></i><span>Account</span></button>
            </nav>
        </aside>

        <main class="sub-main-shell">
            <header class="sub-topbar">
                <button class="sub-back" id="sub-back-btn" type="button" hidden><i class="fas fa-arrow-left"></i><span>Back</span></button>
                <button class="sub-wordmark" type="button" data-sub-route="home">
                    <span class="sub-kicker">Aether</span>
                    <strong>Member Library</strong>
                </button>
                <div class="sub-account-chip" id="sub-account-chip">Checking session...</div>
            </header>

            <section id="sub-stage" class="sub-stage" aria-live="polite">
                <div class="sub-loading-card">Opening the member library...</div>
            </section>
        </main>

        <nav class="sub-bottom-nav" aria-label="Subscription reader mobile navigation">
            <button type="button" data-sub-route="library"><i class="fas fa-book-open"></i><span>Library</span></button>
            <button type="button" data-sub-route="updates"><i class="fas fa-clock"></i><span>Updates</span></button>
            <button type="button" data-sub-route="access"><i class="fas fa-key"></i><span>Access</span></button>
            <button type="button" data-sub-route="account"><i class="fas fa-user-astronaut"></i><span>Account</span></button>
        </nav>
    </div>

    <div id="sub-toast" class="sub-toast" role="status" aria-live="polite"></div>

    <dialog id="sub-auth-dialog" class="sub-dialog">
        <form method="dialog" class="sub-dialog-card">
            <button class="sub-dialog-close" value="cancel" aria-label="Close">&times;</button>
            <p class="sub-kicker">Reader account</p>
            <h2 id="sub-auth-title">Sign in</h2>
            <div id="sub-auth-message" class="sub-inline-status"></div>
            <label>Email <input id="sub-auth-email" type="email" autocomplete="email" placeholder="reader@example.com"></label>
            <label>Password <input id="sub-auth-password" type="password" autocomplete="current-password" placeholder="••••••••"></label>
            <button id="sub-auth-submit" class="sub-primary-btn" type="button">Sign in</button>
            <button id="sub-auth-toggle" class="sub-link-btn" type="button">Need an account? Join the library.</button>
        </form>
    </dialog>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module" src="js/subscription/main.js"></script>
</body>
</html>

```

---

## File Path: `subscription.css`

```css
/* --- CORE VARIABLES --- */
:root {
    --primary-color: #ffffff;
    --accent-color: #ffd700;
    --success-color: #4caf50;
    --danger-color: #ff6b6b;
    --font-header: 'Cinzel', serif;
    --font-body: 'Lora', serif;
    --font-ui: 'Montserrat', sans-serif;
    
    /* Subscription specific tokens */
    --sub-bg: #07090e;
    --sub-surface: rgba(255, 255, 255, 0.04);
    --sub-surface-strong: rgba(255, 255, 255, 0.08);
    --sub-text: #f5f1e8;
    --sub-muted: rgba(245, 241, 232, 0.62);
    --sub-border: rgba(255, 255, 255, 0.1);
    --sub-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    --sub-transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* --- BASE RESET & SYSTEM STYLES --- */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}
input, button, select, textarea {
    font-family: inherit;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color);
}

/* --- SUBSCRIPTION BODY --- */
.subscription-body {
    background-color: var(--sub-bg);
    background-image: 
        linear-gradient(135deg, rgba(7, 9, 14, 0.95), rgba(15, 11, 20, 0.92)),
        var(--sub-story-bg, radial-gradient(circle at top left, rgba(216, 181, 91, 0.1), transparent 40%));
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: var(--sub-text);
    min-height: 100vh;
    font-family: var(--font-ui);
    overflow: hidden; /* Main viewport static, internal scrolling */
    user-select: text; /* Allow text highlighting for readers */
}

/* --- BACKGROUND ORBS --- */
.sub-bg-orb {
    position: fixed;
    width: 45vw;
    aspect-ratio: 1;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(140px);
    opacity: 0.15;
    z-index: 0;
}
.sub-bg-orb-one {
    left: -15vw;
    top: -15vh;
    background: var(--accent-color);
}
.sub-bg-orb-two {
    right: -15vw;
    bottom: -15vh;
    background: #4f8cfc;
}

/* --- APP SHELL LAYOUT --- */
.subscription-app-shell {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 84px 1fr;
    height: 100vh;
    width: 100%;
}

/* Sidebar Rail (Desktop) */
.sub-desktop-rail {
    border-right: 1px solid var(--sub-border);
    background: rgba(7, 9, 14, 0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0.8rem;
    gap: 2rem;
    z-index: 10;
}

.sub-brand {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--accent-color) 40%, var(--sub-border));
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
    color: var(--accent-color);
    font: 700 1.5rem var(--font-header);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: var(--sub-transition);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.sub-brand:hover {
    transform: translateY(-2px);
    border-color: var(--accent-color);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.25);
}

.sub-rail-nav {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
}
.sub-rail-nav button {
    height: 64px;
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--sub-muted);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    border-radius: 12px;
    font: 600 0.65rem var(--font-ui);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: var(--sub-transition);
}
.sub-rail-nav button i {
    font-size: 1.15rem;
    transition: var(--sub-transition);
}
.sub-rail-nav button:hover {
    color: var(--accent-color);
    background: rgba(255, 255, 255, 0.03);
}
.sub-rail-nav button:hover i {
    transform: scale(1.1);
}
.sub-rail-nav button.is-active {
    background: color-mix(in srgb, var(--accent-color) 12%, rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 215, 0, 0.15);
    color: var(--accent-color);
    box-shadow: inset 0 0 12px rgba(255, 215, 0, 0.05);
}

/* Main Area Container */
.sub-main-shell {
    height: 100vh;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
    background: transparent;
}

/* Top bar navigation */
.sub-topbar {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0 clamp(1.5rem, 4vw, 3rem);
    border-bottom: 1px solid var(--sub-border);
    background: rgba(7, 9, 14, 0.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 5;
}

.sub-back {
    height: 40px;
    padding: 0 1.1rem;
    border-radius: 99px;
    border: 1px solid var(--sub-border);
    background: rgba(255, 255, 255, 0.03);
    color: var(--sub-muted);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font: 700 0.72rem var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: var(--sub-transition);
}
.sub-back:hover {
    color: var(--accent-color);
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(-2px);
}

.sub-wordmark {
    border: 0;
    background: transparent;
    color: var(--sub-text);
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    transition: var(--sub-transition);
}
.sub-wordmark:hover {
    opacity: 0.9;
}
.sub-wordmark strong {
    font: 700 1.15rem var(--font-header);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: linear-gradient(to right, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.sub-kicker {
    color: var(--accent-color);
    font: 800 0.7rem var(--font-ui);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin: 0 0 0.2rem;
}

.sub-account-chip {
    font: 600 0.75rem var(--font-ui);
    color: var(--sub-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.sub-account-chip button {
    border: 0;
    background: transparent;
    color: var(--sub-text);
    cursor: pointer;
    text-align: right;
    display: flex;
    flex-direction: column;
    font-family: var(--font-ui);
    transition: var(--sub-transition);
}
.sub-account-chip button:hover {
    color: var(--accent-color);
}
.sub-account-chip em {
    font-style: normal;
    color: var(--accent-color);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* Stage Area (Dynamic Content Panel) */
.sub-stage {
    overflow-y: auto;
    padding: clamp(1.5rem, 4vw, 3.5rem);
    padding-bottom: calc(3rem + env(safe-area-inset-bottom));
    scroll-behavior: smooth;
    transition: opacity 0.2s ease;
}
.sub-stage.is-loading {
    opacity: 0.55;
}

/* --- PREMIUM CARD DESIGN SYSTEM --- */
.sub-loading-card, 
.sub-empty-state, 
.sub-status-card, 
.sub-access-option, 
.sub-entitlement-card, 
.sub-access-gate, 
.sub-access-page, 
.sub-hero-panel, 
.sub-story-hero, 
.sub-story-card, 
.sub-chapter-card {
    border: 1px solid var(--sub-border);
    background: rgba(255, 255, 255, 0.03);
    box-shadow: var(--sub-shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 20px;
    transition: var(--sub-transition);
}

.sub-loading-card,
.sub-empty-state,
.sub-status-card,
.sub-access-option,
.sub-entitlement-card,
.sub-access-gate,
.sub-chapter-card {
    padding: 1.8rem;
}

.sub-chapter-card:hover, 
.sub-access-option:hover, 
.sub-status-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 215, 0, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.03);
}

.sub-empty-state {
    text-align: center;
    color: var(--sub-muted);
}
.sub-empty-state i {
    font-size: 2rem;
    margin-bottom: 0.8rem;
    color: var(--accent-color);
}


/* Hero Panel (Main Landing Screen) */
.sub-hero-panel {
    display: grid;
    grid-template-columns: 1fr minmax(300px, 400px);
    gap: 2.5rem;
    padding: clamp(2rem, 5vw, 4rem);
    align-items: center;
    margin-bottom: 2.5rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
    border-color: rgba(255, 255, 255, 0.08);
}
.sub-hero-panel h1, 
.sub-page-head h1, 
.sub-story-hero h1, 
.sub-access-gate h1, 
.sub-access-page h1 {
    font-family: var(--font-header);
    font-size: clamp(2.2rem, 5vw, 4rem);
    line-height: 1.1;
    margin: 0 0 1.2rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.sub-hero-panel p, 
.sub-page-head p, 
.sub-story-hero p, 
.sub-access-gate p, 
.sub-access-page p {
    color: var(--sub-muted);
    font-size: 1rem;
    line-height: 1.7;
    margin: 0;
}

/* Action Row */
.sub-action-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1.8rem;
}

/* Centralized Button Components */
.sub-primary-btn, 
.sub-secondary-btn, 
.sub-link-btn {
    min-height: 48px;
    border-radius: 99px;
    padding: 0.8rem 1.8rem;
    font: 700 0.72rem var(--font-ui);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: var(--sub-transition);
}
.sub-primary-btn {
    border: 1px solid var(--accent-color);
    background: var(--accent-color);
    color: #07090e;
    box-shadow: 0 4px 14px rgba(255, 215, 0, 0.25);
}
.sub-primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4), 0 0 12px rgba(255, 215, 0, 0.2);
    background: #ffe359;
    border-color: #ffe359;
}
.sub-primary-btn:active {
    transform: translateY(0);
}
.sub-secondary-btn {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: var(--sub-text);
}
.sub-secondary-btn:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}
.sub-secondary-btn:active {
    transform: translateY(0);
}
.sub-link-btn {
    border: 0;
    background: transparent;
    color: var(--accent-color);
    padding: 0.5rem 1rem;
    letter-spacing: 0.08em;
}
.sub-link-btn:hover {
    color: #ffe359;
    transform: translateX(2px);
}

/* Page Headers & Headings */
.sub-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin: 3rem 0 1.5rem;
}
.sub-section-heading h2 {
    font-family: var(--font-header);
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
}
.sub-page-head {
    max-width: 820px;
    margin: 0 0 2rem;
}
.sub-page-head.compact h1 {
    font-size: clamp(1.8rem, 4vw, 3rem);
}

/* Story Grid */
.sub-story-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.8rem;
}

/* Story Card */
.sub-story-card {
    overflow: hidden;
    border-color: rgba(255, 255, 255, 0.08);
    position: relative;
    background: linear-gradient(135deg, rgba(30, 20, 45, 0.5), rgba(15, 20, 30, 0.5));
}
.sub-story-card::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 20px;
    border: 1px solid var(--story-accent, var(--accent-color));
    opacity: 0.15;
    pointer-events: none;
    transition: var(--sub-transition);
}
.sub-story-card:hover::after {
    opacity: 0.5;
}
.sub-story-card button {
    width: 100%;
    min-height: 360px;
    text-align: left;
    border: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.85) 85%);
    color: var(--sub-text);
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    transition: var(--sub-transition);
}
.sub-story-card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    opacity: 0.8;
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.6s ease;
}
.sub-story-card:hover img {
    transform: scale(1.06);
    opacity: 0.95;
}
.sub-story-card-copy {
    display: grid;
    gap: 0.4rem;
}
.sub-story-card-copy strong {
    font: 700 1.4rem var(--font-header);
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    line-height: 1.2;
}
.sub-story-card-copy em {
    color: var(--sub-muted);
    font-style: normal;
    font-size: 0.85rem;
    line-height: 1.45;
}

/* Story Detail Hero Panel */
.sub-story-hero {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 2.5rem;
    padding: 2.2rem;
    align-items: flex-start;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border-color: rgba(255, 255, 255, 0.06);
}
.sub-story-cover img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 14px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: var(--sub-transition);
}
.sub-story-cover img:hover {
    transform: scale(1.02);
}
.sub-story-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.2rem;
}
.sub-story-facts span, 
.sub-tier-badge {
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--sub-text);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 99px;
    padding: 0.4rem 0.8rem;
    font: 700 0.65rem var(--font-ui);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.sub-tier-badge[data-state="free"], 
.sub-tier-badge[data-state="unlocked"] {
    border-color: rgba(76, 175, 80, 0.4);
    background: rgba(76, 175, 80, 0.1);
    color: #81c784;
}
.sub-tier-badge[data-state="expired"] {
    border-color: rgba(255, 107, 107, 0.4);
    background: rgba(255, 107, 107, 0.1);
    color: #e57373;
}
.sub-tier-badge[data-state="locked_tier"] {
    border-color: rgba(255, 215, 0, 0.4);
    background: rgba(255, 215, 0, 0.08);
    color: #ffe082;
}

/* Chapter Directory Catalog List */
.sub-chapter-list {
    display: grid;
    gap: 1.2rem;
}
.sub-chapter-card {
    border: 1px solid var(--sub-border);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.01);
    padding: 1.5rem;
    box-shadow: none;
}
.sub-chapter-card.is-locked {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.01), rgba(216, 181, 91, 0.02));
    border-color: rgba(216, 181, 91, 0.15);
}
.sub-card-meta, 
.sub-chapter-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}
.sub-card-meta > span:first-child, 
.sub-chapter-footer > span {
    color: var(--sub-muted);
    font: 700 0.7rem var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
.sub-chapter-card h3 {
    font: 700 1.35rem var(--font-header);
    margin: 0.8rem 0 0.5rem;
    color: #fff;
}
.sub-chapter-card p {
    color: var(--sub-muted);
    font-size: 0.95rem;
    line-height: 1.65;
    margin-bottom: 1.2rem;
}

/* --- ACCESS & REDEMPTION WORKFLOWS --- */
.sub-access-grid, 
.sub-account-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}
.sub-access-option i {
    color: var(--accent-color);
    font-size: 2.2rem;
    margin-bottom: 1rem;
    display: inline-block;
}

.sub-key-form {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
    width: 100%;
}
.sub-key-form input, 
.sub-dialog input {
    height: 48px;
    border: 1px solid var(--sub-border);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.35);
    color: var(--sub-text);
    padding: 0.8rem 1.2rem;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    min-width: 260px;
    flex: 1;
    transition: var(--sub-transition);
}
.sub-key-form input:focus, 
.sub-dialog input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
}

.sub-inline-status {
    min-height: 1.5em;
    margin-top: 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--sub-muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
}
.sub-inline-status[data-type="error"] {
    color: var(--danger-color);
}
.sub-inline-status[data-type="success"] {
    color: #a3e635;
}

.sub-entitlement-card ul {
    list-style: none;
    padding: 0;
    margin: 1.2rem 0 0;
    display: grid;
    gap: 0.8rem;
}
.sub-entitlement-card li {
    display: grid;
    gap: 0.3rem;
    padding: 1rem;
    border: 1px solid var(--sub-border);
    background: rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    transition: var(--sub-transition);
}
.sub-entitlement-card li:hover {
    border-color: rgba(255, 255, 255, 0.15);
}
.sub-entitlement-card li strong {
    color: #fff;
    font-size: 0.95rem;
}
.sub-entitlement-card span, 
.sub-entitlement-card em {
    color: var(--sub-muted);
    font-style: normal;
    font-size: 0.8rem;
}

/* --- THE FULL READER ENGINE PAGE --- */
.sub-reader-page {
    max-width: 780px;
    margin: 0 auto;
    border: 1px solid var(--sub-border);
    border-radius: 20px;
    background: rgba(10, 12, 17, 0.9);
    padding: clamp(1.5rem, 6vw, 4rem);
    box-shadow: var(--sub-shadow);
    transition: background 0.4s ease, color 0.4s ease;
}
.sub-reader-head {
    margin-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 1.5rem;
}
.sub-reader-head h1 {
    font-family: var(--font-header);
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.15;
    margin: 0.5rem 0 1rem;
    color: #fff;
}
.sub-reader-content {
    font-family: var(--font-body);
    color: #e6dfd3;
    line-height: 1.85;
    user-select: text; /* Explicitly allow text selection in reader */
}
.sub-reader-content p {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
}
.sub-reader-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 3.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 2rem;
}

/* Theme Skins */
.subscription-body[data-reader-theme="parchment"] {
    background-color: #ede2cd;
    background-image: none;
    color: #1e1b15;
}
.subscription-body[data-reader-theme="parchment"] .sub-bg-orb {
    display: none;
}
.subscription-body[data-reader-theme="parchment"] .sub-reader-page {
    background: #f7eedc;
    color: #1e1b15;
    border-color: #d6cbaf;
    box-shadow: 0 12px 32px rgba(30, 27, 21, 0.08);
}
.subscription-body[data-reader-theme="parchment"] .sub-reader-head h1 {
    color: #1e1b15;
}
.subscription-body[data-reader-theme="parchment"] .sub-reader-content {
    color: #2b251d;
}
.subscription-body[data-reader-theme="parchment"] .sub-reader-head,
.subscription-body[data-reader-theme="parchment"] .sub-reader-footer {
    border-color: #d6cbaf;
}
.subscription-body[data-reader-theme="parchment"] .sub-reader-fab {
    background: #f7eedc;
    color: #1e1b15;
    border-color: #1e1b15;
}

.subscription-body[data-reader-theme="contrast"] {
    background-color: #000000;
    background-image: none;
    color: #ffffff;
}
.subscription-body[data-reader-theme="contrast"] .sub-bg-orb {
    display: none;
}
.subscription-body[data-reader-theme="contrast"] .sub-reader-page {
    background: #000000;
    color: #ffffff;
    border-color: #ffffff;
    box-shadow: none;
}
.subscription-body[data-reader-theme="contrast"] .sub-reader-head h1 {
    color: #ffffff;
}
.subscription-body[data-reader-theme="contrast"] .sub-reader-content {
    color: #ffffff;
}
.subscription-body[data-reader-theme="contrast"] .sub-reader-head,
.subscription-body[data-reader-theme="contrast"] .sub-reader-footer {
    border-color: #ffffff;
}
.subscription-body[data-reader-theme="contrast"] .sub-reader-fab {
    background: #000000;
    color: #ffffff;
    border-color: #ffffff;
}

/* Floating Settings Drawer & Fab */
.sub-reader-fab {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 20;
    min-height: 52px;
    border-radius: 99px;
    border: 1px solid var(--accent-color);
    background: rgba(7, 9, 14, 0.85);
    backdrop-filter: blur(12px);
    color: var(--sub-text);
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    font: 700 0.72rem var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: var(--sub-transition);
}
.sub-reader-fab:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(255, 215, 0, 0.25);
    background: var(--accent-color);
    color: #07090e;
}

.sub-reader-sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 31;
    backdrop-filter: blur(4px);
}
.sub-reader-sheet {
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 110%);
    width: min(520px, 100%);
    background: rgba(10, 12, 17, 0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--sub-border);
    border-bottom: 0;
    border-radius: 24px 24px 0 0;
    z-index: 32;
    padding: 2rem;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom));
    transition: transform 0.35s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}
.sub-sheet-open .sub-reader-sheet-backdrop {
    opacity: 1;
    pointer-events: auto;
}
.sub-sheet-open .sub-reader-sheet {
    transform: translate(-50%, 0);
}

.sub-reader-controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    margin-top: 1.2rem;
}
.sub-reader-controls button {
    min-height: 44px;
    border-radius: 12px;
    border: 1px solid var(--sub-border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--sub-text);
    font: 600 0.8rem var(--font-ui);
    cursor: pointer;
    transition: var(--sub-transition);
}
.sub-reader-controls button:hover {
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.08);
    color: var(--accent-color);
}
.sub-reader-controls button:first-child {
    background: #0f1115;
    color: #fff;
}
.sub-reader-controls button:nth-child(2) {
    background: #f4ead8;
    color: #34291d;
}
.sub-reader-controls button:nth-child(3) {
    background: #000000;
    color: #ffffff;
    border-color: #fff;
}

/* --- RECENT FEED UPDATES --- */
.sub-update-list {
    display: grid;
    gap: 0.9rem;
}
.sub-update-list article {
    border: 1px solid var(--sub-border);
    border-radius: 16px;
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.01);
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 1.2rem;
    transition: var(--sub-transition);
}
.sub-update-list article:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
    transform: translateX(3px);
}
.sub-update-list span {
    color: var(--sub-muted);
    font: 700 0.7rem var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* --- TOAST & DIALOGS --- */
.sub-toast {
    position: fixed;
    left: 50%;
    bottom: calc(2rem + env(safe-area-inset-bottom));
    transform: translate(-50%, 150%);
    z-index: 80;
    border: 1px solid var(--sub-border);
    background: rgba(7, 9, 14, 0.95);
    backdrop-filter: blur(12px);
    color: var(--sub-text);
    border-radius: 99px;
    padding: 0.8rem 1.6rem;
    box-shadow: var(--sub-shadow);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font: 600 0.85rem var(--font-ui);
    pointer-events: none;
}
.sub-toast.is-visible {
    transform: translate(-50%, 0);
}
.sub-toast[data-type="error"] {
    border-color: rgba(255, 107, 107, 0.5);
    color: #ff8f8f;
}
.sub-toast[data-type="success"] {
    border-color: rgba(163, 230, 53, 0.5);
    color: #a3e635;
}

.sub-dialog {
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--sub-text);
    margin: auto;
}
.sub-dialog::backdrop {
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
}
.sub-dialog-card {
    width: min(90vw, 440px);
    border: 1px solid var(--sub-border);
    background: rgba(10, 12, 17, 0.95);
    backdrop-filter: blur(24px);
    border-radius: 24px;
    padding: 2.2rem;
    box-shadow: var(--sub-shadow);
    display: grid;
    gap: 1rem;
    position: relative;
    box-sizing: border-box;
}
.sub-dialog-close {
    position: absolute;
    right: 1.2rem;
    top: 1rem;
    border: 0;
    background: transparent;
    color: var(--sub-muted);
    font-size: 1.8rem;
    cursor: pointer;
    line-height: 1;
    transition: var(--sub-transition);
}
.sub-dialog-close:hover {
    color: var(--accent-color);
}
.sub-dialog label {
    display: grid;
    gap: 0.4rem;
    color: var(--sub-muted);
    font: 700 0.68rem var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

/* --- RESPONSIVE MEDIA QUERIES --- */
@media (max-width: 860px) {
    .subscription-body {
        overflow-y: auto;
    }
    .subscription-app-shell {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 100vh;
    }
    .sub-desktop-rail {
        display: none;
    }
    .sub-main-shell {
        height: auto;
        overflow: visible;
        grid-template-rows: auto;
    }
    .sub-stage {
        overflow: visible;
        padding: clamp(1rem, 4vw, 2rem);
        padding-bottom: calc(6.5rem + env(safe-area-inset-bottom));
    }
    .sub-topbar {
        height: 64px;
        position: sticky;
        top: 0;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        background: rgba(7, 9, 14, 0.75);
        border-bottom: 1px solid var(--sub-border);
        padding: 0 1.2rem;
    }
    
    .sub-account-chip {
        max-width: 140px;
    }
    .sub-account-chip button span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        max-width: 100%;
    }
    
    /* Navigation Bar (Mobile Floating) */
    .sub-bottom-nav {
        position: fixed;
        z-index: 30;
        left: 1rem;
        right: 1rem;
        bottom: calc(0.8rem + env(safe-area-inset-bottom));
        height: 66px;
        border: 1px solid var(--sub-border);
        background: rgba(7, 9, 14, 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-radius: 20px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 0.3rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .sub-bottom-nav button {
        border: 0;
        background: transparent;
        color: var(--sub-muted);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.2rem;
        cursor: pointer;
        border-radius: 14px;
        font: 700 0.62rem var(--font-ui);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        transition: var(--sub-transition);
        height: 100%;
    }
    .sub-bottom-nav button i {
        font-size: 1.1rem;
        transition: var(--sub-transition);
    }
    .sub-bottom-nav button:hover {
        color: var(--accent-color);
    }
    .sub-bottom-nav button.is-active {
        background: color-mix(in srgb, var(--accent-color) 12%, rgba(255, 255, 255, 0.02));
        color: var(--accent-color);
        border: 1px solid rgba(255, 215, 0, 0.15);
    }
    
    .sub-hero-panel, 
    .sub-story-hero {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 1.5rem;
    }
    .sub-story-cover {
        max-width: 200px;
        margin: 0 auto;
    }
    .sub-story-card button {
        min-height: 280px;
    }
    .sub-update-list article {
        grid-template-columns: 1fr;
        gap: 0.8rem;
    }
    .sub-key-form input, 
    .sub-key-form button {
        width: 100%;
    }
    .sub-reader-fab {
        bottom: calc(5.8rem + env(safe-area-inset-bottom));
        right: 1.5rem;
    }
}

@media (max-width: 560px) {
    .sub-stage {
        padding: 1rem 0.8rem;
        padding-bottom: calc(6.5rem + env(safe-area-inset-bottom));
    }
    .sub-topbar {
        padding: 0 0.8rem;
    }
    .sub-back span, 
    .sub-wordmark .sub-kicker {
        display: none;
    }
    .sub-hero-panel, 
    .sub-story-hero, 
    .sub-access-gate, 
    .sub-access-page {
        border-radius: 16px;
    }
    .sub-card-meta, 
    .sub-chapter-footer, 
    .sub-action-row {
        align-items: stretch;
        flex-direction: column;
    }
    .sub-chapter-footer .sub-primary-btn, 
    .sub-chapter-footer .sub-secondary-btn, 
    .sub-action-row .sub-primary-btn, 
    .sub-action-row .sub-secondary-btn {
        width: 100%;
    }
    .sub-reader-page {
        padding: 1.5rem 1rem;
        border-radius: 12px;
    }
    .sub-reader-content p {
        font-size: 1.05rem;
        line-height: 1.75;
    }
}

@media (prefers-reduced-motion: reduce) {
    .sub-story-card img, 
    .sub-reader-sheet, 
    .sub-toast, 
    .sub-stage {
        transition: none !important;
    }
}

```

---

## File Path: `js/subscription/main.js`

```javascript
﻿import { SubAuth } from './auth.js';
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
﻿import { supabaseClient, Utils } from '../config.js';

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
﻿import { supabaseClient, SubState } from './state.js';
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
﻿import { supabaseClient, SubState, normalizeChapter } from './state.js';

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
﻿import { SubRender } from './render.js';
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
﻿import { SubState, routeTo } from './state.js';
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
﻿import { SubDB } from './db.js';
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

