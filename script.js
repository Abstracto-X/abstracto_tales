// --- script.js (for the public index.html) ---

const App = {
    state: {
        currentStoryId: null,
        currentStoryConfig: null,
    },
    
    init: () => {
        Router.init();
        Visuals.initDynamicTransparency();
    },

    // --- DATA FETCHING ---
    fetchManifest: async () => (await fetch('data/manifest.json')).json(),
    fetchStoryConfig: async (id) => (await fetch(`data/stories/${id}/config.json`)).json(),
    fetchChapters: async (id) => (await fetch(`data/stories/${id}/chapters/index.json`)).json(),
    fetchCharacters: async (id) => (await fetch(`data/stories/${id}/gallery/manifest.json`)).json(),
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
        UI.backContainer.innerHTML = action ? `<div class="back-btn-wrapper" onclick="${action}"><i class="fas fa-arrow-left"></i> ${label}</div>` : '';
    },

    // --- PAGE RENDERERS ---
    renderHome: async () => {
        UI.setBackButton(null);
        UI.stage.innerHTML = '<div style="text-align:center;">Loading...</div>';
        // Set the specific homepage background
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
        const config = App.state.currentStoryConfig; // Already loaded by router
        if (!config) return UI.stage.innerHTML = "Story not found.";
        
        UI.stage.innerHTML = `
            <div class="story-hub-layout fade-in glass-box">
                <img class="hub-cover" src="${config.cover}" alt="Cover">
                <div class="hub-details">
                    <h1>${config.title}</h1>
                    <div style="color:var(--accent-color); text-transform:uppercase; letter-spacing:1px; margin-bottom:2rem;">
                        ${config.status} • ${config.genre}
                    </div>
                    <div class="hub-synopsis">${config.synopsis}</div>
                    <div class="hub-actions">
                        <button class="btn-large" onclick="Router.navigate('read/${id}/0')"><i class="fas fa-book-open"></i> READ</button>
                        <button class="btn-large" onclick="Router.navigate('gallery/${id}')"><i class="fas fa-images"></i> GALLERY</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderReader: async (storyId, chapterIndex) => {
        UI.setBackButton(`Router.navigate('story/${storyId}')`, "Story Hub");
        const chapters = await App.fetchChapters(storyId);
        const chapter = chapters[chapterIndex];
        
        let sidebarHtml = chapters.map((ch, idx) => `
            <div class="chapter-list-item ${idx == chapterIndex ? 'active' : ''}" onclick="Router.navigate('read/${storyId}/${idx}')">
                ${ch.title}
            </div>
        `).join('');

        UI.stage.innerHTML = `
            <div class="reader-layout fade-in">
                <div class="reader-sidebar glass-box">${sidebarHtml}</div>
                <div class="reader-content glass-box">
                    <h2>${chapter.title}</h2>
                    <div class="chapter-text">${chapter.content}</div>
                </div>
            </div>
        `;
    },

    renderGallery: async (storyId, charId = null) => {
        const characters = await App.fetchCharacters(storyId);
        
        if (!charId) {
            // Roster View
            UI.setBackButton(`Router.navigate('story/${storyId}')`, "Story Hub");
            let html = '<div class="char-grid fade-in">';
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
            // Sub-Gallery View
            UI.setBackButton(`Router.navigate('gallery/${storyId}')`, "All Characters");
            const charData = characters.find(c => c.id === charId);
            
            let imagesHtml = (charData.gallery_images || []).map(img => `
                <div class="gallery-item"><img src="${img.src}" loading="lazy"></div>
            `).join('');

            UI.stage.innerHTML = `
                <div class="fade-in">
                    <div class="glass-box" style="padding: 2rem; margin-bottom: 2rem; display:flex; gap:2rem; align-items:center;">
                        <img src="${charData.img}" style="width:120px; height:120px; border-radius:50%; object-fit:cover;">
                        <div>
                            <h2 style="font-family:var(--font-header); font-size:2rem;">${charData.name}</h2>
                            <p>${charData.bio || ''}</p>
                        </div>
                    </div>
                    <div class="sub-gallery-grid">${imagesHtml}</div>
                </div>
            `;
        }
    }
};

const Visuals = {
    initDynamicTransparency: () => {
        // This part remains the same as your original, no changes needed.
    }
};

const Router = {
    init: () => {
        window.addEventListener('hashchange', Router.handle);
        Router.handle();
    },
    navigate: (path) => window.location.hash = path,
    handle: async () => {
        const hash = window.location.hash.slice(1) || 'home';
        const parts = hash.split('/');
        const route = parts[0];
        const storyId = parts[1];

        // *** KEY FIX: Pre-load story context if we are in a story page ***
        if (storyId && storyId.startsWith('story_')) {
            App.state.currentStoryId = storyId;
            App.state.currentStoryConfig = await App.fetchStoryConfig(storyId);
            // Apply the book-specific theme and background
            UI.setTheme(App.state.currentStoryConfig.themeColor, App.state.currentStoryConfig.bg);
        } else {
            // Reset to home theme
            UI.setTheme('#ffd700', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop');
        }

        // Now, render the correct view
        if (route === 'home') UI.renderHome();
        else if (route === 'story') UI.renderStoryHub(storyId);
        else if (route === 'read') UI.renderReader(storyId, parts[2] || 0);
        else if (route === 'gallery') UI.renderGallery(storyId, parts[2]);
    }
};

window.addEventListener('DOMContentLoaded', App.init);
