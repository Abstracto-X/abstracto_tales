// SnippingTool.js
// Requires: Tesseract.js, Fuse.js, MapEngine, State, PlanetDB, PlanetEditor, Utils, getContributorColor

window.SnippingTool = {
    overlay: null,
    box: null,
    isSnipping: false,
    startPoint: null,
    targetLatLng: null,
    worker: null,
    fuse: null,
    
    async init() {
        // Inject HTML elements for the snipping UI
        this.overlay = document.createElement('div');
        this.overlay.id = 'snipping-overlay';
        this.overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.3); z-index:2000; cursor:crosshair; display:none;';
        
        this.box = document.createElement('div');
        this.box.id = 'snipping-box';
        this.box.style.cssText = 'position:absolute; border:2px solid var(--accent-color); background:rgba(255,215,0,0.15); pointer-events:none; display:none; box-shadow:0 0 15px rgba(255,215,0,0.4);';
        
        this.overlay.appendChild(this.box);
        document.body.appendChild(this.overlay);

        // Bind events
        this.overlay.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.overlay.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.overlay.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Init Tesseract
        try {
            this.worker = await Tesseract.createWorker('eng');
            console.log('OCR Worker Ready');
        } catch(e) { console.warn('OCR Init failed', e); }
    },

    activate(latlng) {
        this.targetLatLng = latlng;
        this.overlay.style.display = 'block';
        this.box.style.display = 'none';
        Toast.show('Drag a box around the planet name', 'info', 4000);
    },

    deactivate() {
        this.overlay.style.display = 'none';
        this.isSnipping = false;
    },

    onMouseDown(e) {
        this.isSnipping = true;
        this.startPoint = { x: e.clientX, y: e.clientY };
        this.box.style.left = e.clientX + 'px';
        this.box.style.top = e.clientY + 'px';
        this.box.style.width = '0px';
        this.box.style.height = '0px';
        this.box.style.display = 'block';
    },

    onMouseMove(e) {
        if (!this.isSnipping) return;
        const width = e.clientX - this.startPoint.x;
        const height = e.clientY - this.startPoint.y;
        this.box.style.width = Math.abs(width) + 'px';
        this.box.style.height = Math.abs(height) + 'px';
        this.box.style.left = (width > 0 ? this.startPoint.x : e.clientX) + 'px';
        this.box.style.top = (height > 0 ? this.startPoint.y : e.clientY) + 'px';
    },

    async onMouseUp(e) {
        if (!this.isSnipping) return;
        this.isSnipping = false;
        const rect = this.box.getBoundingClientRect();
        this.deactivate();

        if (rect.width < 10 || rect.height < 10) {
            this.createPlanetFallback("Snip area too small");
            return;
        }

        UI.showLoading();
        try {
            // 1. Capture screen area (we use an offscreen canvas and the Map Image)
            const mapImg = MapEngine.imageOverlay.getElement();
            const canvas = document.createElement('canvas');
            canvas.width = rect.width; 
            canvas.height = rect.height;
            const ctx = canvas.getContext('2d');
            
            // Map screen coordinates to image bounds
            const mapContainerRect = document.getElementById('map-container').getBoundingClientRect();
            const relativeL = rect.left - mapContainerRect.left;
            const relativeT = rect.top - mapContainerRect.top;
            
            const nw = MapEngine.map.containerPointToLatLng([relativeL, relativeT]);
            const se = MapEngine.map.containerPointToLatLng([relativeL + rect.width, relativeT + rect.height]);
            
            // Note: CRS.Simple coordinates map 1:1 to image pixels if bounds are correctly set
            const imgRatioX = mapImg.naturalWidth / State.currentProject.width;
            const imgRatioY = mapImg.naturalHeight / State.currentProject.height;

            ctx.drawImage(
                mapImg,
                nw.lng * imgRatioX, (State.currentProject.height - nw.lat) * imgRatioY, // source x, y
                (se.lng - nw.lng) * imgRatioX, (nw.lat - se.lat) * imgRatioY, // source w, h
                0, 0, rect.width, rect.height
            );

            // 2. Run OCR
            const { data: { text } } = await this.worker.recognize(canvas.toDataURL());
            const cleanText = text.replace(/\n/g, ' ').trim();

            // 3. Fuzzy Match
            if (!this.fuse && PlanetDB.loaded) {
                this.fuse = new Fuse(PlanetDB.entries, { keys: ['name'], threshold: 0.4 });
            }
            
            const matches = this.fuse ? this.fuse.search(cleanText, { limit: 1 }) : [];
            const bestMatch = matches.length > 0 ? matches[0].item : null;

            this.createPlanet(bestMatch ? bestMatch.name : cleanText, bestMatch);
            
        } catch (err) {
            this.createPlanetFallback(err);
        }
        UI.hideLoading();
    },

    createPlanet(name, matchData) {
        const node = { 
            id: Utils.uuid(), map_id: State.currentProject.id, 
            name: name || 'Unknown', 
            x: Math.round(this.targetLatLng.lng * 10)/10, 
            y: Math.round(this.targetLatLng.lat * 10)/10, 
            region: matchData ? matchData.region : '', 
            sector: matchData ? matchData.sector : '', 
            color: getContributorColor(State.user.id), 
            created_by: State.user.id, 
            _live: false, _localAction: 'ADD' 
        };
        State.nodes.push(node);
        const marker = MapEngine.renderNode(node);
        StatusBar.updateStats(); 
        SaveIndicator.setUnsaved();
        ModeManager.set('select'); // Auto-switch to select to edit
        PlanetEditor.openPopup(node, marker, true);
    },

    createPlanetFallback(err = null) {
        if (err) console.error("Snipping Error:", err);
        Toast.show('Snip failed. Defaulting to manual entry.', 'warning');
        this.createPlanet('New Planet', null);
    }
};

// Overwrite the basic PlaceMode
window.PlaceMode = {
    placeAt: (latlng) => {
        if (!SnippingTool.worker) SnippingTool.init();
        SnippingTool.activate(latlng);
    }
};
