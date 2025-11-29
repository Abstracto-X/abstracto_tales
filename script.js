const USE_MOCK_DATA = false; 

// --- MOCK DATA ---
const MOCK_DB = {
    manifest: [
        { id: "story_001", title: "The Gray Tales", genre: "Dark Fantasy", cover: "https://images.unsplash.com/photo-1635326444826-06c8f8d2e666?q=80&w=1000&auto=format&fit=crop", desc: "A mercenary navigates a world where shadows have physical weight and the sun is dying." },
        { id: "story_002", title: "Neon Virtue", genre: "Cyberpunk", cover: "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?q=80&w=1000&auto=format&fit=crop", desc: "In 2199, code is law, and hackers are the new high priests." }
    ],
    stories: {
        "story_001": {
            config: { title: "The Gray Tales", status: "Ongoing", synopsis: "In a world where shadows have mass and can crush a man, Elara sells her sword to the highest bidder. But when a job goes wrong, she finds herself protecting a child who shines with an inner light that could burn the world down.", themeColor: "#b0c4de", bg: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2070&auto=format&fit=crop" },
            chapters: [
                { id: "ch1", title: "Chapter 1: Shadow Weight", content: "The tavern smelled of stale ale and fear. Elara kept her hand near the hilt of her blade. <br><br>The shadows in the corner were moving, shifting like oil on water. She took a sip of her drink. 'Not tonight,' she whispered. <br><br>But the shadows didn't listen. They coalesced, forming a jagged shape that lunged..." },
                { id: "ch2", title: "Chapter 2: The Contract", content: "Gold has a specific sound when it hits a table. Heavy. Final. <br><br>'Double it,' Elara said, not looking up from the coins. <br><br>'It's a child, mercenary. Not a dragon.' <br><br>'Children represent the future,' she replied, finally meeting the patron's eyes. 'And the future is heavy.'" }
            ],
            characters: [
                { id: "char1", name: "Elara", role: "Protagonist", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop", bio: "A veteran mercenary with a mysterious past." },
                { id: "char2", name: "The Child", role: "Target", img: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=500&auto=format&fit=crop", bio: "A beacon of light in a dark world." }
            ],
            gallery: {
                "char1": [
                    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop", tags: ["Portrait", "Concepts"] },
                    { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop", tags: ["Action", "Combat"] },
                    { src: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=1000&auto=format&fit=crop", tags: ["Sketch", "Concepts"] },
                    { src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=1000&auto=format&fit=crop", tags: ["Portrait"] }
                ]
            }
        }
    }
};

// --- CORE LOGIC ---
const App = {
    state: {
        currentStoryId: null,
        currentStoryData: null,
        currentCharId: null,
        currentImages: [],
    },
    
    init: async () => { // Make init async
        Router.init();
        Visuals.initDynamicTransparency();
        
        // ADD THIS BLOCK:
        try {
            const settings = await (await fetch('data/settings.json')).json();
            if(settings.globalBg) {
                document.getElementById('global-bg').style.backgroundImage = `url('${settings.globalBg}')`;
            }
        } catch(e) {
            console.log("No custom settings found, using default CSS.");
        }
    },

    // DATA FETCHING HELPERS
    fetchManifest: async () => USE_MOCK_DATA ? MOCK_DB.manifest : (await fetch('data/manifest.json')).json(),
    fetchStoryConfig: async (id) => USE_MOCK_DATA ? MOCK_DB.stories[id]?.config : (await fetch(`data/stories/${id}/config.json`)).json(),
    fetchChapters: async (id) => USE_MOCK_DATA ? MOCK_DB.stories[id]?.chapters : (await fetch(`data/stories/${id}/chapters/index.json`)).json(),
    fetchCharacters: async (id) => USE_MOCK_DATA ? MOCK_DB.stories[id]?.characters : (await fetch(`data/stories/${id}/gallery/manifest.json`)).json(),
    fetchCharImages: async (storyId, charId) => USE_MOCK_DATA ? MOCK_DB.stories[storyId]?.gallery[charId] || [] : [],
};

const UI = {
    stage: document.getElementById('content-stage'),
    bg: document.getElementById('global-bg'),
    backContainer: document.getElementById('back-container'),
    root: document.documentElement,

    setTheme: (color, bgImage) => {
        UI.root.style.setProperty('--accent-color', color || '#ffd700');
        if (bgImage) UI.bg.style.backgroundImage = `url('${bgImage}')`;
    },

    setBackButton: (action, label) => {
        if (!action) {
            UI.backContainer.innerHTML = '';
        } else {
            UI.backContainer.innerHTML = `
                <div class="back-btn-wrapper" onclick="${action}">
                    <i class="fas fa-arrow-left"></i> ${label || 'Back'}
                </div>
            `;
        }
    },

    renderHome: async () => {
        UI.setBackButton(null);
        UI.stage.innerHTML = '<div style="color:white; text-align:center; margin-top:50px;">Loading Archives...</div>';
        UI.setTheme('#ffd700', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop'); 
        
        const stories = await App.fetchManifest();
        let html = '<div class="story-grid fade-in">';
        stories.forEach(story => {
            html += `
                <div class="story-card glass-box" onclick="Router.navigate('story/${story.id}')">
                    <img src="${story.cover}" alt="${story.title}">
                    <div class="card-info">
                        <div class="card-title">${story.title}</div>
                        <div style="color:#ccc; font-size:0.9rem;">${story.desc}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        UI.stage.innerHTML = html;
    },

    renderStoryHub: async (id) => {
        UI.setBackButton("Router.navigate('home')", "Archives");
        const config = await App.fetchStoryConfig(id);
        if (!config) return UI.stage.innerHTML = "Story not found.";
        
        App.state.currentStoryId = id;
        App.state.currentStoryData = config;
        UI.setTheme(config.themeColor, config.bg);

        UI.stage.innerHTML = `
            <div class="story-hub-layout fade-in glass-box">
                <img class="hub-cover" src="${config.bg}" alt="Cover">
                <div class="hub-details">
                    <h1>${config.title}</h1>
                    <div style="color:var(--accent-color); text-transform:uppercase; letter-spacing:1px; margin-bottom:2rem;">
                        ${config.status} • ${App.state.currentStoryData.genre || 'Fiction'}
                    </div>
                    <div class="hub-synopsis">${config.synopsis}</div>
                    <div class="hub-actions">
                        <button class="btn-large" onclick="Router.navigate('read/${id}/0')">
                            <i class="fas fa-book-open"></i> READ
                        </button>
                        <button class="btn-large" onclick="Router.navigate('gallery/${id}')">
                            <i class="fas fa-images"></i> GALLERY
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderReader: async (storyId, chapterIndex) => {
        UI.setBackButton(`Router.navigate('story/${storyId}')`, "Story Hub");
        const chapters = await App.fetchChapters(storyId);
        const chapter = chapters[chapterIndex];
        
        let sidebarHtml = '';
        chapters.forEach((ch, idx) => {
            const active = idx == chapterIndex ? 'active' : '';
            sidebarHtml += `<div class="chapter-list-item ${active}" onclick="Router.navigate('read/${storyId}/${idx}')">${ch.title}</div>`;
        });

        UI.stage.innerHTML = `
            <div class="reader-layout fade-in">
                <div class="reader-sidebar glass-box">
                    <h3 style="margin-bottom:1rem; color:var(--accent-color); font-family:var(--font-header);">Chapters</h3>
                    ${sidebarHtml}
                </div>
                <div class="reader-content glass-box">
                    <h2>${chapter.title}</h2>
                    <div class="chapter-text">${chapter.content}</div>
                    <br><hr style="border-color:rgba(255,255,255,0.1)"><br>
                    <div style="text-align:center;">
                        ${parseInt(chapterIndex) < chapters.length - 1 
                            ? `<button class="btn-large" style="margin:0 auto;" onclick="Router.navigate('read/${storyId}/${parseInt(chapterIndex)+1}')">Next Chapter</button>` 
                            : '<span>End of current updates.</span>'}
                    </div>
                </div>
            </div>
        `;
    },

    renderGallery: async (storyId, charId = null) => {
        if (!charId) {
            // Level 1: Roster
            UI.setBackButton(`Router.navigate('story/${storyId}')`, "Story Hub");
            const characters = await App.fetchCharacters(storyId);
            
            let html = `<h2 style="text-align:center; font-family:var(--font-header); font-size:2rem; margin-bottom:2rem;">Dramatis Personae</h2>`;
            html += '<div class="char-grid fade-in">';
            characters.forEach(char => {
                html += `
                    <div class="char-card" onclick="Router.navigate('gallery/${storyId}/${char.id}')">
                        <div class="char-img-frame"><img src="${char.img}"></div>
                        <div class="char-name">${char.name}</div>
                        <div style="font-size:0.8rem; color:#aaa;">${char.role}</div>
                    </div>
                `;
            });
            html += '</div>';
            UI.stage.innerHTML = html;
        } else {
            // Level 2: Sub-Gallery with Filters
            UI.setBackButton(`Router.navigate('gallery/${storyId}')`, "All Characters");
            const characters = await App.fetchCharacters(storyId);
            const charData = characters.find(c => c.id === charId);
            
            // Store images for filtering
            App.state.currentImages = await App.fetchCharImages(storyId, charId);
            
            // Extract unique tags
            const allTags = new Set(["All"]);
            App.state.currentImages.forEach(img => img.tags.forEach(t => allTags.add(t)));
            
            // Render Chips
            let chipsHtml = '';
            allTags.forEach(tag => {
                chipsHtml += `<div class="filter-chip ${tag === 'All' ? 'active' : ''}" onclick="UI.filterGallery('${tag}', this)">${tag}</div>`;
            });

            UI.stage.innerHTML = `
                <div class="fade-in">
                    <div class="glass-box" style="margin-bottom:2rem; display:flex; gap:2rem; align-items:center; padding: 2rem;">
                        <img src="${charData.img}" style="width:120px; height:120px; border-radius:50%; border:2px solid var(--accent-color); object-fit:cover;">
                        <div>
                            <h2 style="font-family:var(--font-header); font-size:2rem; color: var(--accent-color);">${charData.name}</h2>
                            <p>${charData.bio}</p>
                        </div>
                    </div>
                    
                    <div class="gallery-nav">${chipsHtml}</div>
                    <div id="gallery-grid" class="sub-gallery-grid"></div>
                </div>
            `;
            // Render initial images
            UI.renderGalleryGrid(App.state.currentImages);
        }
    },

    filterGallery: (tag, chipElement) => {
        // Update active chip visual
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chipElement.classList.add('active');

        // Filter data
        const filtered = tag === 'All' 
            ? App.state.currentImages 
            : App.state.currentImages.filter(img => img.tags.includes(tag));
        
        UI.renderGalleryGrid(filtered);
    },

    renderGalleryGrid: (images) => {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = images.map(img => `
            <div class="gallery-item fade-in">
                <img src="${img.src}" loading="lazy">
            </div>
        `).join('');
    }
};

const Visuals = {
    initDynamicTransparency: () => {
        const app = document.getElementById('app-container');
        const bgLayer = document.getElementById('global-bg');
        let mouseX = 0, mouseY = 0;
        
        // Track mouse position
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Check if hovering ANY glass-box or interactive element
            const isHoveringContent = e.target.closest('.glass-box') || 
                                      e.target.closest('.story-card') || 
                                      e.target.closest('button') || 
                                      e.target.closest('.char-card') ||
                                      e.target.closest('.gallery-item') ||
                                      e.target.closest('.reader-content');

            if (isHoveringContent) {
                // User is reading/interacting: Full Opacity, Blur BG
                app.style.opacity = '1';
                bgLayer.style.filter = 'blur(5px) brightness(0.5)';
                bgLayer.style.transform = 'scale(1.02)';
            } else {
                // User is looking at art: Calculate Rolling Opacity
                Visuals.calculateDistanceOpacity(mouseX, mouseY, app, bgLayer);
            }
        });
    },

    calculateDistanceOpacity: (x, y, appEl, bgEl) => {
        // Calculate distance from center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const maxDist = Math.hypot(centerX, centerY); // Distance to corner
        const currentDist = Math.hypot(x - centerX, y - centerY);
        
        const ratio = currentDist / maxDist; // 0 (center) to 1 (corner)

        // LOGIC: 
        // 0% to 70% distance -> High Opacity (0.9 to 0.7)
        // 70% to 100% distance -> Exponential drop to 0.1
        
        let targetOpacity;
        if (ratio < 0.7) {
            // Slow linear fade
            targetOpacity = 1 - (ratio * 0.3); // ranges 1.0 -> 0.79
        } else {
            // Exponential drop for the edges
            // Normalize ratio to 0-1 range for the last 30%
            const edgeRatio = (ratio - 0.7) / 0.3; 
            targetOpacity = 0.79 * (1 - Math.pow(edgeRatio, 2)); // Drops to 0
        }

        // Clamp minimum opacity to 0.1 so it's never fully invisible
        targetOpacity = Math.max(0.1, targetOpacity);

        appEl.style.opacity = targetOpacity;
        
        // Remove blur so art is clear
        bgEl.style.filter = 'blur(0px) brightness(1)';
        bgEl.style.transform = 'scale(1)';
    }
};

const Router = {
    init: () => {
        window.addEventListener('hashchange', Router.handle);
        Router.handle();
    },
    navigate: (path) => window.location.hash = path,
    handle: () => {
        const hash = window.location.hash.slice(1) || 'home';
        const parts = hash.split('/');
        const route = parts[0];

        if (route === 'home') UI.renderHome();
        else if (route === 'story') UI.renderStoryHub(parts[1]);
        else if (route === 'read') UI.renderReader(parts[1], parts[2] || 0);
        else if (route === 'gallery') UI.renderGallery(parts[1], parts[2]);
    }
};

window.addEventListener('DOMContentLoaded', App.init);
