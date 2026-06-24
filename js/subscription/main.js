import { SubAuth } from './auth.js';
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
