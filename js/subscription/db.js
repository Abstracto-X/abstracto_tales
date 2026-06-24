import { supabaseClient, SubState, normalizeChapter } from './state.js';

const rpcOrFallback = async (rpcName, args, fallback) => {
    try {
        const { data, error } = await supabaseClient.rpc(rpcName, args);
        if (!error) return data;
        console.warn(`RPC ${rpcName} unavailable, using fallback:`, error.message || error);
    } catch (err) {
        console.warn(`RPC ${rpcName} failed, using fallback:`, err);
    }
    return fallback();
};

export const SubDB = {
    getStories: async () => {
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('is_published', true)
            .order('sort_order');
        if (error) throw error;
        SubState.stories = data || [];
        return SubState.stories;
    },

    getStoryBySlug: async (slug) => {
        const cached = SubState.stories.find(story => story.slug === slug);
        if (cached) return cached;
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();
        if (error) throw error;
        return data;
    },

    getChapterCatalog: async (storyId) => {
        const rows = await rpcOrFallback('get_chapter_catalog', { target_story_id: storyId }, async () => {
            const { data, error } = await supabaseClient
                .from('chapters')
                .select('id, story_id, title, chapter_order, word_count, created_at, updated_at, is_published')
                .eq('story_id', storyId)
                .eq('is_published', true)
                .order('chapter_order');
            if (error) throw error;
            return (data || []).map(chapter => ({ ...chapter, access_state: 'free', can_read: true }));
        });
        SubState.currentCatalog = (rows || []).map(normalizeChapter).sort((a, b) => a.chapter_order - b.chapter_order);
        return SubState.currentCatalog;
    },

    getReaderChapter: async (chapterId) => {
        const chapter = await rpcOrFallback('get_reader_chapter', { target_chapter_id: chapterId }, async () => {
            const { data, error } = await supabaseClient
                .from('chapters')
                .select('*')
                .eq('id', chapterId)
                .eq('is_published', true)
                .single();
            if (error) throw error;
            return { ...data, access_state: 'free', can_read: true };
        });
        return Array.isArray(chapter) ? chapter[0] : chapter;
    },

    getAccessTiers: async () => {
        const { data, error } = await supabaseClient
            .from('reader_access_tiers')
            .select('*')
            .eq('is_active', true)
            .order('tier_rank');
        if (error) {
            console.warn('Access tier table unavailable:', error.message || error);
            return [];
        }
        return data || [];
    },

    getMyEntitlements: async () => {
        if (!SubState.user) {
            SubState.entitlements = [];
            return [];
        }
        const rows = await rpcOrFallback('get_my_entitlements', {}, async () => {
            const { data, error } = await supabaseClient
                .from('user_entitlements')
                .select('*, reader_access_tiers(name, slug, tier_rank)')
                .eq('user_id', SubState.user.id)
                .order('created_at', { ascending: false });
            if (error) {
                console.warn('Entitlement table unavailable:', error.message || error);
                return [];
            }
            return data || [];
        });
        SubState.entitlements = rows || [];
        return SubState.entitlements;
    },

    redeemAccessKey: async (code) => {
        return rpcOrFallback('redeem_access_key', { submitted_code: code }, async () => {
            throw new Error('Access-key redemption is not deployed yet. Apply the subscription access SQL migration first.');
        });
    },

    requestPatreonSync: async () => {
        if (!SubState.user) throw new Error('Sign in before connecting Patreon.');
        try {
            const { data, error } = await supabaseClient.functions.invoke('patreon-oauth-start', {
                body: { returnTo: window.location.href }
            });
            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
                return data;
            }
            return data || { message: 'Patreon sync requested.' };
        } catch (err) {
            throw new Error(err.message || 'Patreon connection is not deployed yet.');
        }
    }
};
