// js/db.js
import { supabaseClient } from './config.js';

// TTL + LRU cache — prevents unbounded growth and stale data
export const Cache = {
    stories: null,
    storiesTTL: 0,
    author: null,       // Author profile cache
    authorTTL: 0,
    _hubEntries: [],    // Ordered list of {slug, data, timestamp}
    _hubMap: {},        // Quick lookup: slug -> data
    _HUB_MAX: 5,        // LRU cap
    _TTL: 5 * 60 * 1000, // 5 minutes

    getHub: (slug) => {
        const entry = Cache._hubMap[slug];
        if (!entry) return null;
        if (Date.now() - entry.timestamp > Cache._TTL) {
            // Stale — evict
            Cache._evictHub(slug);
            return null;
        }
        // Move to end (most recently used)
        Cache._hubEntries = Cache._hubEntries.filter(e => e.slug !== slug);
        Cache._hubEntries.push(entry);
        return entry.data;
    },

    setHub: (slug, data) => {
        // Evict LRU if at capacity
        if (!Cache._hubMap[slug] && Cache._hubEntries.length >= Cache._HUB_MAX) {
            const oldest = Cache._hubEntries.shift();
            if (oldest) delete Cache._hubMap[oldest.slug];
        }
        // Remove existing entry if updating
        Cache._hubEntries = Cache._hubEntries.filter(e => e.slug !== slug);
        const entry = { slug, data, timestamp: Date.now() };
        Cache._hubEntries.push(entry);
        Cache._hubMap[slug] = entry;
    },

    _evictHub: (slug) => {
        Cache._hubEntries = Cache._hubEntries.filter(e => e.slug !== slug);
        delete Cache._hubMap[slug];
    },

    isStale: (ttlTimestamp) => {
        return !ttlTimestamp || (Date.now() - ttlTimestamp > Cache._TTL);
    }
};

