// Central image registry for the reader Galactic History console.
const GALACTIC_ASSET_ROOT = 'data/timeline/galactic';

export const GALACTIC_OVERVIEW_BACKGROUND = `${GALACTIC_ASSET_ROOT}/overview-bg.png`;

export const GALACTIC_FOCUS_REPUBLIC_HERO = `${GALACTIC_ASSET_ROOT}/focus-republic-hero.png`;
export const GALACTIC_FOCUS_CLONE_DETAIL = `${GALACTIC_ASSET_ROOT}/focus-clone-detail.png`;
export const GALACTIC_FOCUS_TIMELINE_PANEL = `${GALACTIC_ASSET_ROOT}/focus-timeline-panel.png`;

export const GALACTIC_ERA_BEFORE_REPUBLIC = `${GALACTIC_ASSET_ROOT}/era-before-republic.png`;
export const GALACTIC_ERA_OLD_REPUBLIC = `${GALACTIC_ASSET_ROOT}/era-old-republic.png`;
export const GALACTIC_ERA_REPUBLIC = `${GALACTIC_ASSET_ROOT}/era-republic.png`;
export const GALACTIC_ERA_EMPIRE_RISE = `${GALACTIC_ASSET_ROOT}/era-empire-rise.png`;
export const GALACTIC_ERA_IMPERIAL = `${GALACTIC_ASSET_ROOT}/era-imperial.png`;
export const GALACTIC_ERA_NEW_REPUBLIC = `${GALACTIC_ASSET_ROOT}/era-new-republic.png`;
export const GALACTIC_ERA_FIRST_ORDER = `${GALACTIC_ASSET_ROOT}/era-first-order.png`;
export const GALACTIC_ERA_BEYOND_FIRST_ORDER = `${GALACTIC_ASSET_ROOT}/era-beyond-first-order.png`;

export const GALACTIC_DETAIL_BEFORE_REPUBLIC = `${GALACTIC_ASSET_ROOT}/detail-era-01.svg`;
export const GALACTIC_DETAIL_OLD_REPUBLIC = `${GALACTIC_ASSET_ROOT}/detail-era-02.svg`;
export const GALACTIC_DETAIL_REPUBLIC = `${GALACTIC_ASSET_ROOT}/detail-era-03.svg`;
export const GALACTIC_DETAIL_EMPIRE_RISE = `${GALACTIC_ASSET_ROOT}/detail-era-04.svg`;
export const GALACTIC_DETAIL_IMPERIAL = `${GALACTIC_ASSET_ROOT}/detail-era-05.svg`;
export const GALACTIC_DETAIL_NEW_REPUBLIC = `${GALACTIC_ASSET_ROOT}/detail-era-06.svg`;
export const GALACTIC_DETAIL_FIRST_ORDER = `${GALACTIC_ASSET_ROOT}/detail-era-07.svg`;
export const GALACTIC_DETAIL_BEYOND_FIRST_ORDER = `${GALACTIC_ASSET_ROOT}/detail-era-08.svg`;

export const GALACTIC_SUBERA_HIGH_REPUBLIC = `${GALACTIC_ASSET_ROOT}/subera-dummy-01.svg`;
export const GALACTIC_SUBERA_END_HIGH_REPUBLIC = `${GALACTIC_ASSET_ROOT}/subera-dummy-02.svg`;
export const GALACTIC_SUBERA_FALL_REPUBLIC = `${GALACTIC_ASSET_ROOT}/subera-dummy-03.svg`;
export const GALACTIC_SUBERA_CLONE_WARS = `${GALACTIC_ASSET_ROOT}/subera-dummy-04.svg`;
export const GALACTIC_SUBERA_RISE_SEPARATISTS = `${GALACTIC_ASSET_ROOT}/subera-dummy-05.svg`;
export const GALACTIC_SUBERA_POLITICAL_TURMOIL = `${GALACTIC_ASSET_ROOT}/subera-dummy-06.svg`;
export const GALACTIC_SUBERA_JEDI_ORDER = `${GALACTIC_ASSET_ROOT}/subera-dummy-07.svg`;
export const GALACTIC_SUBERA_DUMMY_01 = `${GALACTIC_ASSET_ROOT}/subera-dummy-01.svg`;
export const GALACTIC_SUBERA_DUMMY_02 = `${GALACTIC_ASSET_ROOT}/subera-dummy-02.svg`;
export const GALACTIC_SUBERA_DUMMY_03 = `${GALACTIC_ASSET_ROOT}/subera-dummy-03.svg`;
export const GALACTIC_SUBERA_DUMMY_04 = `${GALACTIC_ASSET_ROOT}/subera-dummy-04.svg`;
export const GALACTIC_SUBERA_DUMMY_05 = `${GALACTIC_ASSET_ROOT}/subera-dummy-05.svg`;
export const GALACTIC_SUBERA_DUMMY_06 = `${GALACTIC_ASSET_ROOT}/subera-dummy-06.svg`;
export const GALACTIC_SUBERA_DUMMY_07 = `${GALACTIC_ASSET_ROOT}/subera-dummy-07.svg`;
export const GALACTIC_SUBERA_DUMMY_08 = `${GALACTIC_ASSET_ROOT}/subera-dummy-08.svg`;
export const GALACTIC_SUBERA_DUMMY_09 = `${GALACTIC_ASSET_ROOT}/subera-dummy-09.svg`;
export const GALACTIC_SUBERA_DUMMY_10 = `${GALACTIC_ASSET_ROOT}/subera-dummy-10.svg`;
export const GALACTIC_SUBERA_DUMMY_11 = `${GALACTIC_ASSET_ROOT}/subera-dummy-11.svg`;
export const GALACTIC_SUBERA_DUMMY_12 = `${GALACTIC_ASSET_ROOT}/subera-dummy-12.svg`;

