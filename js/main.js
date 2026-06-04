// js/main.js
import { State, Utils } from './config.js';
import { DB } from './db.js';
import { UserAuth } from './auth.js';
import { CommentsManager } from './comments.js';
import { 
    Particles, 
    Visuals, 
    LorePrefetcher, 
    AudioController, 
    ReaderFeatures, 
    SaberController, 
    UI, 
    LoaderManager, 
    Actions 
} from './ui.js';
import { MapViewer } from './maps/MapViewer.js';
import { MapHub } from './maps/MapHub.js';
import { TimelineHub } from './timelines/TimelineHub.js';
import { LocationHistoryIndex } from './timelines/LocationHistoryIndex.js';
import { Render } from './render.js';
import { Router } from './router.js';

// Expose modules to the global namespace for inline HTML event handlers
window.State = State;
window.Utils = Utils;
window.DB = DB;
window.UserAuth = UserAuth;
window.CommentsManager = CommentsManager;
window.Particles = Particles;
window.Visuals = Visuals;
window.LorePrefetcher = LorePrefetcher;
window.AudioController = AudioController;
window.ReaderFeatures = ReaderFeatures;
window.SaberController = SaberController;
window.UI = UI;
window.LoaderManager = LoaderManager;
window.Actions = Actions;
window.MapViewer = MapViewer;
window.MapHub = MapHub;
window.TimelineHub = TimelineHub;
window.LocationHistoryIndex = LocationHistoryIndex;
window.Render = Render;
window.Router = Router;

// Setup event listeners
window.addEventListener('hashchange', Router.handle);

window.addEventListener('DOMContentLoaded', async () => { 
    let didStartRouter = false;
    const startRouterOnce = () => {
        if (didStartRouter) return;
        didStartRouter = true;
        Router.handle();
    };

    const startupWatchdog = setTimeout(() => {
        console.warn('Reader startup watchdog released the router.');
        startRouterOnce();
    }, 6000);

    try {
        // 1. Instantly display the active loading system (Primary cinematic loader for cold start)
        await LoaderManager.show();
    } catch (err) {
        console.error('Initial loader failed:', err);
    }

    try {
        // 2. Init rest of the app without letting cosmetic loaders block routing
        await SaberController.init();
    } catch (err) {
        console.error('Saber initialization failed:', err);
    }
    
    // Non-blocking prefetcher — cosmetic data should not block critical path
    LorePrefetcher.init().catch(err => console.error('Lore prefetch failed:', err)); // fire-and-forget
    
    UserAuth.init().catch(err => {
        console.error('Reader auth initialization failed:', err);
        UI.initAuthLink(null);
        UI.initAdminLink();
    });
    clearTimeout(startupWatchdog);
    startRouterOnce(); 
    Visuals.initDynamicTransparency(); 
    Particles.init();
    AudioController.init();
});
