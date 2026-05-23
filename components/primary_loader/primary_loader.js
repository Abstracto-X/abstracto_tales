export const PrimaryLoader = {
    inject: () => {
        // Inject original CSS with scoped selectors to prevent global style pollution
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --pl-bg-dark: #050508;
                --pl-text-light: #f4f4f5;
                --pl-accent-cyan: #00f2fe;
                --pl-accent-purple: #7b2ff7;
                --pl-accent-gold: #d4af37;
                --pl-font-display: 'Cinzel', serif;
                --pl-font-body: 'Montserrat', sans-serif;
            }

            #loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: radial-gradient(circle at center, #131320 0%, var(--pl-bg-dark) 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 1.5s ease, transform 1.5s ease, filter 1.5s ease;
            }

            /* Cinematic Exit for Loader */
            #loader.hide {
                opacity: 0;
                transform: scale(1.1);
                filter: blur(10px);
                pointer-events: none;
            }

            #loader .loader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            /* SVG Monogram 'A' */
            #loader .monogram-container {
                width: 120px;
                height: 140px;
                margin-bottom: 2rem;
                position: relative;
                animation: pl-float 4s ease-in-out infinite alternate 2s;
            }

            #loader .monogram-svg {
                width: 100%;
                height: 100%;
                overflow: visible;
                filter: drop-shadow(0 0 15px rgba(0, 242, 254, 0.4));
            }

            /* SVG Drawing Animations */
            #loader .a-stroke {
                fill: none;
                stroke: url(#monogram-gradient);
                stroke-width: 4;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 150;
                stroke-dashoffset: 150;
            }

            #loader .a-stroke-left { animation: pl-drawLine 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
            #loader .a-stroke-right { animation: pl-drawLine 1.2s cubic-bezier(0.7, 0, 0.3, 1) 0.3s forwards; }
            #loader .a-stroke-cross { animation: pl-drawLine 0.8s cubic-bezier(0.7, 0, 0.3, 1) 1s forwards; }

            /* Magical glowing core inside the A */
            #loader .a-core {
                fill: url(#monogram-gradient);
                opacity: 0;
                animation: pl-fadeIn 1.5s ease 1.5s forwards;
            }

            /* Typography */
            #loader .author-name {
                font-family: var(--pl-font-display);
                font-size: 2.5rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0px;
                opacity: 0;
                margin-right: 0; 
                background: linear-gradient(to right, #fff, #a1a1aa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: pl-textReveal 1.8s cubic-bezier(0.2, 1, 0.2, 1) 1.2s forwards;
            }

            #loader .author-title {
                font-family: var(--pl-font-body);
                font-size: 0.85rem;
                font-weight: 300;
                letter-spacing: 6px;
                color: var(--pl-accent-cyan);
                margin-top: 1rem;
                opacity: 0;
                text-transform: uppercase;
                animation: pl-fadeInUp 1s ease 2s forwards;
            }

            /* Loading Bar Layout */
            #loader .loading-bar-container {
                width: 180px;
                height: 2px;
                background: rgba(255, 255, 255, 0.08);
                margin-top: 2rem;
                border-radius: 4px;
                overflow: hidden;
                opacity: 0;
                animation: pl-fadeIn 1s ease 2.2s forwards;
            }

            #loader .loading-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(to right, var(--pl-accent-cyan), var(--pl-accent-purple));
                box-shadow: 0 0 8px var(--pl-accent-cyan);
                animation: pl-loadProgress 3.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
            }

            /* Keyframes */
            @keyframes pl-drawLine { to { stroke-dashoffset: 0; } }
            @keyframes pl-fadeIn { to { opacity: 1; } }
            @keyframes pl-textReveal { to { opacity: 1; letter-spacing: 16px; margin-right: -16px; } }
            @keyframes pl-fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pl-float { 0% { transform: translateY(0px); } 100% { transform: translateY(-10px); } }
            @keyframes pl-loadProgress { 0% { width: 0%; } 100% { width: 100%; } }

            @media (max-width: 768px) {
                #loader .author-name { font-size: 1.8rem; }
                @keyframes pl-textReveal { to { opacity: 1; letter-spacing: 8px; margin-right: -8px; } }
            }

            @media (prefers-reduced-motion: reduce) {
                #loader .author-name { opacity: 1; letter-spacing: 16px; margin-right: -16px; }
                #loader .a-stroke { stroke-dashoffset: 0; }
                #loader .a-core, #loader .author-title, #loader .loading-bar-container { opacity: 1; }
                #loader .loading-bar { width: 100%; animation: none; }
            }
        `;
        document.head.appendChild(style);

        // Inject original HTML layout with the loading bar
        const div = document.createElement('div');
        div.id = 'loader';
        div.innerHTML = `
            <div class="loader-content">
                <div class="monogram-container">
                    <svg class="monogram-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="monogram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#00f2fe" />
                                <stop offset="50%" stop-color="#7b2ff7" />
                                <stop offset="100%" stop-color="#d4af37" />
                            </linearGradient>
                        </defs>
                        <path class="a-stroke a-stroke-left" d="M 50 15 L 15 105" />
                        <path class="a-stroke a-stroke-right" d="M 50 15 L 85 105" />
                        <path class="a-stroke a-stroke-cross" d="M 28 65 L 72 65" />
                        <path class="a-core" d="M 50 35 L 42 52 L 50 68 L 58 52 Z" />
                    </svg>
                </div>
                <h1 class="author-name">Abstracto</h1>
                <p class="author-title">Sci-Fi & Fantasy</p>
                <div class="loading-bar-container">
                    <div class="loading-bar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    },

    show: () => {
        let loader = document.getElementById('loader');
        if (!loader) {
            PrimaryLoader.inject();
            loader = document.getElementById('loader');
        }
        loader.classList.remove('hide');
        const bar = loader.querySelector('.loading-bar');
        if (bar) {
            bar.style.animation = 'none';
            void bar.offsetWidth; // trigger reflow
            bar.style.animation = '';
        }
    },

    hide: () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hide');
        }
    },

    playOutro: () => {
        const loader = document.getElementById('loader');
        if (!loader) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const loadingDuration = prefersReducedMotion ? 500 : 4000;

        setTimeout(() => {
            loader.classList.add('hide');
            setTimeout(() => {
                loader.remove(); // Clean up from DOM completely
            }, 1500);
        }, loadingDuration);
    }
};