export const HILT_SVG_PATHS = {
  obiwan: 'components/lightsaber/lightsabers/obiwan.svg',
  luke: 'components/lightsaber/lightsabers/luke.svg',
  maul: 'components/lightsaber/lightsabers/maul.svg',
  crossguard: 'components/lightsaber/lightsabers/crossguard.svg',
  kylo_ren: 'components/lightsaber/lightsabers/kylo_ren.svg',
};

export const HILT_CONFIGS = {
  obiwan:     { hiltWidth: 200, isDouble: false, isCrossguard: false },
  luke:       { hiltWidth: 280, isDouble: false, isCrossguard: false },
  crossguard: { hiltWidth: 200, isDouble: false, isCrossguard: true  },
  kylo_ren:   { hiltWidth: 200, isDouble: false, isCrossguard: true  },
  maul:       { hiltWidth: 380, isDouble: true,  isCrossguard: false },
};

export const DEMO_HILT_OPTIONS = [
  { value: 'obiwan', label: 'Obi-Wan' },
  { value: 'luke', label: 'Luke' },
  { value: 'kylo_ren', label: 'Kylo Ren' },
  { value: 'crossguard', label: 'Crossguard' },
  { value: 'maul', label: 'Darth Maul' },
];

export const DEMO_PRESETS = [
  {
    key: 'obiwan',
    name: 'Obi-Wan Kenobi',
    desc: 'Blue • Stable • Classic',
    options: { x: 25, y: 50, rotation: 0, color: 'blue', hilt: 'obiwan', unstable: false, scale: 1, bladeLength: 700 },
  },
  {
    key: 'luke',
    name: 'Luke Skywalker',
    desc: 'Green • Stable • ROTJ',
    options: { x: 25, y: 50, rotation: 0, color: 'green', hilt: 'luke', unstable: false, scale: 1, bladeLength: 650 },
  },
  {
    key: 'kylo',
    name: 'Kylo Ren',
    desc: 'Red • Unstable • Crossguard',
    options: { x: 25, y: 50, rotation: 0, color: 'red', hilt: 'kylo_ren', unstable: true, scale: 1, bladeLength: 600 },
  },
  {
    key: 'maul',
    name: 'Darth Maul',
    desc: 'Red • Double-Blade • Staff',
    options: { x: 50, y: 50, rotation: 0, color: 'red', hilt: 'maul', unstable: false, scale: 0.8, bladeLength: 450 },
  },
  {
    key: 'mace',
    name: 'Mace Windu',
    desc: 'Purple • Stable • Rotated',
    options: { x: 30, y: 45, rotation: -20, color: 'purple', hilt: 'obiwan', unstable: false, scale: 1, bladeLength: 700 },
  },
  {
    key: 'temple',
    name: 'Temple Guard',
    desc: 'Yellow • Stable • Vertical',
    options: { x: 50, y: 70, rotation: -90, color: 'yellow', hilt: 'luke', unstable: false, scale: 0.9, bladeLength: 500 },
  },
];