export const ImageMapping = {
    eras: {
        'before-the-republic': GALACTIC_ERA_BEFORE_REPUBLIC,
        'the-old-republic': GALACTIC_ERA_OLD_REPUBLIC,
        'republic-era': GALACTIC_ERA_REPUBLIC,
        'imperial-era': GALACTIC_ERA_IMPERIAL,
        'new-republic-era': GALACTIC_ERA_NEW_REPUBLIC,
        'first-order-resistance-war': GALACTIC_ERA_FIRST_ORDER,
        'new-jedi-order': GALACTIC_ERA_BEYOND_FIRST_ORDER,
        'thereafter': GALACTIC_ERA_BEYOND_FIRST_ORDER
    },
    subEras: {
        'dawn-of-the-jedi': GALACTIC_SUBERA_DUMMY_01,
        'expansionist-period': GALACTIC_SUBERA_DUMMY_02,
        'millennia-before-the-imperial-era': GALACTIC_SUBERA_DUMMY_03,
        '22000-5000-bby': GALACTIC_SUBERA_DUMMY_04,
        'wars-of-the-old-republic': GALACTIC_SUBERA_DUMMY_05,
        'reformation-of-the-republic': GALACTIC_SUBERA_DUMMY_06,
        'high-republic-era': GALACTIC_SUBERA_HIGH_REPUBLIC,
        'fall-of-the-republic': GALACTIC_SUBERA_FALL_REPUBLIC,
        'clone-wars': GALACTIC_SUBERA_CLONE_WARS,
        'the-dark-times': GALACTIC_SUBERA_DUMMY_08,
        'battle-of-yavin': GALACTIC_SUBERA_DUMMY_09,
        'galactic-civil-war-after-the-battle-of-yavin': GALACTIC_SUBERA_DUMMY_10,
        'peace': GALACTIC_SUBERA_DUMMY_11,
        'cold-war': GALACTIC_SUBERA_DUMMY_12
    }
};

export const GALACTIC_TIMELINE_ASSETS = {
    overviewBackground: GALACTIC_OVERVIEW_BACKGROUND,
    focusHero: GALACTIC_FOCUS_REPUBLIC_HERO,
    detailArt: GALACTIC_FOCUS_CLONE_DETAIL,
    timelinePanel: GALACTIC_FOCUS_TIMELINE_PANEL,
    eraPosters: [
        GALACTIC_ERA_BEFORE_REPUBLIC,
        GALACTIC_ERA_OLD_REPUBLIC,
        GALACTIC_ERA_REPUBLIC,
        GALACTIC_ERA_EMPIRE_RISE,
        GALACTIC_ERA_IMPERIAL,
        GALACTIC_ERA_NEW_REPUBLIC,
        GALACTIC_ERA_FIRST_ORDER,
        GALACTIC_ERA_BEYOND_FIRST_ORDER
    ],
    subEraCards: [
        GALACTIC_SUBERA_HIGH_REPUBLIC,
        GALACTIC_SUBERA_END_HIGH_REPUBLIC,
        GALACTIC_SUBERA_FALL_REPUBLIC,
        GALACTIC_SUBERA_CLONE_WARS,
        GALACTIC_SUBERA_RISE_SEPARATISTS,
        GALACTIC_SUBERA_POLITICAL_TURMOIL,
        GALACTIC_SUBERA_JEDI_ORDER,
        GALACTIC_SUBERA_DUMMY_01,
        GALACTIC_SUBERA_DUMMY_02,
        GALACTIC_SUBERA_DUMMY_03,
        GALACTIC_SUBERA_DUMMY_04,
        GALACTIC_SUBERA_DUMMY_05,
        GALACTIC_SUBERA_DUMMY_06,
        GALACTIC_SUBERA_DUMMY_07,
        GALACTIC_SUBERA_DUMMY_08,
        GALACTIC_SUBERA_DUMMY_09,
        GALACTIC_SUBERA_DUMMY_10,
        GALACTIC_SUBERA_DUMMY_11,
        GALACTIC_SUBERA_DUMMY_12
    ],
    detailPanels: [
        GALACTIC_DETAIL_BEFORE_REPUBLIC,
        GALACTIC_DETAIL_OLD_REPUBLIC,
        GALACTIC_DETAIL_REPUBLIC,
        GALACTIC_DETAIL_EMPIRE_RISE,
        GALACTIC_DETAIL_IMPERIAL,
        GALACTIC_DETAIL_NEW_REPUBLIC,
        GALACTIC_DETAIL_FIRST_ORDER,
        GALACTIC_DETAIL_BEYOND_FIRST_ORDER
    ]
};
