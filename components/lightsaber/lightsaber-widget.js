// lightsaber-widget.js
// Self-contained Lightsaber Transition/Loading Widget
// Usage: import { createLightsaber } from './lightsaber-widget.js'
import { HILT_CONFIGS, HILT_SVG_PATHS } from './lightsaber-config.js';

const WIDGET_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.lsw-root {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 99999;
  pointer-events: all;
  overflow: hidden;
  font-family: 'Orbitron', sans-serif;
}

.lsw-root * { margin: 0; padding: 0; box-sizing: border-box; }

.lsw-root.lsw-hidden {
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.lsw-root.lsw-visible {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}

.lsw-bg-dark {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.05) grayscale(0.2);
  z-index: 0;
}

.lsw-bg-bright {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
  opacity: 0;
  --gel-x: 50%;
  --gel-y: 50%;
  --gel-outer-x: 40vmin;
  --gel-outer-y: 18vmin;
  --gel-color: rgba(255, 255, 255, 0.6);
  background-blend-mode: screen;
  filter: brightness(1.15) saturate(1.2);
  -webkit-mask-image: radial-gradient(ellipse var(--gel-outer-x) var(--gel-outer-y) at var(--gel-x) var(--gel-y), black 0%, black 55%, transparent 100%);
  mask-image: radial-gradient(ellipse var(--gel-outer-x) var(--gel-outer-y) at var(--gel-x) var(--gel-y), black 0%, black 55%, transparent 100%);
}

.lsw-ambient {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.5s;
}

.lsw-saber-group {
  position: absolute;
  z-index: 20;
  display: flex;
  align-items: center;
  transform-origin: center center;
}

.lsw-hilt-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 5;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));
  overflow: visible;
}

.lsw-hilt-wrapper svg {
  display: block;
  height: auto;
  position: relative;
  z-index: 2;
}

.lsw-blade-container {
  position: relative;
  flex-grow: 1;
  height: 120px;
  display: flex;
  align-items: center;
  margin-left: -2px;
  overflow: visible;
}

.lsw-blade-container-left {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  margin-right: -2px;
  overflow: visible;
  display: none;
}

.lsw-blade-beam {
  position: relative;
  height: 28px;
  width: 0%;
  border-radius: 0 14px 14px 0;
  transition: width 0.016s linear;
  overflow: visible;
}

.lsw-blade-beam-left {
  position: relative;
  height: 28px;
  width: 0%;
  border-radius: 14px 0 0 14px;
  transition: width 0.016s linear;
  overflow: visible;
  margin-left: auto;
}

.lsw-blade-core {
  position: absolute;
  top: 5px; left: 0; right: 0; bottom: 5px;
  background: #fff;
  border-radius: 0 10px 10px 0;
  z-index: 3;
}

.lsw-blade-inner {
  position: absolute;
  top: 2px; left: 0; right: 0; bottom: 2px;
  border-radius: 0 12px 12px 0;
  z-index: 2;
  opacity: 0.9;
}

.lsw-blade-outer {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 0 14px 14px 0;
  z-index: 1;
  opacity: 0.7;
}

.lsw-blade-glow-soft {
  position: absolute;
  top: -12px; left: -5px; right: -5px; bottom: -12px;
  border-radius: 0 24px 24px 0;
  z-index: 0;
  opacity: 0.5;
  filter: blur(10px);
}

.lsw-blade-glow-wide {
  position: absolute;
  top: -30px; left: -5px; right: -5px; bottom: -30px;
  border-radius: 0 35px 35px 0;
  z-index: -1;
  opacity: 0.25;
  filter: blur(22px);
}

.lsw-blade-glow-ultra {
  position: absolute;
  top: -55px; left: -5px; right: -5px; bottom: -55px;
  border-radius: 0 45px 45px 0;
  z-index: -2;
  opacity: 0.1;
  filter: blur(45px);
}

.lsw-blade-tip {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  z-index: 4;
  filter: blur(3px);
}

.lsw-blade-beam-left .lsw-blade-core { border-radius: 10px 0 0 10px; }
.lsw-blade-beam-left .lsw-blade-inner { border-radius: 12px 0 0 12px; }
.lsw-blade-beam-left .lsw-blade-outer { border-radius: 14px 0 0 14px; }
.lsw-blade-beam-left .lsw-blade-glow-soft { border-radius: 24px 0 0 24px; }
.lsw-blade-beam-left .lsw-blade-glow-wide { border-radius: 35px 0 0 35px; }
.lsw-blade-beam-left .lsw-blade-glow-ultra { border-radius: 45px 0 0 45px; }
.lsw-blade-beam-left .lsw-blade-tip { left: -8px; right: auto; }

.lsw-emitter-glow {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 50px;
  border-radius: 50%;
  z-index: 0;
  opacity: 0;
  filter: blur(12px);
  transition: opacity 0.3s;
}

.lsw-emitter-glow-left {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 50px;
  border-radius: 50%;
  z-index: 0;
  opacity: 0;
  filter: blur(12px);
  transition: opacity 0.3s;
}

