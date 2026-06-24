// js/config.js

// SUPABASE CLIENT INITIALIZATION
export const SUPABASE_URL = 'https://gdivyqfhgashkqcqqnas.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_pumorCjNkGt1RV_Ygfq30A_IFtVz_Lt';

export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const hasAuthToken = () => {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                return true;
            }
        }
    } catch (e) {
        console.warn('localStorage is not accessible:', e);
    }
    return false;
};

// APPLICATION STATE
export const State = { 
    isInitialAppLoad: true,
    currentStory: null,
    currentStorySlug: null,
    currentChars: [], 
    currentWallpapers: [],
    filterTag: 'All',
    gallerySearch: '',
    gallerySort: 'curated',
    galleryConfirmed: false,
    galleryViewMode: localStorage.getItem('gallery_view_mode') || 'grid',
    showR18: hasAuthToken() && localStorage.getItem('show_r18') === 'true'
};

// LIGHTSABER CONTROLLER CONSTANT
export const default_behavior_lightsaber = 'horizontal';

// UTILITIES
export const Utils = {
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return (unsafe+'')
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    },
    escapeAttr: (unsafe) => {
        if (!unsafe) return '';
        return (unsafe+'')
             .replace(/&/g, "&amp;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
};
