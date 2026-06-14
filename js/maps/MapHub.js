// js/maps/MapHub.js
import { Utils } from '../config.js';

export const MapHub = {
    _counts: {},

    // Map type configuration
    _types: {
        galactic: { label: 'Galactic Maps', icon: 'fas fa-globe', cls: 'hub-section-galactic', badgeCls: 'type-galactic', badgeLabel: 'Galactic' },
        regional: { label: 'Regional / Sector Maps', icon: 'fas fa-map', cls: 'hub-section-regional', badgeCls: 'type-regional', badgeLabel: 'Regional' },
        local:    { label: 'Local Maps', icon: 'fas fa-map-pin', cls: 'hub-section-local', badgeCls: 'type-local', badgeLabel: 'Local' },
    },

    renderCard: (map, slug, counts) => {
        const type = map.map_type || 'galactic';
        const cfg = MapHub._types[type] || MapHub._types.galactic;
        const c = counts[map.id] || { nodes: 0, edges: 0 };
        const thumbHtml = map.image_url
            ? `<img class="map-hub-thumb" src="${Utils.escapeHtml(map.image_url)}" loading="lazy" decoding="async" fetchpriority="low" alt="${Utils.escapeHtml(map.map_name)}">`
            : `<div class="map-hub-thumb-placeholder"><i class="fas fa-map-marked-alt"></i></div>`;
        return `
            <div class="map-hub-card" data-name="${Utils.escapeHtml(map.map_name.toLowerCase())}" data-type="${type}" onclick="window.Router.navigate('maps/${slug}/${map.id}')">
                <div class="map-hub-card-overlay"></div>
                ${thumbHtml}
                <div class="map-hub-card-body">
                    <div class="map-hub-card-name">${Utils.escapeHtml(map.map_name)}</div>
                    <div class="map-hub-card-badges">
                        <span class="map-hub-badge ${cfg.badgeCls}">${cfg.badgeLabel}</span>
                        ${map.is_primary ? '<span class="map-hub-badge primary"><i class="fas fa-star"></i> Primary</span>' : ''}
                        <span class="map-hub-badge stat"><i class="fas fa-circle-dot"></i> ${c.nodes} node${c.nodes !== 1 ? 's' : ''}</span>
                        <span class="map-hub-badge stat"><i class="fas fa-route"></i> ${c.edges} lane${c.edges !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>`;
    },

    renderSection: (typeKey, maps, slug, counts) => {
        if (!maps.length) return '';
        const cfg = MapHub._types[typeKey];
        const cardsHtml = maps.map(m => MapHub.renderCard(m, slug, counts)).join('');
        return `
            <div class="map-hub-section ${cfg.cls}" data-category="${typeKey}">
                <div class="map-hub-section-header">
                    <div class="map-hub-section-icon"><i class="${cfg.icon}"></i></div>
                    <div class="map-hub-section-title">${cfg.label}</div>
                    <span class="map-hub-count-pill">${maps.length}</span>
                    <div class="map-hub-section-line"></div>
                </div>
                <div class="map-hub-grid">${cardsHtml}</div>
            </div>`;
    },

    render: (maps, slug, themeColor, counts) => {
        const galactic = maps.filter(m => (m.map_type || 'galactic') === 'galactic');
        const regional = maps.filter(m => m.map_type === 'regional');
        const local    = maps.filter(m => m.map_type === 'local');
        const sections = [
            MapHub.renderSection('galactic', galactic, slug, counts),
            MapHub.renderSection('regional', regional, slug, counts),
            MapHub.renderSection('local',    local,    slug, counts),
        ].join('');

        return `
            <div class="map-hub-screen" id="map-hub-screen">
                <div class="map-hub-header">
                    <div class="map-hub-title"><i class="fas fa-satellite-dish" style="margin-right:0.5rem; opacity:0.7;"></i>Star Chart Registry</div>
                    <div class="map-hub-subtitle">${maps.length} chart${maps.length !== 1 ? 's' : ''} in the database — select one to open the interactive viewer</div>
                </div>
                <div class="map-hub-search-wrapper">
                    <i class="fas fa-search map-hub-search-icon"></i>
                    <input id="map-hub-search" type="text" class="map-hub-search" placeholder="Search charts…" autocomplete="off">
                </div>
                ${sections}
                <div class="map-hub-no-results" id="map-hub-no-results">
                    <i class="fas fa-satellite-dish"></i>
                    No charts match your search
                </div>
            </div>`;
    },

    init: () => {
        const searchInput = document.getElementById('map-hub-search');
        if (!searchInput) return;
        searchInput.addEventListener('input', MapHub.onSearch);
    },

    onSearch: (e) => {
        const query = (e.target.value || '').toLowerCase().trim();
        let anyVisible = false;
        document.querySelectorAll('.map-hub-card').forEach(card => {
            const name = card.dataset.name || '';
            const type = card.dataset.type || '';
            const match = !query || name.includes(query) || type.includes(query);
            card.style.display = match ? '' : 'none';
            if (match) anyVisible = true;
        });
        // Hide empty sections
        document.querySelectorAll('.map-hub-section').forEach(section => {
            const hasVisible = [...section.querySelectorAll('.map-hub-card')].some(c => c.style.display !== 'none');
            section.style.display = hasVisible ? '' : 'none';
        });
        const noResults = document.getElementById('map-hub-no-results');
        if (noResults) noResults.style.display = (query && !anyVisible) ? 'block' : 'none';
    }
};