.lsw-ignition-flash {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  filter: blur(15px);
}

.lsw-ignition-flash.lsw-flash {
  animation: lswFlashBurst 0.4s ease-out forwards;
}

@keyframes lswFlashBurst {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.5); }
}

.lsw-crackle-canvas {
  position: absolute;
  top: -30px;
  left: 0;
  width: 100%;
  height: 180px;
  pointer-events: none;
  z-index: 7;
}

.lsw-crossguard-container {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  display: none;
  pointer-events: none;
}

.lsw-crossguard-blade {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 0px;
  overflow: visible;
  transition: height 0.3s ease-out;
}

.lsw-crossguard-blade.lsw-up {
  bottom: 50%;
  margin-bottom: 16px;
  transform-origin: bottom center;
}

.lsw-crossguard-blade.lsw-down {
  top: 50%;
  margin-top: 16px;
  transform-origin: top center;
}

.lsw-crossguard-blade .lsw-cg-core {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 100%;
  background: #fff;
  z-index: 3;
}

.lsw-crossguard-blade.lsw-up .lsw-cg-core { border-radius: 6px 6px 0 0; bottom: 0; }
.lsw-crossguard-blade.lsw-down .lsw-cg-core { border-radius: 0 0 6px 6px; top: 0; }

.lsw-crossguard-blade .lsw-cg-inner {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 100%;
  z-index: 2;
  opacity: 0.85;
}

.lsw-crossguard-blade.lsw-up .lsw-cg-inner { border-radius: 8px 8px 0 0; bottom: 0; }
.lsw-crossguard-blade.lsw-down .lsw-cg-inner { border-radius: 0 0 8px 8px; top: 0; }

.lsw-crossguard-blade .lsw-cg-outer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 100%;
  z-index: 1;
  opacity: 0.6;
}

.lsw-crossguard-blade.lsw-up .lsw-cg-outer { border-radius: 10px 10px 0 0; bottom: 0; }
.lsw-crossguard-blade.lsw-down .lsw-cg-outer { border-radius: 0 0 10px 10px; top: 0; }

.lsw-crossguard-blade .lsw-cg-glow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: calc(100% + 20px);
  z-index: 0;
  opacity: 0.4;
  filter: blur(10px);
}

.lsw-crossguard-blade.lsw-up .lsw-cg-glow { border-radius: 16px 16px 0 0; bottom: -10px; }
.lsw-crossguard-blade.lsw-down .lsw-cg-glow { border-radius: 0 0 16px 16px; top: -10px; }

@keyframes lswGlowPulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.38; }
}

@keyframes lswGlowPulseSoft {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.68; }
}

@keyframes lswStableFlicker {
  0% { opacity: 1; transform: scaleY(1); }
  4% { opacity: 0.98; transform: scaleY(1.005); }
  8% { opacity: 1; transform: scaleY(0.998); }
  20% { opacity: 1; transform: scaleY(1); }
  50% { opacity: 0.97; transform: scaleY(1.003); }
  80% { opacity: 1; transform: scaleY(1); }
  100% { opacity: 1; transform: scaleY(1); }
}

@keyframes lswKyloFlicker {
  0% { opacity: 1; transform: scaleY(1); }
  3% { opacity: 0.82; transform: scaleY(0.94); }
  5% { opacity: 1; transform: scaleY(1.04); }
  7% { opacity: 0.88; transform: scaleY(0.96); }
  10% { opacity: 1; transform: scaleY(1.02); }
  15% { opacity: 0.95; transform: scaleY(0.98); }
  20% { opacity: 1; transform: scaleY(1); }
  30% { opacity: 0.9; transform: scaleY(1.03); }
  33% { opacity: 1; transform: scaleY(0.97); }
  40% { opacity: 1; transform: scaleY(1); }
  50% { opacity: 0.85; transform: scaleY(0.95); }
  52% { opacity: 1; transform: scaleY(1.05); }
  60% { opacity: 1; transform: scaleY(1); }
  70% { opacity: 0.92; transform: scaleY(1.02); }
  72% { opacity: 1; transform: scaleY(0.97); }
  80% { opacity: 1; transform: scaleY(1); }
  90% { opacity: 0.88; transform: scaleY(0.96); }
  92% { opacity: 1; transform: scaleY(1.03); }
  100% { opacity: 1; transform: scaleY(1); }
}

