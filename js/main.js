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
window.Render = Render;
window.Router = Router;

// Setup event listeners
window.addEventListener('hashchange', Router.handle);

window.addEventListener('DOMContentLoaded', async () => { 
    // 1. Instantly display the active loading system (Primary cinematic loader for cold start)
    await LoaderManager.show();

    // 2. Init rest of the app in parallel
    await SaberController.init();
    
    // Non-blocking prefetcher — cosmetic data should not block critical path
    LorePrefetcher.init(); // fire-and-forget (no await)
    
    UserAuth.init();
    Router.handle(); 
    Visuals.initDynamicTransparency(); 
    Particles.init();
    AudioController.init();
});
