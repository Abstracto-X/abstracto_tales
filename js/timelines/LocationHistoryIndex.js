// js/timelines/LocationHistoryIndex.js
import { Utils } from '../config.js';
import { TimelineHub } from './TimelineHub.js';

export const LocationHistoryIndex = {
    _galacticCache: new Map(),
    _overlay: null,

    normalizeText: (value = '') => ` ${(value || '')
        .toLowerCase()
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()} `,

    getLocationTerms: (locationName = '') => {
        const primary = (locationName || '').trim();
        const stripped = primary.replace(/\([^)]*\)/g, '').trim();
        return Array.from(new Set([primary, stripped]
            .map(term => LocationHistoryIndex.normalizeText(term).trim())
            .filter(term => term.length >= 3)));
    },

    textMatchesLocation: (text, terms) => {
        const haystack = LocationHistoryIndex.normalizeText(text);
        return terms.some(term => haystack.includes(` ${term} `));
    },

    findStoryEvents: (locationName, storyEvents = []) => {
        const terms = LocationHistoryIndex.getLocationTerms(locationName);
        if (!terms.length || !Array.isArray(storyEvents)) return [];

        return storyEvents
            .filter(event => LocationHistoryIndex.textMatchesLocation(`${event.title || ''} ${event.description || ''}`, terms))
            .map(event => ({
                id: `story-${event.id || event.event_order || event.title}`,
                source: 'Story History',
                eraTitle: 'Story History',
                subEraTitle: '',
                label: event.event_date || 'Undated',
                order: Number.isFinite(Number(event.event_order)) ? Number(event.event_order) : 0,
                title: event.title || 'Untitled event',
                text: event.description || '',
                characters: event.characters || []
            }));
    },

    findGalacticEvents: async (locationName) => {
        const terms = LocationHistoryIndex.getLocationTerms(locationName);
        const cacheKey = terms[0] || LocationHistoryIndex.normalizeText(locationName).trim();
        if (!cacheKey) return [];
        if (LocationHistoryIndex._galacticCache.has(cacheKey)) {
            return LocationHistoryIndex._galacticCache.get(cacheKey);
        }

        await TimelineHub.fetchGalacticTree();
        const data = TimelineHub.getGalacticData();
        const matches = [];

        data.forEach(era => {
            (era.subEras || []).forEach(subEra => {
                (subEra.events || []).forEach((event, index) => {
                    if (!LocationHistoryIndex.textMatchesLocation(event.text || '', terms)) return;
                    matches.push({
                        id: `galactic-${subEra.id}-${index}`,
                        source: 'Galactic History',
                        eraTitle: era.title,
                        subEraTitle: subEra.title,
                        label: event.label || TimelineHub.formatYearLabel(event),
                        order: TimelineHub.getTimelineOrder(event),
                        title: '',
                        text: event.text || ''
                    });
                });
            });
        });

        matches.sort((a, b) => a.order - b.order);
        LocationHistoryIndex._galacticCache.set(cacheKey, matches);
        return matches;
    },

    search: async (locationName, storyEvents = []) => {
        const [storyMatches, galacticMatches] = await Promise.all([
            Promise.resolve(LocationHistoryIndex.findStoryEvents(locationName, storyEvents)),
            LocationHistoryIndex.findGalacticEvents(locationName)
        ]);

        const combined = [...galacticMatches, ...storyMatches];
        return {
            storyMatches,
            galacticMatches,
            combined: combined.sort((a, b) => {
                if (a.source !== b.source && (a.source === 'Story History' || b.source === 'Story History')) {
                    return a.source === 'Galactic History' ? -1 : 1;
                }
                return a.order - b.order;
            })
        };
    },

    ensureOverlay: () => {
        if (LocationHistoryIndex._overlay) return LocationHistoryIndex._overlay;
        const overlay = document.createElement('div');
        overlay.id = 'location-history-overlay';
        overlay.className = 'location-history-overlay';
        overlay.innerHTML = `
            <div class="location-history-panel" role="dialog" aria-modal="true" aria-labelledby="location-history-title">
                <button class="location-history-close" type="button" aria-label="Close location history" onclick="window.LocationHistoryIndex.close()">x</button>
                <div id="location-history-content"></div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', event => {
            if (event.target === overlay) LocationHistoryIndex.close();
        });
        LocationHistoryIndex._overlay = overlay;
        return overlay;
    },

    open: async (locationName, storyEvents = []) => {
        const overlay = LocationHistoryIndex.ensureOverlay();
        const content = document.getElementById('location-history-content');
        overlay.classList.add('active');
        if (content) {
            content.innerHTML = `
                <div class="location-history-kicker">Historical Index</div>
                <h2 id="location-history-title">${Utils.escapeHtml(locationName)}</h2>
                <p class="location-history-loading">Scanning story chronology and Galactic History...</p>`;
        }

        try {
            const results = await LocationHistoryIndex.search(locationName, storyEvents);
            LocationHistoryIndex.render(locationName, results);
        } catch (err) {
            console.error('Location history search failed:', err);
            if (content) {
                content.innerHTML = `
                    <div class="location-history-kicker">Historical Index</div>
                    <h2 id="location-history-title">${Utils.escapeHtml(locationName)}</h2>
                    <p class="location-history-empty">History lookup failed. Confirm the Galactic History data files are available.</p>`;
            }
        }
    },

    close: () => {
        if (LocationHistoryIndex._overlay) {
            LocationHistoryIndex._overlay.classList.remove('active');
        }
    },

    render: (locationName, results) => {
        const content = document.getElementById('location-history-content');
        if (!content) return;

        const events = results.combined || [];
        const byEra = new Map();
        events.forEach(event => {
            const key = event.eraTitle || event.source;
            if (!byEra.has(key)) byEra.set(key, []);
            byEra.get(key).push(event);
        });

        const groupsHtml = Array.from(byEra.entries()).map(([eraTitle, eraEvents]) => `
            <section class="location-history-era">
                <h3>${Utils.escapeHtml(eraTitle)}</h3>
                ${eraEvents.map(event => LocationHistoryIndex.renderEvent(event)).join('')}
            </section>
        `).join('');

        content.innerHTML = `
            <div class="location-history-kicker">Historical Index</div>
            <h2 id="location-history-title">${Utils.escapeHtml(locationName)}</h2>
            <div class="location-history-stats">
                <span>${results.galacticMatches.length} Galactic</span>
                <span>${results.storyMatches.length} Story</span>
                <span>${events.length} Total</span>
            </div>
            ${events.length ? groupsHtml : `<p class="location-history-empty">No indexed events mention ${Utils.escapeHtml(locationName)} yet.</p>`}`;
    },

    renderEvent: (event) => {
        const characterChips = (event.characters || []).map(character =>
            `<span class="location-history-chip">${Utils.escapeHtml(character.name || character.display_name || 'Character')}</span>`
        ).join('');
        const title = event.title ? `<strong>${Utils.escapeHtml(event.title)}</strong>` : '';
        const subEra = event.subEraTitle ? `<span>${Utils.escapeHtml(event.subEraTitle)}</span>` : '';
        return `
            <article class="location-history-event">
                <div class="location-history-event-meta">
                    <span>${Utils.escapeHtml(event.label || 'Undated')}</span>
                    ${subEra}
                    <span>${Utils.escapeHtml(event.source)}</span>
                </div>
                ${title}
                <p>${TimelineHub.applyKeywordLinks(event.text || '')}</p>
                ${characterChips ? `<div class="location-history-chips">${characterChips}</div>` : ''}
            </article>`;
    }
};
