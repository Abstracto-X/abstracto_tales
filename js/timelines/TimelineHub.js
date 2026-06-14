// js/timelines/TimelineHub.js
import { Utils } from '../config.js';
import { GALACTIC_TIMELINE_ASSETS, ImageMapping } from './galacticTimelineAssets.js';

export const TimelineHub = {
    _galacticTree: null,
    _galacticMetadata: null,
    _galacticData: null,
    _keywordMap: null,
    _keywordRegex: null,
    _imageLookup: null,
    _GALACTIC_TREE_URL: 'data/timeline/timeline_tree.json',
    _activeGalacticEra: 0,
    _activeSubEra: 0,
    _keyBindingInitialized: false,
    _scrollBindingInitialized: false,

    fetchGalacticTree: async () => {
        if (TimelineHub._galacticTree) return TimelineHub._galacticTree;

        const [treeResponse, metaResponse] = await Promise.all([
            fetch(TimelineHub._GALACTIC_TREE_URL),
            fetch('data/timeline/galactic_metadata.json')
        ]);

        if (!treeResponse.ok || !metaResponse.ok) {
            throw new Error('Unable to load galactic history index.');
        }

        const tree = await treeResponse.json();
        const metadata = await metaResponse.json();

        TimelineHub._galacticTree = tree;
        TimelineHub._galacticMetadata = metadata;
        TimelineHub._galacticData = TimelineHub.parseWikiData(tree, metadata);

        // Lazily compile keyword links
        TimelineHub.initKeywordLinks().catch(console.error);

        return tree;
    },

    initKeywordLinks: async () => {
        if (TimelineHub._keywordMap) return;

        try {
            const [linksResponse, imgResponse] = await Promise.all([
                fetch('data/timeline/timeline_simple_links.json'),
                fetch('data/timeline/page_image_lookup.json')
            ]);
            if (!linksResponse.ok) throw new Error('Unable to load keyword links.');
            const links = await linksResponse.json();

            if (imgResponse.ok) {
                TimelineHub._imageLookup = await imgResponse.json();
            }

            const map = new Map();
            links.forEach(item => {
                if (item.type !== 'link') return;
                const text = (item.text || '').trim();
                if (!text || text.length < 3) return;

                if (item.link.includes('/wiki/Category:')) return;
                if (/^\d+\s*(BBY|ABY)$/i.test(text)) return;
                if (/^\d+$/.test(text)) return;
                if (text === text.toLowerCase()) return; // Proper nouns only

                map.set(text.toLowerCase(), item.link);
            });

            TimelineHub._keywordMap = map;

            const sortedKeys = Array.from(map.keys())
                .sort((a, b) => b.length - a.length);

            if (sortedKeys.length > 0) {
                const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = `(?<![a-zA-Z0-9_])(${sortedKeys.map(escapeRegExp).join('|')})(?![a-zA-Z0-9_])`;
                TimelineHub._keywordRegex = new RegExp(pattern, 'gi');
            }
        } catch (err) {
            console.error('Error compiling timeline keyword links:', err);
        }
    },

    applyKeywordLinks: (text = '') => {
        let safeText = Utils.escapeHtml(text);
        if (!TimelineHub._keywordRegex || !TimelineHub._keywordMap) return safeText;

        return safeText.replace(TimelineHub._keywordRegex, (match) => {
            const lowerMatch = match.toLowerCase();
            const url = TimelineHub._keywordMap.get(lowerMatch);
            if (!url) return match;
            return `<a href="${url}" target="_blank" class="timeline-keyword-link">${match}</a>`;
        });
    },

    getEventImages: (text = '') => {
        if (!text || !TimelineHub._keywordRegex || !TimelineHub._keywordMap || !TimelineHub._imageLookup) return [];

        const matches = text.match(TimelineHub._keywordRegex) || [];
        const seenUrls = new Set();
        const images = [];

        for (const match of matches) {
            const lowerMatch = match.toLowerCase();
            const pageUrl = TimelineHub._keywordMap.get(lowerMatch);
            if (!pageUrl || seenUrls.has(pageUrl)) continue;
            seenUrls.add(pageUrl);

            const imageData = TimelineHub._imageLookup[pageUrl];
            if (imageData && imageData.image_url) {
                const imgUrl = imageData.image_url;
                // De-duplicate images across the entire active timeline page view
                if (TimelineHub._renderedImagesThisPage && TimelineHub._renderedImagesThisPage.has(imgUrl)) {
                    continue;
                }

                // Resolve local path matching Python script organization
                const sanitizeName = (str) => str.replace(/[\\/*?:"<>|]/g, '_').trim();
                const eraDir = imageData.eras && imageData.eras.length ? sanitizeName(imageData.eras[0]) : "Uncategorized";
                const subEraDir = imageData.sub_eras && imageData.sub_eras.length ? sanitizeName(imageData.sub_eras[0]) : "";
                
                let filename = imageData.image_key || imageData.image_name;
                if (!filename) {
                    filename = imgUrl.split('/').pop().split('?')[0];
                }
                filename = sanitizeName(filename);
                
                const localImgUrl = `data/timeline/downloaded_images/${eraDir}/${subEraDir ? subEraDir + '/' : ''}${filename}`;

                images.push({
                    name: imageData.image_name || match,
                    url: localImgUrl
                });

                if (TimelineHub._renderedImagesThisPage) {
                    TimelineHub._renderedImagesThisPage.add(imgUrl);
                }
                if (images.length >= 4) break; // Limit to max 4 images
            }
        }
        return images;
    },

    renderEventImagesTiled: (images = [], layoutMode = 'below', limit = 2) => {
        if (!images || images.length === 0) return '';
        const selectedImages = images.slice(0, limit);
        const imgHtml = selectedImages.map(img => {
            const cleanName = img.name.replace(/\.[^/.]+$/, "");
            return `
                <div class="timeline-event-img-tile" title="${Utils.escapeHtml(cleanName)}" onclick="window.open('${Utils.escapeAttr(img.url)}', '_blank')">
                    <img src="${Utils.escapeHtml(img.url)}" alt="${Utils.escapeHtml(cleanName)}" referrerpolicy="no-referrer" loading="lazy" decoding="async" fetchpriority="low">
                </div>
            `;
        }).join('');
        return `<div class="timeline-event-images-tiled ${layoutMode}">${imgHtml}</div>`;
    },

    normalizeTitle: (title = '') => {
        return (title || '')
            .toLowerCase()
            .replace(/\([^)]*\)/g, '')
            .replace(/["']/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    getGalacticRoot: (tree) => {
        if (!tree) return null;
        const candidates = [];
        const visit = (section) => {
            if (!section) return;
            if (/timeline of galactic history/i.test(section.title || '')) candidates.push(section);
            (section.children || []).forEach(visit);
        };

        visit(tree);
        if (!candidates.length) return tree;

        return candidates.sort((a, b) => {
            const childDelta = (b.children || []).length - (a.children || []).length;
            if (childDelta !== 0) return childDelta;
            return TimelineHub.countSectionEvents(b) - TimelineHub.countSectionEvents(a);
        })[0];
    },

    findSectionByTitle: (node, targetTitle) => {
        if (!node || !targetTitle) return null;
        if ((node.title || '').trim() === targetTitle.trim()) return node;
        
        if (node.children && node.children.length) {
            for (const child of node.children) {
                const found = TimelineHub.findSectionByTitle(child, targetTitle);
                if (found) return found;
            }
        }
        
        if (node.lists && node.lists.length) {
            for (const list of node.lists) {
                for (const item of list) {
                    if (item.text && item.text.trim() === targetTitle.trim()) {
                        return {
                            title: item.text,
                            children: [],
                            lists: [item.children || []]
                        };
                    }
                }
            }
        }

        return null;
    },

    findSubEraNode: (eraNode, sourceTitle) => {
        if (!eraNode || !sourceTitle) return null;
        
        if (eraNode.children) {
            const found = eraNode.children.find(child => child && child.title === sourceTitle);
            if (found) return found;
        }

        if (eraNode.lists) {
            for (const list of eraNode.lists) {
                for (const item of list) {
                    if (item.text === sourceTitle) {
                        return {
                            title: item.text,
                            children: [],
                            lists: [item.children || []]
                        };
                    }
                }
            }
        }

        return TimelineHub.findSectionByTitle(eraNode, sourceTitle);
    },

    parseWikiData: (rawJson, metadata) => {
        if (!metadata) return [];
        const root = TimelineHub.getGalacticRoot(rawJson);
        return metadata.map((era) => {
            const eraNode = TimelineHub.findSectionByTitle(root, era.sourceTitle);
            const range = TimelineHub.parseRangeFromTitle(era.sourceTitle);
            
            const subEras = era.subEras.map((subEra) => {
                const subNode = TimelineHub.findSubEraNode(eraNode || root, subEra.sourceTitle);
                const subRange = TimelineHub.parseRangeFromTitle(subEra.sourceTitle);
                
                const events = subNode 
                    ? TimelineHub.collectParsedEvents(subNode, subRange || range)
                        .map((event, eventIndex) => ({
                            ...event,
                            id: `${subEra.id}-event-${eventIndex + 1}`,
                            order: TimelineHub.getTimelineOrder(event)
                        }))
                        .sort((a, b) => a.order - b.order)
                    : [];

                return {
                    id: subEra.id,
                    title: subEra.title,
                    range: subRange || range,
                    rangeLabel: subEra.rangeLabel,
                    asset: subEra.asset,
                    events
                };
            });

            return {
                id: era.id,
                title: era.title,
                range,
                rangeLabel: era.rangeLabel,
                asset: era.asset,
                subEras,
                events: subEras.flatMap(subEra => subEra.events.map(event => ({
                    ...event,
                    subEraId: subEra.id,
                    subEraTitle: subEra.title
                })))
            };
        });
    },

    getSubEraNodes: (eraNode) => {
        const directChildren = (eraNode.children || []).filter(child => child?.title);
        if (directChildren.length) return directChildren;

        const listBlocks = [];
        (eraNode.lists || []).forEach(list => {
            list.forEach(item => {
                if (!item.text || !item.children?.length) return;
                listBlocks.push({
                    title: item.text,
                    children: [],
                    lists: [item.children]
                });
            });
        });
        return listBlocks.length ? listBlocks : [eraNode];
    },

    collectParsedEvents: (section, fallbackRange = null) => {
        const events = [];
        const fallbackYear = fallbackRange?.start || fallbackRange?.end || null;

        const visitItems = (items = [], activeYear = null) => {
            items.forEach(item => {
                const itemYear = TimelineHub.parseSingleYear(item.text || '');
                const nextYear = itemYear || activeYear;
                const hasChildren = item.children && item.children.length;

                if (hasChildren) {
                    visitItems(item.children, nextYear);
                    return;
                }

                if (!item.text || TimelineHub.isChronologyHeading(item.text, false)) return;
                const eventYear = nextYear || fallbackYear;
                if (!eventYear) return;

                events.push({
                    year: eventYear.year,
                    era: eventYear.era,
                    label: TimelineHub.formatYearLabel(eventYear),
                    text: TimelineHub.cleanTimelineText(item.text)
                });
            });
        };

        (section.lists || []).forEach(list => visitItems(list));
        (section.children || []).forEach(child => {
            events.push(...TimelineHub.collectParsedEvents(child, fallbackRange));
        });

        return events.filter(event => event.text);
    },

    parseSingleYear: (value = '') => {
        const text = TimelineHub.normalizeDateText(value);
        const match = text.match(/(?:c\.\s*)?(\d{1,6})\s*(BBY|ABY)\b/i);
        if (!match) return null;
        const year = Number(match[1].replace(/,/g, ''));
        if (Number.isNaN(year)) return null;
        return { year, era: match[2].toUpperCase() };
    },

    parseRangeFromTitle: (title = '') => {
        const text = TimelineHub.normalizeDateText(title);
        const years = [...text.matchAll(/(?:c\.\s*)?(\d{1,6})\s*(BBY|ABY)\b/gi)].map(match => ({
            year: Number(match[1].replace(/,/g, '')),
            era: match[2].toUpperCase()
        })).filter(item => !Number.isNaN(item.year));

        if (years.length === 1) {
            const impliedEraMatch = text.match(/(?:c\.\s*)?(\d{1,6}(?:,\d{3})?)\s*-\s*(?:c\.\s*)?(\d{1,6}(?:,\d{3})?)\s*(BBY|ABY)\b/i);
            if (impliedEraMatch) {
                const start = Number(impliedEraMatch[1].replace(/,/g, ''));
                const end = Number(impliedEraMatch[2].replace(/,/g, ''));
                if (!Number.isNaN(start) && !Number.isNaN(end)) {
                    return {
                        start: { year: start, era: impliedEraMatch[3].toUpperCase() },
                        end: { year: end, era: impliedEraMatch[3].toUpperCase() }
                    };
                }
            }
        }

        if (!years.length) return null;
        return {
            start: years[0],
            end: years[1] || years[0]
        };
    },

    normalizeDateText: (value = '') => {
        return (value || '')
            .replace(/â€“|â€”|&ndash;|&mdash;/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    },

    cleanTimelineText: (value = '') => {
        return TimelineHub.normalizeDateText(value)
            .replace(/\s+([,.!?])/g, '$1')
            .replace(/\s+-\s+/g, ' - ')
            .trim();
    },

    getTimelineOrder: (event) => {
        if (!event) return 0;
        return event.era === 'BBY' ? -event.year : event.year;
    },

    formatYearLabel: (year) => {
        if (!year) return 'Undated';
        return `${Number(year.year).toLocaleString()} ${year.era}`;
    },

    getEraTitle: (title = '') => {
        return (title || 'Unnamed Era').replace(/\s*\([^)]*\)\s*$/, '').trim();
    },

    getEraRange: (title = '') => {
        const match = TimelineHub.normalizeDateText(title).match(/\(([^)]*)\)\s*$/);
        return match ? match[1].replace(/\s*-\s*/g, ' - ') : 'Chronology uncertain';
    },

    getEraPosterAsset: (index, title = '') => {
        const key = TimelineHub.normalizeTitle(title);
        return ImageMapping.eras[key] || GALACTIC_TIMELINE_ASSETS.eraPosters[index % GALACTIC_TIMELINE_ASSETS.eraPosters.length];
    },

    getSubEraAsset: (index, title = '') => {
        const key = TimelineHub.normalizeTitle(title);
        return ImageMapping.subEras[key] || GALACTIC_TIMELINE_ASSETS.subEraCards[index % GALACTIC_TIMELINE_ASSETS.subEraCards.length];
    },

    countListItems: (items = []) => items.reduce((total, item) => total + 1 + TimelineHub.countListItems(item.children || []), 0),

    countSectionEvents: (section) => {
        if (!section) return 0;
        const own = (section.lists || []).reduce((total, list) => total + TimelineHub.countListItems(list), 0);
        const nested = (section.children || []).reduce((total, child) => total + TimelineHub.countSectionEvents(child), 0);
        return own + nested;
    },

    isChronologyHeading: (text, hasChildren = false) => {
        const value = TimelineHub.normalizeDateText(text);
        const proseCheck = value.replace(/\bc\./gi, 'c');
        if (!value) return true;
        if (/^(c\.\s*)?\d{1,6}(,\d{3})?\s*(BBY|ABY)(\s*\(continued\))?$/i.test(value)) return true;
        if (/^(pre|post)-?\s*hyperspace travel$/i.test(value)) return true;
        if (/^(eons|ancient times|exact chronology undefined)$/i.test(value)) return true;
        if (hasChildren && value.length < 90 && !/[.!?]/.test(proseCheck)) return true;
        if (value.length < 18 && !/[.!?]/.test(proseCheck)) return true;
        return false;
    },

    getGalacticData: (tree = TimelineHub._galacticTree) => {
        if (!TimelineHub._galacticData && tree && TimelineHub._galacticMetadata) {
            TimelineHub._galacticData = TimelineHub.parseWikiData(tree, TimelineHub._galacticMetadata);
        }
        return TimelineHub._galacticData || [];
    },

    groupEventsByYear: (events = []) => {
        const groups = new Map();
        events.forEach(event => {
            const key = `${event.era}-${event.year}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    year: event.year,
                    era: event.era,
                    label: event.label || TimelineHub.formatYearLabel(event),
                    order: TimelineHub.getTimelineOrder(event),
                    events: []
                });
            }
            groups.get(key).events.push(event);
        });
        return [...groups.values()].sort((a, b) => a.order - b.order);
    },

    buildFrequencyPath: (events = []) => {
        if (!events.length) return { path: '', points: [] };
        const orders = events.map(event => TimelineHub.getTimelineOrder(event));
        const min = Math.min(...orders);
        const max = Math.max(...orders);
        const bucketCount = Math.min(18, Math.max(6, Math.ceil(events.length / 5)));
        const buckets = Array.from({ length: bucketCount }, (_, index) => ({
            index,
            count: 0
        }));
        const span = Math.max(max - min, 1);

        events.forEach(event => {
            const position = (TimelineHub.getTimelineOrder(event) - min) / span;
            const bucketIndex = Math.min(bucketCount - 1, Math.max(0, Math.floor(position * bucketCount)));
            buckets[bucketIndex].count += 1;
        });

        const maxCount = Math.max(...buckets.map(bucket => bucket.count), 1);
        const points = buckets.map((bucket, index) => {
            const x = (index / Math.max(bucketCount - 1, 1)) * 100;
            const y = 82 - (bucket.count / maxCount) * 64;
            return { x, y, count: bucket.count };
        });

        const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
        return {
            path: `M 0 86 ${line} L 100 86 Z`,
            points
        };
    },

    renderLanding: (storyEvents, slug) => {
        const storyCount = storyEvents.length;
        return `
            <div class="timeline-hub-screen">
                <div class="timeline-hub-header">
                    <div class="timeline-hub-kicker">Chronology Archive</div>
                    <div class="timeline-hub-title">Choose a history stream</div>
                    <div class="timeline-hub-subtitle">Follow the published story sequence, or step out into the larger galactic record by era.</div>
                </div>
                <div class="timeline-mode-grid">
                    <button class="timeline-mode-card story" type="button" onclick="window.Router.navigate('timeline/${slug}/story')">
                        <span class="timeline-mode-icon"><i class="fas fa-book-open"></i></span>
                        <span class="timeline-mode-eyebrow">Current timeline</span>
                        <span class="timeline-mode-title">Story History</span>
                        <span class="timeline-mode-desc">A focused sequence of story events, character introductions, and plot milestones.</span>
                        <span class="timeline-mode-meta">${storyCount} event${storyCount !== 1 ? 's' : ''}</span>
                    </button>
                    <button class="timeline-mode-card galactic" type="button" onclick="window.Router.navigate('timeline/${slug}/galactic')">
                        <span class="timeline-mode-icon"><i class="fas fa-jedi"></i></span>
                        <span class="timeline-mode-eyebrow">Reference archive</span>
                        <span class="timeline-mode-title">Timeline of Galactic History</span>
                        <span class="timeline-mode-desc">Browse the wider chronology by major era, then drill into sub-eras and eventful years.</span>
                        <span class="timeline-mode-meta">Era index</span>
                    </button>
                </div>
            </div>`;
    },

    renderStoryHistory: (events, slug) => {
        TimelineHub._renderedImagesThisPage = new Set();
        if (!events || events.length === 0) {
            return `<div class="timeline-empty glass-box">No story history has been archived yet.</div>`;
        }

        const firstDate = events[0]?.event_date || 'Opening record';
        const lastDate = events[events.length - 1]?.event_date || 'Latest record';
        const cards = events.map((evt, index) => TimelineHub.renderStoryEventCard(evt, index, slug)).join('');

        return `
            <div class="story-history-screen">
                <div class="timeline-explorer-topbar">
                    <button class="map-hub-back-btn" type="button" onclick="window.Router.navigate('timeline/${slug}')">
                        <i class="fas fa-arrow-left"></i> Timelines
                    </button>
                    <div class="timeline-explorer-title">Story History</div>
                </div>
                <div class="story-history-hero glass-box">
                    <div>
                        <div class="timeline-hub-kicker">Current timeline</div>
                        <div class="story-history-title">A searchable path through the narrative</div>
                    </div>
                    <div class="story-history-stats">
                        <div><strong>${events.length}</strong><span>Events</span></div>
                        <div><strong>${Utils.escapeHtml(firstDate)}</strong><span>First</span></div>
                        <div><strong>${Utils.escapeHtml(lastDate)}</strong><span>Latest</span></div>
                    </div>
                </div>
                <div class="timeline-search-wrapper">
                    <i class="fas fa-search timeline-search-icon"></i>
                    <input id="story-timeline-search" class="timeline-search" type="text" placeholder="Search events, dates, or linked characters..." autocomplete="off">
                </div>
                <div class="story-history-list" id="story-history-list">${cards}</div>
                <div class="timeline-no-results" id="story-timeline-no-results">No story events match your search.</div>
            </div>`;
    },

    renderStoryEventCard: (evt, index, slug) => {
        const chars = evt.characters || [];
        const charNames = chars.map(char => char.name).join(' ');
        const charHtml = chars.slice(0, 3).map(char => `
            <button class="story-event-character" type="button" onclick="event.stopPropagation(); window.Router.navigate('gallery/${slug}/${char.id}')">
                ${char.profile_image_url ? `<img src="${Utils.escapeHtml(char.profile_image_url)}" alt="${Utils.escapeHtml(char.name)}" loading="lazy" decoding="async" fetchpriority="low">` : '<span class="story-event-avatar-fallback"><i class="fas fa-user"></i></span>'}
                <span>${Utils.escapeHtml(char.name)}</span>
            </button>
        `).join('');

        const enrichedDescription = TimelineHub.applyKeywordLinks(evt.description || '');
        const images = TimelineHub.getEventImages(evt.description || '');
        const imagesHtml = TimelineHub.renderEventImagesTiled(images, 'below', 2);

        return `
            <div class="story-event-wrapper" data-search="${Utils.escapeHtml(`${evt.event_date || ''} ${evt.title || ''} ${evt.description || ''} ${charNames}`.toLowerCase())}">
                <article class="story-event-card glass-box">
                    <div class="story-event-index">${String(index + 1).padStart(2, '0')}</div>
                    <div class="story-event-body">
                        <div class="story-event-date">${Utils.escapeHtml(evt.event_date || 'Undated')}</div>
                        <h3>${Utils.escapeHtml(evt.title || 'Untitled Event')}</h3>
                        <p>${enrichedDescription}</p>
                        ${charHtml ? `<div class="story-event-characters">${charHtml}</div>` : ''}
                    </div>
                </article>
                ${imagesHtml}
            </div>`;
    },

    renderGalacticExplorer: (tree, slug) => {
        const eras = TimelineHub.getGalacticData(tree);
        const totalEvents = eras.reduce((total, era) => total + era.events.length, 0);
        const cards = eras.map((era, index) => TimelineHub.renderEraOverviewCard(era, index)).join('');

        return `
            <div class="aaa-codex-shell">
                <div class="aaa-codex-bg" style="--bg-image: url('${Utils.escapeAttr(GALACTIC_TIMELINE_ASSETS.overviewBackground)}')"></div>
                <div class="aaa-codex-scanline" aria-hidden="true"></div>
                <div class="aaa-codex-scanline-beam" aria-hidden="true"></div>
                <div class="aaa-codex-ambient-glow" aria-hidden="true"></div>
                <div class="aaa-codex-topbar" id="galactic-topbar">
                    <div class="aaa-codex-search-wrapper">
                        <i class="fas fa-search"></i>
                        <input id="galactic-era-search" class="aaa-codex-search" type="text" placeholder="SEARCH CODES..." autocomplete="off">
                    </div>
                </div>
                <section class="aaa-codex-timeline-page" id="galactic-overview-panel">
                    <div class="aaa-codex-detail-header">
                        <div class="viewport-kicker">DATABASE OVERVIEW</div>
                        <h2>Galactic History Codex</h2>
                        <p>ACCESSING ${eras.length} ERAS // ${eras.reduce((sum, era) => sum + era.subEras.length, 0)} SUB-ERAS // ${totalEvents} HISTORICAL RECORDS</p>
                    </div>
                    <div class="aaa-codex-era-grid" id="galactic-era-grid">${cards}</div>
                    <div class="timeline-no-results" id="galactic-era-no-results" style="display: none; font-family: var(--font-mono, monospace); color: #94A3B8; text-align: center; margin-top: 3rem;">NO RECORD CODES FOUND.</div>
                </section>
                <section id="galactic-page-host"></section>
            </div>`;
    },

    renderEraOverviewCard: (era, index) => {
        const searchText = `${era.title} ${era.rawTitle} ${era.subEras.map(subEra => `${subEra.title} ${subEra.events.map(event => event.text).join(' ')}`).join(' ')}`.toLowerCase();
        return `
            <button class="aaa-codex-era-card" type="button" onclick="window.TimelineHub.openGalacticEra(${index})" data-era-index="${index}" data-search="${Utils.escapeHtml(searchText)}" style="--card-bg: url('${Utils.escapeAttr(era.asset)}')">
                <div class="card-index-box">${String(index + 1).padStart(2, '0')}</div>
                <div>
                    <h3>${Utils.escapeHtml(era.title)}</h3>
                    <div class="card-range">${Utils.escapeHtml(era.rangeLabel)}</div>
                    <div class="card-records">RECORDS: ${era.events.length}</div>
                </div>
            </button>`;
    },

    renderSubEraSelectionPage: (era, eraIndex) => {
        const cards = era.subEras.map((subEra, subIndex) => TimelineHub.renderSubEraSelectionCard(subEra, eraIndex, subIndex)).join('');
        const firstSubEra = era.subEras[0];
        const previewImg = firstSubEra ? firstSubEra.asset : era.asset;
        const previewTitle = firstSubEra ? firstSubEra.title : era.title;
        const previewRange = firstSubEra ? firstSubEra.rangeLabel : era.rangeLabel;
        const previewCount = firstSubEra ? firstSubEra.events.length : era.events.length;
        const previewText = firstSubEra && firstSubEra.events[0] ? firstSubEra.events[0].text : 'Select an archive directory to review historical timeline telemetry.';
        
        return `
            <section class="aaa-codex-split-pane" style="--bg-image: url('${Utils.escapeAttr(era.asset)}')">
                <div class="aaa-codex-left-index">
                    <button class="aaa-codex-back-btn" type="button" onclick="window.TimelineHub.showEraOverview()" style="margin: 1.5rem 0 2rem;">
                        &larr; BACK TO ERAS
                    </button>
                    <div class="viewport-kicker" style="margin-bottom: 0.5rem;">ERA INDEX</div>
                    <div style="font-family: var(--font-header); font-size: 2rem; color: #FFFFFF; font-weight: 300; margin-bottom: 1.5rem; line-height: 1.1;">
                        ${Utils.escapeHtml(era.title)}
                    </div>
                    <div class="aaa-codex-subera-list">
                        ${cards || '<div class="galactic-muted">No sub-eras indexed.</div>'}
                    </div>
                </div>
                <div class="aaa-codex-right-viewport">
                    <div class="aaa-codex-viewport-frame">
                        <div class="aaa-codex-viewport-img" id="aaa-viewport-img" style="--preview-img: url('${Utils.escapeAttr(previewImg)}')"></div>
                        <div class="aaa-codex-hud-corner tl"></div>
                        <div class="aaa-codex-hud-corner tr"></div>
                        <div class="aaa-codex-hud-corner bl"></div>
                        <div class="aaa-codex-hud-corner br"></div>
                        
                        <div class="aaa-codex-viewport-content">
                            <div class="viewport-kicker" id="aaa-viewport-kicker">SUB-ERA 01</div>
                            <h2 id="aaa-viewport-title">${Utils.escapeHtml(previewTitle)}</h2>
                            <div class="viewport-range" id="aaa-viewport-range">${Utils.escapeHtml(previewRange)} // ${previewCount} RECORDS</div>
                            <p id="aaa-viewport-desc">${Utils.escapeHtml(previewText)}</p>
                            <button id="aaa-viewport-btn" class="aaa-codex-terminal-btn" type="button" onclick="window.TimelineHub.openSubEraTimeline(${eraIndex}, 0)">
                                <i class="fas fa-satellite-dish"></i> [ INITIALIZE SCAN ]
                            </button>
                            <button class="aaa-codex-terminal-btn" type="button" onclick="window.TimelineHub.openEraTimeline(${eraIndex})" style="margin-left: 1rem; background: transparent; border-color: rgba(255, 255, 255, 0.2);">
                                <i class="fas fa-project-diagram"></i> [ FULL OVERVIEW ]
                            </button>
                        </div>
                    </div>
                </div>
            </section>`;
    },

    renderSubEraSelectionCard: (subEra, eraIndex, subIndex) => {
        const activeClass = subIndex === 0 ? 'active' : '';
        const previewText = subEra.events[0] ? subEra.events[0].text : 'No events recorded.';
        return `
            <button class="aaa-codex-index-row ${activeClass}" type="button" 
                data-sub-index="${subIndex}"
                data-asset="${Utils.escapeAttr(subEra.asset)}"
                data-title="${Utils.escapeHtml(subEra.title)}"
                data-range="${Utils.escapeHtml(subEra.rangeLabel)}"
                data-count="${subEra.events.length}"
                data-desc="${Utils.escapeHtml(previewText)}"
                onclick="window.TimelineHub.selectSubEraRow(this, ${eraIndex}, ${subIndex})">
                <span class="row-num">// DIRECTORY_${String(subIndex + 1).padStart(2, '0')}</span>
                <strong>${Utils.escapeHtml(subEra.title)}</strong>
                <span class="row-meta">
                    <span>${Utils.escapeHtml(subEra.rangeLabel)}</span>
                    <span>${subEra.events.length} LOGS</span>
                </span>
            </button>`;
    },

    renderDetailedTimelinePage: (era, subEra = null) => {
        TimelineHub._renderedImagesThisPage = new Set();
        const isOverview = !subEra;
        const active = subEra || {
            id: `${era.id}-overview`,
            title: `${era.title} Overview`,
            rangeLabel: era.rangeLabel,
            asset: era.asset,
            events: era.events
        };
        const groups = TimelineHub.groupEventsByYear(active.events);
        const chart = TimelineHub.buildFrequencyPath(active.events);
        const minLabel = groups[0]?.label || era.rangeLabel;
        const maxLabel = groups[groups.length - 1]?.label || era.rangeLabel;
        const watermarkText = subEra ? `SUB-ERA.${String(era.subEras.indexOf(subEra) + 1).padStart(2, '0')}` : 'OVERVIEW';
        
        return `
            <div class="aaa-codex-timeline-page" style="--bg-image: url('${Utils.escapeAttr(active.asset || era.asset)}')">
                <div class="aaa-codex-detail-header">
                    <button class="aaa-codex-back-btn" type="button" onclick="window.TimelineHub.openGalacticEra(${TimelineHub._activeGalacticEra})" style="margin-bottom: 1.5rem;">
                        &larr; BACK TO SUB-ERAS
                    </button>
                    <div class="viewport-kicker">${Utils.escapeHtml(era.title)}</div>
                    <h2>${Utils.escapeHtml(active.title)}</h2>
                    <p>${Utils.escapeHtml(active.rangeLabel || 'Chronology uncertain')} // ${active.events.length} SEQUENCED RECORDS</p>
                </div>
                
                <div class="aaa-codex-telemetry-panel">
                    <div class="aaa-codex-telemetry-labels">
                        <span>MIN_RANGE: ${Utils.escapeHtml(minLabel)}</span>
                        <strong>HISTORICAL TELEMETRY GRAPH</strong>
                        <span>MAX_RANGE: ${Utils.escapeHtml(maxLabel)}</span>
                    </div>
                    <div class="aaa-codex-telemetry-chart">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;" aria-hidden="true">
                            <path d="${Utils.escapeAttr(chart.path)}"></path>
                        </svg>
                    </div>
                    <div class="aaa-codex-scrubber-track">
                        <span class="aaa-codex-scrubber-handle" id="galactic-viewport-scrubber"></span>
                    </div>
                </div>

                <div class="aaa-codex-timeline-stream" id="galactic-vertical-timeline">
                    ${groups.map((group, index) => TimelineHub.renderBranchingYearGroup(group, index)).join('') || '<div class="galactic-muted">No timeline events sequenced.</div>'}
                </div>
                <div class="aaa-codex-watermark" aria-hidden="true">${watermarkText}</div>
            </div>`;
    },

    renderBranchingYearGroup: (group, groupIndex) => {
        const cards = group.events.map((event, eventIndex) => TimelineHub.renderBranchingEventCard(event, group.events.length, groupIndex, eventIndex)).join('');
        return `
            <article class="aaa-codex-year-group" id="galactic-year-${groupIndex}" data-year-index="${groupIndex}">
                <div class="aaa-codex-year-node">
                    <span class="aaa-codex-node-ring"></span>
                    <strong>${Utils.escapeHtml(group.label)}</strong>
                </div>
                <div class="aaa-codex-event-row">${cards}</div>
            </article>`;
    },

    renderBranchingEventCard: (event, count, groupIndex, eventIndex) => {
        const side = TimelineHub.getBranchSide(count, groupIndex, eventIndex);
        const cardSide = side.includes('branch-left') ? 'left' : 'right';
        const displayIndex = String(eventIndex + 1).padStart(2, '0');
        const enrichedText = TimelineHub.applyKeywordLinks(event.text || '');
        const images = TimelineHub.getEventImages(event.text || '');

        const cardHtml = `
            <article class="aaa-codex-event-card ${cardSide}" data-event-index="${eventIndex}">
                <div class="card-header">
                    <span>[ LOG // ${displayIndex} ]</span>
                    <span>TRANSMISSION SECURE</span>
                </div>
                <p>${enrichedText}</p>
            </article>`;

        if (count === 1) {
            const oppositeSide = cardSide === 'left' ? 'right' : 'left';
            const imagesHtml = TimelineHub.renderEventImagesTiled(images, `opposite ${oppositeSide}`, 4);
            return cardHtml + imagesHtml;
        } else {
            const imagesHtml = TimelineHub.renderEventImagesTiled(images, 'below', 2);
            return `
                <div class="aaa-codex-event-wrapper ${cardSide}">
                    ${cardHtml}
                    ${imagesHtml}
                </div>`;
        }
    },

    getBranchSide: (count, groupIndex, eventIndex) => {
        if (count === 1) return groupIndex % 2 === 0 ? 'branch-right' : 'branch-left';
        if (count === 2) return eventIndex === 0 ? 'branch-left' : 'branch-right';
        const pattern = ['branch-left', 'branch-right', 'branch-right branch-lower', 'branch-left branch-lower'];
        return pattern[eventIndex % pattern.length];
    },

    initLanding: () => {},

    initStoryHistory: () => {
        const input = document.getElementById('story-timeline-search');
        if (!input) return;
        input.addEventListener('input', TimelineHub.filterStoryEvents);
    },

    initGalacticExplorer: () => {
        const input = document.getElementById('galactic-era-search');
        if (input) input.addEventListener('input', TimelineHub.filterGalacticEras);
        TimelineHub.initTimelineKeyboard();

        const shell = document.querySelector('.aaa-codex-shell');
        if (shell) {
            shell.addEventListener('mousemove', e => {
                const rect = shell.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                shell.style.setProperty('--mouse-x', `${x}px`);
                shell.style.setProperty('--mouse-y', `${y}px`);
            });
        }

        document.querySelectorAll('.aaa-codex-era-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * -8;
                const rotateY = ((x / rect.width) - 0.5) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    },

    selectSubEraRow: (btn, eraIndex, subIndex) => {
        document.querySelectorAll('.aaa-codex-index-row').forEach(row => row.classList.remove('active'));
        btn.classList.add('active');

        const asset = btn.dataset.asset;
        const title = btn.dataset.title;
        const range = btn.dataset.range;
        const count = btn.dataset.count;
        const desc = btn.dataset.desc;

        const img = document.getElementById('aaa-viewport-img');
        const titleEl = document.getElementById('aaa-viewport-title');
        const rangeEl = document.getElementById('aaa-viewport-range');
        const descEl = document.getElementById('aaa-viewport-desc');
        const kickerEl = document.getElementById('aaa-viewport-kicker');
        const btnEl = document.getElementById('aaa-viewport-btn');

        if (img) img.style.setProperty('--preview-img', `url('${asset}')`);
        if (titleEl) titleEl.textContent = title;
        if (rangeEl) rangeEl.textContent = `${range} // ${count} RECORDS`;
        if (descEl) descEl.textContent = desc;
        if (kickerEl) kickerEl.textContent = `SUB-ERA ${String(subIndex + 1).padStart(2, '0')}`;
        if (btnEl) btnEl.setAttribute('onclick', `window.TimelineHub.openSubEraTimeline(${eraIndex}, ${subIndex})`);
    },

    initTimelineKeyboard: () => {
        if (TimelineHub._keyBindingInitialized) return;
        TimelineHub._keyBindingInitialized = true;
        window.addEventListener('keydown', event => {
            if (!document.querySelector('.aaa-codex-timeline-page')) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            TimelineHub.navigateEventfulYear(event.key === 'ArrowRight' ? 1 : -1);
        });
    },

    initTimelineScrollSync: () => {
        const updateScrubber = () => {
            const scrubber = document.getElementById('galactic-viewport-scrubber');
            const list = document.getElementById('galactic-vertical-timeline');
            if (!scrubber || !list) return;
            const rect = list.getBoundingClientRect();
            const viewport = window.innerHeight || 1;
            const total = Math.max(rect.height - viewport, 1);
            const progress = Math.min(1, Math.max(0, (viewport - rect.top) / total));
            scrubber.style.left = `${progress * 98}%`;
        };
        window.removeEventListener('scroll', TimelineHub._activeScrollHandler);
        TimelineHub._activeScrollHandler = updateScrubber;
        window.addEventListener('scroll', updateScrubber, { passive: true });
        updateScrubber();

        if (TimelineHub._observer) TimelineHub._observer.disconnect();
        TimelineHub._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

        document.querySelectorAll('.aaa-codex-event-card, .timeline-event-images-tiled').forEach(el => {
            TimelineHub._observer.observe(el);
        });
    },

    filterStoryEvents: (event) => {
        const query = (event.target.value || '').toLowerCase().trim();
        let visible = 0;
        document.querySelectorAll('.story-event-wrapper').forEach(wrapper => {
            const match = !query || (wrapper.dataset.search || '').includes(query);
            wrapper.style.display = match ? '' : 'none';
            if (match) visible += 1;
        });
        const noResults = document.getElementById('story-timeline-no-results');
        if (noResults) noResults.style.display = query && !visible ? 'block' : 'none';
    },

    filterGalacticEras: (event) => {
        const query = (event.target.value || '').toLowerCase().trim();
        let visible = 0;
        document.querySelectorAll('.aaa-codex-era-card').forEach(card => {
            const match = !query || (card.dataset.search || '').includes(query);
            card.style.display = match ? '' : 'none';
            if (match) visible += 1;
        });
        const noResults = document.getElementById('galactic-era-no-results');
        if (noResults) noResults.style.display = query && !visible ? 'block' : 'none';
    },

    openGalacticEra: (index) => {
        const era = TimelineHub.getGalacticData()[index];
        if (!era) return;
        TimelineHub._activeGalacticEra = index;
        TimelineHub._activeSubEra = 0;

        const host = document.getElementById('galactic-page-host');
        if (host) host.innerHTML = TimelineHub.renderSubEraSelectionPage(era, index);

        const overview = document.getElementById('galactic-overview-panel');
        if (overview) overview.style.display = 'none';

        const topbar = document.getElementById('galactic-topbar');
        if (topbar) topbar.style.display = 'none';

        const bg = document.querySelector('.aaa-codex-bg');
        if (bg) bg.style.setProperty('--bg-image', `url('${era.asset}')`);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        TimelineHub.initGalacticExplorer();
    },

    showEraOverview: () => {
        const overview = document.getElementById('galactic-overview-panel');
        if (overview) overview.style.display = '';
        const host = document.getElementById('galactic-page-host');
        if (host) host.innerHTML = '';

        const topbar = document.getElementById('galactic-topbar');
        if (topbar) topbar.style.display = '';

        const bg = document.querySelector('.aaa-codex-bg');
        if (bg) bg.style.setProperty('--bg-image', `url('${GALACTIC_TIMELINE_ASSETS.overviewBackground}')`);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openEraTimeline: (eraIndex) => {
        const era = TimelineHub.getGalacticData()[eraIndex];
        if (!era) return;
        TimelineHub._activeGalacticEra = eraIndex;
        TimelineHub._activeSubEra = -1;
        TimelineHub.renderTimelineIntoHost(era, null);
    },

    openSubEraTimeline: (eraIndex, subEraIndex) => {
        const era = TimelineHub.getGalacticData()[eraIndex];
        const subEra = era?.subEras?.[subEraIndex];
        if (!era || !subEra) return;
        TimelineHub._activeGalacticEra = eraIndex;
        TimelineHub._activeSubEra = subEraIndex;
        TimelineHub.renderTimelineIntoHost(era, subEra);
    },

    renderTimelineIntoHost: (era, subEra) => {
        const host = document.getElementById('galactic-page-host');
        if (host) host.innerHTML = TimelineHub.renderDetailedTimelinePage(era, subEra);

        const overview = document.getElementById('galactic-overview-panel');
        if (overview) overview.style.display = 'none';

        const topbar = document.getElementById('galactic-topbar');
        if (topbar) topbar.style.display = 'none';

        const bg = document.querySelector('.aaa-codex-bg');
        if (bg) bg.style.setProperty('--bg-image', `url('${(subEra || era).asset}')`);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        requestAnimationFrame(() => TimelineHub.initTimelineScrollSync());
    },

    navigateEventfulYear: (direction) => {
        const groups = [...document.querySelectorAll('.aaa-codex-year-group')];
        if (!groups.length) return;

        const viewportMiddle = window.innerHeight / 2;
        let currentIndex = groups.findIndex(group => {
            const rect = group.getBoundingClientRect();
            return rect.top <= viewportMiddle && rect.bottom >= viewportMiddle;
        });
        if (currentIndex < 0) currentIndex = Math.max(groups.findIndex(group => group.getBoundingClientRect().top > 0) - 1, 0);

        const nextIndex = Math.min(groups.length - 1, Math.max(0, currentIndex + direction));
        groups[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    selectSubEra: () => {},
    openRecordDetail: () => {},
    toggleEra: () => {},
    filterEraSection: () => {},
    toggleEraRecords: () => {}
};
