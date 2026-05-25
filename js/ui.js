// js/ui.js
import { supabaseClient, State, default_behavior_lightsaber, Utils } from './config.js';
import { DB } from './db.js';
import { UserAuth } from './auth.js';
import { CommentsManager } from './comments.js';

// PARTICLES ENGINE
export const Particles = {
    _rafId: null,
    _paused: false,
    init: () => {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particlesArray = [];
        const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();
        class Particle {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5; this.speedY = Math.random() * 0.3 + 0.1; this.opacity = Math.random() * 0.5;
            }
            update() { this.y -= this.speedY; if(this.y < 0) { this.y = height; this.x = Math.random() * width; } }
            draw() { ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        }
        function initParticles() { particlesArray = []; for(let i=0; i<30; i++) particlesArray.push(new Particle()); }
        function animate() {
            if (Particles._paused) return;
            ctx.clearRect(0,0, width, height);
            particlesArray.forEach(p => { p.update(); p.draw(); });
            Particles._rafId = requestAnimationFrame(animate);
        }
        initParticles();
        animate();

        // Pause/resume on tab visibility change to save CPU/battery
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Particles._paused = true;
                if (Particles._rafId) {
                    cancelAnimationFrame(Particles._rafId);
                    Particles._rafId = null;
                }
            } else {
                Particles._paused = false;
                animate();
            }
        });
    }
};

