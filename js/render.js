// js/render.js
import { State, Utils } from './config.js';
import { DB } from './db.js';
import { UI, Actions, Visuals, ReaderFeatures } from './ui.js';
import { CommentsManager } from './comments.js';
import { MapViewer } from './maps/MapViewer.js';
import { MapHub } from './maps/MapHub.js';
import { TimelineHub } from './timelines/TimelineHub.js';
import { UserAuth } from './auth.js';

export const Render = {
    stage: document.getElementById('content-stage'),

    home: async () => {
        UI.setBackButton(null); 
        UI.hideWallpaperButton();
        
        // 1. Enable home-active class for specialized themed layouts
        document.body.classList.add('home-active');
        
        // 2. Set home variables to utilize the Loader's custom colors
        document.documentElement.style.setProperty('--accent-color', '#00f2fe');
        
        // 3. Set background to match the atmospheric backdrop of the loader
        UI.setBg('https://getwallpapers.com/wallpaper/full/f/4/a/275569.jpg');

        const [stories, author] = await Promise.all([
            DB.getStories(),
            DB.getAuthorProfile()
        ]);

        let html = '<div class="story-grid">';
        
        if (!stories || stories.length === 0) {
            html += `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: rgba(0,0,0,0.5); border-radius: 12px; border: 1px dashed #333;">
                    <h2 style="font-family: var(--font-header); color: var(--accent-color); margin-bottom: 1rem;">The Archives are Empty</h2>
                    <p style="color: #888;">No published stories were found in the database.</p>
                </div>
            `;
        } else {
            stories.forEach((s, idx) => {
                const loadAttr = idx === 0
                    ? 'fetchpriority="high"'
                    : (idx < 4 ? '' : 'loading="lazy" fetchpriority="low"');
                html += `
                    <div class="story-card" onclick="window.Router.navigate('story/${s.slug}')">
                        <img src="${s.cover_image_url || ''}" ${loadAttr} decoding="async">
                        <div class="card-info">
                            <div class="card-title">${s.title}</div>
                            <div class="card-desc">${s.short_description || ''}</div>
                        </div>
                    </div>`;
            });
        }
        html += '</div>';

        if (author) {
            const linksHtml = (author.links || []).map(link => `
                <a href="${link.url}" target="_blank" class="link-row">
                    <img src="${link.icon_url || ''}" class="social-icon" alt="${link.platform_name}" loading="lazy" decoding="async" fetchpriority="low" onerror="this.style.display='none'">
                    <div class="link-details">
                        <span class="link-name">${link.platform_name}</span>
                        ${link.note ? `<span class="link-note">${link.note}</span>` : ''}
                    </div>
                </a>
            `).join('');

            html += `
            <div class="fade-in">
                <div class="author-section glass-box">
                    <div class="author-img-wrapper">
                        <img src="${author.avatar_url || ''}" class="author-img" loading="lazy" decoding="async" onerror="this.style.display='none'">
                    </div>
                    <div class="author-info">
                        <h2>${author.display_name || 'Author'}</h2>
                        <div class="author-bio">${author.bio || ''}</div>
                        <div class="author-links">${linksHtml}</div>
                    </div>
                </div>
            </div>`;
        }

        Render.stage.innerHTML = html;
    },

    storyHub: async (slug) => {
        UI.showLoading();
        UI.setBackButton("window.Router.navigate('home')", "Archives");

        const hubData = await DB.getStoryHubData(slug);
        
        if (!hubData || !hubData.story) {
            Render.stage.innerHTML = `<div class="glass-box" style="padding:2rem;text-align:center"><h3>Story Not Found</h3></div>`;
            return;
        }

        const story = hubData.story;
        State.currentStory = story;
        State.currentStorySlug = slug;
        State.currentWallpapers = hubData.wallpapers;
        State.currentChars = hubData.characters;
        
        UI.setBg(story.background_image_url);
        UI.showWallpaperButton();
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const barHTML = `
            <div class="world-hub-bar glass-box">
                <div class="bar-title">${story.world_title || 'World Encyclopedia'}</div>
                <div class="bar-actions">
                    <button class="btn-large" onclick="window.Router.navigate('timeline/${slug}')"><i class="fas fa-stream"></i> Timelines</button>
                    ${hubData.maps.length > 0 ? `<button class="btn-large" onclick="window.Router.navigate('maps/${slug}')"><i class="fas fa-map-marked-alt"></i> Maps</button>` : ''}
                    ${hubData.lore.length > 0 ? `<button class="btn-large" onclick="window.Router.navigate('lore/${slug}')"><i class="fas fa-book-dead"></i> Lore</button>` : ''}
                </div>
            </div>`;

        Render.stage.innerHTML = `
            <div class="story-hub-wrapper">
                <div class="story-hub-layout glass-box">
                    <img class="hub-cover" src="${story.cover_image_url || ''}" fetchpriority="high" decoding="async">
                    <div class="hub-details">
                        <h1>${story.title}</h1>
                        <div class="hub-meta">${story.status || ''} • ${story.genre || ''}</div>
                        <div class="hub-synopsis">${story.synopsis || ''}</div>
                        <div class="hub-actions">
                            <button class="btn-large" onclick="window.location.href = 'subscription.html#/story/${slug}'">Read</button>
                            <button class="btn-large" onclick="window.Router.navigate('gallery/${slug}')">Gallery</button>
                        </div>
                    </div>
                </div>
                ${barHTML}
            </div>`;
    },

    gallery: async (slug, charId = null) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;
        
        State.currentStory = story;
        UI.setBg(story.background_image_url);
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const characters = hubData.characters;
        State.currentChars = characters;
        const galleryHeaderHtml = (title, subtitle, eyebrow = 'The Visual Archive') => `
            <header class="gallery-archive-header glass-box">
                <div>
                    <div class="gallery-eyebrow">${Utils.escapeHtml(eyebrow)}</div>
                    <h1>${Utils.escapeHtml(title)}</h1>
                    <p>${Utils.escapeHtml(subtitle)}</p>
                </div>
                <button class="btn-large gallery-r18-toggle" data-gallery-r18-toggle type="button" onclick="window.Actions.toggleR18()"></button>
            </header>`;
        
        if (!charId) {
            // Main visual archive
            UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
            const [latestImages, collectionImages] = await Promise.all([
                DB.getLatestGalleryImages(story.id, 10, 0),
                DB.getGalleryCollectionPreviews(story.id)
            ]);
            const visibleCollectionImages = Actions.processGalleryImages(collectionImages);
            const featured = characters.find(character => character.profile_image_url) || characters[0] || {};
            const collectionMap = visibleCollectionImages.reduce((map, image) => {
                if (!map[image.character_id]) map[image.character_id] = [];
                map[image.character_id].push(image);
                return map;
            }, {});
            const uniqueTags = new Set(visibleCollectionImages.flatMap(image => (image.image_tags || []).filter(tag => !Actions.isMatureTag(tag))));
            const featuredImages = collectionMap[featured.id] || [];
            const featuredImage = featured.profile_image_url || story.cover_image_url || '';
            const collectionDecks = characters.map(character => {
                return `
                    <button class="archive-collection-deck ${character.id === featured.id ? 'is-active' : ''}" type="button"
                        data-character-id="${Utils.escapeAttr(character.id)}"
                        data-character-name="${Utils.escapeAttr(character.name)}"
                        data-character-role="${Utils.escapeAttr(character.role_title || 'Archive subject')}"
                        data-character-bio="${Utils.escapeAttr(character.biography || '')}"
                        data-character-profile="${Utils.escapeAttr(character.profile_image_url || '')}"
                        data-character-art-count="${(collectionMap[character.id] || []).length}"
                        data-character-tag-count="${new Set((collectionMap[character.id] || []).flatMap(image => image.image_tags || [])).size}"
                        onclick="window.Router.navigate('gallery/${slug}/${character.id}')" aria-label="Open ${Utils.escapeAttr(character.name)} gallery">
                        <span class="archive-deck-stack">${character.profile_image_url
                            ? `<span class="archive-profile-card"><img src="${Utils.escapeAttr(character.profile_image_url)}" alt="${Utils.escapeAttr(character.name)} profile" loading="lazy" decoding="async" fetchpriority="low"></span>`
                            : '<span class="archive-deck-placeholder"><i class="fas fa-user-astronaut"></i></span>'}</span>
                        <span class="archive-deck-copy">
                            <strong>${Utils.escapeHtml(character.name)}</strong>
                            <small>${Utils.escapeHtml(character.role_title || 'Archive subject')}</small>
                            <em>${(collectionMap[character.id] || []).length} artworks</em>
                        </span>
                    </button>`;
            }).join('');

            let html = `
                <div class="archive-landing">
                    <header class="archive-titlebar">
                        <div><div class="gallery-eyebrow">${Utils.escapeHtml(story.title)}</div><h1>Gallery</h1></div>
                        <button class="btn-large gallery-r18-toggle" data-gallery-r18-toggle type="button" onclick="window.Actions.toggleR18()"></button>
                    </header>
                    <section class="archive-feature">
                        <div class="archive-feature-portrait">
                            <img id="archive-feature-image" src="${Utils.escapeAttr(featuredImage)}" alt="${Utils.escapeAttr(featured.name || 'Featured character')}" fetchpriority="high" decoding="async">
                        </div>
                        <div class="archive-feature-copy">
                            <div class="gallery-eyebrow"><i class="fas fa-star"></i> Featured character</div>
                            <h2 id="archive-feature-name">${Utils.escapeHtml(featured.name || 'The Archive')}</h2>
                            <div class="archive-feature-role" id="archive-feature-role">${Utils.escapeHtml(featured.role_title || 'Character collection')}</div>
                            <p id="archive-feature-bio">${Utils.escapeHtml(featured.biography || story.synopsis || 'Explore the visual records preserved in this story archive.')}</p>
                            <div class="archive-feature-facts">
                                <span><i class="fas fa-images"></i><b id="archive-feature-art-count">${featuredImages.length}</b> artworks</span>
                                <span><i class="fas fa-tags"></i><b id="archive-feature-tag-count">${new Set(featuredImages.flatMap(image => image.image_tags || [])).size}</b> collections</span>
                            </div>
                            ${featured.id ? `<button class="archive-open-button" id="archive-feature-open" type="button" data-story-slug="${Utils.escapeAttr(slug)}" data-character-id="${Utils.escapeAttr(featured.id)}">Open archive <i class="fas fa-arrow-right"></i></button>` : ''}
                        </div>
                        <aside class="archive-browser-panel">
                            <div class="archive-stats">
                                <span><b>${characters.length}</b> Characters</span>
                                <span><b>${visibleCollectionImages.length}</b> Artworks</span>
                                <span><b>${uniqueTags.size}</b> Collections</span>
                            </div>
                            <div class="archive-browser-heading"><span>Archive roster</span><strong>Characters</strong></div>
                            <div class="archive-deck-grid">${collectionDecks || '<div class="gallery-empty-state">No character collections are available yet.</div>'}</div>
                        </aside>
                    </section>
                </div>`;

            Actions.latestGalleryImages = latestImages;
            Actions.currentGalleryImages = latestImages;
            await Actions.fetchVotes();

            if (latestImages && latestImages.length > 0) {
                html += `
                    <section class="gallery-recent-section">
                        <div class="gallery-section-heading"><div><span>Fresh transmissions</span><h2>Recently Added</h2></div><p>Newly published artwork from across the roster.</p></div>
                        <div class="flex-masonry" id="latest-gallery-grid"></div>
                        ${latestImages.length === 10 ? `<div class="gallery-load-more"><button id="load-more-latest-btn" class="btn-large" onclick="window.Actions.loadMoreLatestImages('${story.id}')">Load More</button></div>` : ''}
                    </section>
                `;
            }

            Render.stage.innerHTML = html; 
            Actions.updateR18ToggleButtons();
            Actions.renderLatestGalleryGrid();
            Actions.initArchiveCollectionDecks();
        } else {
            // Individual character profile
            UI.setBackButton(`window.Router.navigate('gallery/${slug}')`, "Roster");
            
            const character = characters.find(x => x.id === charId);
            if (!character) { window.Router.navigate(`gallery/${slug}`); return; }
            
            const galleryImages = await DB.getCharacterGallery(charId);
            Actions.currentGalleryImages = galleryImages;
            await Actions.fetchVotes();
            State.filterTag = 'All';
            State.gallerySearch = '';
            State.gallerySort = 'curated';

            // Global floating comment hook
            const globalBtn = document.getElementById('global-comment-btn');
            if (globalBtn) {
                globalBtn.style.display = 'flex';
                globalBtn.onclick = () => CommentsManager.openDrawer(charId, 'gallery', character.name + ' Discussion');
            }

            // Build unique tags
            const tags = new Set(['All']); 
            galleryImages.forEach(i => {
                if (i.image_tags) {
                    i.image_tags.forEach(t => {
                        if (!Actions.isMatureTag(t)) tags.add(t);
                    });
                }
            });
            
            let tHtml = `<div class="gallery-tag-row" id="gallery-tag-row">`;
            tags.forEach(t => {
                const isActive = t === State.filterTag;
                tHtml += `<button class="gallery-tag ${isActive ? 'active' : ''}" type="button" data-gallery-tag="${Utils.escapeAttr(t)}">${Utils.escapeHtml(t)}</button>`;
            });
            tHtml += `<button class="gallery-tag" type="button" onclick="window.Actions.shuffleGallery()" aria-label="Shuffle artwork"><i class="fas fa-random"></i></button></div>`;

            const prefHtml = `
                <section class="gallery-controls glass-box">
                    <label class="gallery-search"><i class="fas fa-search"></i><input id="gallery-search-input" type="search" placeholder="Search captions or tags" aria-label="Search gallery"></label>
                    <label class="gallery-sort">Sort
                        <select id="gallery-sort-select" aria-label="Sort gallery">
                            <option value="curated">Curated</option>
                            <option value="newest">Newest</option>
                            <option value="top">Top Rated</option>
                        </select>
                    </label>
                    <button class="btn-large" id="pref-view-mode-toggle" type="button" onclick="window.Actions.toggleViewMode()">
                        <i class="${State.galleryViewMode === 'deck' ? 'fas fa-layer-group' : 'fas fa-th'}"></i> 
                        <span>${State.galleryViewMode === 'deck' ? 'Deck View' : 'Grid View'}</span>
                    </button>
                    <div class="gallery-result-count" id="gallery-result-count">${galleryImages.length} artworks</div>
                </section>`;
            
            Render.stage.innerHTML = `
                ${galleryHeaderHtml(character.name + ' Gallery', 'Search, filter, vote, discuss, or explore the original scrolling deck.', story.title)}
                <div class="char-profile-hero gallery-character-masthead glass-box">
                    <div class="hero-img-container"><img src="${Utils.escapeAttr(character.profile_image_url || '')}" alt="${Utils.escapeAttr(character.name)} portrait" class="hero-img" fetchpriority="high" decoding="async"></div>
                    <div class="hero-info">
                        <div class="gallery-art-count">${galleryImages.length} published artworks</div>
                        <div class="hero-name">${Utils.escapeHtml(character.name)}</div>
                        <div class="hero-role">${Utils.escapeHtml(character.role_title || '')}</div>
                        <div class="hero-bio">${Utils.escapeHtml(character.biography || '')}</div>
                    </div>
                </div>
                ${prefHtml}
                ${tHtml}
                <div class="${State.galleryViewMode === 'deck' ? 'decks-grid' : 'sub-gallery-grid'}" id="gallery-grid"></div>`;
            
            Actions.updateR18ToggleButtons();
            Actions.bindGalleryControls();
            Actions.renderGalleryGrid();
        }
    },

    reader: async (slug, chIdx = 0) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;

        State.currentStory = story;
        UI.setBg(story.background_image_url);
        UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const chapters = await DB.getChapters(story.id);
        
        if (!chapters || !chapters[chIdx]) {
            Render.stage.innerHTML = `<div class="glass-box" style="padding:2rem; text-align:center;"><h3>Chapter Error</h3><p>Chapter not found.</p></div>`;
            return;
        }

        const chapter = chapters[chIdx];
        
        let sidebar = '';
        chapters.forEach((c, i) => {
            sidebar += `<div class="chapter-list-item ${i == chIdx ? 'active':''}" onclick="window.Router.navigate('read/${slug}/${i}'); window.ReaderFeatures.toggleSidebar()">${c.title}</div>`;
        });
        
        let nextBtn = parseInt(chIdx) < chapters.length - 1 
            ? `<button class="btn-large" style="margin:2rem auto 0; font-size:0.8rem" onclick="window.Router.navigate('read/${slug}/${parseInt(chIdx) + 1}')">Next Chapter</button>` 
            : '<div style="margin-top:2rem; text-align:center; color:#888">End of updates.</div>';
        
        // Process content into annotated paragraphs
        const rawParagraphs = chapter.content.split('\n').filter(p => p.trim().length > 0);
        const annotatedContent = rawParagraphs.map((para, idx) => `
            <div class="paragraph-block">
                <p>${para}</p>
                <button class="para-comment-btn" onclick="window.CommentsManager.openDrawer('${chapter.id}', 'chapter', 'Paragraph ${idx + 1}', { paragraphIndex: ${idx} })" title="Comment on this paragraph">
                    <i class="fas fa-comment-alt"></i>
                </button>
            </div>
        `).join('');

        const globalBtn = document.getElementById('global-comment-btn');
        if (globalBtn) {
            globalBtn.style.display = 'flex';
            globalBtn.onclick = () => CommentsManager.openDrawer(chapter.id, 'chapter', 'Chapter Discussion');
        }

        Render.stage.innerHTML = `
            <div class="reader-layout">
                <div class="sidebar-backdrop" onclick="window.ReaderFeatures.toggleSidebar()"></div>
                <div class="reader-sidebar glass-box">
                    <h3 style="padding:1rem; font-family:var(--font-header)">Chapters</h3>
                    ${sidebar}
                </div>
                <div class="reader-content glass-box ${ReaderFeatures.fontSize} ${ReaderFeatures.fontFamily}">
                    <div class="reader-toolbar">
                        <button class="rt-btn" title="General Chapter Comments" onclick="window.CommentsManager.openDrawer('${chapter.id}', 'chapter', 'Chapter Discussion')"><i class="fas fa-comments"></i></button>
                        <button class="rt-btn" title="Chapters" onclick="window.ReaderFeatures.toggleSidebar()"><i class="fas fa-list"></i></button>
                        <button class="rt-btn" title="Focus" onclick="window.ReaderFeatures.toggleFocus(this)"><i class="fas fa-expand"></i></button>
                        <div style="position:relative;">
                            <button class="rt-btn" title="Fonts" onclick="window.ReaderFeatures.toggleFontMenu()"><i class="fas fa-font"></i></button>
                            <div id="font-menu" class="font-menu">
                                <div class="font-option" onclick="window.ReaderFeatures.setFontFamily('font-serif')">Serif</div>
                                <div class="font-option" onclick="window.ReaderFeatures.setFontFamily('font-sans')">Sans</div>
                                <div style="scale: 1; border-top:1px solid #333; margin:4px 0"></div>
                                <div class="font-option" onclick="window.ReaderFeatures.setFontSize('text-sm')">Small</div>
                                <div class="font-option" onclick="window.ReaderFeatures.setFontSize('text-md')">Medium</div>
                                <div class="font-option" onclick="window.ReaderFeatures.setFontSize('text-lg')">Large</div>
                            </div>
                        </div>
                    </div>
                    <h2 style="font-family:var(--font-header); margin-bottom:1.5rem; line-height:1.3;">${chapter.title}</h2>
                    <div class="chapter-text">${annotatedContent}</div>
                    ${nextBtn}
                </div>
            </div>`;
    },

    lore: async (slug) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;

        UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
        UI.setBg(story.background_image_url);
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const loreEntries = hubData.lore;
        
        if (!loreEntries || loreEntries.length === 0) {
            Render.stage.innerHTML = `<div style="padding:2rem;text-align:center">No lore data found.</div>`;
            return;
        }
        
        const loreGrid = document.createElement('div');
        loreGrid.className = 'lore-grid';
        const frag = document.createDocumentFragment();

        loreEntries.forEach((item, idx) => {
            const categoryName = item.lore_categories ? item.lore_categories.name : 'Uncategorized';
            const loadAttr = idx === 0
                ? 'fetchpriority="high"'
                : (idx < 6 ? '' : 'loading="lazy" fetchpriority="low"');
            const card = document.createElement('div');
            card.className = 'lore-card glass-box';
            card.onclick = () => window.Router.navigate(`lore/${slug}/${item.slug}`);
            card.innerHTML = `
                <img src="${item.image_url || ''}" class="lore-card-img" ${loadAttr} decoding="async">
                <div class="lore-card-content">
                    <div class="title">${item.title}</div>
                    <div class="type">${categoryName}</div>
                    <div class="desc">${item.description || ''}</div>
                </div>`;
            frag.appendChild(card);
        });

        loreGrid.appendChild(frag);
        Render.stage.innerHTML = '';
        Render.stage.appendChild(loreGrid);
    },

    loreDetail: async (slug, loreSlug) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;

        UI.setBackButton(`window.Router.navigate('lore/${slug}')`, "Lore Index");
        UI.setBg(story.background_image_url);
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const item = await DB.getLoreEntry(story.id, loreSlug);
        
        if (!item) {
            Render.stage.innerHTML = `<div style="padding:2rem">Item not found.</div>`;
            return;
        }

        const categoryName = item.lore_categories ? item.lore_categories.name : 'Uncategorized';

        const globalBtn = document.getElementById('global-comment-btn');
        if (globalBtn) {
            globalBtn.style.display = 'flex';
            globalBtn.onclick = () => CommentsManager.openDrawer(item.id, 'lore', 'Lore Discussion');
        }

        Render.stage.innerHTML = `
            <div class="lore-wiki-layout">
                <div class="lore-wiki-header"><img src="${item.image_url || ''}" fetchpriority="high" decoding="async"></div>
                <div class="glass-box lore-wiki-body">
                    <div class="lore-wiki-title">${item.title}</div>
                    <div class="lore-wiki-type">${categoryName}</div>
                    <div class="lore-wiki-text">${item.description || ''}</div>
                    <div style="margin-top: 3rem; text-align: center;">
                        <button class="btn-large" style="margin: 0 auto;" onclick="window.CommentsManager.openDrawer('${item.id}', 'lore', 'Lore Discussion')"><i class="fas fa-comments"></i> Open Discussion</button>
                    </div>
                </div>
            </div>`;
    },

    timeline: async (slug, mode = null) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;

        UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
        UI.setBg(story.background_image_url);
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const events = hubData.timeline || [];

        if (mode === 'story') {
            UI.setBackButton(`window.Router.navigate('timeline/${slug}')`, "Timelines");
            await TimelineHub.initKeywordLinks().catch(console.error);
            Render.stage.innerHTML = TimelineHub.renderStoryHistory(events, slug);
            TimelineHub.initStoryHistory();
            return;
        }

        if (mode === 'galactic') {
            UI.setBackButton(`window.Router.navigate('timeline/${slug}')`, "Timelines");
            try {
                const tree = await TimelineHub.fetchGalacticTree();
                Render.stage.innerHTML = TimelineHub.renderGalacticExplorer(tree, slug);
                TimelineHub.initGalacticExplorer();
            } catch (err) {
                console.error('Failed to load galactic history:', err);
                Render.stage.innerHTML = `
                    <div class="timeline-empty glass-box">
                        <h3>Galactic history unavailable</h3>
                        <p>The local history index could not be loaded. Please confirm <code>data/timeline/timeline_tree.json</code> is present.</p>
                    </div>`;
            }
            return;
        }

        Render.stage.innerHTML = TimelineHub.renderLanding(events, slug);
        TimelineHub.initLanding();
    },

    maps: async (slug, mapId = null) => {
        UI.showLoading();
        
        const hubData = await DB.getStoryHubData(slug);
        if (!hubData || !hubData.story) { window.Router.navigate('home'); return; }
        const story = hubData.story;

        UI.setBg(story.background_image_url);
        document.documentElement.style.setProperty('--accent-color', story.theme_color || '#ffd700');

        const maps = hubData.maps || [];
        if (maps.length === 0) {
            UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
            Render.stage.innerHTML = `<div style="padding:2rem;text-align:center">No maps found.</div>`;
            return;
        }

        MapViewer.storyMaps = maps;
        MapViewer.storySlug = slug;
        MapViewer.storyTimeline = hubData.timeline || [];

        // Populate global cross-map indexes
        try {
            const nodeNames = await DB.getAllMapNodeNames(story.id);
            const crossIndex = {};
            nodeNames.forEach(n => {
                const key = n.name.trim().toLowerCase();
                if (!crossIndex[key]) crossIndex[key] = [];
                const m = maps.find(x => x.id === n.map_id);
                if (m) {
                    crossIndex[key].push({
                        mapId: n.map_id,
                        mapName: m.map_name
                    });
                }
            });
            MapViewer.crossMapIndex = crossIndex;
        } catch (e) {
            console.error("Failed to build cross-map search index:", e);
        }

        // Phase 1: Hub Screen (if no mapId is provided)
        if (!mapId) {
            UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
            
            // Fetch counts for all maps
            const mapIds = maps.map(m => m.id);
            let counts = {};
            try {
                counts = await DB.getMapCounts(mapIds);
            } catch (e) {
                console.error("Failed to fetch map node/edge counts:", e);
            }

            Render.stage.innerHTML = MapHub.render(maps, slug, story.theme_color, counts);
            MapHub.init();
            return;
        }

        // Phase 2: Interactive Viewer Screen
        UI.setBackButton(`window.Router.navigate('maps/${slug}')`, "Registry");

        const activeMap = maps.find(m => m.id === mapId) || maps.find(m => m.is_primary) || maps[0];
        const activeMapType = activeMap.map_type || 'galactic';
        const mapCards = maps.map(m => {
            const type = m.map_type || 'galactic';
            const typeLabel = type === 'regional' ? 'Regional / Sector' : type === 'local' ? 'Local' : 'Galactic';
            return `
                <button class="map-selector-btn ${m.id === activeMap.id ? 'active' : ''}"
                    data-id="${m.id}"
                    data-src="${Utils.escapeAttr(m.image_url || '')}"
                    data-map-name="${Utils.escapeAttr(m.map_name)}"
                    data-map-type="${Utils.escapeAttr(type)}"
                    data-width="${m.width || 4000}"
                    data-height="${m.height || 4000}"
                    type="button">
                    <img class="map-selector-thumb" src="${Utils.escapeAttr(m.image_url || '')}" alt="" loading="lazy" decoding="async">
                    <span class="map-selector-btn-eyebrow">${Utils.escapeHtml(typeLabel)}</span>
                    <strong>${Utils.escapeHtml(m.map_name)}</strong>
                    <span class="map-selector-btn-meta">${m.is_primary ? 'Primary chart' : 'Mapped registry entry'}</span>
                </button>`;
        }).join('');

        const avatarUrl = UserAuth.profile?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        Render.stage.innerHTML = `
            <div class="map-console-shell map-console-shell--viewer" data-map-type="${Utils.escapeAttr(activeMapType)}">
                <div class="map-console-ambience" aria-hidden="true"></div>
                <header class="map-hud-bar" role="banner">
                    <button class="map-hud-back" onclick="window.Router.navigate('maps/${slug}')" type="button" aria-label="Return to the star chart registry">
                        <i class="fas fa-arrow-left" aria-hidden="true"></i>
                        <span>Registry</span>
                    </button>
                    <div class="map-hud-title-group">
                        <div class="map-hud-title">AETHER</div>
                        <div class="map-hud-subtitle" id="map-hud-subtitle">${Utils.escapeHtml(story.title)} &bull; ${Utils.escapeHtml(activeMap.map_name)}</div>
                    </div>
                    <div class="map-hud-actions">
                        <button class="map-hud-action-btn" id="charts-trigger" type="button" aria-controls="charts-dock" aria-expanded="false">
                            <i class="fas fa-map" aria-hidden="true"></i><span>Star Chart Registry</span>
                        </button>
                        <button class="map-hud-action-btn" id="layers-trigger" type="button" aria-controls="layers-dock" aria-expanded="false">
                            <i class="fas fa-layer-group" aria-hidden="true"></i><span>Layers</span>
                        </button>
                        <button class="map-hud-icon-btn" id="hud-theme-toggle" type="button" aria-label="Toggle console accent theme" aria-pressed="false">
                            <i class="fas fa-magic" aria-hidden="true"></i>
                        </button>
                        <button class="map-hud-icon-btn" id="hud-volume-toggle" type="button" aria-label="Toggle ambient audio indicator" aria-pressed="false">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                        </button>
                        <button class="map-hud-icon-btn" id="hud-settings-toggle" type="button" aria-label="Open chart filters and options" aria-expanded="false">
                            <i class="fas fa-cog" aria-hidden="true"></i>
                        </button>
                        <button class="map-hud-avatar-btn" id="hud-avatar-trigger" type="button" aria-label="Reader profile">
                            <img src="${Utils.escapeAttr(avatarUrl)}" class="map-hud-avatar" alt="Reader avatar" decoding="async">
                        </button>
                        <span id="active-map-chip" class="active-map-chip">${Utils.escapeHtml(activeMap.map_name)}</span>
                    </div>
                </header>

                <section class="charts-dock map-floating-panel" id="charts-dock" aria-label="Map registry controls" aria-hidden="true">
                    <div class="map-floating-panel-header">
                        <div>
                            <div class="map-floating-kicker">Filters & Charts</div>
                            <h3>Star Chart Registry</h3>
                        </div>
                        <button class="dock-btn" id="close-charts" type="button" aria-label="Close chart selector"><i class="fas fa-times" aria-hidden="true"></i></button>
                    </div>
                    <div class="map-floating-panel-copy">Switch between mapped regions without leaving the operations deck.</div>
                    <div class="charts-dock-grid">${mapCards}</div>
                </section>

                <section class="layers-dock map-floating-panel" id="layers-dock" aria-label="Layer visibility controls" aria-hidden="true">
                    <div class="map-floating-panel-header">
                        <div>
                            <div class="map-floating-kicker">Sensor Layers</div>
                            <h3>Display Controls</h3>
                        </div>
                        <button class="dock-btn" id="close-layers" type="button" aria-label="Close layer controls"><i class="fas fa-times" aria-hidden="true"></i></button>
                    </div>
                    <div class="layers-dock-actions">
                        <button class="routing-btn active" id="toggle-map-labels" type="button" aria-pressed="true">Planet Labels</button>
                        <button class="routing-btn active" id="toggle-map-hyperlanes" type="button" aria-pressed="true">Hyperlanes</button>
                    </div>
                </section>

                <div class="map-stage">
                    <div class="map-panel-tools">
                        <div class="map-controls" aria-label="Map controls">
                            <div class="map-viewport-rail">
                                <button class="map-control-icon" id="zoom-in-btn" type="button" title="Zoom in" aria-label="Zoom in"><i class="fas fa-plus" aria-hidden="true"></i></button>
                                <button class="map-control-icon" id="zoom-out-btn" type="button" title="Zoom out" aria-label="Zoom out"><i class="fas fa-minus" aria-hidden="true"></i></button>
                                <button class="map-control-icon" id="map-reset-btn" type="button" title="Reset view" aria-label="Reset view"><i class="fas fa-house" aria-hidden="true"></i></button>
                                <button class="map-control-icon" id="map-center-route-btn" type="button" title="Center route" aria-label="Center plotted route"><i class="fas fa-crosshairs" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <button class="minimize-panels-btn" id="minimize-panels-btn" type="button" aria-pressed="false">
                            <i class="fas fa-compress-alt" aria-hidden="true"></i>
                            <span class="minimize-panels-label">Minimize Panels</span>
                        </button>
                    </div>

                    <div class="map-viewer" id="map-viewer">
                        <div class="map-canvas" id="map-canvas">
                            <img src="${activeMap.image_url}" id="map-image" draggable="false" crossorigin="anonymous" fetchpriority="high" decoding="async" alt="${Utils.escapeAttr(activeMap.map_name)} map">
                            <svg id="map-svg-layer" aria-hidden="true"></svg>
                            <div id="map-nodes-layer"></div>
                        </div>
                    </div>

                    <aside class="map-dock dock-left" id="worldIntel-dock" aria-label="World inspector" aria-hidden="true">
                        <div class="dock-header">
                            <span class="dock-header-title"><i class="fas fa-globe" aria-hidden="true"></i> World Inspector</span>
                            <div class="dock-controls">
                                <button class="dock-btn" id="pin-worldIntel" title="Pin panel" type="button" aria-pressed="false"><i class="fas fa-thumbtack" aria-hidden="true"></i></button>
                                <button class="dock-btn" id="close-worldIntel" title="Close" type="button" aria-label="Close world inspector"><i class="fas fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="dock-body" id="world-intel-body">
                            <div class="map-empty-panel">
                                <div class="map-empty-panel-icon"><i class="fas fa-globe-americas" aria-hidden="true"></i></div>
                                <h3>Select a world</h3>
                                <p>Click a world node to open the inspector, review local telemetry, and add the world to your plotted course.</p>
                            </div>
                        </div>
                    </aside>

                    <aside class="map-dock dock-right" id="navicomputer-dock" aria-label="Navicomputer" aria-hidden="true">
                        <div class="dock-header">
                            <span class="dock-header-title"><i class="fas fa-satellite-dish" aria-hidden="true"></i> Navicomputer</span>
                            <div class="dock-controls">
                                <button class="dock-btn" id="pin-navicomputer" title="Pin panel" type="button" aria-pressed="false"><i class="fas fa-thumbtack" aria-hidden="true"></i></button>
                                <button class="dock-btn" id="close-navicomputer" title="Close" type="button" aria-label="Close navicomputer"><i class="fas fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="dock-body dock-body-nav">
                            <p class="routing-kicker">Plot routes, compare sectors, and track every plotted jump without leaving the chart.</p>
                            <div class="routing-status" id="routing-status" role="status" aria-live="polite">Loading navicomputer...</div>

                            <section class="routing-section">
                                <div class="routing-field-row">
                                    <label for="planet-search">Search / Focus</label>
                                    <input type="text" id="planet-search" placeholder="Center a world" list="planet-datalist" autocomplete="off">
                                </div>
                                <div id="cross-map-hint-search" class="routing-cross-map-hint" aria-live="polite"></div>
                                <div class="routing-inline-actions">
                                    <button class="routing-btn" id="focus-route-btn" type="button">Focus World</button>
                                    <button class="routing-btn" id="set-origin-btn" type="button">Set Selected as Origin</button>
                                    <button class="routing-btn" id="set-destination-btn" type="button">Set Selected as Destination</button>
                                </div>
                            </section>

                            <div class="routing-node-card empty" id="routing-node-card">
                                <h4>World Focus</h4>
                                <p class="routing-kicker">Click a world on the chart to inspect it, review links, and assign route endpoints.</p>
                            </div>

                            <section class="routing-section">
                                <div class="routing-field-row">
                                    <label for="route-origin">Origin</label>
                                    <input type="text" id="route-origin" placeholder="Choose departure world" list="planet-datalist" autocomplete="off">
                                </div>
                                <div id="cross-map-hint-origin" class="routing-cross-map-hint" aria-live="polite"></div>
                                <div class="routing-field-row">
                                    <label for="route-dest">Destination</label>
                                    <input type="text" id="route-dest" placeholder="Choose arrival world" list="planet-datalist" autocomplete="off">
                                </div>
                                <div id="cross-map-hint-dest" class="routing-cross-map-hint" aria-live="polite"></div>
                                <datalist id="planet-datalist"></datalist>
                                <div class="routing-main-actions">
                                    <button class="routing-btn primary" id="plot-course-btn" type="button">Plot Course</button>
                                    <button class="routing-btn" id="swap-route-btn" type="button">Swap</button>
                                    <button class="routing-btn" id="clear-route-btn" type="button">Clear</button>
                                </div>
                            </section>

                            <div class="routing-summary empty" id="routing-summary">
                                <h4>Route Overview</h4>
                                <p class="routing-kicker">No active course. Choose an origin and destination to generate a route.</p>
                            </div>

                            <section class="routing-analysis-panel" id="routing-analysis">
                                <div class="routing-analysis-header">
                                    <div>
                                        <div class="map-floating-kicker">Route Analysis</div>
                                        <h4>Flight Data</h4>
                                    </div>
                                </div>
                                <div class="routing-accordion">
                                    <button class="routing-accordion-trigger" type="button" data-analysis-trigger="preview" aria-expanded="true" aria-controls="analysis-preview-panel">
                                        <span><i class="fas fa-route" aria-hidden="true"></i> Hyperlane Preview</span>
                                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                                    </button>
                                    <div class="routing-accordion-panel is-open" id="analysis-preview-panel"></div>
                                </div>
                                <div class="routing-accordion">
                                    <button class="routing-accordion-trigger" type="button" data-analysis-trigger="fuel" aria-expanded="false" aria-controls="analysis-fuel-panel">
                                        <span><i class="fas fa-gas-pump" aria-hidden="true"></i> Fuel Estimate</span>
                                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                                    </button>
                                    <div class="routing-accordion-panel" id="analysis-fuel-panel"></div>
                                </div>
                                <div class="routing-accordion">
                                    <button class="routing-accordion-trigger" type="button" data-analysis-trigger="borders" aria-expanded="false" aria-controls="analysis-borders-panel">
                                        <span><i class="fas fa-flag" aria-hidden="true"></i> Political Borders</span>
                                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                                    </button>
                                    <div class="routing-accordion-panel" id="analysis-borders-panel"></div>
                                </div>
                                <div class="routing-accordion">
                                    <button class="routing-accordion-trigger" type="button" data-analysis-trigger="hazard" aria-expanded="false" aria-controls="analysis-hazard-panel">
                                        <span><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Hazard Rating</span>
                                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                                    </button>
                                    <div class="routing-accordion-panel" id="analysis-hazard-panel"></div>
                                </div>
                            </section>

                        </div>
                    </aside>

                    <section class="map-status-card" id="map-status-card" aria-live="polite">
                        <div class="map-status-card-copy">
                            <div class="map-floating-kicker">Navicomputer</div>
                            <h3 id="hud-route-title">Navicomputer Online</h3>
                            <p id="hud-route-state">Select two worlds to plot a course.</p>
                            <div class="map-status-card-meta" id="hud-route-meta">0 Hops &bull; 0 u</div>
                            <div class="map-status-actions">
                                <button class="map-status-btn" id="navicomputer-trigger" type="button" aria-controls="navicomputer-dock" aria-expanded="false">
                                    <i class="fas fa-satellite-dish" aria-hidden="true"></i><span>Open Navicomputer</span>
                                </button>
                                <button class="map-status-btn" id="search-map-btn" type="button">
                                    <i class="fas fa-search" aria-hidden="true"></i><span>Search</span>
                                </button>
                            </div>
                        </div>
                        <div class="map-status-radar" aria-hidden="true">
                            <div class="radar-scope">
                                <span class="radar-ring radar-ring-a"></span>
                                <span class="radar-ring radar-ring-b"></span>
                                <span class="radar-ring radar-ring-c"></span>
                                <span class="radar-sweep"></span>
                                <span class="radar-blip radar-blip-a"></span>
                                <span class="radar-blip radar-blip-b"></span>
                                <span class="radar-blip radar-blip-c"></span>
                            </div>
                        </div>
                    </section>

                    <div class="map-console-legend" id="map-console-legend" aria-label="Map legend">
                        <span class="map-legend-item"><span class="map-legend-swatch galaxy"></span>The Galaxy (Political)</span>
                        <span class="map-legend-item"><span class="map-legend-swatch botian"></span>Botian Space</span>
                        <span class="map-legend-item"><span class="map-legend-swatch disputed"></span>Disputed Territory</span>
                        <span class="map-legend-item"><span class="map-legend-line"></span>Hyperlane</span>
                    </div>

                    <div class="cartographer-beacon">
                        <div class="cartographer-beacon-card" id="cartographer-beacon-card">
                            <h4>Help Chart the Galaxy</h4>
                            <p>Propose new maps, add undocumented planets, and chart hyperlanes through the Cartographer Terminal.</p>
                            <button class="routing-btn primary" onclick="window.open('cartographer.html', '_blank')" type="button">
                                <i class="fab fa-galactic-republic" aria-hidden="true"></i> Access Cartographer Terminal
                            </button>
                            ${UserAuth.user ? '' : '<p class="auth-warning" style="color: var(--danger-color); font-size: 0.72rem; margin-top: 5px; font-style: italic;">Note: You need to be registered in order to contribute.</p>'}
                        </div>
                        <button class="cartographer-beacon-pill" id="cartographer-beacon-trigger" type="button">
                            <i class="fab fa-galactic-republic" aria-hidden="true"></i> Contribute
                        </button>
                    </div>

                    <footer class="map-console-footer" id="map-console-footer">
                        <div class="map-footer-actions">
                            <button class="map-footer-btn" id="footer-history-btn" type="button"><i class="fas fa-book-open" aria-hidden="true"></i><span>Historical Index</span></button>
                        </div>
                        <div class="map-footer-ticker" id="map-footer-ticker">
                            <div class="map-footer-ticker-track"><span id="map-footer-ticker-text">Awaiting live astrogation bulletins...</span></div>
                            <button class="map-footer-close" id="footer-ticker-dismiss" type="button" aria-label="Hide contribution ticker"><i class="fas fa-times" aria-hidden="true"></i></button>
                        </div>
                        <div class="map-footer-clock">
                            <span class="map-footer-clock-label">Galactic Time</span>
                            <strong id="map-galactic-clock">--:--:--</strong>
                            <span class="map-footer-clock-spinner" aria-hidden="true"><i class="fab fa-galactic-republic"></i></span>
                        </div>
                    </footer>
                </div>
            </div>`;

        setTimeout(() => MapViewer.init({
            id: activeMap.id,
            src: activeMap.image_url,
            mapName: activeMap.map_name,
            mapType: activeMapType,
            width: parseInt(activeMap.width) || 4000,
            height: parseInt(activeMap.height) || 4000
        }), 50);
    }
};
