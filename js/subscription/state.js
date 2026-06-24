import { supabaseClient, Utils } from '../config.js';

export const SubState = {
    user: null,
    profile: null,
    stories: [],
    entitlements: [],
    currentStory: null,
    currentCatalog: [],
    pendingReturnRoute: null,
    authMode: 'signin',
    readerTheme: localStorage.getItem('sub_reader_theme') || 'dark',
    readerScale: Number(localStorage.getItem('sub_reader_scale') || '1')
};

export { supabaseClient, Utils };

export const AccessLabels = {
    free: 'Free',
    unlocked: 'Unlocked',
    free_preview: 'Preview',
    locked_tier: 'Members',
    early_access: 'Early Access',
    key_locked: 'Key Unlock',
    pending_sync: 'Sync Pending',
    expired: 'Expired'
};

export const normalizeChapter = (chapter = {}) => {
    const requiredTier = chapter.required_tier || chapter.required_tier_name || chapter.tier_name || chapter.required_tier_label || null;
    const explicitState = chapter.access_state || chapter.state || null;
    const locked = Boolean(chapter.is_locked ?? chapter.locked ?? requiredTier);
    const accessState = explicitState || (locked ? 'locked_tier' : 'free');
    return {
        ...chapter,
        id: chapter.id,
        title: chapter.title || 'Untitled chapter',
        chapter_order: Number(chapter.chapter_order || chapter.order || 0),
        preview_text: chapter.preview_text || chapter.excerpt || '',
        required_tier_name: requiredTier,
        access_state: accessState,
        is_locked: ['locked_tier', 'early_access', 'key_locked', 'pending_sync', 'expired'].includes(accessState),
        can_read: Boolean(chapter.can_read ?? ['free', 'unlocked'].includes(accessState))
    };
};

export const routeTo = (path) => {
    window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^#?\/?/, '')}`;
};

export const safeText = Utils.escapeHtml;
export const safeAttr = Utils.escapeAttr;
