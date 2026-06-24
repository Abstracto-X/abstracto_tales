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