export const DB = {
    getStories: async () => {
        if (Cache.stories && !Cache.isStale(Cache.storiesTTL)) return Cache.stories;
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('is_published', true)
            .order('sort_order');
        if (error) { console.error('Error fetching stories:', error); return []; }
        Cache.stories = data || [];
        Cache.storiesTTL = Date.now();
        return Cache.stories;
    },

    getMapNodes: async (mapId) => {
        const { data, error } = await supabaseClient.from('map_nodes').select('*').eq('map_id', mapId).order('created_at');
        if (error) throw error;
        return data || [];
    },
    
    getMapEdges: async (mapId) => {
        const { data, error } = await supabaseClient.from('map_edges').select('*').eq('map_id', mapId).order('created_at');
        if (error) throw error;
        return data || [];
    },

    // Batch-fetch node and edge counts for multiple maps (used by MapHub)
    getMapCounts: async (mapIds) => {
        if (!mapIds || !mapIds.length) return {};
        const [nodesRes, edgesRes] = await Promise.all([
            supabaseClient.from('map_nodes').select('map_id').in('map_id', mapIds),
            supabaseClient.from('map_edges').select('map_id').in('map_id', mapIds)
        ]);
        const counts = {};
        mapIds.forEach(id => { counts[id] = { nodes: 0, edges: 0 }; });
        (nodesRes.data || []).forEach(r => { if (counts[r.map_id]) counts[r.map_id].nodes++; });
        (edgesRes.data || []).forEach(r => { if (counts[r.map_id]) counts[r.map_id].edges++; });
        return counts;
    },

    // Fetch all node names across all maps of a story for cross-map search
    getAllMapNodeNames: async (storyId) => {
        const { data, error } = await supabaseClient
            .from('map_nodes')
            .select('map_id, name')
            .in('map_id',
                supabaseClient.from('maps').select('id').eq('story_id', storyId)
            );
        if (error) {
            // Fallback: simple query without subquery if the DB doesn't support it
            const mapsRes = await supabaseClient.from('maps').select('id').eq('story_id', storyId);
            if (mapsRes.error || !mapsRes.data) return [];
            const mapIds = mapsRes.data.map(m => m.id);
            if (!mapIds.length) return [];
            const nodesRes = await supabaseClient.from('map_nodes').select('map_id, name').in('map_id', mapIds);
            return nodesRes.data || [];
        }
        return data || [];
    },

    // Cached author profile — avoids re-fetching on every #home visit
    getAuthorProfile: async () => {
        if (Cache.author && !Cache.isStale(Cache.authorTTL)) return Cache.author;

        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', 'admin')
            .limit(1)
            .single();
        
        if (profileError || !profile) return null;

        const { data: links, error: linksError } = await supabaseClient
            .from('author_links')
            .select('*')
            .eq('profile_id', profile.id)
            .order('sort_order');

        Cache.author = {
            ...profile,
            links: links || []
        };
        Cache.authorTTL = Date.now();
        return Cache.author;
    },

    // The new unified and cached fetching function
    getStoryHubData: async (slug) => {
        const cached = Cache.getHub(slug);
        if (cached) return cached;

        const { data: story, error: storyError } = await supabaseClient
            .from('stories')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (storyError || !story) return null;

        // Execute all dependent queries simultaneously
        const [wallpapersReq, charactersReq, loreReq, timelineReq, mapsReq] = await Promise.all([
            supabaseClient.from('story_wallpapers').select('*').eq('story_id', story.id).order('sort_order'),
            supabaseClient.from('characters').select('*').eq('story_id', story.id).order('sort_order'),
            supabaseClient.from('lore_entries').select('*, lore_categories(id, name, slug)').eq('story_id', story.id).order('sort_order'),
            supabaseClient.from('timeline_events').select('*').eq('story_id', story.id).order('event_order'),
            supabaseClient.from('maps').select('*').eq('story_id', story.id).order('sort_order')
        ]);

        const timelineEvents = timelineReq.data || [];
        
        // Single batched query instead of N sequential queries
        if (timelineEvents.length > 0) {
            const eventIds = timelineEvents.map(e => e.id);
            const { data: allCharLinks } = await supabaseClient
                .from('timeline_event_characters')
                .select('event_id, character_id, characters(id, name, role_title, profile_image_url)')
                .in('event_id', eventIds);
            
            timelineEvents.forEach(event => {
                event.characters = (allCharLinks || [])
                    .filter(cl => cl.event_id === event.id)
                    .map(cl => cl.characters);
            });
        } else {
            timelineEvents.forEach(event => { event.characters = []; });
        }

        const hubData = {
            story: story,
            wallpapers: wallpapersReq.data || [],
            characters: charactersReq.data || [],
            lore: loreReq.data || [],
            timeline: timelineEvents,
            maps: mapsReq.data || []
        };

        Cache.setHub(slug, hubData);
        return hubData;
    },

    getChapters: async (storyId) => {
        const { data, error } = await supabaseClient
            .from('chapters')
            .select('*')
            .eq('story_id', storyId)
            .eq('is_published', true)
            .order('chapter_order');
        if (error) { console.error('Error fetching chapters:', error); return []; }
        return data || [];
    },

    getCharacterGallery: async (characterId) => {
        const { data, error } = await supabaseClient
            .from('character_gallery_images')
            .select('*')
            .eq('character_id', characterId)
            .eq('is_published', true)
            .order('sort_order');
        if (error) { console.error('Error fetching gallery:', error); return []; }
        return data || [];
    },

    getLatestGalleryImages: async (storyId, limit = 10, offset = 0) => {
        const { data, error } = await supabaseClient
            .from('character_gallery_images')
            .select('*, characters!inner(story_id, name)')
            .eq('characters.story_id', storyId)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) { console.error('Error fetching latest gallery:', error); return []; }
        return data || [];
    },

    getLoreEntry: async (storyId, loreSlug) => {
        const { data, error } = await supabaseClient
            .from('lore_entries')
            .select('*, lore_categories(id, name, slug)')
            .eq('story_id', storyId)
            .eq('slug', loreSlug)
            .single();
        if (error) { console.error('Error fetching lore entry:', error); return null; }
        return data;
    }
};
