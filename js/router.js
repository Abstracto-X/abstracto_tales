// js/router.js
import { State } from './config.js';
import { DB } from './db.js';
import { Render } from './render.js';
import { UI, Actions, Visuals, LoaderManager } from './ui.js';
import { CommentsManager } from './comments.js';
import { MapViewer } from './maps/MapViewer.js';

export const Router = {
    _activeRouteToken: 0,
    _pendingNavigationTimer: null,
    getParts: () => (window.location.hash.slice(1) || 'home').split('/'),
    
    navigate: (h) => {
        const nextRoute = (h || 'home').replace(/^#/, '') || 'home';
        const nextHash = `#${nextRoute}`;
        const stage = document.getElementById('content-stage');
        clearTimeout(Router._pendingNavigationTimer);

        // Re-render same-route clicks instead of fading the stage out forever.
        if (window.location.hash === nextHash || (!window.location.hash && nextRoute === 'home')) {
            Router.handle();
            return;
        }

        if (stage) stage.style.opacity = '0';
        const parts = nextRoute.split('/');
        const target = parts[0];
        const slug = parts[1];
        if (slug && ['story','read','gallery','lore','timeline','maps'].includes(target)) {
            DB.getStoryHubData(slug); // fire-and-forget; result will be cached for Router.handle
        }
        Router._pendingNavigationTimer = setTimeout(() => window.location.hash = nextRoute, 400); 
    },
    
    handle: () => {
        const routeToken = ++Router._activeRouteToken;
        
        // Clear the loader theme overrides upon switching views
        document.body.classList.remove('home-active');
        
        CommentsManager.closeDrawer();
        const globalBtn = document.getElementById('global-comment-btn');
        if (globalBtn) globalBtn.style.display = 'none';

        Visuals.closeLightbox();
        document.getElementById('wp-modal').style.display = 'none';
        
        if (MapViewer.destroy) MapViewer.destroy();

        // Clean up transient state on route change
        Actions.currentGalleryImages = [];
        Actions.votesCache = {};
        
        const sb = document.querySelector('.reader-sidebar');
        if(sb) sb.classList.remove('active');
        const bd = document.querySelector('.sidebar-backdrop');
        if(bd) bd.classList.remove('active');
        
        document.body.classList.remove('focus-active');

        const parts = Router.getParts();
        const view = parts[0];
        const id = parts[1];
        const subId = parts[2];
        const stage = document.getElementById('content-stage');
        
        // Intercept gallery route if content disclaimer not yet accepted
        if (view === 'gallery' && !State.galleryConfirmed && sessionStorage.getItem('gallery_confirmed') !== 'true') {
            UI.showGalleryWarning(id);
            return;
        }
        
        (async () => {
            if (view === 'home') await Render.home();
            else if (view === 'story') await Render.storyHub(id);
            else if (view === 'read') await Render.reader(id, parseInt(subId) || 0);
            else if (view === 'gallery') await Render.gallery(id, subId);
            else if (view === 'lore') {
                if(subId) await Render.loreDetail(id, subId);
                else await Render.lore(id);
            }
            else if (view === 'timeline') await Render.timeline(id);
            else if (view === 'maps') await Render.maps(id, subId);
            else await Render.home();
        })().then(() => {
            setTimeout(() => {
                if (routeToken !== Router._activeRouteToken) return;
                
                LoaderManager.playOutro();

                if (!stage) return;
                stage.scrollTop = 0;
                // Fade the new content back in
                stage.style.opacity = '1';
            }, 800);
        }).catch((err) => {
            console.error('Router rendering failed:', err);
            setTimeout(() => {
                if (routeToken !== Router._activeRouteToken) return;
                LoaderManager.hide();
                if (!stage) return;
                stage.stage = document.getElementById('content-stage');
                stage.innerHTML = `<div style="text-align:center; padding: 4rem; color: var(--danger-color); font-family: var(--font-header);">
                    <h3>System Error</h3>
                    <p style="font-family: var(--font-body); color: #ccc; margin-top: 1rem;">An error occurred while accessing the archives.</p>
                    <p style="font-size: 0.8rem; font-family: var(--font-ui); color: #888; margin-top: 0.5rem;">${err.message}</p>
                    <button class="btn-large" style="margin: 2rem auto 0;" onclick="window.location.reload()">Reload Archives</button>
                </div>`;
                stage.scrollTop = 0;
                stage.style.opacity = '1';
            }, 800);
        });
    }
};
