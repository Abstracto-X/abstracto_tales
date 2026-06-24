import { SubRender } from './render.js';
import { SubUI } from './ui.js';
import { SubState } from './state.js';

const parseHash = () => {
    const raw = (window.location.hash || '#/home').replace(/^#\/?/, '') || 'home';
    const [path, queryString = ''] = raw.split('?');
    const query = new URLSearchParams(queryString);
    return { parts: path.split('/').filter(Boolean), query };
};

export const SubRouter = {
    _token: 0,

    navigate: (path) => {
        window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\/?/, '')}`;
    },

    handle: async () => {
        const token = ++SubRouter._token;
        const { parts, query } = parseHash();
        const view = parts[0] || 'home';
        const stage = document.getElementById('sub-stage');
        SubUI.setActiveNav(view);
        if (stage) stage.classList.add('is-loading');
        if (query.get('return')) SubState.pendingReturnRoute = query.get('return');

        try {
            if (view === 'home') await SubRender.home();
            else if (view === 'library') await SubRender.library();
            else if (view === 'story') {
                const slug = parts[1];
                const section = parts[2];
                const id = parts[3];
                if (!slug) await SubRender.library();
                else if (section === 'chapters') await SubRender.chapters(slug);
                else if (section === 'chapter' && id) await SubRender.chapter(slug, id);
                else if (section === 'preview' && id) await SubRender.preview(slug, id);
                else await SubRender.story(slug);
            }
            else if (view === 'updates' || view === 'calendar') await SubRender.updates();
            else if (view === 'access') await SubRender.access(parts[1] || '');
            else if (view === 'account') await SubRender.account(parts[1] || '');
            else if (view === 'tiers') await SubRender.tiers();
            else if (view === 'tier') await SubRender.tiers(parts[1] || '');
            else if (view === 'help') await SubRender.help(parts[1] || 'access');
            else await SubRender.home();
        } catch (err) {
            console.error('Subscription route failed:', err);
            if (token === SubRouter._token) SubRender.error(err);
        } finally {
            if (token === SubRouter._token && stage) {
                stage.scrollTop = 0;
                stage.classList.remove('is-loading');
            }
        }
    }
};
