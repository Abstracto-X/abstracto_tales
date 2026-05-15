// PathDrawer.js
window.PathDrawer = {
    state: 'SELECTING', // SELECTING, CURVING
    curvePoints: [], 
    draggedPointIdx: -1,
    tempPolyline: null,
    tempHitArea: null,
    controlPointMarkers: [],
    
    // Cached event functions to ensure clean removal
    _onMouseMove: null,
    _onMouseUp: null,

    init() {
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);

        // Dedicated listener that intercepts ENTER specifically for the spline tool
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'Enter' && State.mode === 'trace') {
                e.preventDefault();
                if (this.state === 'CURVING') {
                    this.finalize(true);
                } else if (State.traceQueue.length >= 2) {
                    this.finalize(false);
                }
            } else if (e.key === 'Escape' && this.state === 'CURVING') {
                this.cancel();
            }
        });

        // Inject dynamic CSS to make the drawing line and points glow and pop
        const style = document.createElement('style');
        style.textContent = `
            .pulse-spline { filter: drop-shadow(0 0 6px #00e5ff); }
            .curve-control-point { border: 3px solid #fff !important; cursor: grab !important; filter: drop-shadow(0 0 8px rgba(255, 0, 85, 0.9)); }
            .curve-control-point:active { cursor: grabbing !important; }
        `;
        document.head.appendChild(style);
    },

    addNode(node) {
        if (this.state !== 'SELECTING') return;
        if (State.traceQueue.find(n => n.id === node.id)) return;
        
        State.traceQueue.push(node);
        
        const icon = L.divIcon({ className: 'selection-number', html: `${State.traceQueue.length}`, iconSize: [20, 20], iconAnchor: [10, 10] });
        L.marker([node.y, node.x], { icon, interactive: false }).addTo(MapEngine.selectionLayer);
        
        if (State.traceQueue.length >= 2) {
            const pts = State.traceQueue.map(n => [n.y, n.x]);
            MapEngine.selectionLayer.eachLayer(l => { if (l instanceof L.Polyline) MapEngine.selectionLayer.removeLayer(l); });
            // Thicker selection connecting line
            L.polyline(pts, { color: getContributorColor(State.user.id), weight: 4, opacity: 0.8, dashArray: '8,6' }).addTo(MapEngine.selectionLayer);
        }
        
        StatusBar.setMode('trace');
        if (State.traceQueue.length === 2) {
            Toast.show('Right click a selected node to choose straight or curved path', 'info', 4000);
        }
    },

    startCurving() {
        if (State.traceQueue.length < 2) return;
        this.state = 'CURVING';
        this.curvePoints = [];
        this.draggedPointIdx = -1;
        MapEngine.selectionLayer.clearLayers();

        const start = State.traceQueue[0];
        const end = State.traceQueue[1];

        // Massively increased thickness and changed to a bright Cyan
        this.tempPolyline = L.polyline([[start.y, start.x], [end.y, end.x]], {
            color: '#00e5ff', dashArray: '10, 10', weight: 6, opacity: 1, className: 'pulse-spline', lineCap: 'round'
        }).addTo(MapEngine.map);

        // Fatter hit area (40px) so grabbing the invisible line to add points is much easier
        this.tempHitArea = L.polyline([[start.y, start.x], [end.y, end.x]], {
            color: 'transparent', weight: 40, opacity: 0, interactive: true
        }).addTo(MapEngine.map);

        this.tempHitArea.on('mousedown', (e) => {
            if (this.curvePoints.length >= 3) { Toast.show('Max 3 curve points allowed', 'warning'); return; }
            L.DomEvent.stopPropagation(e);
            this.curvePoints.push({ x: e.latlng.lng, y: e.latlng.lat });
            this.draggedPointIdx = this.curvePoints.length - 1;
            this.refreshCurveVisuals();
            this.renderControlMarkers();
            MapEngine.map.dragging.disable();
        });

        document.getElementById('status-hint').textContent = 'Drag invisible line to curve | Press ENTER to save | ESC to cancel';
        
        // Bind mouse events safely
        MapEngine.map.on('mousemove', this._onMouseMove);
        MapEngine.map.on('mouseup', this._onMouseUp);
    },

    onMouseMove(e) {
        if (this.state === 'CURVING' && this.draggedPointIdx !== -1) {
            this.curvePoints[this.draggedPointIdx] = { x: e.latlng.lng, y: e.latlng.lat };
            this.refreshCurveVisuals();
            if (this.controlPointMarkers[this.draggedPointIdx]) {
                this.controlPointMarkers[this.draggedPointIdx].setLatLng(e.latlng);
            }
        }
    },

    onMouseUp() {
        if (this.state === 'CURVING') {
            this.draggedPointIdx = -1;
            MapEngine.map.dragging.enable();
        }
    },

    refreshCurveVisuals() {
        const start = State.traceQueue[0];
        const end = State.traceQueue[1];
        const fullPoints = [{ x: start.x, y: start.y }, ...this.curvePoints, { x: end.x, y: end.y }];
        const splineLatlngs = MapEngine.catmullRom(fullPoints.map(p => [p.y, p.x]), 25);
        
        if (this.tempPolyline) this.tempPolyline.setLatLngs(splineLatlngs);
        if (this.tempHitArea) this.tempHitArea.setLatLngs(splineLatlngs);
    },

    renderControlMarkers() {
        this.controlPointMarkers.forEach(m => MapEngine.map.removeLayer(m));
        this.controlPointMarkers = [];

        this.curvePoints.forEach((pt, idx) => {
            // Bright red/pink control points
            const marker = L.circleMarker([pt.y, pt.x], {
                radius: 8, fillColor: '#ff0055', color: '#fff', weight: 2, fillOpacity: 1, className: 'curve-control-point', interactive: true
            }).addTo(MapEngine.map);

            marker.on('mousedown', (e) => {
                L.DomEvent.stopPropagation(e);
                this.draggedPointIdx = idx;
                MapEngine.map.dragging.disable();
            });
            this.controlPointMarkers.push(marker);
        });
    },

    finalize(isCurved = false) {
        if (State.traceQueue.length < 2) { this.cancel(); return; }
        const src = State.traceQueue[0], tgt = State.traceQueue[1];
        
        let geometry = [{ x: src.x, y: src.y }, { x: tgt.x, y: tgt.y }];
        if (isCurved && this.curvePoints.length > 0) {
            const fullPoints = [{ x: src.x, y: src.y }, ...this.curvePoints, { x: tgt.x, y: tgt.y }];
            const spline = MapEngine.catmullRom(fullPoints.map(p => [p.y, p.x]), 25);
            geometry = spline.map(latlng => ({ x: latlng[1], y: latlng[0] }));
        }

        const edge = { 
            id: Utils.uuid(), map_id: State.currentProject.id, 
            source_node_id: src.id, target_node_id: tgt.id, 
            source_name: src.name, target_name: tgt.name, 
            geometry: geometry, edge_type: isCurved ? 'curved' : 'straight', 
            color: getContributorColor(State.user.id), created_by: State.user.id, 
            _live: false, _localAction: 'ADD' 
        };
        
        State.edges.push(edge);
        SaveIndicator.setUnsaved();
        
        this.cancel(); 
        MapEngine.renderAll();
        Toast.show('Path created locally', 'success');
    },

    cancel() {
        this.state = 'SELECTING';
        State.traceQueue = [];
        MapEngine.selectionLayer.clearLayers();
        if (this.tempPolyline) MapEngine.map.removeLayer(this.tempPolyline);
        if (this.tempHitArea) MapEngine.map.removeLayer(this.tempHitArea);
        this.controlPointMarkers.forEach(m => MapEngine.map.removeLayer(m));
        this.controlPointMarkers = [];
        this.curvePoints = [];
        this.draggedPointIdx = -1;
        
        // Cleanly remove specific bound events
        MapEngine.map.off('mousemove', this._onMouseMove);
        MapEngine.map.off('mouseup', this._onMouseUp);
        StatusBar.setMode('trace');
    }
};

window.TraceMode = {
    addNode: (node) => PathDrawer.addNode(node),
    finish: () => PathDrawer.finalize(false),
    cancel: () => PathDrawer.cancel()
};

// Initialize listeners immediately
PathDrawer.init();