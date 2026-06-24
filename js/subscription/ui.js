import { SubState, routeTo } from './state.js';
import { SubAuth } from './auth.js';

export const SubUI = {
    init: () => {
        document.body.addEventListener('click', (event) => {
            const routeButton = event.target.closest('[data-sub-route]');
            if (routeButton) {
                event.preventDefault();
                routeTo(routeButton.dataset.subRoute);
                return;
            }
            if (event.target.closest('[data-sub-open-auth]')) {
                event.preventDefault();
                SubUI.openAuthDialog();
            }
        });

        document.getElementById('sub-auth-submit')?.addEventListener('click', SubAuth.handleSubmit);
        document.getElementById('sub-auth-toggle')?.addEventListener('click', SubAuth.toggleMode);
    },

    setActiveNav: (view) => {
        document.querySelectorAll('[data-sub-route]').forEach(button => {
            const target = button.dataset.subRoute?.split('/')[0];
            button.classList.toggle('is-active', target === view || (view === 'story' && target === 'library'));
        });
    },

    setBack: (route = null, label = 'Back') => {
        const button = document.getElementById('sub-back-btn');
        if (!button) return;
        button.hidden = !route;
        button.innerHTML = `<i class="fas fa-arrow-left"></i><span>${label}</span>`;
        button.onclick = route ? () => routeTo(route) : null;
    },

    setAccent: (story) => {
        document.documentElement.style.setProperty('--accent-color', story?.theme_color || '#d8b55b');
        if (story?.background_image_url) {
            document.body.style.setProperty('--sub-story-bg', `url('${story.background_image_url}')`);
        } else {
            document.body.style.removeProperty('--sub-story-bg');
        }
    },

    openAuthDialog: () => {
        SubAuth.setMode(SubState.authMode || 'signin');
        const dialog = document.getElementById('sub-auth-dialog');
        if (dialog?.showModal) dialog.showModal();
        else dialog?.setAttribute('open', '');
    },

    closeAuthDialog: () => {
        const dialog = document.getElementById('sub-auth-dialog');
        if (dialog?.open) dialog.close();
    },

    toast: (message, type = 'info') => {
        const toast = document.getElementById('sub-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.dataset.type = type;
        toast.classList.add('is-visible');
        clearTimeout(SubUI._toastTimer);
        SubUI._toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
    },

    setInlineStatus: (id, message, type = 'info') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = message;
        el.dataset.type = type;
    },

    openReaderSheet: () => document.body.classList.add('sub-sheet-open'),
    closeReaderSheet: () => document.body.classList.remove('sub-sheet-open'),

    setReaderTheme: (theme) => {
        SubState.readerTheme = theme;
        localStorage.setItem('sub_reader_theme', theme);
        document.body.dataset.readerTheme = theme;
    },

    setReaderScale: (scale) => {
        SubState.readerScale = Math.max(0.85, Math.min(1.35, Number(scale) || 1));
        localStorage.setItem('sub_reader_scale', String(SubState.readerScale));
        document.documentElement.style.setProperty('--sub-reader-scale', SubState.readerScale);
    }
};
