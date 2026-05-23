export const AnomalyLoader = {
    animationFrame: null,
    canvas: null,
    ctx: null,
    particles: [],
    time: 0,
    selectedPattern: 'flesh',
    currentMaxDist: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    maxDiag: 0,
    glowPulseEnabled: true,
    chromaShiftEnabled: false,

    config: {
        flesh: { speed: 2.0, branchRate: 0.015, chaos: 0.15 },
        hex: { speed: 3.0, size: 20, branchRate: 0.05 },
        cyber: { speed: 4.0, length: 15, branchRate: 0.03 },
        kinetic: { speed: 12.0, maxBounces: 8, thickness: 1.0, branchRate: 0.15 },
        crystal: { speed: 4.0, size: 25, branchRate: 0.06, thickness: 1.2 }
    },

    inject: () => {
        if (document.getElementById('anomaly-loader')) return;

        // Inject scoped styles
        const style = document.createElement('style');
        style.id = 'anomaly-loader-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

            #anomaly-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: #030000;
                color: #ff1a1a;
                font-family: 'Courier Prime', monospace;
                z-index: 99999;
                overflow: hidden;
                user-select: none;
                transition: opacity 1.2s ease, transform 1.2s ease, filter 1.2s ease;
            }

            #anomaly-loader.hide {
                opacity: 0;
                transform: scale(1.05);
                filter: blur(10px);
                pointer-events: none;
            }

            #anomaly-loader.crt::before {
                content: " ";
                display: block;
                position: absolute;
                top: 0; left: 0; bottom: 0; right: 0;
                background: linear-gradient(rgba(255, 255, 255, 0.03) 50%, transparent 50%);
                background-size: 100% 4px;
                z-index: 100;
                pointer-events: none;
            }

            #anomalyCanvas {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
            }

            #anomaly-status {
                position: absolute;
                bottom: 30px;
                left: 30px;
                z-index: 100;
                font-size: 0.9rem;
                letter-spacing: 2px;
                text-shadow: 0 0 5px rgba(255, 26, 26, 0.4);
            }

            #anomaly-status .terminal-text {
                font-weight: 700;
                color: #ff1a1a;
                font-size: 1.1rem;
                margin-bottom: 5px;
                animation: anomaly-glitch 2.5s infinite alternate-reverse;
            }

            #anomaly-status .terminal-subtext {
                color: #aa0000;
                font-size: 0.8rem;
                margin-bottom: 12px;
            }

            #anomaly-status .bar-label {
                display: inline-block;
                color: #ff5555;
            }

            #anomaly-status .bar {
                display: inline-block;
                width: 150px;
                height: 10px;
                border: 1px solid #ff1a1a;
                margin-left: 10px;
                position: relative;
                vertical-align: middle;
            }

            #anomaly-status .bar-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: #ff1a1a;
                width: 0%;
                box-shadow: 0 0 8px #ff1a1a;
                transition: width 0.2s;
            }

            @keyframes anomaly-glitch {
                0% { text-shadow: 1px 0px 0px red, -1px 0px 0px blue; }
                20% { text-shadow: -2px 1px 0px red, 1px -1px 0px blue; }
                40% { text-shadow: 1px -1px 0px red, -1px 2px 0px blue; }
                60% { text-shadow: -1px 0px 0px red, 1px 0px 0px blue; }
                80% { text-shadow: 2px -1px 0px red, -1px 1px 0px blue; }
                100% { text-shadow: 0px 0px 0px red, 0px 0px 0px blue; }
            }

            @media (prefers-reduced-motion: reduce) {
                #anomaly-status .terminal-text { animation: none; }
                #anomaly-loader.crt::before { display: none; }
            }
        `;
        document.head.appendChild(style);

        // Inject DOM overlay structure
        const div = document.createElement('div');
        div.id = 'anomaly-loader';
        div.className = 'crt';
        div.innerHTML = `
            <canvas id="anomalyCanvas"></canvas>
            <div id="anomaly-status">
                <div class="terminal-text">SITE-19 SECURE UPLINK</div>
                <div class="terminal-subtext">DECRYPTING COGNITOHAZARD FILES</div>
                <div class="bar-label">BREACH SPREAD:</div>
                <div class="bar">
                    <div class="bar-fill" id="anomaly-bar-fill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        AnomalyLoader.canvas = document.getElementById('anomalyCanvas');
        AnomalyLoader.ctx = AnomalyLoader.canvas.getContext('2d', { alpha: false });

        window.addEventListener('resize', AnomalyLoader.handleResize);
    },

    handleResize: () => {
        if (!AnomalyLoader.canvas) return;
        AnomalyLoader.width = AnomalyLoader.canvas.width = window.innerWidth;
        AnomalyLoader.height = AnomalyLoader.canvas.height = window.innerHeight;
        AnomalyLoader.centerX = AnomalyLoader.width / 2;
        AnomalyLoader.centerY = AnomalyLoader.height / 2;
        AnomalyLoader.maxDiag = Math.hypot(AnomalyLoader.centerX, AnomalyLoader.centerY);

        if (AnomalyLoader.ctx) {
            AnomalyLoader.ctx.fillStyle = '#020000';
            AnomalyLoader.ctx.fillRect(0, 0, AnomalyLoader.width, AnomalyLoader.height);
        }
    },

    getNeonGlowColor: (x, y) => {
        const d = Math.hypot(x - AnomalyLoader.centerX, y - AnomalyLoader.centerY);
        const ratio = Math.max(0, Math.min(1, d / AnomalyLoader.maxDiag));
        const wave = Math.sin(d * 0.05 - AnomalyLoader.time * 0.1) * 0.5 + 0.5;
        const brightness = AnomalyLoader.glowPulseEnabled ? (0.4 + wave * 0.6) : 0.8;

        const r = Math.floor((80 + 175 * Math.min(1, ratio * 1.5)) * brightness);
        const g = 0;
        const b = Math.floor((30 * Math.pow(ratio, 3)) * brightness);

        const blur = AnomalyLoader.glowPulseEnabled ? (2 + (15 * ratio) * brightness) : 10;
        return { color: `rgb(${r}, ${g}, ${b})`, blur: blur };
    },

    show: (pattern = 'flesh') => {
        let container = document.getElementById('anomaly-loader');
        if (!container) {
            AnomalyLoader.inject();
            container = document.getElementById('anomaly-loader');
        }

        container.classList.remove('hide');
        AnomalyLoader.selectedPattern = pattern;
        AnomalyLoader.handleResize();

        // Spawn seeds & setup initial state
        AnomalyLoader.particles = [];
        AnomalyLoader.currentMaxDist = 0;
        AnomalyLoader.time = 0;

        const barFill = document.getElementById('anomaly-bar-fill');
        if (barFill) barFill.style.width = '0%';

        const seedX = AnomalyLoader.centerX;
        const seedY = AnomalyLoader.centerY;

        if (pattern === 'flesh') {
            for (let i = 0; i < 8; i++) {
                const speedMultiplier = Math.random() * 1.4 + 0.4;
                AnomalyLoader.particles.push(new FleshWalker(seedX, seedY, (Math.PI * 2 / 8) * i, speedMultiplier, 0));
            }
        } else if (pattern === 'hex') {
            for (let i = 0; i < 6; i++) {
                AnomalyLoader.particles.push(new HexTracer(seedX, seedY, i));
            }
        } else if (pattern === 'cyber') {
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            dirs.forEach(dir => {
                AnomalyLoader.particles.push(new CyberWalker(seedX, seedY, dir[0], dir[1], AnomalyLoader.config.cyber.length));
            });
        } else if (pattern === 'kinetic') {
            for (let i = 0; i < 5; i++) {
                AnomalyLoader.particles.push(new KineticWalker(seedX, seedY, Math.random() * Math.PI * 2));
            }
        } else if (pattern === 'crystal') {
            for (let i = 0; i < 3; i++) {
                AnomalyLoader.particles.push(new CrystalWalker(seedX, seedY, i * 2));
            }
        }

        if (AnomalyLoader.animationFrame) cancelAnimationFrame(AnomalyLoader.animationFrame);
        AnomalyLoader.renderLoop();
    },

    renderLoop: () => {
        AnomalyLoader.time++;

        // Ambient screen degradation
        if (Math.random() < 0.01) {
            AnomalyLoader.ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.02 + 0.01})`;
            AnomalyLoader.ctx.fillRect(Math.random() * AnomalyLoader.width, Math.random() * AnomalyLoader.height, Math.random() * 150 + 50, Math.random() * 4 + 1);
        }

        // Update progress bar
        const percent = Math.min(100, (AnomalyLoader.currentMaxDist / AnomalyLoader.maxDiag) * 100);
        const barFill = document.getElementById('anomaly-bar-fill');
        if (barFill) barFill.style.width = percent + '%';

        // Process particles
        for (let i = AnomalyLoader.particles.length - 1; i >= 0; i--) {
            let p = AnomalyLoader.particles[i];
            p.update();
            if (!p.active && Math.random() < 0.05) {
                AnomalyLoader.particles.splice(i, 1);
            }
        }

        AnomalyLoader.animationFrame = requestAnimationFrame(AnomalyLoader.renderLoop);
    },

    hide: () => {
        const container = document.getElementById('anomaly-loader');
        if (container) {
            container.classList.add('hide');
        }
        if (AnomalyLoader.animationFrame) {
            cancelAnimationFrame(AnomalyLoader.animationFrame);
            AnomalyLoader.animationFrame = null;
        }
    },

    playOutro: () => {
        const container = document.getElementById('anomaly-loader');
        if (!container) return;

        setTimeout(() => {
            container.classList.add('hide');
            if (AnomalyLoader.animationFrame) {
                cancelAnimationFrame(AnomalyLoader.animationFrame);
                AnomalyLoader.animationFrame = null;
            }
            setTimeout(() => {
                container.remove();
            }, 1200);
        }, 1500);
    }
};

// --- ANOMALY WALKER IMPLEMENTATIONS ---

class FleshWalker {
    constructor(x, y, angle, speedMult, generation) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.speedMult = speedMult;
        this.generation = generation;
        this.active = true;
        this.size = Math.max(0.5, 3.5 - generation * 0.3);
    }

    update() {
        if (!this.active) return;

        const c = AnomalyLoader.config.flesh;
        const ox = this.x;
        const oy = this.y;

        this.angle += Math.sin(AnomalyLoader.time * 0.05 + this.x) * c.chaos + (Math.random() * c.chaos * 2 - c.chaos);
        const spd = c.speed * this.speedMult;
        this.x += Math.cos(this.angle) * spd;
        this.y += Math.sin(this.angle) * spd;

        const d = Math.hypot(this.x - AnomalyLoader.centerX, this.y - AnomalyLoader.centerY);
        if (d > AnomalyLoader.currentMaxDist) AnomalyLoader.currentMaxDist = d;

        if (d > AnomalyLoader.maxDiag + 50) { this.active = false; return; }

        const style = AnomalyLoader.getNeonGlowColor(this.x, this.y);
        AnomalyLoader.ctx.beginPath();
        AnomalyLoader.ctx.moveTo(ox, oy);
        AnomalyLoader.ctx.lineTo(this.x, this.y);
        AnomalyLoader.ctx.strokeStyle = style.color;
        AnomalyLoader.ctx.lineWidth = this.size;
        AnomalyLoader.ctx.shadowColor = style.color;
        AnomalyLoader.ctx.shadowBlur = style.blur;
        AnomalyLoader.ctx.stroke();

        if (Math.random() < c.branchRate && AnomalyLoader.particles.length < 1500) {
            const turnRange = Math.random() * 0.7 + 0.5;
            AnomalyLoader.particles.push(new FleshWalker(this.x, this.y, this.angle + turnRange, this.speedMult * (Math.random() * 0.3 + 0.8), this.generation + 1));
            if (Math.random() < 0.3) {
                AnomalyLoader.particles.push(new FleshWalker(this.x, this.y, this.angle - turnRange, this.speedMult * (Math.random() * 0.3 + 0.8), this.generation + 1));
            }
            if (Math.random() < 0.1) this.active = false;
        }
    }
}

class HexTracer {
    constructor(x, y, angleIdx) {
        this.x = x; this.y = y;
        this.angleIdx = angleIdx % 6;
        if (this.angleIdx < 0) this.angleIdx += 6;
        this.active = true;
        this.calculateTarget();
    }

    calculateTarget() {
        const angle = (Math.PI / 3) * this.angleIdx;
        this.tx = this.x + Math.cos(angle) * AnomalyLoader.config.hex.size;
        this.ty = this.y + Math.sin(angle) * AnomalyLoader.config.hex.size;
    }

    update() {
        if (!this.active) return;

        const c = AnomalyLoader.config.hex;
        const ox = this.x;
        const oy = this.y;

        const angleToTarget = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.x += Math.cos(angleToTarget) * c.speed;
        this.y += Math.sin(angleToTarget) * c.speed;

        const dToTarget = Math.hypot(this.tx - this.x, this.ty - this.y);
        const reached = dToTarget <= c.speed;

        if (reached) {
            this.x = this.tx;
            this.y = this.ty;
        }

        const d = Math.hypot(this.x - AnomalyLoader.centerX, this.y - AnomalyLoader.centerY);
        if (d > AnomalyLoader.currentMaxDist) AnomalyLoader.currentMaxDist = d;

        if (d > AnomalyLoader.maxDiag + 50) { this.active = false; return; }

        const style = AnomalyLoader.getNeonGlowColor(this.x, this.y);
        AnomalyLoader.ctx.beginPath();
        AnomalyLoader.ctx.moveTo(ox, oy);
        AnomalyLoader.ctx.lineTo(this.x, this.y);
        AnomalyLoader.ctx.strokeStyle = style.color;
        AnomalyLoader.ctx.lineWidth = 1.5;
        AnomalyLoader.ctx.shadowColor = style.color;
        AnomalyLoader.ctx.shadowBlur = style.blur * 1.5;
        AnomalyLoader.ctx.stroke();

        if (reached) {
            const turns = [-1, 1, 0];
            if (Math.random() < c.branchRate && AnomalyLoader.particles.length < 1000) {
                AnomalyLoader.particles.push(new HexTracer(this.x, this.y, this.angleIdx + 1));
                AnomalyLoader.particles.push(new HexTracer(this.x, this.y, this.angleIdx - 1));
                this.active = false;
            } else {
                const turn = turns[Math.floor(Math.random() * turns.length)];
                this.angleIdx += turn;
                this.calculateTarget();
            }
        }
    }
}

class CyberWalker {
    constructor(x, y, dx, dy, lengthLimit) {
        this.x = x; this.y = y;
        this.dx = dx; this.dy = dy;
        this.limit = lengthLimit;
        this.steps = 0;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        const c = AnomalyLoader.config.cyber;
        const ox = this.x;
        const oy = this.y;

        this.x += this.dx * c.speed;
        this.y += this.dy * c.speed;
        this.steps += c.speed;

        const d = Math.hypot(this.x - AnomalyLoader.centerX, this.y - AnomalyLoader.centerY);
        if (d > AnomalyLoader.currentMaxDist) AnomalyLoader.currentMaxDist = d;

        if (d > AnomalyLoader.maxDiag + 50) { this.active = false; return; }

        const style = AnomalyLoader.getNeonGlowColor(this.x, this.y);
        AnomalyLoader.ctx.beginPath();
        AnomalyLoader.ctx.moveTo(ox, oy);
        AnomalyLoader.ctx.lineTo(this.x, this.y);
        AnomalyLoader.ctx.strokeStyle = style.color;
        AnomalyLoader.ctx.lineWidth = 2;
        AnomalyLoader.ctx.shadowColor = style.color;
        AnomalyLoader.ctx.shadowBlur = style.blur;
        AnomalyLoader.ctx.stroke();

        if (this.steps >= this.limit) {
            this.active = false;

            if (Math.random() < 0.2) {
                AnomalyLoader.ctx.fillStyle = style.color;
                AnomalyLoader.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
            }

            if (AnomalyLoader.particles.length < 800) {
                const dirs = (this.dx === 0) ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]];
                const dir1 = dirs[Math.floor(Math.random() * dirs.length)];
                AnomalyLoader.particles.push(new CyberWalker(this.x, this.y, dir1[0], dir1[1], c.length * (Math.random() * 1.0 + 0.5)));

                if (Math.random() < c.branchRate) {
                    const dir2 = dirs.find(d => d !== dir1);
                    AnomalyLoader.particles.push(new CyberWalker(this.x, this.y, dir2[0], dir2[1], c.length * (Math.random() * 1.0 + 0.5)));
                }

                if (Math.random() < 0.3) {
                    AnomalyLoader.particles.push(new CyberWalker(this.x, this.y, this.dx, this.dy, c.length * (Math.random() * 0.6 + 0.2)));
                }
            }
        }
    }
}

class KineticWalker {
    constructor(x, y, angle, bounces = 0) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.bounces = bounces;
        this.active = true;
        this.speed = AnomalyLoader.config.kinetic.speed * (Math.random() * 0.4 + 0.8);
        this.maxBounces = AnomalyLoader.config.kinetic.maxBounces;
    }

    update() {
        if (!this.active) return;

        const c = AnomalyLoader.config.kinetic;
        const ox = this.x;
        const oy = this.y;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        let bounced = false;
        if (this.x < 0) {
            this.x = 0;
            this.angle = Math.PI - this.angle;
            bounced = true;
        } else if (this.x > AnomalyLoader.width) {
            this.x = AnomalyLoader.width;
            this.angle = Math.PI - this.angle;
            bounced = true;
        }
        if (this.y < 0) {
            this.y = 0;
            this.angle = -this.angle;
            bounced = true;
        } else if (this.y > AnomalyLoader.height) {
            this.y = AnomalyLoader.height;
            this.angle = -this.angle;
            bounced = true;
        }

        const d = Math.hypot(this.x - AnomalyLoader.centerX, this.y - AnomalyLoader.centerY);
        if (d > AnomalyLoader.currentMaxDist) AnomalyLoader.currentMaxDist = d;

        const style = AnomalyLoader.getNeonGlowColor(this.x, this.y);
        AnomalyLoader.ctx.beginPath();
        AnomalyLoader.ctx.moveTo(ox, oy);
        AnomalyLoader.ctx.lineTo(this.x, this.y);
        AnomalyLoader.ctx.strokeStyle = style.color;
        AnomalyLoader.ctx.lineWidth = c.thickness;
        AnomalyLoader.ctx.shadowColor = style.color;
        AnomalyLoader.ctx.shadowBlur = style.blur * 1.2;
        AnomalyLoader.ctx.stroke();

        if (bounced) {
            this.bounces++;
            AnomalyLoader.ctx.fillStyle = '#ffffff';
            AnomalyLoader.ctx.beginPath();
            AnomalyLoader.ctx.arc(this.x, this.y, c.thickness * 2.5, 0, Math.PI * 2);
            AnomalyLoader.ctx.shadowColor = '#ffffff';
            AnomalyLoader.ctx.shadowBlur = style.blur;
            AnomalyLoader.ctx.fill();

            if (this.bounces >= this.maxBounces) {
                this.active = false;
            } else if (Math.random() < c.branchRate && AnomalyLoader.particles.length < 1000) {
                AnomalyLoader.particles.push(new KineticWalker(this.x, this.y, this.angle + (Math.random() * 1.2 - 0.6), this.bounces));
            }
        }
    }
}

class CrystalWalker {
    constructor(x, y, angleIdx, stepLength = null) {
        this.x = x; this.y = y;
        this.angleIdx = angleIdx % 6;
        if (this.angleIdx < 0) this.angleIdx += 6;
        this.active = true;
        this.stepLength = stepLength || AnomalyLoader.config.crystal.size;
        this.calculateTarget();
    }

    calculateTarget() {
        const angle = (Math.PI / 6) + (Math.PI / 3) * this.angleIdx;
        this.tx = this.x + Math.cos(angle) * this.stepLength;
        this.ty = this.y + Math.sin(angle) * this.stepLength;
    }

    update() {
        if (!this.active) return;

        const c = AnomalyLoader.config.crystal;
        const ox = this.x;
        const oy = this.y;

        const angleToTarget = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.x += Math.cos(angleToTarget) * c.speed;
        this.y += Math.sin(angleToTarget) * c.speed;

        const dToTarget = Math.hypot(this.tx - this.x, this.ty - this.y);
        const reached = dToTarget <= c.speed;

        if (reached) {
            this.x = this.tx;
            this.y = this.ty;
        }

        const d = Math.hypot(this.x - AnomalyLoader.centerX, this.y - AnomalyLoader.centerY);
        if (d > AnomalyLoader.currentMaxDist) AnomalyLoader.currentMaxDist = d;

        if (d > AnomalyLoader.maxDiag + 50) { this.active = false; return; }

        const style = AnomalyLoader.getNeonGlowColor(this.x, this.y);
        AnomalyLoader.ctx.beginPath();
        AnomalyLoader.ctx.moveTo(ox, oy);
        AnomalyLoader.ctx.lineTo(this.x, this.y);
        AnomalyLoader.ctx.strokeStyle = style.color;
        AnomalyLoader.ctx.lineWidth = c.thickness;
        AnomalyLoader.ctx.shadowColor = style.color;
        AnomalyLoader.ctx.shadowBlur = style.blur * 1.5;
        AnomalyLoader.ctx.stroke();

        if (reached) {
            if (Math.random() < c.branchRate && AnomalyLoader.particles.length < 1000) {
                AnomalyLoader.particles.push(new CrystalWalker(this.x, this.y, this.angleIdx + 1, this.stepLength));
                AnomalyLoader.particles.push(new CrystalWalker(this.x, this.y, this.angleIdx - 1, this.stepLength));

                if (Math.random() < 0.4) {
                    this.drawIsoFace(this.x, this.y, this.angleIdx, this.stepLength, style.color, style.blur);
                }
                this.active = false;
            } else {
                const turns = [-2, -1, 1, 2];
                const turn = turns[Math.floor(Math.random() * turns.length)];
                this.angleIdx += turn;
                this.calculateTarget();
            }
        }
    }

    drawIsoFace(x, y, idx, size, color, blur) {
        const a1 = (Math.PI / 6) + (Math.PI / 3) * idx;
        const a2 = (Math.PI / 6) + (Math.PI / 3) * (idx + 1);

        const x2 = x + Math.cos(a1) * size;
        const y2 = y + Math.sin(a1) * size;

        const x4 = x + Math.cos(a2) * size;
        const y4 = y + Math.sin(a2) * size;

        const x3 = x2 + Math.cos(a2) * size;
        const y3 = y2 + Math.sin(a2) * size;

        const ctx = AnomalyLoader.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', 0.08)');
        ctx.shadowColor = color;
        ctx.shadowBlur = blur * 0.8;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