@keyframes lswCrossguardFlicker {
  0% { transform: translateX(-50%) scaleX(1); opacity: 1; }
  5% { transform: translateX(-50%) scaleX(0.85); opacity: 0.8; }
  8% { transform: translateX(-50%) scaleX(1.1); opacity: 1; }
  15% { transform: translateX(-50%) scaleX(0.9); opacity: 0.85; }
  20% { transform: translateX(-50%) scaleX(1); opacity: 1; }
  35% { transform: translateX(-50%) scaleX(1.05); opacity: 0.9; }
  40% { transform: translateX(-50%) scaleX(0.88); opacity: 0.82; }
  45% { transform: translateX(-50%) scaleX(1.08); opacity: 1; }
  60% { transform: translateX(-50%) scaleX(0.92); opacity: 0.88; }
  65% { transform: translateX(-50%) scaleX(1); opacity: 1; }
  80% { transform: translateX(-50%) scaleX(0.95); opacity: 0.9; }
  85% { transform: translateX(-50%) scaleX(1.12); opacity: 0.85; }
  90% { transform: translateX(-50%) scaleX(0.9); opacity: 1; }
  100% { transform: translateX(-50%) scaleX(1); opacity: 1; }
}

.lsw-blade-beam.lsw-active, .lsw-blade-beam-left.lsw-active {
  animation: lswStableFlicker 0.3s infinite;
}

.lsw-blade-beam.lsw-active .lsw-blade-glow-wide,
.lsw-blade-beam-left.lsw-active .lsw-blade-glow-wide {
  animation: lswGlowPulse 1.5s ease-in-out infinite;
}

.lsw-blade-beam.lsw-active .lsw-blade-glow-soft,
.lsw-blade-beam-left.lsw-active .lsw-blade-glow-soft {
  animation: lswGlowPulseSoft 0.8s ease-in-out infinite;
}

.lsw-blade-beam.lsw-kylo-active {
  animation: lswKyloFlicker 0.25s infinite !important;
}

.lsw-crossguard-blade .lsw-cg-core,
.lsw-crossguard-blade .lsw-cg-inner,
.lsw-crossguard-blade .lsw-cg-outer {
  animation: lswCrossguardFlicker 0.2s infinite;
}

.lsw-crossguard-blade .lsw-cg-inner { animation-delay: -0.05s; }
.lsw-crossguard-blade .lsw-cg-outer { animation-delay: -0.12s; }

.lsw-progress-overlay {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.lsw-progress-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #888;
  text-shadow: 0 0 15px currentColor;
}

.lsw-progress-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #555;
}

.lsw-progress-bar-track {
  width: 300px;
  height: 4px;
  background: #1a1a2e;
  border-radius: 2px;
  overflow: hidden;
}

