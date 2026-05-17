// PathDrawer.js
window.PathDrawer = {
    state: 'SELECTING', // SELECTING, CURVING
    currentSegmentIdx: 0,
    curvePoints: [], 
    draggedPointIdx: -1,
    tempPolyline: null,
    tempHitArea: null,
    controlPointMarkers: [],
    
    _onMouseMove: null,
    _onMouseUp: null,

    init() {
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);

        // 1. MONKEY-PATCH MAP ENGINE: Upgrade to Centripetal Catmull-Rom
        // This globally fixes bulging, overshooting, and loops for all rendered map paths.
        MapEngine.catmullRom = function(pts, segments = 30) {
            if (pts.length < 2) return pts;
            const p = [pts[0], ...pts, pts[pts.length - 1]].map(pt => ({ x: pt[1], y: pt[0] }));
            const result = [];
            const alpha = 0.5; // 0.5 = Centripetal (No bulges), 0.0 = Uniform (Bulges)

            function getT(t, p0, p1) {
                const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
                return t + Math.pow(a, alpha * 0.5);
            }

            for (let i = 1; i < p.length - 2; i++) {
                const p0 = p[i-1], p1 = p[i], p2 = p[i+1], p3 = p[i+2];
                
                let t0 = 0;
                let t1 = getT(t0, p0, p1);
                let t2 = getT(t1, p1, p2);
                let t3 = getT(t2, p2, p3);
                
                if (t1 === t0) t1 += 0.0001;
                if (t2 === t1) t2 += 0.0001;
                if (t3 === t2) t3 += 0.0001;

                for (let t = 0; t < segments; t++) {
                    const tn = t1 + (t / segments) * (t2 - t1);

                    const A1x = ((t1-tn)*p0.x + (tn-t0)*p1.x)/(t1-t0);
                    const A1y = ((t1-tn)*p0.y + (tn-t0)*p1.y)/(t1-t0);
                    const A2x = ((t2-tn)*p1.x + (tn-t1)*p2.x)/(t2-t1);
                    const A2y = ((t2-tn)*p1.y + (tn-t1)*p2.y)/(t2-t1);
                    const A3x = ((t3-tn)*p2.x + (tn-t2)*p3.x)/(t3-t2);
                    const A3y = ((t3-tn)*p2.y + (tn-t2)*p3.y)/(t3-t2);
                    
                    const B1x = ((t2-tn)*A1x + (tn-t0)*A2x)/(t2-t0);
                    const B1y = ((t2-tn)*A1y + (tn-t0)*A2y)/(t2-t0);
                    const B2x = ((t3-tn)*A2x + (tn-t1)*A3x)/(t3-t1);
                    const B2y = ((t3-tn)*A2y + (tn-t1)*A3y)/(t3-t1);
                    
                    const Cx = ((t2-tn)*B1x + (tn-t1)*B2x)/(t2-t1);
                    const Cy = ((t2-tn)*B1y + (tn-t1)*B2y)/(t2-t1);
                    
                    result.push([Cy, Cx]); // Return as [lat, lng]
                }
            }
            result.push(pts[pts.length - 1]);
            return result;
        };

        // 2. Event Listeners
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (e.key === 'Enter' && State.mode === 'trace') {
                e.preventDefault();
                if (this.state === 'CURVING') this.finalize(true);
                else if (State.traceQueue.length >= 2) this.finalize(false);
            } else if (e.key === 'Escape' && this.state === 'CURVING') {
                this.cancel();
            }
        });

        // 3. Glowing effect classes
        const style = document.createElement('style');
        style.textContent = `
            .pulse-spline-draft { filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.4)); }
            .curve-control-point { border: 3px solid #fff !important; cursor: grab !important; filter: drop-shadow(0 0 8px rgba(255, 0, 85, 0.9)); }
            .curve-control-point:active { cursor: grabbing !important; }
        `;
        document.head.appendChild(style);
    },

    addNode(node) {
        if (this.state !== 'SELECTING') return;
        
        if (State.traceQueue.length >= 30) {
            Toast.show('Max node limit (30) reached for a single trace queue.', 'warning');
            return;
        }

        if (State.traceQueue.find(n => n.id === node.id)) return;
        
        State.traceQueue.push(node);
        
        const icon = L.divIcon({ className: 'selection-number', html: `${State.traceQueue.length}`, iconSize: [20, 20], iconAnchor: [10, 10] });
        L.marker([node.y, node.x], { icon, interactive: false }).addTo(MapEngine.selectionLayer);
        
        if (State.traceQueue.length >= 2) {
            const pts = State.traceQueue.map(n => [n.y, n.x]);
            MapEngine.selectionLayer.eachLayer(l => { if (l instanceof L.Polyline) MapEngine.selectionLayer.removeLayer(l); });
            L.polyline(pts, { color: getContributorColor(State.user.id), weight: 4, opacity: 0.8, dashArray: '8,6' }).addTo(MapEngine.selectionLayer);
        }
        
        StatusBar.setMode('trace');
        if (State.traceQueue.length === 2) {
            Toast.show('Right-click ANYWHERE to choose Straight or Curved path', 'info', 5000);
        }
    },

    startCurving() {
        if (State.traceQueue.length < 2) return;
        this.state = 'CURVING';
        this.currentSegmentIdx = 0;
        MapEngine.selectionLayer.clearLayers();

        this.setupCurveSegment();
        
        MapEngine.map.on('mousemove', this._onMouseMove);
        MapEngine.map.on('mouseup', this._onMouseUp);
    },

    setupCurveSegment() {
        this.curvePoints = [];
        this.draggedPointIdx = -1;

        const start = State.traceQueue[this.currentSegmentIdx];
        const end = State.traceQueue[this.currentSegmentIdx + 1];

        // DRAFT STYLING: Restored to dashed, translucent look
        this.tempPolyline = L.polyline([[start.y, start.x], [end.y, end.x]], {
            color: '#00e5ff', dashArray: '10, 10', weight: 4, opacity: 0.8, className: 'pulse-spline-draft', lineCap: 'round'
        }).addTo(MapEngine.map);

        this.tempHitArea = L.polyline([[start.y, start.x], [end.y, end.x]], {
            color: 'transparent', weight: 40, opacity: 0, interactive: true
        }).addTo(MapEngine.map);

        this.tempHitArea.on('mousedown', (e) => {
            if (this.curvePoints.length >= 10) { Toast.show('Max 10 curve points allowed per segment', 'warning'); return; }
            L.DomEvent.stopPropagation(e);
            
            const newPt = { x: e.latlng.lng, y: e.latlng.lat };
            
            // SPATIAL INSERTION: Find exactly where in the sequence the user clicked
            const anchors = [State.traceQueue[this.currentSegmentIdx], ...this.curvePoints, State.traceQueue[this.currentSegmentIdx + 1]];
            let bestIndex = 0;
            let minAddedDist = Infinity;

            for (let i = 0; i < anchors.length - 1; i++) {
                const distCurrent = Math.hypot(anchors[i+1].x - anchors[i].x, anchors[i+1].y - anchors[i].y);
                const distNew = Math.hypot(newPt.x - anchors[i].x, newPt.y - anchors[i].y) + Math.hypot(anchors[i+1].x - newPt.x, anchors[i+1].y - newPt.y);
                const added = distNew - distCurrent;
                if (added < minAddedDist) {
                    minAddedDist = added;
                    bestIndex = i;
                }
            }
            
            // Insert point into correct spatial order to prevent looping
            this.curvePoints.splice(bestIndex, 0, newPt);
            this.draggedPointIdx = bestIndex;
            
            this.refreshCurveVisuals();
            this.renderControlMarkers();
            MapEngine.map.dragging.disable();
        });

        document.getElementById('status-hint').textContent = `Curving: ${start.name} → ${end.name} | Right-click ANYWHERE to confirm paths`;
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
        const start = State.traceQueue[this.currentSegmentIdx];
        const end = State.traceQueue[this.currentSegmentIdx + 1];
        const fullPoints = [{ x: start.x, y: start.y }, ...this.curvePoints, { x: end.x, y: end.y }];
        const splineLatlngs = MapEngine.catmullRom(fullPoints.map(p => [p.y, p.x]), 30);
        
        if (this.tempPolyline) this.tempPolyline.setLatLngs(splineLatlngs);
        if (this.tempHitArea) this.tempHitArea.setLatLngs(splineLatlngs);
    },

    renderControlMarkers() {
        this.controlPointMarkers.forEach(m => MapEngine.map.removeLayer(m));
        this.controlPointMarkers = [];

        this.curvePoints.forEach((pt, idx) => {
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

    cleanupCurvingVisuals() {
        if (this.tempPolyline) MapEngine.map.removeLayer(this.tempPolyline);
        if (this.tempHitArea) MapEngine.map.removeLayer(this.tempHitArea);
        this.tempPolyline = null;
        this.tempHitArea = null;
        this.controlPointMarkers.forEach(m => MapEngine.map.removeLayer(m));
        this.controlPointMarkers = [];
        this.curvePoints = [];
        this.draggedPointIdx = -1;
        MapEngine.map.dragging.enable();
    },

    finalize(isCurved = false) {
        if (State.traceQueue.length < 2) { this.cancel(); return; }
        
        if (!isCurved) {
            let count = 0;
            for (let i = 0; i < State.traceQueue.length - 1; i++) {
                const src = State.traceQueue[i];
                const tgt = State.traceQueue[i+1];
                const edge = { 
                    id: Utils.uuid(), map_id: State.currentProject.id, 
                    source_node_id: src.id, target_node_id: tgt.id, 
                    source_name: src.name, target_name: tgt.name, 
                    geometry: [{ x: src.x, y: src.y }, { x: tgt.x, y: tgt.y }], 
                    edge_type: 'straight', 
                    color: getContributorColor(State.user.id), created_by: State.user.id, 
                    _live: false, _localAction: 'ADD' 
                };
                State.edges.push(edge);
                count++;
            }
            SaveIndicator.setUnsaved();
            this.cancel(); 
            MapEngine.renderAll();
            Toast.show(`Created ${count} straight path(s)`, 'success');
            
        } else {
            const src = State.traceQueue[this.currentSegmentIdx];
            const tgt = State.traceQueue[this.currentSegmentIdx + 1];
            
            let geometry = [{ x: src.x, y: src.y }, { x: tgt.x, y: tgt.y }];
            if (this.curvePoints.length > 0) {
                const fullPoints = [{ x: src.x, y: src.y }, ...this.curvePoints, { x: tgt.x, y: tgt.y }];
                const spline = MapEngine.catmullRom(fullPoints.map(p => [p.y, p.x]), 30);
                geometry = spline.map(latlng => ({ x: latlng[1], y: latlng[0] }));
            }

            const edge = { 
                id: Utils.uuid(), map_id: State.currentProject.id, 
                source_node_id: src.id, target_node_id: tgt.id, 
                source_name: src.name, target_name: tgt.name, 
                geometry: geometry, edge_type: 'curved', 
                color: getContributorColor(State.user.id), created_by: State.user.id, 
                _live: false, _localAction: 'ADD' 
            };
            State.edges.push(edge);

            this.cleanupCurvingVisuals();
            this.currentSegmentIdx++;

            if (this.currentSegmentIdx >= State.traceQueue.length - 1) {
                SaveIndicator.setUnsaved();
                this.cancel(); 
                MapEngine.renderAll();
                Toast.show('Curved path completed', 'success');
            } else {
                this.setupCurveSegment();
            }
        }
    },

    finalizeAll() {
        if (this.state !== 'CURVING') return;
        
        const src = State.traceQueue[this.currentSegmentIdx];
        const tgt = State.traceQueue[this.currentSegmentIdx + 1];
        
        let geometry = [{ x: src.x, y: src.y }, { x: tgt.x, y: tgt.y }];
        if (this.curvePoints.length > 0) {
            const fullPoints = [{ x: src.x, y: src.y }, ...this.curvePoints, { x: tgt.x, y: tgt.y }];
            const spline = MapEngine.catmullRom(fullPoints.map(p => [p.y, p.x]), 30);
            geometry = spline.map(latlng => ({ x: latlng[1], y: latlng[0] }));
        }

        const edge = { 
            id: Utils.uuid(), map_id: State.currentProject.id, 
            source_node_id: src.id, target_node_id: tgt.id, 
            source_name: src.name, target_name: tgt.name, 
            geometry: geometry, edge_type: 'curved', 
            color: getContributorColor(State.user.id), created_by: State.user.id, 
            _live: false, _localAction: 'ADD' 
        };
        State.edges.push(edge);
        
        let count = 1; 
        for (let i = this.currentSegmentIdx + 1; i < State.traceQueue.length - 1; i++) {
            const s = State.traceQueue[i];
            const t = State.traceQueue[i+1];
            const sEdge = {
                id: Utils.uuid(), map_id: State.currentProject.id, 
                source_node_id: s.id, target_node_id: t.id, 
                source_name: s.name, target_name: t.name, 
                geometry: [{ x: s.x, y: s.y }, { x: t.x, y: t.y }], 
                edge_type: 'straight', 
                color: getContributorColor(State.user.id), created_by: State.user.id, 
                _live: false, _localAction: 'ADD' 
            };
            State.edges.push(sEdge);
            count++;
        }

        SaveIndicator.setUnsaved();
        this.cancel(); 
        MapEngine.renderAll();
        Toast.show(`Saved ${count} path(s)`, 'success');
    },

    cancel() {
        this.state = 'SELECTING';
        State.traceQueue = [];
        this.currentSegmentIdx = 0;
        MapEngine.selectionLayer.clearLayers();
        this.cleanupCurvingVisuals();
        
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

PathDrawer.init();