// VISUAL EFFECTS
export const Visuals = {
    initDynamicTransparency: () => {
        if (window.innerWidth < 900) return;
        const app = document.getElementById('app-container');
        const bgLayer = document.getElementById('global-bg');
        if (!app || !bgLayer) return;
        
        let ticking = false;
        let lastTarget = null;
        let isHoveringContent = false;
        let currentFilterState = ''; // Cache the applied CSS string

        window.addEventListener('mousemove', (e) => {
            if (ticking) return;
            ticking = true;

            window.requestAnimationFrame(() => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                const isBottomRight = (e.clientX > w * 0.90) && (e.clientY > h * 0.90);

                if (isBottomRight) {
                    app.style.opacity = '0';
                    if (currentFilterState !== 'none') {
                        bgLayer.style.filter = 'blur(0px) brightness(1)';
                        currentFilterState = 'none';
                    }
                } else {
                    app.style.opacity = '1';
                    
                    // Optimized Target Caching
                    if (e.target !== lastTarget) {
                        lastTarget = e.target;
                        isHoveringContent = !!(e.target.closest('.glass-box') || e.target.closest('.char-card'));
                    }

                    let newFilter;
                    if (isHoveringContent) {
                        newFilter = 'blur(5px) brightness(0.5)';
                    } else {
                        const distX = Math.abs(e.clientX - w / 2);
                        const distY = Math.abs(e.clientY - h / 2);
                        const maxDist = Math.hypot(w/2, h/2);
                        const currentDist = Math.hypot(distX, distY);
                        
                        // Round values to 1 decimal place to prevent micro-repaints
                        const blur = (5 * (1 - (currentDist / maxDist))).toFixed(1); 
                        const brightness = (0.5 + (0.5 * (currentDist / maxDist))).toFixed(2);
                        
                        newFilter = `blur(${blur}px) brightness(${brightness})`;
                    }

                    // DOM Write Gating: Only touch the DOM if the string actually changed
                    if (currentFilterState !== newFilter) {
                        bgLayer.style.filter = newFilter;
                        currentFilterState = newFilter;
                    }
                }
                ticking = false;
            });
        });
    },
    // Single delegated listener instead of N per-card listeners
    initCardTilt: () => {
        if(window.innerWidth < 900) return;
        const grid = document.querySelector('.char-grid');
        if (!grid) return;
        let tiltTicking = false;
        grid.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.char-card');
            if (!card || tiltTicking) return;
            tiltTicking = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width/2, y = e.clientY - rect.top - rect.height/2;
                card.classList.remove('reset-anim');
                card.style.transform = `perspective(1000px) scale(1.02) rotateX(${y * -0.05}deg) rotateY(${x * 0.05}deg)`;
                tiltTicking = false;
            });
        });
        grid.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.char-card');
            if (card) { card.classList.add('reset-anim'); card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`; }
        }, true); // useCapture to catch mouseleave from children
    },
    currentGalleryImages: [],
    currentLightboxIdx: -1,
    openLightbox: (src) => {
        const lb = document.getElementById('lightbox'); 
        if (!lb) return;
        const img = document.getElementById('lightbox-img');
        if (img) img.src = src;
        const comments = document.getElementById('lightbox-comments');
        if (comments) comments.style.display = 'none';
        document.querySelectorAll('.lb-nav').forEach(n => n.style.display = 'none');
        const voteC = document.getElementById('lightbox-vote-container');
        if (voteC) voteC.style.display = 'none';
        lb.style.display = 'flex'; 
        setTimeout(() => lb.classList.add('active'), 10);
    },
    closeLightbox: () => {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        lb.classList.remove('active');
        setTimeout(() => lb.style.display = 'none', 300);
    },
    openGalleryLightbox: (idx, images) => {
        Visuals.currentGalleryImages = images;
        Visuals.currentLightboxIdx = idx;
        
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        const comments = document.getElementById('lightbox-comments');
        if (comments) comments.style.display = 'flex';
        document.querySelectorAll('.lb-nav').forEach(n => n.style.display = 'flex');
        
        lb.style.display = 'flex'; 
        setTimeout(() => lb.classList.add('active'), 10);
        
        Visuals.updateLightboxView();
    },
    lbNext: () => {
        if(Visuals.currentGalleryImages.length === 0) return;
        Visuals.currentLightboxIdx = (Visuals.currentLightboxIdx + 1) % Visuals.currentGalleryImages.length;
        Visuals.updateLightboxView();
    },
    lbPrev: () => {
        if(Visuals.currentGalleryImages.length === 0) return;
        Visuals.currentLightboxIdx = (Visuals.currentLightboxIdx - 1 + Visuals.currentGalleryImages.length) % Visuals.currentGalleryImages.length;
        Visuals.updateLightboxView();
    },
    updateLightboxView: () => {
        const imgObj = Visuals.currentGalleryImages[Visuals.currentLightboxIdx];
        if (!imgObj) return;
        
        const img = document.getElementById('lightbox-img');
        if (img) img.src = imgObj.image_url;
        
        const voteC = document.getElementById('lightbox-vote-container');
        if (voteC) {
            voteC.style.display = 'flex';
            const cache = Actions.votesCache[imgObj.id] || { score: 0, userVote: 0 };
            voteC.innerHTML = `
                <button class="vote-btn upvote ${cache.userVote === 1 ? 'active' : ''}" onclick="Actions.voteImage('${imgObj.id}', 1)"><i class="fas fa-arrow-up"></i></button>
                <div class="vote-score">${cache.score}</div>
                <button class="vote-btn downvote ${cache.userVote === -1 ? 'active' : ''}" onclick="Actions.voteImage('${imgObj.id}', -1)"><i class="fas fa-arrow-down"></i></button>
            `;
        }

        CommentsManager.openDrawer(imgObj.character_id, 'gallery', 'Image Discussion', { imageUrl: imgObj.image_url }, 'lightbox');
    }
};

// LORE PRE-FETCHER
export const LorePrefetcher = {
    entries: [],
    isLoaded: false,
    
    init: async () => {
        // Fetch a bulk array of lore entries globally
        const { data, error } = await supabaseClient
            .from('lore_entries')
            .select('title, description, image_url')
            .limit(20);
            
        if (!error && data) {
            // Filter out entries without images to ensure the UI always looks good
            LorePrefetcher.entries = data.filter(entry => entry.image_url && entry.image_url.trim() !== '');
            LorePrefetcher.isLoaded = true;
        }
    },
    
    getRandomEntry: () => {
        if (!LorePrefetcher.isLoaded || LorePrefetcher.entries.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * LorePrefetcher.entries.length);
        return LorePrefetcher.entries[randomIndex];
    }
};

// AUDIO CONTROLLER
export const AudioController = {
    audioEl: null, btn: null, initialized: false,
    init: () => {
        AudioController.audioEl = document.getElementById('ambient-audio');
        const div = document.getElementById('audio-toggle-container');
        if (div) {
            div.innerHTML = `<div class="back-btn-wrapper" id="audio-btn"><i class="fas fa-volume-mute"></i></div>`;
            AudioController.btn = document.getElementById('audio-btn');
            if (AudioController.btn) AudioController.btn.addEventListener('click', AudioController.toggle);
        }
    },
    toggle: () => {
        if(!AudioController.audioEl) return;
        AudioController.audioEl.muted = !AudioController.audioEl.muted;
        if(!AudioController.initialized && !AudioController.audioEl.muted) { 
            AudioController.audioEl.play().catch(()=>{}); 
            AudioController.initialized = true; 
        }
        if (AudioController.btn) {
            AudioController.btn.innerHTML = `<i class="fas fa-volume-${AudioController.audioEl.muted ? 'mute' : 'up'}"></i>`;
        }
    }
};

// READER FEATURES
export const ReaderFeatures = {
    fontSize: 'text-md', fontFamily: 'font-serif',
    toggleFocus: (btn) => { document.body.classList.toggle('focus-active'); btn.classList.toggle('active'); },
    toggleFontMenu: () => { const m = document.getElementById('font-menu'); if (m) m.style.display = m.style.display==='flex'?'none':'flex'; },
    setFontSize: (s) => { ReaderFeatures.fontSize = s; ReaderFeatures.applyFonts(); },
    setFontFamily: (f) => { ReaderFeatures.fontFamily = f; ReaderFeatures.applyFonts(); },
    applyFonts: () => { const c = document.querySelector('.reader-content'); if(c) c.className = `reader-content glass-box ${ReaderFeatures.fontSize} ${ReaderFeatures.fontFamily}`; },
    toggleSidebar: () => {
        const sb = document.querySelector('.reader-sidebar');
        const bd = document.querySelector('.sidebar-backdrop');
        if(sb) sb.classList.toggle('active');
        if(bd) bd.classList.toggle('active');
    }
};

// LIGHTSABER CONTROLLER
export const SaberController = {
    widget: null,
    config: null,
    _animFrame: null,
    _hideTimer: null,
    _resetTimer: null,
    _animationToken: 0,
    currentMode: default_behavior_lightsaber,
    getBackgroundImage: () => {
        const bg = document.getElementById('global-bg');
        if (!bg) return '';
        const raw = bg.style.backgroundImage || '';
        const match = raw.match(/url\(["']?(.*?)["']?\)/);
        return match ? match[1] : '';
    },
    normalizeMode: (mode) => mode === 'horizontal' ? 'horizontal' : 'vertical',
    getBladeLength: (mode = SaberController.currentMode) => {
        const normalized = SaberController.normalizeMode(mode);
        return normalized === 'horizontal'
            ? Math.max(420, Math.min(Math.round(window.innerWidth * 0.68), 980))
            : Math.max(440, Math.min(Math.round(window.innerHeight * 0.72), 900));
    },
    getLayoutForMode: (mode = SaberController.currentMode) => {
        const normalized = SaberController.normalizeMode(mode);
        if (normalized === 'horizontal') {
            return {
                mode: normalized,
                x: 50,
                y: 88,
                rotation: 0,
                bladeLength: SaberController.getBladeLength(normalized)
            };
        }
        return {
            mode: normalized,
            x: 50,
            y: 62,
            rotation: -90,
            bladeLength: SaberController.getBladeLength(normalized)
        };
    },
    clearAnimation: () => {
        if (SaberController._animFrame) {
            cancelAnimationFrame(SaberController._animFrame);
            SaberController._animFrame = null;
        }
        clearTimeout(SaberController._hideTimer);
        clearTimeout(SaberController._resetTimer);
        SaberController._hideTimer = null;
        SaberController._resetTimer = null;
    },
    animateProgressTo: (target, duration, onComplete) => {
        if (!SaberController.widget) return;
        SaberController.clearAnimation();
        const start = SaberController.widget.getProgress();
        const delta = target - start;
        const token = ++SaberController._animationToken;
        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const step = (now) => {
            if (!SaberController.widget || token !== SaberController._animationToken) return;
            const t = Math.min((now - startTime) / duration, 1);
            const value = start + (delta * easeOutCubic(t));
            SaberController.widget.setProgress(value, false);

            if (t < 1) {
                SaberController._animFrame = requestAnimationFrame(step);
                return;
            }

            SaberController._animFrame = null;
            if (onComplete) onComplete();
        };

        SaberController._animFrame = requestAnimationFrame(step);
    },
    syncWidgetBackdrop: () => {
        if (!SaberController.widget) return;
        const layout = SaberController.getLayoutForMode(SaberController.currentMode);
        SaberController.widget.setOptions({
            x: layout.x,
            y: layout.y,
            rotation: layout.rotation,
            backgroundImage: SaberController.getBackgroundImage(),
            bladeLength: layout.bladeLength
        });
    },
    init: async () => {
        try {
            const module = await import('../components/lightsaber/lightsaber-widget.js');
            const configModule = await import('../components/lightsaber/lightsaber-config.js');
            SaberController.config = configModule;
            
            const saved = JSON.parse(localStorage.getItem('userParamsSaber') || '{}');
            const mode = SaberController.normalizeMode(saved.mode || default_behavior_lightsaber);
            const layout = SaberController.getLayoutForMode(mode);
            SaberController.currentMode = mode;
            const defaults = {
                mode,
                x: layout.x, y: layout.y, rotation: layout.rotation,
                bladeLength: layout.bladeLength, color: 'blue',
                hilt: 'obiwan', unstable: false,
                audio: true, backgroundImage: SaberController.getBackgroundImage(),
                showProgress: false, progressLabel: 'Accessing Archives...',
                scale: 1
            };
            
            const merged = {
                ...defaults,
                ...saved,
                mode: defaults.mode,
                x: defaults.x,
                y: defaults.y,
                rotation: defaults.rotation,
                bladeLength: defaults.bladeLength,
                backgroundImage: defaults.backgroundImage,
                showProgress: false
            };
            SaberController.widget = module.createLightsaber(merged);
            SaberController.widget.hide();
            
            // Populate options in saber-modal
            const hiltSelect = document.getElementById('saber-hilt');
            if (hiltSelect && configModule.DEMO_HILT_OPTIONS) {
                hiltSelect.innerHTML = configModule.DEMO_HILT_OPTIONS.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
                if(merged.hilt) hiltSelect.value = merged.hilt;
            }
            
            ['color', 'mode', 'unstable', 'audio'].forEach(key => {
                const el = document.getElementById('saber-' + key);
                if (el) {
                    if (el.type === 'checkbox') el.checked = merged[key];
                    else el.value = merged[key];
                }
            });
        } catch(e) {
            console.error("Failed to load Lightsaber module:", e);
        }
    },
    saveAndApply: () => {
        if(!SaberController.widget) return;
        const hilt = document.getElementById('saber-hilt').value;
        const color = document.getElementById('saber-color').value;
        const mode = SaberController.normalizeMode(document.getElementById('saber-mode').value);
        const unstable = document.getElementById('saber-unstable').checked;
        const audio = document.getElementById('saber-audio').checked;
        
        const prefs = { hilt, color, mode, unstable, audio };
        const layout = SaberController.getLayoutForMode(mode);
        SaberController.currentMode = mode;
        localStorage.setItem('userParamsSaber', JSON.stringify(prefs));
        
        SaberController.widget.setOptions({
            ...prefs,
            x: layout.x,
            y: layout.y,
            rotation: layout.rotation,
            bladeLength: layout.bladeLength,
            backgroundImage: SaberController.getBackgroundImage(),
            showProgress: false
        });
        UI.closeSaberModal();
        
        // Show a quick demo ignite!
        SaberController.widget.show();
        SaberController.widget.setProgress(0, false);
        SaberController.widget.ignite();
        setTimeout(() => {
            SaberController.widget.retract();
            setTimeout(() => SaberController.widget.hide(), 1000);
        }, 2000);
    },
    showLoading: () => {
        if (!SaberController.widget) return;
        SaberController.clearAnimation();
        SaberController.syncWidgetBackdrop();
        SaberController.widget.setProgress(0, false);
        SaberController.widget.show();
        SaberController.animateProgressTo(92, 2400);
    },
    hideLoading: () => {
        if (!SaberController.widget) return;
        SaberController.animateProgressTo(100, 360, () => {
            SaberController._hideTimer = setTimeout(() => {
                if (!SaberController.widget) return;
                SaberController.widget.hide();
                const tokenAtHide = SaberController._animationToken;
                SaberController._resetTimer = setTimeout(() => {
                    if (!SaberController.widget || tokenAtHide !== SaberController._animationToken) return;
                    SaberController.widget.setProgress(0, false);
                }, 650);
            }, 180);
        });
    }
};

// UI UTILITIES
export const UI = {
    bg: document.getElementById('global-bg'),
    back: document.getElementById('back-container'),
    wp: document.getElementById('wp-toggle-container'),
    loadingScreen: document.getElementById('lore-loading-screen'),
    
    setBg: (url) => { 
        if(url && UI.bg) {
            UI.bg.style.backgroundImage = `url('${url}')`;
            SaberController.syncWidgetBackdrop();
        }
    },
    
    setBackButton: (act, lbl) => {
        if (UI.back) {
            UI.back.innerHTML = act ? 
                `<div class="back-btn-wrapper" onclick="${act}"><i class="fas fa-arrow-left"></i> ${lbl}</div>` : '';
        }
    },
    
    showWallpaperButton: () => {
        if (UI.wp) {
            if (State.currentWallpapers && State.currentWallpapers.length > 0) {
                UI.wp.innerHTML = `<div class="back-btn-wrapper" style="color:var(--accent-color)" onclick="UI.openWallpaperModal()"><i class="fas fa-paint-brush"></i></div>`;
            } else {
                UI.wp.innerHTML = '';
            }
        }
    },
    
    hideWallpaperButton: () => { if (UI.wp) UI.wp.innerHTML = ''; },
    
    openWallpaperModal: () => {
        if (!State.currentWallpapers || State.currentWallpapers.length === 0) return;
        const grid = document.getElementById('wp-grid');
        if (grid) {
            grid.innerHTML = State.currentWallpapers.map(wp => 
                `<div style="cursor:pointer" onclick="UI.setBg('${wp.image_url}'); document.getElementById('wp-modal').style.display='none'">
                    <img src="${wp.image_url}" style="width:100%; border-radius:4px;">
                </div>`
            ).join('');
        }
        const modal = document.getElementById('wp-modal');
        if (modal) modal.style.display = 'flex';
    },
    
    showLoading: () => {
        LoaderManager.show();
    },

    hideLoading: () => {
        LoaderManager.hide();
    },

    openSaberModal: () => {
        const modal = document.getElementById('saber-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    },

    closeSaberModal: () => {
        const modal = document.getElementById('saber-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    initAuthLink: (userProfile) => {
        const container = document.getElementById('auth-link-container');
        if (!container) return;
        if (userProfile) {
            container.innerHTML = `
                <div class="back-btn-wrapper" onclick="UI.openProfileModal()" title="Profile">
                    <img src="${userProfile.avatar_url || 'https://via.placeholder.com/32'}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-color);">
                </div>`;
        } else {
            container.innerHTML = `
                <div class="back-btn-wrapper" onclick="UI.openAuthModal()" title="Sign In">
                    <i class="fas fa-user-circle" style="font-size: 1.4rem;"></i>
                </div>`;
        }
    },

    openAuthModal: () => {
        const err = document.getElementById('auth-error');
        if (err) {
            err.textContent = '';
            err.style.color = 'var(--danger-color)';
        }
        const pw = document.getElementById('auth-password');
        if (pw) pw.value = '';
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    },

    closeAuthModal: () => {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    openProfileModal: () => {
        if (!UserAuth.profile) return;
        const msg = document.getElementById('profile-msg');
        if (msg) {
            msg.textContent = '';
            msg.style.color = '';
        }
        const name = document.getElementById('profile-name');
        if (name) name.value = UserAuth.profile.display_name || '';
        const avatar = document.getElementById('profile-avatar');
        if (avatar) avatar.value = UserAuth.profile.avatar_url || '';
        const bio = document.getElementById('profile-bio');
        if (bio) bio.value = UserAuth.profile.bio || '';
        const preview = document.getElementById('profile-avatar-preview');
        if (preview) preview.src = UserAuth.profile.avatar_url || 'https://via.placeholder.com/100';

        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    },

    closeProfileModal: () => {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    initAdminLink: () => {
        const container = document.getElementById('admin-link-container');
        if (!container) return;
        if (UserAuth.profile && UserAuth.profile.role === 'admin') {
            container.innerHTML = `
                <div class="back-btn-wrapper" onclick="window.location.href='admin.html'" title="Admin Panel">
                    <i class="fas fa-cog" style="font-size: 1.2rem;"></i>
                </div>`;
        } else {
            container.innerHTML = '';
        }
    },

    showGalleryWarning: (storySlug) => {
        const modal = document.getElementById('gallery-warning-modal');
        if (!modal) return;
        
        // Bind Yes button click
        const yesBtn = document.getElementById('gallery-warning-yes');
        if (yesBtn) {
            yesBtn.onclick = () => {
                State.galleryConfirmed = true;
                sessionStorage.setItem('gallery_confirmed', 'true');
                UI.closeGalleryWarning();
                
                // Proceed to routing and loading
                window.Router.handle();
            };
        }
        
        // Bind No button click
        const noBtn = document.getElementById('gallery-warning-no');
        if (noBtn) {
            noBtn.onclick = () => {
                UI.closeGalleryWarning();
                
                // Go back to story hub or home
                if (storySlug) {
                    window.Router.navigate('story/' + storySlug);
                } else {
                    window.Router.navigate('home');
                }
            };
        }
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    },
    
    closeGalleryWarning: () => {
        const modal = document.getElementById('gallery-warning-modal');
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
};

// LOADER MANAGER
export const LoaderManager = {
    activeLoaderId: null,
    activeLoader: null,
    _IMPORT_TIMEOUT_MS: 5000,
    registry: {
        'primary': {
            path: '../components/primary_loader/primary_loader.js',
            className: 'PrimaryLoader'
        },
        'anomaly_flesh': {
            path: '../components/anomaly_loader/anomaly_loader.js',
            className: 'AnomalyLoader',
            pattern: 'flesh'
        },
        'anomaly_hex': {
            path: '../components/anomaly_loader/anomaly_loader.js',
            className: 'AnomalyLoader',
            pattern: 'hex'
        },
        'anomaly_cyber': {
            path: '../components/anomaly_loader/anomaly_loader.js',
            className: 'AnomalyLoader',
            pattern: 'cyber'
        },
        'anomaly_kinetic': {
            path: '../components/anomaly_loader/anomaly_loader.js',
            className: 'AnomalyLoader',
            pattern: 'kinetic'
        },
        'anomaly_crystal': {
            path: '../components/anomaly_loader/anomaly_loader.js',
            className: 'AnomalyLoader',
            pattern: 'crystal'
        },
        'lightsaber': 'inline'
    },

    withTimeout: (promise, message) => {
        let timerId;
        const timeout = new Promise((_, reject) => {
            timerId = setTimeout(() => reject(new Error(message)), LoaderManager._IMPORT_TIMEOUT_MS);
        });

        return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
    },

    clearPrimaryLoader: () => {
        const loader = document.getElementById('loader');
        if (!loader) return;
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 1500);
    },

    determineRequiredLoader: () => {
        if (State.isInitialAppLoad) {
            return 'primary';
        }
        if (State.currentStory && State.currentStory.loader_theme) {
            return State.currentStory.loader_theme;
        }
        return 'lightsaber';
    },

    show: async () => {
        const loaderId = LoaderManager.determineRequiredLoader();

        if (LoaderManager.activeLoaderId === loaderId) {
            if (loaderId === 'lightsaber') {
                 SaberController.showLoading();
            } else if (LoaderManager.activeLoader && typeof LoaderManager.activeLoader.show === 'function') {
                 const config = LoaderManager.registry[loaderId];
                 LoaderManager.activeLoader.show(config ? config.pattern : undefined);
            }
            return;
        }

        LoaderManager.hide();
        LoaderManager.activeLoaderId = loaderId;

        if (loaderId === 'lightsaber') {
            LoaderManager.activeLoader = SaberController;
            SaberController.showLoading();
        } else {
            const config = LoaderManager.registry[loaderId];
            if (config && config.path) {
                try {
                    const module = await LoaderManager.withTimeout(
                        import(config.path),
                        `Timed out loading loader theme "${loaderId}".`
                    );
                    const loaderObj = module[config.className] || module.default;
                    LoaderManager.activeLoader = loaderObj;

                    if (typeof loaderObj.inject === 'function') {
                        loaderObj.inject();
                    }
                    if (typeof loaderObj.show === 'function') {
                        loaderObj.show(config.pattern);
                    }
                } catch (e) {
                    console.error(`[LoaderManager] Failed to dynamically load theme "${loaderId}":`, e);
                    LoaderManager.activeLoaderId = 'lightsaber';
                    LoaderManager.activeLoader = SaberController;
                    SaberController.showLoading();
                }
            } else {
                LoaderManager.activeLoaderId = 'lightsaber';
                LoaderManager.activeLoader = SaberController;
                SaberController.showLoading();
            }
        }
    },

    hide: () => {
        if (!LoaderManager.activeLoaderId) return;

        if (LoaderManager.activeLoaderId === 'lightsaber') {
            SaberController.hideLoading();
        } else if (LoaderManager.activeLoaderId === 'primary' && !LoaderManager.activeLoader) {
            LoaderManager.clearPrimaryLoader();
        } else if (LoaderManager.activeLoader && typeof LoaderManager.activeLoader.hide === 'function') {
            LoaderManager.activeLoader.hide();
        }
    },

    playOutro: () => {
        if (!LoaderManager.activeLoaderId) return;

        if (LoaderManager.activeLoaderId === 'primary') {
            if (LoaderManager.activeLoader && typeof LoaderManager.activeLoader.playOutro === 'function') {
                LoaderManager.activeLoader.playOutro();
            } else {
                LoaderManager.clearPrimaryLoader();
            }
        } else if (LoaderManager.activeLoaderId === 'lightsaber') {
            SaberController.hideLoading();
        } else if (LoaderManager.activeLoader && typeof LoaderManager.activeLoader.playOutro === 'function') {
            LoaderManager.activeLoader.playOutro();
        } else {
            LoaderManager.hide();
        }

        State.isInitialAppLoad = false;
    }
};

// GALLERY & INTERACTION ACTIONS
export const Actions = {
    currentGalleryImages: [],
    votesCache: {}, // { imageId: { score: 0, userVote: 0 } }
    filteredImages: [],
    latestGalleryImages: [],
    isLoadingMore: false,
    isMatureTag: (tag) => {
        const lower = String(tag || '').toLowerCase();
        return lower === 'r18' || lower === 'mature' || lower === 'nsfw' || lower === 'suggestive';
    },
    isMatureImage: (image) => {
        if (!image || !Array.isArray(image.image_tags)) return false;
        return image.image_tags.some(tag => Actions.isMatureTag(tag));
    },
    processGalleryImages: (images) => {
        let processed = Array.isArray(images) ? [...images] : [];

        if (!State.showR18) {
            return processed.filter(image => !Actions.isMatureImage(image));
        }

        processed.sort((a, b) => Number(Actions.isMatureImage(b)) - Number(Actions.isMatureImage(a)));
        return processed;
    },
    updateR18ToggleButtons: () => {
        const toggleButtons = document.querySelectorAll('[data-gallery-r18-toggle]');
        toggleButtons.forEach((btn) => {
            btn.style.borderColor = State.showR18 ? 'var(--danger-color)' : '';
            btn.style.color = State.showR18 ? 'var(--danger-color)' : '';
            btn.innerHTML = State.showR18
                ? `<i class="fas fa-fire"></i> <span>R18 On</span>`
                : `<i class="fas fa-eye-slash"></i> <span>R18 Off</span>`;
        });
    },
    
    fetchVotes: async () => {
        if(Actions.currentGalleryImages.length === 0) return;
        const imageIds = Actions.currentGalleryImages.map(img => img.id);
        
        try {
            const { data: votes, error } = await supabaseClient
                .from('image_votes')
                .select('image_id, vote_value, user_id')
                .in('image_id', imageIds);
                
            if (error) throw error;
            
            Actions.votesCache = {};
            imageIds.forEach(id => Actions.votesCache[id] = { score: 0, userVote: 0 });
            
            const userId = UserAuth.user ? UserAuth.user.id : null;
            
            votes.forEach(v => {
                if(Actions.votesCache[v.image_id]) {
                    Actions.votesCache[v.image_id].score += v.vote_value;
                    if(userId && v.user_id === userId) {
                        Actions.votesCache[v.image_id].userVote = v.vote_value;
                    }
                }
            });
        } catch(err) {
            console.error('Error fetching votes:', err);
        }
    },

    voteImage: async (imageId, value) => {
        if(!UserAuth.user) {
            UI.openAuthModal();
            return;
        }
        
        const currentVote = Actions.votesCache[imageId]?.userVote || 0;
        let newValue = value;
        
        if (currentVote === value) {
            newValue = 0; // Toggle off
        }
        
        try {
            if (newValue === 0) {
                await supabaseClient.from('image_votes')
                    .delete()
                    .eq('image_id', imageId)
                    .eq('user_id', UserAuth.user.id);
            } else {
                await supabaseClient.from('image_votes')
                    .upsert({ 
                        image_id: imageId, 
                        user_id: UserAuth.user.id, 
                        vote_value: newValue 
                    }, { onConflict: 'user_id, image_id' });
            }
            
            if (!Actions.votesCache[imageId]) {
                Actions.votesCache[imageId] = { score: 0, userVote: 0 };
            }
            Actions.votesCache[imageId].score += (newValue - currentVote);
            Actions.votesCache[imageId].userVote = newValue;
            
            const container = document.getElementById('gallery-grid');
            if (container) {
                Actions.renderGalleryGrid();
            } else {
                // Update DOM nodes directly for latest images grid
                const scoreEl = document.getElementById(`vote-score-${imageId}`);
                if (scoreEl) scoreEl.innerText = Actions.votesCache[imageId].score;
                
                const itemContainer = scoreEl?.parentElement;
                if (itemContainer) {
                    const upBtn = itemContainer.querySelector('.upvote');
                    const downBtn = itemContainer.querySelector('.downvote');
                    if (upBtn) upBtn.className = `vote-btn upvote ${newValue === 1 ? 'active' : ''}`;
                    if (downBtn) downBtn.className = `vote-btn downvote ${newValue === -1 ? 'active' : ''}`;
                }
            }

            // If lightbox is open and displaying this image, update it
            const lb = document.getElementById('lightbox');
            if (lb && lb.classList.contains('active')) {
                const imgObj = Visuals.currentGalleryImages[Visuals.currentLightboxIdx];
                if (imgObj && imgObj.id === imageId) {
                    Visuals.updateLightboxView();
                }
            }

        } catch (err) {
            console.error('Vote error:', err);
            alert('Failed to register vote.');
        }
    },
    
    renderLatestGalleryGrid: () => {
        const grid = document.getElementById('latest-gallery-grid');
        if (!grid) return;

        const displayedImages = Actions.processGalleryImages(Actions.latestGalleryImages);
        Actions.currentGalleryImages = displayedImages;
        grid.innerHTML = '';

        if (displayedImages.length === 0) {
            grid.innerHTML = `
                <div class="glass-box" style="padding:1rem 1.25rem; text-align:center; color:#aaa;">
                    ${Actions.latestGalleryImages.length > 0
                        ? 'No recent images are visible with R18 hidden right now.'
                        : 'No recent images yet.'}
                </div>
            `;
            return;
        }

        const colCount = window.innerWidth <= 768 ? 2 : 3;
        const columns = Array.from({ length: colCount }, () => {
            const column = document.createElement('div');
            column.className = 'flex-masonry-col';
            return column;
        });

        displayedImages.forEach((image, idx) => {
            const cache = Actions.votesCache[image.id] || { score: 0, userVote: 0 };
            const card = document.createElement('div');
            card.className = 'gallery-item';
            card.style.position = 'relative';
            card.innerHTML = `
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; z-index: 5; pointer-events: none;">${image.characters?.name || 'Unknown'}</div>
                <img src="${image.image_url}" loading="lazy" onclick="window.Visuals.openGalleryLightbox(${idx}, window.Actions.currentGalleryImages)">
                <div class="image-vote-container" onclick="event.stopPropagation()">
                    <button class="vote-btn upvote ${cache.userVote === 1 ? 'active' : ''}" onclick="window.Actions.voteImage('${image.id}', 1)"><i class="fas fa-arrow-up"></i></button>
                    <span class="vote-score" id="vote-score-${image.id}">${cache.score}</span>
                    <button class="vote-btn downvote ${cache.userVote === -1 ? 'active' : ''}" onclick="window.Actions.voteImage('${image.id}', -1)"><i class="fas fa-arrow-down"></i></button>
                </div>
            `;
            columns[idx % colCount].appendChild(card);
        });

        columns.forEach((column) => grid.appendChild(column));
    },

    // Chunked gallery rendering via requestIdleCallback to avoid long tasks
    renderGalleryGrid: (shuffle = false) => {
        let imgs = Actions.processGalleryImages(Actions.currentGalleryImages);

        if (State.filterTag !== 'All') {
            imgs = imgs.filter(i => i.image_tags && i.image_tags.includes(State.filterTag));
        }
        if (shuffle) imgs.sort(() => Math.random() - 0.5);
        
        Actions.filteredImages = imgs;
        
        const container = document.getElementById('gallery-grid');
        if (!container) return;
        container.innerHTML = ''; // Clear existing

        if (State.galleryViewMode === 'deck') {
            container.className = 'decks-grid';
            
            const decksMap = {};
            imgs.forEach(i => {
                if (i.image_tags && i.image_tags.length > 0) {
                    i.image_tags.forEach(t => {
                        const lower = t.toLowerCase();
                        if (lower === 'r18' || lower === 'mature' || lower === 'nsfw' || lower === 'suggestive') return;
                        
                        if (!decksMap[t]) decksMap[t] = [];
                        decksMap[t].push(i);
                    });
                } else {
                    if (!decksMap['General']) decksMap['General'] = [];
                    decksMap['General'].push(i);
                }
            });

            // Ensure ungrouped images fall back to General
            imgs.forEach(i => {
                const isGrouped = Object.values(decksMap).some(arr => arr.includes(i));
                if (!isGrouped) {
                    if (!decksMap['General']) decksMap['General'] = [];
                    decksMap['General'].push(i);
                }
            });

            const frag = document.createDocumentFragment();
            const tagsList = Object.keys(decksMap).sort();
            
            tagsList.forEach(tag => {
                const deckImages = decksMap[tag];
                if (deckImages.length === 0) return;

                // Cap at 12 to maintain visual depth accuracy and prevent heavy DOM paint loops
                const maxVisibleCards = Math.min(deckImages.length, 20);
                const scrubImages = deckImages.slice(0, maxVisibleCards);
                const deckItem = document.createElement('div');
                
                deckItem.className = 'card-deck';
                
                // Scoped tracking state for this specific deck instance
                let currentIndex = 0;
                let isHovered = false;

                // Helper function to dynamically adjust layout positions
                const updateDeckLayout = () => {
                    const cards = deckItem.querySelectorAll('.deck-card');
                    cards.forEach((card, domIdx) => {
                        // Determine relative distance from the currently focused card
                        const offset = domIdx - currentIndex; 

                        if (offset < 0) {
                            // Sent to the left backdrop: completely read or filtered past
                            card.style.opacity = '0';
                            card.style.transform = `translate3d(-120px, 15px, -100px) rotate(-25deg) scale(0.85)`;
                            card.style.zIndex = domIdx;
                            card.querySelector('img').style.filter = 'brightness(0.3)';
                        } else if (offset === 0) {
                            // The main foreground spotlight card
                            card.style.opacity = '1';
                            card.style.zIndex = 50;
                            card.style.transform = isHovered 
                                ? `translate3d(0, -15px, 20px) scale(1.05)` 
                                : `translate3d(0, 0, 0)`;
                            card.querySelector('img').style.filter = 'brightness(1)';
                        } else {
                            // Secondary and tertiary cards fanning outward to the right field
                            card.style.opacity = offset <= 3 ? '1' : '0'; // Only show next 3 layers
                            card.style.zIndex = 50 - offset;

                            if (isHovered) {
                                // Accentuated wide 3D spreading arc values
                                const shiftX = 35 + (offset * 25);
                                const shiftY = -10 - (offset * 8);
                                const rotateDeg = 6 + (offset * 6);
                                const scaleFactor = 1 - (offset * 0.04);
                                
                                card.style.transform = `translate3d(${shiftX}px, ${shiftY}px, -${offset * 20}px) rotate(${rotateDeg}deg) scale(${scaleFactor})`;
                                card.querySelector('img').style.filter = `brightness(${0.85 - (offset * 0.15)})`;
                            } else {
                                // Resting stack style
                                const shiftY = -6 * offset;
                                const scaleFactor = 1 - (offset * 0.04);
                                card.style.transform = `translate3d(0, ${shiftY}px, -${offset * 15}px) scale(${scaleFactor})`;
                                card.querySelector('img').style.filter = 'brightness(0.7)';
                            }
                        }
                    });

                    // Refresh counter notification chip
                    const indicator = deckItem.querySelector('.deck-scroll-indicator');
                    if (indicator) {
                        indicator.textContent = `${currentIndex + 1} / ${scrubImages.length} (Scroll)`;
                    }
                };

                // Capture scrolling wheel ticks
                deckItem.addEventListener('wheel', (e) => {
                    // Intercept standard global viewport page scroll
                    e.preventDefault(); 
                    
                    if (e.deltaY > 0 && currentIndex < scrubImages.length - 1) {
                        currentIndex++;
                        updateDeckLayout();
                    } else if (e.deltaY < 0 && currentIndex > 0) {
                        currentIndex--;
                        updateDeckLayout();
                    }
                }, { passive: false });

                // Handle hover ignition states
                deckItem.onmouseenter = () => {
                    isHovered = true;
                    updateDeckLayout();
                };

                deckItem.onmouseleave = () => {
                    isHovered = false;
                    currentIndex = 0; // Seamless snap back to front cover when user pulls back mouse
                    updateDeckLayout();
                };

                // Handle selection redirection matching the spotlight index position
                deckItem.onclick = (e) => {
                    // Prevent event confusion layers
                    e.stopPropagation();
                    const activeImgRecord = scrubImages[currentIndex];
                    const flatIdx = Actions.filteredImages.findIndex(x => x.id === activeImgRecord.id);
                    if (flatIdx !== -1) {
                        Visuals.openGalleryLightbox(flatIdx, Actions.filteredImages);
                    }
                };

                // Build the template structures
                let cardsHtml = '';
                scrubImages.forEach((img) => {
                    cardsHtml += `
                        <div class="deck-card">
                            <img src="${img.image_url}" loading="lazy" alt="${tag} illustration">
                        </div>
                    `;
                });

                deckItem.innerHTML = `
                    ${cardsHtml}
                    <div class="deck-scroll-indicator"></div>
                    <div class="card-deck-title">
                        ${tag} <span style="opacity: 0.5; font-size: 0.8em;">(${deckImages.length})</span>
                    </div>
                `;
                
                frag.appendChild(deckItem);
                
                // Perform instant initialization call once added to document scope
                setTimeout(updateDeckLayout, 0);
            });
            
            container.appendChild(frag);
            return;
        }

        // Grid View chunked rendering
        container.className = 'sub-gallery-grid';
        const CHUNK_SIZE = 8;
        let idx = 0;

        const renderChunk = (deadline) => {
            const frag = document.createDocumentFragment();
            const chunkEnd = Math.min(idx + CHUNK_SIZE, imgs.length);
            
            while (idx < chunkEnd) {
                const i = imgs[idx];
                const currentIdx = idx;
                const cache = Actions.votesCache[i.id] || { score: 0, userVote: 0 };
                
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.position = 'relative';
                item.innerHTML = `
                    <img src="${i.image_url}" loading="lazy" onclick="Visuals.openGalleryLightbox(${currentIdx}, Actions.filteredImages)">
                    <div class="image-vote-container" onclick="event.stopPropagation()">
                        <button class="vote-btn upvote ${cache.userVote === 1 ? 'active' : ''}" onclick="Actions.voteImage('${i.id}', 1)"><i class="fas fa-arrow-up"></i></button>
                        <div class="vote-score">${cache.score}</div>
                        <button class="vote-btn downvote ${cache.userVote === -1 ? 'active' : ''}" onclick="Actions.voteImage('${i.id}', -1)"><i class="fas fa-arrow-down"></i></button>
                    </div>
                    <button style="position:absolute; bottom:15px; right:15px; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); border:1px solid rgba(255,215,0,0.2); color:var(--accent-color); border-radius:50%; width:35px; height:35px; cursor:pointer; z-index:10; transition:all 0.3s;" onmouseover="this.style.background='var(--accent-color)'; this.style.color='#000'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(0,0,0,0.5)'; this.style.color='var(--accent-color)'; this.style.transform='scale(1)';" onclick="event.stopPropagation(); CommentsManager.openDrawer('${i.character_id}', 'gallery', 'Image Discussion', { imageUrl: '${i.image_url}' })" title="Comment on this image">
                        <i class="fas fa-comment"></i>
                    </button>`;
                frag.appendChild(item);
                idx++;
            }
            
            container.appendChild(frag);
            
            if (idx < imgs.length) {
                if (window.requestIdleCallback) {
                    requestIdleCallback(renderChunk, { timeout: 100 });
                } else {
                    requestAnimationFrame(() => renderChunk());
                }
            }
        };

        renderChunk();
    },
    toggleViewMode: () => {
        const newMode = State.galleryViewMode === 'deck' ? 'grid' : 'deck';
        State.galleryViewMode = newMode;
        localStorage.setItem('gallery_view_mode', newMode);
        
        const btn = document.getElementById('pref-view-mode-toggle');
        if (btn) {
            btn.innerHTML = `<i class="${newMode === 'deck' ? 'fas fa-layer-group' : 'fas fa-th'}"></i> <span>${newMode === 'deck' ? 'Deck View' : 'Grid View'}</span>`;
        }
        
        Actions.renderGalleryGrid();
    },
    toggleR18: () => {
        const newValue = !State.showR18;
        State.showR18 = newValue;
        localStorage.setItem('show_r18', newValue ? 'true' : 'false');

        Actions.updateR18ToggleButtons();

        if (document.getElementById('latest-gallery-grid')) {
            Actions.renderLatestGalleryGrid();
        }

        if (document.getElementById('gallery-grid')) {
            Actions.renderGalleryGrid();
        }
    },
    setFilter: (t) => { State.filterTag = t; Actions.renderGalleryGrid(); },
    shuffleGallery: () => Actions.renderGalleryGrid(true),

    loadMoreLatestImages: async (storyId) => {
        if (Actions.isLoadingMore) return;
        Actions.isLoadingMore = true;
        const btn = document.getElementById('load-more-latest-btn');
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        const offset = Actions.latestGalleryImages.length;
        const newImages = await DB.getLatestGalleryImages(storyId, 10, offset);
        
        if (!newImages || newImages.length === 0) {
            if (btn) btn.style.display = 'none';
            Actions.isLoadingMore = false;
            return;
        }
        
        Actions.latestGalleryImages = Actions.latestGalleryImages.concat(newImages);
        Actions.currentGalleryImages = Actions.latestGalleryImages;
        await Actions.fetchVotes(); // Re-fetch votes for the new set
        Actions.renderLatestGalleryGrid();
        
        if (newImages.length < 10) {
            if (btn) btn.style.display = 'none';
        } else {
            if (btn) btn.innerHTML = 'Load More';
        }
        Actions.isLoadingMore = false;
    }
};