.lsw-progress-bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 2px;
  transition: width 0.016s linear;
}
`;

const COLORS = {
  blue:   { core: '#ffffff', inner: '#4fc3f7', outer: '#0d47a1', glow: '#2196f3' },
  green:  { core: '#ffffff', inner: '#81c784', outer: '#1b5e20', glow: '#4caf50' },
  red:    { core: '#ffffff', inner: '#ef5350', outer: '#b71c1c', glow: '#f44336' },
  purple: { core: '#ffffff', inner: '#ce93d8', outer: '#4a148c', glow: '#9c27b0' },
  yellow: { core: '#ffffff', inner: '#fff176', outer: '#f57f17', glow: '#ffeb3b' },
  white:  { core: '#ffffff', inner: '#e0e0e0', outer: '#9e9e9e', glow: '#ffffff' },
};

const HILT_SVG_CACHE = new Map();

function loadHiltSvg(hiltKey) {
  const path = HILT_SVG_PATHS[hiltKey] || HILT_SVG_PATHS.obiwan;
  if (HILT_SVG_CACHE.has(path)) return HILT_SVG_CACHE.get(path);
  const request = fetch(path, { cache: 'force-cache' })
    .then((resp) => (resp.ok ? resp.text() : null))
    .catch(() => null);
  HILT_SVG_CACHE.set(path, request);
  return request;
}

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const f = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
  const n = parseInt(f, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

let styleInjected = false;
let svgFiltersInjected = false;

function injectStyle() {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.textContent = WIDGET_CSS;
  document.head.appendChild(style);
  styleInjected = true;
}

function injectSvgFilters() {
  if (svgFiltersInjected) return;
  const div = document.createElement('div');
  div.innerHTML = `<svg width="0" height="0" style="position:absolute">
    <defs>
      <filter id="lsw-kylo-turbulence" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.04 0.12" numOctaves="3" seed="2" result="turb">
          <animate attributeName="baseFrequency" values="0.04 0.12;0.06 0.15;0.03 0.1;0.05 0.14;0.04 0.12" dur="0.4s" repeatCount="indefinite"/>
          <animate attributeName="seed" values="1;5;2;8;3;6;1" dur="0.3s" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="turb" scale="3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="lsw-crossguard-flame" x="-30%" y="-10%" width="160%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.08 0.2" numOctaves="4" seed="5" result="noise">
          <animate attributeName="seed" values="1;4;2;7;3;9;5;1" dur="0.25s" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>`;
  document.body.appendChild(div.firstElementChild);
  svgFiltersInjected = true;
}

/**
 * @typedef {Object} LightsaberOptions
 * @property {number}  [x=50]               - Hilt X position in % of viewport width
 * @property {number}  [y=50]               - Hilt Y position in % of viewport height
 * @property {number}  [rotation=0]         - Rotation in degrees
 * @property {number}  [bladeLength=600]    - Max blade length in px
 * @property {string}  [color='blue']       - 'blue'|'green'|'red'|'purple'|'yellow'|'white'
 * @property {string}  [hilt='obiwan']      - 'obiwan'|'luke'|'crossguard'|'maul'|'kylo_ren'
 * @property {boolean} [unstable=false]     - Kylo-style unstable flicker
 * @property {boolean} [audio=true]         - Enable audio
 * @property {string}  [backgroundImage=''] - Background image URL
 * @property {number}  [backgroundBrightness=0.05] - Dark bg brightness 0-1
 * @property {boolean} [showProgress=true]  - Show % text overlay
 * @property {string}  [progressLabel='Loading'] - Label text
 * @property {number}  [progress=0]         - Initial progress 0-100
 * @property {number}  [scale=1]            - Scale factor for the saber
 */

/**
 * Creates a full-screen lightsaber transition widget.
 * @param {LightsaberOptions} options
 * @returns {LightsaberController}
 */
export function createLightsaber(options = {}) {
  injectStyle();
  injectSvgFilters();

  const opts = Object.assign({
    x: 50,
    y: 50,
    rotation: 0,
    bladeLength: 600,
    color: 'blue',
    hilt: 'obiwan',
    unstable: false,
    audio: true,
    backgroundImage: '',
    backgroundBrightness: 0.05,
    showProgress: true,
    progressLabel: 'Loading',
    progress: 0,
    scale: 1,
  }, options);

  // Resolve hilt config
  function getHiltConfig() {
    const hiltKey = opts.hilt;
    const cfg = HILT_CONFIGS[hiltKey] || HILT_CONFIGS.obiwan;
    return {
      ...cfg,
      // Override crossguard/unstable if explicitly set
      isCrossguard: opts.hilt === 'crossguard' || (opts.unstable && opts.hilt !== 'maul'),
      isDouble: cfg.isDouble,
    };
  }

  // ── Build DOM ──
  const root = document.createElement('div');
  root.className = 'lsw-root lsw-visible';

  const bgDark = document.createElement('div');
  bgDark.className = 'lsw-bg-dark';
  if (opts.backgroundImage) {
    bgDark.style.backgroundImage = `url('${opts.backgroundImage}')`;
    bgDark.style.filter = `brightness(${opts.backgroundBrightness}) grayscale(0.2)`;
  } else {
    bgDark.style.background = '#0a0a0f';
  }

  const bgBright = document.createElement('div');
  bgBright.className = 'lsw-bg-bright';
  if (opts.backgroundImage) {
    const c = COLORS[opts.color] || COLORS.blue;
    const rgb = hexToRgb(c.glow);
    bgBright.style.backgroundImage =
      `radial-gradient(ellipse var(--gel-outer-x) var(--gel-outer-y) at var(--gel-x) var(--gel-y), rgba(${rgb.r},${rgb.g},${rgb.b},0.7) 0%, rgba(0,0,0,0) 70%), url('${opts.backgroundImage}')`;
    bgBright.style.backgroundSize = 'cover, cover';
    bgBright.style.backgroundPosition = 'center, center';
  }

  const ambient = document.createElement('div');
  ambient.className = 'lsw-ambient';

  const saberGroup = document.createElement('div');
  saberGroup.className = 'lsw-saber-group';

  // Left blade container
  const bladeContLeft = document.createElement('div');
  bladeContLeft.className = 'lsw-blade-container-left';
  bladeContLeft.innerHTML = `
    <div class="lsw-emitter-glow-left"></div>
    <div class="lsw-blade-beam-left">
      <div class="lsw-blade-glow-ultra"></div>
      <div class="lsw-blade-glow-wide"></div>
      <div class="lsw-blade-glow-soft"></div>
      <div class="lsw-blade-outer"></div>
      <div class="lsw-blade-inner"></div>
      <div class="lsw-blade-core"></div>
      <div class="lsw-blade-tip"></div>
    </div>
    <canvas class="lsw-crackle-canvas"></canvas>
  `;

  const hiltWrapper = document.createElement('div');
  hiltWrapper.className = 'lsw-hilt-wrapper';

  // Right blade container
  const bladeCont = document.createElement('div');
  bladeCont.className = 'lsw-blade-container';
  bladeCont.innerHTML = `
    <div class="lsw-ignition-flash"></div>
    <div class="lsw-emitter-glow"></div>
    <div class="lsw-crossguard-container">
      <div class="lsw-crossguard-blade lsw-up">
        <div class="lsw-cg-glow"></div>
        <div class="lsw-cg-outer"></div>
        <div class="lsw-cg-inner"></div>
        <div class="lsw-cg-core"></div>
      </div>
      <div class="lsw-crossguard-blade lsw-down">
        <div class="lsw-cg-glow"></div>
        <div class="lsw-cg-outer"></div>
        <div class="lsw-cg-inner"></div>
        <div class="lsw-cg-core"></div>
      </div>
    </div>
    <div class="lsw-blade-beam">
      <div class="lsw-blade-glow-ultra"></div>
      <div class="lsw-blade-glow-wide"></div>
      <div class="lsw-blade-glow-soft"></div>
      <div class="lsw-blade-outer"></div>
      <div class="lsw-blade-inner"></div>
      <div class="lsw-blade-core"></div>
      <div class="lsw-blade-tip"></div>
    </div>
    <canvas class="lsw-crackle-canvas"></canvas>
  `;

  saberGroup.appendChild(bladeContLeft);
  saberGroup.appendChild(hiltWrapper);
  saberGroup.appendChild(bladeCont);

  // Progress overlay
  const progressOverlay = document.createElement('div');
  progressOverlay.className = 'lsw-progress-overlay';
  progressOverlay.innerHTML = `
    <div class="lsw-progress-label">${opts.progressLabel}</div>
    <div class="lsw-progress-text">0%</div>
    <div class="lsw-progress-bar-track">
      <div class="lsw-progress-bar-fill"></div>
    </div>
  `;
  if (!opts.showProgress) progressOverlay.style.display = 'none';

  root.appendChild(bgDark);
  root.appendChild(bgBright);
  root.appendChild(ambient);
  root.appendChild(saberGroup);
  root.appendChild(progressOverlay);
  document.body.appendChild(root);

  // ── Element refs ──
  const el = {
    root,
    bgDark,
    bgBright,
    ambient,
    saberGroup,
    hiltWrapper,
    bladeCont,
    bladeContLeft,
    bladeBeam:       bladeCont.querySelector('.lsw-blade-beam'),
    bladeBeamLeft:   bladeContLeft.querySelector('.lsw-blade-beam-left'),
    emitterGlow:     bladeCont.querySelector('.lsw-emitter-glow'),
    emitterGlowLeft: bladeContLeft.querySelector('.lsw-emitter-glow-left'),
    ignitionFlash:   bladeCont.querySelector('.lsw-ignition-flash'),
    cgContainer:     bladeCont.querySelector('.lsw-crossguard-container'),
    cgUp:            bladeCont.querySelector('.lsw-crossguard-blade.lsw-up'),
    cgDown:          bladeCont.querySelector('.lsw-crossguard-blade.lsw-down'),
    crackleCanvas:   bladeCont.querySelector('.lsw-crackle-canvas'),
    crackleCanvasL:  bladeContLeft.querySelector('.lsw-crackle-canvas'),
    progressText:    progressOverlay.querySelector('.lsw-progress-text'),
    progressLabel:   progressOverlay.querySelector('.lsw-progress-label'),
    progressBarFill: progressOverlay.querySelector('.lsw-progress-bar-fill'),
    progressOverlay,
  };

  const cCtx  = el.crackleCanvas.getContext('2d');
  const cCtxL = el.crackleCanvasL.getContext('2d');

  // ── State ──
  let currentProgress = 0;
  let targetProgress = 0;
  let animating = false;
  let isOn = false;
  let destroyed = false;
  let loopId = null;
  let kyloJitterTime = 0;

  // Audio
  let audioCtx = null, humOsc = null, humGain = null, humOn = false;

  // ── Init ──
  function init() {
    applyHilt();
    applyLayout();
    applyColor();
    resizeCanvases();
    if (opts.progress > 0) {
      setProgressInternal(opts.progress, false);
    }
    loopId = requestAnimationFrame(loop);
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    resizeCanvases();
    applyLayout();
  }

  function applyHilt() {
    const hiltKey = opts.hilt;
    const cfg = HILT_CONFIGS[hiltKey] || HILT_CONFIGS.obiwan;
    hiltWrapper.innerHTML = '';
    hiltWrapper.style.width = cfg.hiltWidth + 'px';

    // Show/hide crossguard
    const showCG = cfg.isCrossguard || opts.unstable;
    el.cgContainer.style.display = showCG ? 'block' : 'none';

    // Show/hide left blade for double
    el.bladeContLeft.style.display = cfg.isDouble ? 'flex' : 'none';

    loadHiltSvg(hiltKey).then((svg) => {
      if (destroyed || !svg || opts.hilt !== hiltKey) return;
      hiltWrapper.innerHTML = svg;
      const svgEl = hiltWrapper.querySelector('svg');
      if (svgEl) svgEl.style.width = cfg.hiltWidth + 'px';
    });
  }

  function applyLayout() {
    const cfg = HILT_CONFIGS[opts.hilt] || HILT_CONFIGS.obiwan;
    const s = opts.scale;

    // Position: x/y are % of viewport, saber is placed so hilt center is at that point
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const px = (opts.x / 100) * vw;
    const py = (opts.y / 100) * vh;

    // Blade container width
    el.bladeCont.style.width = opts.bladeLength + 'px';
    if (cfg.isDouble) {
      el.bladeContLeft.style.width = opts.bladeLength + 'px';
    }

    saberGroup.style.left = px + 'px';
    saberGroup.style.top = py + 'px';
    saberGroup.style.transform = `translate(-50%, -50%) rotate(${opts.rotation}deg) scale(${s})`;
  }

  function applyColor() {
    const c = COLORS[opts.color] || COLORS.blue;
    applyColorToBeam(el.bladeBeam, c);
    if (el.bladeBeamLeft) applyColorToBeam(el.bladeBeamLeft, c);

    [el.cgUp, el.cgDown].forEach(cg => {
      cg.querySelector('.lsw-cg-core').style.background = c.core;
      cg.querySelector('.lsw-cg-inner').style.background = c.inner;
      cg.querySelector('.lsw-cg-outer').style.background = c.outer;
      cg.querySelector('.lsw-cg-glow').style.background = c.glow;
    });

    el.emitterGlow.style.background = c.glow;
    el.emitterGlowLeft.style.background = c.glow;
    el.ignitionFlash.style.background = c.glow;
    el.ambient.style.background = `radial-gradient(ellipse at 50% 50%, ${c.glow}22 0%, transparent 70%)`;
    el.progressText.style.color = currentProgress > 0 ? c.glow : '#888';
    el.progressBarFill.style.background = c.glow;

    // Update gel bg
    if (opts.backgroundImage) {
      const rgb = hexToRgb(c.glow);
      el.bgBright.style.setProperty('--gel-color', `rgba(${rgb.r},${rgb.g},${rgb.b},0.7)`);
      el.bgBright.style.backgroundImage =
        `radial-gradient(ellipse var(--gel-outer-x) var(--gel-outer-y) at var(--gel-x) var(--gel-y), rgba(${rgb.r},${rgb.g},${rgb.b},0.7) 0%, rgba(0,0,0,0) 70%), url('${opts.backgroundImage}')`;
      el.bgBright.style.backgroundSize = 'cover, cover';
      el.bgBright.style.backgroundPosition = 'center, center';
    }
  }

  function applyColorToBeam(beam, c) {
    beam.querySelector('.lsw-blade-core').style.background = c.core;
    beam.querySelector('.lsw-blade-inner').style.background = c.inner;
    beam.querySelector('.lsw-blade-outer').style.background = c.outer;
    beam.querySelector('.lsw-blade-glow-soft').style.background = c.glow;
    beam.querySelector('.lsw-blade-glow-wide').style.background = c.glow;
    beam.querySelector('.lsw-blade-glow-ultra').style.background = c.glow;
    beam.querySelector('.lsw-blade-tip').style.background = c.core;
  }

  function resizeCanvases() {
    const r = el.bladeCont.getBoundingClientRect();
    el.crackleCanvas.width = r.width || opts.bladeLength;
    el.crackleCanvas.height = 180;
    if (el.crackleCanvasL) {
      const r2 = el.bladeContLeft.getBoundingClientRect();
      el.crackleCanvasL.width = r2.width || opts.bladeLength;
      el.crackleCanvasL.height = 180;
    }
  }

  // ── Audio ──
  function initAudio() {
    if (audioCtx || !opts.audio) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function startHum() {
    if (humOn || !opts.audio) return;
    initAudio();
    humOsc = audioCtx.createOscillator();
    humGain = audioCtx.createGain();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(120, audioCtx.currentTime);
    humGain.gain.setValueAtTime(0, audioCtx.currentTime);
    humGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.3);
    humOsc.connect(humGain);
    humGain.connect(audioCtx.destination);
    humOsc.start();
    humOn = true;
  }

  function stopHum() {
    if (!humOn || !humGain) return;
    humGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    const o = humOsc;
    setTimeout(() => { try { o.stop(); } catch(e){} humOn = false; }, 250);
    humOsc = null;
  }

  function playIgniteSound() {
    if (!opts.audio) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.7);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.7);
  }

  function playRetractSound() {
    if (!opts.audio) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
  }

  // ── Progress ──
  function setProgressInternal(val, animate) {
    val = Math.max(0, Math.min(100, val));
    if (animate) {
      targetProgress = val;
      if (!animating) animateProgress();
      return;
    }
    const wasOff = currentProgress === 0;
    currentProgress = val;
    if (val > 0 && wasOff) triggerIgnition();
    else if (val === 0 && !wasOff) triggerRetract();
    updateBlade();
  }

  function animateProgress() {
    animating = true;
    const speed = targetProgress > currentProgress ? 2 : 3;
    const dir = targetProgress > currentProgress ? 1 : -1;
    function step() {
      if (destroyed) return;
      currentProgress += dir * speed;
      if ((dir > 0 && currentProgress >= targetProgress) || (dir < 0 && currentProgress <= targetProgress)) {
        currentProgress = targetProgress;
        animating = false;
      }
      const wasOff = !isOn;
      if (currentProgress > 0 && wasOff) triggerIgnition();
      else if (currentProgress === 0 && isOn) triggerRetract();
      updateBlade();
      if (animating) requestAnimationFrame(step);
    }
    step();
  }

  function triggerIgnition() {
    isOn = true;
    playIgniteSound();
    startHum();
    el.bladeBeam.classList.add('lsw-active');
    if (el.bladeBeamLeft) el.bladeBeamLeft.classList.add('lsw-active');

    const cfg = HILT_CONFIGS[opts.hilt] || HILT_CONFIGS.obiwan;
    if (cfg.isCrossguard || opts.unstable) {
      el.bladeBeam.classList.add('lsw-kylo-active');
      el.bladeBeam.style.filter = 'url(#lsw-kylo-turbulence)';
    }

    el.ignitionFlash.classList.remove('lsw-flash');
    void el.ignitionFlash.offsetWidth;
    el.ignitionFlash.classList.add('lsw-flash');
  }

  function triggerRetract() {
    isOn = false;
    playRetractSound();
    stopHum();
    el.bladeBeam.classList.remove('lsw-active', 'lsw-kylo-active');
    el.bladeBeam.style.filter = 'none';
    if (el.bladeBeamLeft) el.bladeBeamLeft.classList.remove('lsw-active');
  }

  function updateBlade() {
    const pct = currentProgress;
    const c = COLORS[opts.color] || COLORS.blue;
    const cfg = HILT_CONFIGS[opts.hilt] || HILT_CONFIGS.obiwan;
    const isUnstable = cfg.isCrossguard || opts.unstable;

    el.bladeBeam.style.width = pct + '%';
    if (cfg.isDouble && el.bladeBeamLeft) {
      el.bladeBeamLeft.style.width = pct + '%';
      el.emitterGlowLeft.style.opacity = pct > 0 ? 0.6 + (pct / 100) * 0.4 : 0;
    }

    if (isUnstable) {
      const cgHeight = pct > 10 ? Math.min(55, (pct - 10) * 0.65) : 0;
      el.cgUp.style.height = cgHeight + 'px';
      el.cgDown.style.height = cgHeight + 'px';
      el.cgUp.style.filter = cgHeight > 0 ? 'url(#lsw-crossguard-flame)' : 'none';
      el.cgDown.style.filter = cgHeight > 0 ? 'url(#lsw-crossguard-flame)' : 'none';
    }

    el.progressText.textContent = Math.round(pct) + '%';
    el.progressText.style.color = pct > 0 ? c.glow : '#888';
    el.progressBarFill.style.width = pct + '%';
    el.emitterGlow.style.opacity = pct > 0 ? 0.6 + (pct / 100) * 0.4 : 0;
    el.ambient.style.opacity = (pct / 100) * 0.5;

    // Gel lighting
    updateGelLighting(pct, c);

    // Hum pitch
    if (humOsc && humOn) {
      const baseFreq = isUnstable ? 90 : 100;
      humOsc.frequency.setValueAtTime(baseFreq + pct * 1.5, audioCtx.currentTime);
      if (humGain) humGain.gain.setValueAtTime(0.02 + pct * 0.0004, audioCtx.currentTime);
    }
  }

  function updateGelLighting(pct, c) {
    if (!opts.backgroundImage) return;
    if (pct <= 0) {
      el.bgBright.style.opacity = '0';
      return;
    }
    const theta = (opts.rotation * Math.PI) / 180;
    const scaledBladeLength = opts.bladeLength * opts.scale * (pct / 100);
    const midpointX = opts.x + (Math.cos(theta) * scaledBladeLength * 0.5 / window.innerWidth) * 100;
    const midpointY = opts.y + (Math.sin(theta) * scaledBladeLength * 0.5 / window.innerHeight) * 100;
    const outerX = Math.min(92, 16 + pct * 0.55);
    const outerY = Math.min(52, 10 + pct * 0.24);
    const verticalLift = Math.min(10, 3 + pct * 0.04);

    el.bgBright.style.opacity = (pct / 100).toFixed(3);
    el.bgBright.style.setProperty('--gel-x', `${midpointX}%`);
    el.bgBright.style.setProperty('--gel-y', `${midpointY - verticalLift}%`);
    el.bgBright.style.setProperty('--gel-outer-x', `${outerX}vmin`);
    el.bgBright.style.setProperty('--gel-outer-y', `${outerY}vmin`);
  }

  // ── Crackle Drawing ──
  function drawCrackle(ctx, canvasWidth, pct, isKylo, isLeft) {
    ctx.clearRect(0, 0, canvasWidth, 180);
    if (pct <= 0) return;
    const c = COLORS[opts.color] || COLORS.blue;
    const cy = 90;
    const bladeWidth = canvasWidth * (pct / 100);
    const crackleChance = isKylo ? 0.25 : 0.08;

    if (Math.random() < crackleChance) {
      let startX = isLeft
        ? canvasWidth - Math.random() * bladeWidth
        : Math.random() * bladeWidth;

      ctx.save();
      ctx.strokeStyle = c.core;
      ctx.shadowBlur = isKylo ? 8 : 5;
      ctx.shadowColor = c.glow;
      ctx.lineWidth = isKylo ? (1.5 + Math.random()) : (0.8 + Math.random() * 0.5);
      ctx.globalAlpha = isKylo ? 0.85 : 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, cy);
      let x = startX, y = cy;
      const segs = isKylo ? (4 + Math.floor(Math.random() * 6)) : (2 + Math.floor(Math.random() * 3));
      const spread = isKylo ? 25 : 12;
      const ySpread = isKylo ? 35 : 18;
      for (let i = 0; i < segs; i++) {
        x += (Math.random() - 0.5) * spread;
        y += (Math.random() - 0.5) * ySpread;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function applyKyloJitter() {
    const cfg = HILT_CONFIGS[opts.hilt] || HILT_CONFIGS.obiwan;
    const isUnstable = cfg.isCrossguard || opts.unstable;
    if (!isUnstable || currentProgress <= 0) {
      el.bladeBeam.style.height = '28px';
      return;
    }
    kyloJitterTime += 0.15;
    const jitter = 28 + Math.sin(kyloJitterTime * 7.3) * 2 + Math.sin(kyloJitterTime * 13.1) * 1.5 + (Math.random() - 0.5) * 3;
    el.bladeBeam.style.height = jitter + 'px';
  }

  // ── Main Loop ──
  function loop() {
    if (destroyed) return;
    const cfg = HILT_CONFIGS[opts.hilt] || HILT_CONFIGS.obiwan;
    const isUnstable = cfg.isCrossguard || opts.unstable;

    drawCrackle(cCtx, el.crackleCanvas.width, currentProgress, isUnstable, false);
    if (cfg.isDouble) {
      drawCrackle(cCtxL, el.crackleCanvasL.width, currentProgress, false, true);
    }
    applyKyloJitter();
    loopId = requestAnimationFrame(loop);
  }

  // ── Controller ──
  const controller = {
    /**
     * Set progress 0-100. If animate=true, smoothly animates to value.
     */
    setProgress(val, animate = false) {
      if (destroyed) return;
      setProgressInternal(val, animate);
    },

    /** Animate to 100% */
    ignite() {
      if (destroyed) return;
      setProgressInternal(100, true);
    },

    /** Animate to 0% */
    retract() {
      if (destroyed) return;
      setProgressInternal(0, true);
    },

    /**
     * Update any option live. Partial updates supported.
     */
    setOptions(next) {
      if (destroyed) return;
      const colorChanged = next.color && next.color !== opts.color;
      const hiltChanged = next.hilt && next.hilt !== opts.hilt;
      const layoutChanged = next.x !== undefined || next.y !== undefined ||
                            next.rotation !== undefined || next.scale !== undefined ||
                            next.bladeLength !== undefined;
      const bgChanged = next.backgroundImage !== undefined;
      const unstableChanged = next.unstable !== undefined;

      Object.assign(opts, next);

      if (hiltChanged || unstableChanged) {
        // Retract if on, swap hilt
        if (isOn) {
          currentProgress = 0;
          isOn = false;
          stopHum();
          el.bladeBeam.classList.remove('lsw-active', 'lsw-kylo-active');
          el.bladeBeam.style.filter = 'none';
          if (el.bladeBeamLeft) el.bladeBeamLeft.classList.remove('lsw-active');
        }
        applyHilt();
      }
      if (colorChanged || hiltChanged || unstableChanged) applyColor();
      if (layoutChanged || hiltChanged) applyLayout();
      if (bgChanged) {
        if (opts.backgroundImage) {
          bgDark.style.backgroundImage = `url('${opts.backgroundImage}')`;
          bgDark.style.filter = `brightness(${opts.backgroundBrightness}) grayscale(0.2)`;
        } else {
          bgDark.style.backgroundImage = 'none';
          bgDark.style.background = '#0a0a0f';
        }
        applyColor(); // Re-applies gel
      }
      if (next.showProgress !== undefined) {
        el.progressOverlay.style.display = opts.showProgress ? '' : 'none';
      }
      if (next.progressLabel !== undefined) {
        el.progressLabel.textContent = opts.progressLabel;
      }
      updateBlade();
      resizeCanvases();
    },

    /** Show the transition overlay (fade in) */
    show() {
      if (destroyed) return;
      root.classList.remove('lsw-hidden');
      root.classList.add('lsw-visible');
      root.style.pointerEvents = 'all';
    },

    /** Hide the transition overlay (fade out) */
    hide() {
      if (destroyed) return;
      root.classList.remove('lsw-visible');
      root.classList.add('lsw-hidden');
      root.style.pointerEvents = 'none';
    },

    /** Get current progress */
    getProgress() { return currentProgress; },

    /** Get whether blade is on */
    isIgnited() { return isOn; },

    /** Remove from DOM, clean up audio and animation loop */
    destroy() {
      destroyed = true;
      stopHum();
      if (audioCtx) { try { audioCtx.close(); } catch(e){} }
      if (loopId) cancelAnimationFrame(loopId);
      window.removeEventListener('resize', onResize);
      root.remove();
    },

    /** Access the root DOM element */
    get element() { return root; },
  };

  init();
  return controller;
}
