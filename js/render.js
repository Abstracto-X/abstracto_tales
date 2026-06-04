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
                const loadAttr = idx < 4 ? '' : 'loading="lazy"';
                html += `
                    <div class="story-card" onclick="window.Router.navigate('story/${s.slug}')">
                        <img src="${s.cover_image_url || ''}" ${loadAttr}>
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
                    <img src="${link.icon_url || ''}" class="social-icon" alt="${link.platform_name}" onerror="this.style.display='none'">
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
                        <img src="${author.avatar_url || ''}" class="author-img" onerror="this.style.display='none'"> 
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
                    <img class="hub-cover" src="${story.cover_image_url || ''}">
                    <div class="hub-details">
                        <h1>${story.title}</h1>
                        <div class="hub-meta">${story.status || ''} • ${story.genre || ''}</div>
                        <div class="hub-synopsis">${story.synopsis || ''}</div>
                        <div class="hub-actions">
                            <button class="btn-large" onclick="window.Router.navigate('read/${slug}')">Read</button>
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
        const galleryHeaderHtml = (title, subtitle) => `
            <div class="glass-box" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; padding:1rem 1.25rem;">
                <div>
                    <div style="font-family:var(--font-header); font-size:1.25rem; color:var(--accent-color); letter-spacing:1px;">${title}</div>
                    <div style="font-size:0.85rem; color:#aaa; margin-top:0.25rem;">${subtitle}</div>
                </div>
                <div class="btn-large" data-gallery-r18-toggle style="padding: 0.45rem 1rem; font-size: 0.75rem; border-radius: 999px; min-height: 0; cursor: pointer; transition: all 0.3s;" onclick="window.Actions.toggleR18()"></div>
            </div>
        `;
        
        if (!charId) {
            // Character grid view
            UI.setBackButton(`window.Router.navigate('story/${slug}')`, "Story Hub");
            
            let html = galleryHeaderHtml('Gallery', 'Toggle R18 to reveal mature artwork and float it to the front of the gallery.');
            html += '<h2 style="margin-bottom: 1rem; border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; display: inline-block;">Characters</h2>';
            html += '<div class="char-grid" style="margin-bottom: 3rem;">';
            characters.forEach((c, idx) => { 
                const loadAttr = idx < 6 ? '' : 'loading="lazy"';
                html += `
                    <div class="char-card" onclick="window.Router.navigate('gallery/${slug}/${c.id}')">
                        <div class="char-card-inner">
                            <img src="${c.profile_image_url || ''}" ${loadAttr}>
                            <div class="char-info-overlay">
                                <div class="char-role">${c.role_title || ''}</div>
                                <div class="char-name">${c.name}</div>
                                <div class="char-bio-preview">${c.biography || ''}</div>
                            </div>
                        </div>
                    </div>`; 
            });
            html += '</div>';
            // Fetch and append Latest Images below Characters
            const latestImages = await DB.getLatestGalleryImages(story.id, 10, 0);
            Actions.latestGalleryImages = latestImages;
            Actions.currentGalleryImages = latestImages;
            await Actions.fetchVotes();

            if (latestImages && latestImages.length > 0) {
                html += `
                    <div style="margin-bottom: 2rem;">
                        <h2 style="margin-bottom: 1rem; border-bottom: 2px solid var(--accent-color); padding-bottom: 0.5rem; display: inline-block;">Recently Added</h2>
                        <div class="flex-masonry" id="latest-gallery-grid"></div>
                        ${latestImages.length === 10 ? `<div style="text-align: center; margin-top: 1rem;"><button id="load-more-latest-btn" class="btn-large" onclick="window.Actions.loadMoreLatestImages('${story.id}')">Load More</button></div>` : ''}
                    </div>
                `;
            }

            Render.stage.innerHTML = html; 
            Actions.updateR18ToggleButtons();
            Actions.renderLatestGalleryGrid();
            Visuals.initCardTilt();
        } else {
            // Individual character profile
            UI.setBackButton(`window.Router.navigate('gallery/${slug}')`, "Roster");
            
            const character = characters.find(x => x.id === charId);
            if (!character) { window.Router.navigate(`gallery/${slug}`); return; }
            
            const galleryImages = await DB.getCharacterGallery(charId);
            Actions.currentGalleryImages = galleryImages;
            await Actions.fetchVotes();
            State.filterTag = 'All';

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
            
            let tHtml = `<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:1.5rem">`;
            tags.forEach(t => {
                const isActive = t === State.filterTag;
                tHtml += `<div class="btn-large" style="padding:4px 12px; font-size:0.75rem; border-radius:20px; text-transform:none; letter-spacing:0; min-height:0; ${isActive ? 'background:var(--accent-color); color:#000':''}" onclick="window.Actions.setFilter('${t}')">${t}</div>`;
            });
            tHtml += `<div class="btn-large" style="padding:4px 12px; font-size:0.75rem; border-radius:20px; min-height:0;" onclick="window.Actions.shuffleGallery()"><i class="fas fa-random"></i></div></div>`;
            
            let prefHtml = `
                <div class="glass-box" style="display: flex; gap: 15px; justify-content: center; align-items: center; max-width: 420px; margin: 0 auto 1.5rem; padding: 0.8rem 1.25rem; border-radius: 30px; border-color: rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #aaa; font-weight: 500;">
                        <i class="fas fa-sliders-h" style="color: var(--accent-color);"></i> Layout:
                    </div>
                    <div class="btn-large" id="pref-view-mode-toggle" style="padding: 4px 12px; font-size: 0.75rem; border-radius: 20px; min-height: 0; cursor: pointer; transition: all 0.3s;" onclick="window.Actions.toggleViewMode()">
                        <i class="${State.galleryViewMode === 'deck' ? 'fas fa-layer-group' : 'fas fa-th'}"></i> 
                        <span>${State.galleryViewMode === 'deck' ? 'Deck View' : 'Grid View'}</span>
                    </div>
                </div>
            `;
            
            Render.stage.innerHTML = `
                ${galleryHeaderHtml(character.name + ' Gallery', 'Use the header toggle to reveal R18 artwork first across this gallery and the recent feed.')}
                <div class="char-profile-hero glass-box">
                    <div class="hero-img-container"><img src="${character.profile_image_url || ''}" class="hero-img"></div>
                    <div class="hero-info">
                        <div class="hero-name">${character.name}</div>
                        <div class="hero-role">${character.role_title || ''}</div>
                        <div class="hero-bio">${character.biography || ''}</div>
                    </div>
                </div>
                ${prefHtml}
                ${tHtml}
                <div class="${State.galleryViewMode === 'deck' ? 'decks-grid' : 'sub-gallery-grid'}" id="gallery-grid"></div>`;
            
            Actions.updateR18ToggleButtons();
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
            const loadAttr = idx < 6 ? '' : 'loading="lazy"';
            const card = document.createElement('div');
            card.className = 'lore-card glass-box';
            card.onclick = () => window.Router.navigate(`lore/${slug}/${item.slug}`);
            card.innerHTML = `
                <img src="${item.image_url || ''}" class="lore-card-img" ${loadAttr}>
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
                <div class="lore-wiki-header"><img src="${item.image_url || ''}"></div>
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
            MapViewer.storyMaps = maps;
            MapViewer.storySlug = slug;
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

        let btns = '';
        maps.forEach(m => {
            btns += `<button class="map-selector-btn ${m.id === activeMap.id ? 'active' : ''}" data-id="${m.id}" data-src="${m.image_url}" data-map-name="${Utils.escapeHtml(m.map_name)}" data-width="${m.width || 4000}" data-height="${m.height || 4000}">${Utils.escapeHtml(m.map_name)}</button>`;
        });
        
        Render.stage.innerHTML = `
            <div class="map-layout">
                <div class="map-hub-backbar">
                    <button class="map-hub-back-btn" onclick="window.Router.navigate('maps/${slug}')">
                        <i class="fas fa-arrow-left"></i> Registry
                    </button>
                    <div class="map-selector glass-box" style="margin:0; flex:1; justify-content:flex-start;">${btns}</div>
                </div>
                <div class="map-workspace">
                    <div class="map-column-left" style="display: flex; flex-direction: column; gap: 0.85rem; min-width: 0;">
                        <div class="map-stage">
                            <div class="map-topbar">
                                <div class="map-topbar-group">
                                    <button class="map-chip active" id="toggle-map-labels" type="button">Labels</button>
                                    <button class="map-chip active" id="toggle-map-hyperlanes" type="button">Hyperlanes</button>
                                </div>
                                <div class="map-topbar-group">
                                    <div class="map-chip" id="active-map-chip">${Utils.escapeHtml(activeMap.map_name)}</div>
                                </div>
                            </div>
                            <div class="map-viewer" id="map-viewer">
                                <div class="map-canvas" id="map-canvas">
                                    <img src="${activeMap.image_url}" id="map-image" draggable="false" crossorigin="anonymous">
                                    <svg id="map-svg-layer"></svg>
                                    <div id="map-nodes-layer"></div>
                                </div>
                            </div>
                            <div class="map-controls">
                                <button class="map-control-btn cartographer-link" type="button" title="Access Cartographer Terminal" onclick="window.open('cartographer.html', '_blank')" style="color: var(--accent-color); border-color: var(--accent-color); box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); margin-bottom: 12px;"><i class="fab fa-galactic-republic"></i></button>
                                <button class="map-control-btn" id="zoom-in-btn" type="button" title="Zoom In"><i class="fas fa-plus"></i></button>
                                <button class="map-control-btn" id="zoom-out-btn" type="button" title="Zoom Out"><i class="fas fa-minus"></i></button>
                                <button class="map-control-btn" id="map-reset-btn" type="button" title="Reset View"><i class="fas fa-house"></i></button>
                                <button class="map-control-btn" id="map-center-route-btn" type="button" title="Center Route"><i class="fas fa-crosshairs"></i></button>
                            </div>
                        </div>
                        <div class="map-promo-block shadow-box" style="padding: 20px; text-align: center; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px;">
                            <h3 style="font-family: var(--font-header); color: var(--accent-color); margin-bottom: 10px;">Help Chart the Galaxy</h3>
                            <p style="font-family: var(--font-body); line-height: 1.6; max-width: 800px; margin: 0 auto 15px auto;">
                                Want to contribute to the first navigable map database in Star Wars? You can propose new maps, add undocumented planets, and chart hyperlanes easily through the Cartographer Terminal. Collaborate with millions of Star Wars fans around the globe to map a galaxy far, far away!
                            </p>
                            <button class="form-btn primary" onclick="window.open('cartographer.html', '_blank')" style="font-size: 1.1em; padding: 10px 24px;">
                                <i class="fab fa-galactic-republic" style="margin-right: 8px;"></i> Access Cartographer Terminal
                            </button>
                            ${UserAuth.user ? '' : '<p class="auth-warning" style="color: var(--danger-color); font-size: 0.85em; margin-top: 15px; font-style: italic;">Note: You need to be registered in order to contribute. Please create a profile or sign in.</p>'}
                        </div>
                    </div>
                    <div class="routing-panel shadow-box">
                        <h3>Navicomputer</h3>
                        <p class="routing-kicker">Select worlds directly on the chart, then build and inspect routes without leaving the map.</p>

                        <div class="routing-status" id="routing-status">Loading navicomputer...</div>

                        <div class="routing-section">
                            <div class="routing-field-row">
                                <label for="planet-search">Focus</label>
                                <input type="text" id="planet-search" placeholder="Center a world" list="planet-datalist">
                            </div>
                            <div id="cross-map-hint-search" class="routing-cross-map-hint"></div>
                            <div class="routing-inline-actions">
                                <button class="routing-btn" id="focus-route-btn" type="button">Focus World</button>
                                <button class="routing-btn" id="set-origin-btn" type="button">Set Selected as Origin</button>
                                <button class="routing-btn" id="set-destination-btn" type="button">Set Selected as Destination</button>
                            </div>
                        </div>

                        <div class="routing-node-card empty" id="routing-node-card">
                            <h4>Node Focus</h4>
                            <p class="routing-kicker">Click a world on the chart to inspect it and assign route endpoints.</p>
                        </div>

                        <div class="routing-section">
                            <div class="routing-field-row">
                                <label for="route-origin">Origin</label>
                                <input type="text" id="route-origin" placeholder="Choose departure world" list="planet-datalist">
                            </div>
                            <div id="cross-map-hint-origin" class="routing-cross-map-hint"></div>
                            <div class="routing-field-row">
                                <label for="route-dest">Destination</label>
                                <input type="text" id="route-dest" placeholder="Choose arrival world" list="planet-datalist">
                            </div>
                            <div id="cross-map-hint-dest" class="routing-cross-map-hint"></div>
                            <datalist id="planet-datalist"></datalist>
                            <div class="routing-main-actions">
                                <button class="routing-btn primary" id="plot-course-btn" type="button">Plot Course</button>
                                <button class="routing-btn" id="swap-route-btn" type="button">Swap</button>
                                <button class="routing-btn" id="clear-route-btn" type="button">Clear</button>
                            </div>
                        </div>

                        <div class="routing-summary empty" id="routing-summary">
                            <h4>Route Summary</h4>
                            <p class="routing-kicker">No active course. Choose an origin and destination to generate an itinerary.</p>
                        </div>

                        <div id="routing-itinerary" class="routing-itinerary"></div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => MapViewer.init({ 
            id: activeMap.id, 
            src: activeMap.image_url, 
            mapName: activeMap.map_name, 
            width: parseInt(activeMap.width) || 4000, 
            height: parseInt(activeMap.height) || 4000 
        }), 50);
    }
};
