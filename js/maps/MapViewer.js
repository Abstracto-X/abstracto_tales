// js/maps/MapViewer.js
import { Utils } from '../config.js';
import { DB } from '../db.js';

export class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    
    enqueue(node, priority) {
        this.heap.push({ node, priority });
        this.bubbleUp();
    }
    
    dequeue() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }
        return min;
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
    
    bubbleUp() {
        let idx = this.heap.length - 1;
        const element = this.heap[idx];
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.heap[parentIdx];
            if (element.priority >= parent.priority) break;
            this.heap[parentIdx] = element;
            this.heap[idx] = parent;
            idx = parentIdx;
        }
    }
    
    sinkDown() {
        let idx = 0;
        const length = this.heap.length;
        const element = this.heap[0];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.heap[idx] = this.heap[swap];
            this.heap[swap] = element;
            idx = swap;
        }
    }
}

export const MapViewer = {
    viewer: null, canvas: null, img: null,
    ui: {},
    state: { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastDist: 0, pendingX: 0, pendingY: 0, dragTicking: false },
    _abortController: null,
    mapData: null,
    _mapDataPromise: null,
    graph: null,
    nodeIndex: {},
    nodeNameIndex: {},
    edgeIndex: {},
    edgeLengthIndex: {},
    componentIndex: {},
    nodeComponentIndex: {},
    mapHeight: 4000,
    selectedNodeId: null,
    routeState: {
        originId: null,
        destinationId: null,
        pathNodes: [],
        pathEdges: [],
        totalDistance: 0,
        offlaneSegments: [],
        accessPoints: { origin: null, destination: null },
        isHybrid: false,
        advisory: ''
    },
    displayState: {
        showLabels: true,
        showHyperlanes: true
    },
    currentMap: {
        src: '',
        name: ''
    },
    // Cross-map search: populated by Render.maps before entering viewer
    crossMapIndex: {},  // { 'planet name lowercase': [{mapId, mapName}] }
    storyMaps: [],      // All maps for the current story
    storySlug: '',      // Slug of the current story

    init: ({ id, src, mapName, width, height }) => {
        if (MapViewer._abortController) {
            MapViewer.destroy();
        }
        
        MapViewer._abortController = new AbortController();
        const signal = MapViewer._abortController.signal;

        MapViewer.viewer = document.getElementById('map-viewer');
        MapViewer.canvas = document.getElementById('map-canvas');
        MapViewer.img = document.getElementById('map-image');
        MapViewer.ui = {
            selectorButtons: Array.from(document.querySelectorAll('.map-selector-btn')),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            resetBtn: document.getElementById('map-reset-btn'),
            centerRouteBtn: document.getElementById('map-center-route-btn'),
            searchInput: document.getElementById('planet-search'),
            originInput: document.getElementById('route-origin'),
            destInput: document.getElementById('route-dest'),
            datalist: document.getElementById('planet-datalist'),
            status: document.getElementById('routing-status'),
            nodeCard: document.getElementById('routing-node-card'),
            summary: document.getElementById('routing-summary'),
            itinerary: document.getElementById('routing-itinerary'),
            plotBtn: document.getElementById('plot-course-btn'),
            swapBtn: document.getElementById('swap-route-btn'),
            clearBtn: document.getElementById('clear-route-btn'),
            focusBtn: document.getElementById('focus-route-btn'),
            labelsToggle: document.getElementById('toggle-map-labels'),
            hyperlanesToggle: document.getElementById('toggle-map-hyperlanes'),
            setOriginBtn: document.getElementById('set-origin-btn'),
            setDestBtn: document.getElementById('set-destination-btn'),
            activeMapChip: document.getElementById('active-map-chip')
        };
        
        MapViewer.state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastDist: 0, pendingX: 0, pendingY: 0, dragTicking: false };
        MapViewer.currentMap = { id, src, name: mapName || 'Map', width: width || 4000, height: height || 4000 };
        MapViewer.mapHeight = height || 4000;
        MapViewer.mapData = null;
        MapViewer.routeState = MapViewer.createEmptyRouteState();
        MapViewer.selectedNodeId = null;

        MapViewer.bindUI(signal);
        MapViewer.applyDisplayState();
        MapViewer.img.onload = () => {
            MapViewer.centerMap();
        };

        MapViewer.setMapSource(src, mapName || 'Map');
        MapViewer.loadMapData();

        const v = MapViewer.viewer;
        v.addEventListener('pointerdown', MapViewer.onPointerDown, { signal });
        window.addEventListener('pointermove', MapViewer.onPointerMove, { signal });
        window.addEventListener('pointerup', MapViewer.onPointerUp, { signal });
        window.addEventListener('pointercancel', MapViewer.onPointerUp, { signal });
        v.addEventListener('wheel', MapViewer.onWheel, { passive: false, signal });
        v.addEventListener('touchstart', MapViewer.onTouchStart, { passive: false, signal });
        v.addEventListener('touchmove', MapViewer.onTouchMove, { passive: false, signal });
        v.addEventListener('touchend', MapViewer.onUp, { signal });
        window.addEventListener('resize', MapViewer.onResize, { signal });
    },

    bindUI: (signal) => {
        const ui = MapViewer.ui;
        if (!ui.zoomInBtn) return;

        ui.zoomInBtn.addEventListener('click', () => MapViewer.zoom(1.2), { signal });
        ui.zoomOutBtn.addEventListener('click', () => MapViewer.zoom(0.8), { signal });
        ui.resetBtn.addEventListener('click', () => MapViewer.resetView(), { signal });
        ui.centerRouteBtn.addEventListener('click', () => MapViewer.focusActiveRoute(), { signal });
        ui.plotBtn.addEventListener('click', () => MapViewer.calculateRoute(), { signal });
        ui.swapBtn.addEventListener('click', () => MapViewer.swapRoute(), { signal });
        ui.clearBtn.addEventListener('click', () => MapViewer.clearRoute(), { signal });
        ui.focusBtn.addEventListener('click', () => MapViewer.handleSearch(), { signal });
        ui.labelsToggle.addEventListener('click', () => MapViewer.toggleLayer('showLabels'), { signal });
        ui.hyperlanesToggle.addEventListener('click', () => MapViewer.toggleLayer('showHyperlanes'), { signal });
        ui.setOriginBtn.addEventListener('click', () => MapViewer.assignSelectedNode('origin'), { signal });
        ui.setDestBtn.addEventListener('click', () => MapViewer.assignSelectedNode('destination'), { signal });

        ui.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                MapViewer.handleSearch();
            }
        }, { signal });
        ui.searchInput.addEventListener('change', () => MapViewer.handleSearch(), { signal });

        ui.originInput.addEventListener('change', () => {
            const ok = MapViewer.setRouteEndpoint('origin', ui.originInput.value, { allowPartial: false });
            if (!ok) MapViewer.updateCrossMapHint(ui.originInput.value, 'origin');
            else MapViewer.hideCrossMapHint('origin');
        }, { signal });
        ui.destInput.addEventListener('change', () => {
            const ok = MapViewer.setRouteEndpoint('destination', ui.destInput.value, { allowPartial: false });
            if (!ok) MapViewer.updateCrossMapHint(ui.destInput.value, 'dest');
            else MapViewer.hideCrossMapHint('dest');
        }, { signal });

        ui.selectorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (MapViewer.storySlug) {
                    window.Router.navigate(`maps/${MapViewer.storySlug}/${btn.dataset.id}`);
                } else {
                    MapViewer.init({
                        id: btn.dataset.id,
                        src: btn.dataset.src,
                        mapName: btn.dataset.mapName || btn.textContent.trim(),
                        width: parseInt(btn.dataset.width) || 4000,
                        height: parseInt(btn.dataset.height) || 4000
                    });
                }
            }, { signal });
        });
    },

    loadMapData: async () => {
        try {
            MapViewer.setStatus('Loading navicomputer data...', 'info');
            if (!MapViewer.currentMap || !MapViewer.currentMap.id) throw new Error("No Map ID provided to Navicomputer.");

            // Sequential fetch exactly mirroring Cartographer's working logic
            const nodesData = await DB.getMapNodes(MapViewer.currentMap.id);
            const edgesData = await DB.getMapEdges(MapViewer.currentMap.id);

            // Remap edge schema to match what Dijkstra's algorithm requires
            const mappedEdges = edgesData.map(e => ({
                ...e,
                source: e.source_node_id,
                target: e.target_node_id,
                sourceName: e.source_name,
                targetName: e.target_name
            }));

            MapViewer.mapData = { nodes: nodesData, edges: mappedEdges };
            
            MapViewer.renderMapData();
            MapViewer.buildGraph();
            MapViewer.setStatus('Navicomputer online.', 'success');
            
            return MapViewer.mapData;
        } catch (err) {
            console.error("Failed to load map data from DB:", err);
            MapViewer.setStatus('The navicomputer could not load route data for this region. ' + (err.message || ''), 'error');
            return null;
        }
    },

    renderMapData: () => {
        if (!MapViewer.mapData) return;
        const { nodes, edges } = MapViewer.mapData;
        const svgLayer = document.getElementById('map-svg-layer');
        const nodesLayer = document.getElementById('map-nodes-layer');
        const datalist = MapViewer.ui.datalist;

        svgLayer.innerHTML = '';
        nodesLayer.innerHTML = '';
        datalist.innerHTML = '';
        MapViewer.nodeIndex = {};
        MapViewer.nodeNameIndex = {};
        MapViewer.edgeIndex = {};
        MapViewer.edgeLengthIndex = {};

        let svgContent = '';
        edges.forEach(edge => {
            if (!edge.geometry || edge.geometry.length === 0) return;
            MapViewer.edgeIndex[edge.id] = edge;
            MapViewer.edgeLengthIndex[edge.id] = MapViewer.measureGeometry(edge.geometry);
            let d = `M ${edge.geometry[0].x} ${MapViewer.mapHeight - edge.geometry[0].y}`;
            for(let i = 1; i < edge.geometry.length; i += 1) {
                d += ` L ${edge.geometry[i].x} ${MapViewer.mapHeight - edge.geometry[i].y}`;
            }
            svgContent += `<path d="${d}" class="map-edge" id="${edge.id}"></path>`;
        });
        svgLayer.innerHTML = `<g id="map-edge-group">${svgContent}</g><g id="map-route-overlay-group"></g>`;

        nodes.forEach(node => {
            MapViewer.nodeIndex[node.id] = node;
            MapViewer.nodeNameIndex[node.name.trim().toLowerCase()] = node;
            const flippedY = MapViewer.mapHeight - node.y;
            const el = document.createElement('div');
            el.className = 'map-node';
            el.id = node.id;
            el.style.left = `${node.x}px`;
            el.style.top = `${flippedY}px`;
            el.innerHTML = `<div class="map-node-label">${Utils.escapeHtml(node.name)}</div>`;
            el.addEventListener('click', () => MapViewer.selectNode(node.id));
            nodesLayer.appendChild(el);

            const opt = document.createElement('option');
            opt.value = node.name;
            datalist.appendChild(opt);
        });

        MapViewer.applyDisplayState();
        MapViewer.refreshNodeStates();
        MapViewer.syncInputs();
        MapViewer.renderNodeCard();
        if (MapViewer.routeState.pathNodes.length > 0) {
            MapViewer.drawRoute(MapViewer.routeState.pathNodes, MapViewer.routeState.pathEdges, {
                totalDistance: MapViewer.routeState.totalDistance,
                originId: MapViewer.routeState.originId,
                destinationId: MapViewer.routeState.destinationId,
                offlaneSegments: MapViewer.routeState.offlaneSegments,
                accessPoints: MapViewer.routeState.accessPoints,
                isHybrid: MapViewer.routeState.isHybrid,
                advisory: MapViewer.routeState.advisory,
                preserveStatus: true
            });
        } else {
            MapViewer.renderSummary();
        }
    },

    buildGraph: () => {
        const graph = {};
        if (!MapViewer.mapData) return;
        MapViewer.mapData.nodes.forEach(n => graph[n.id] = { node: n, edges: [] });
        MapViewer.mapData.edges.forEach(e => {
            if (graph[e.source] && graph[e.target]) {
                const weight = MapViewer.edgeLengthIndex[e.id] ?? MapViewer.measureGeometry(e.geometry);
                graph[e.source].edges.push({ target: e.target, edgeId: e.id, weight });
                graph[e.target].edges.push({ target: e.source, edgeId: e.id, weight });
            }
        });
        MapViewer.graph = graph;
        MapViewer.buildComponents();
        if (MapViewer.selectedNodeId) {
            MapViewer.renderNodeCard();
        }
    },

    setMapSource: (src, mapName = 'Map') => {
        if (!MapViewer.img || !src) return;
        MapViewer.currentMap.src = src;
        MapViewer.currentMap.name = mapName;
        if (MapViewer.ui.activeMapChip) {
            MapViewer.ui.activeMapChip.textContent = mapName;
        }
        MapViewer.ui.selectorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.src === src);
        });
        if (MapViewer.img.src !== src) {
            MapViewer.img.src = src;
        } else if (MapViewer.img.complete) {
            MapViewer.centerMap();
        }
        MapViewer.setStatus(`Viewing ${mapName}. Select a world or plot a course.`, 'info');
    },

    normalizeName: (value) => (value || '').trim().toLowerCase(),

    findNodeByName: (value) => {
        const normalized = MapViewer.normalizeName(value);
        return normalized ? MapViewer.nodeNameIndex[normalized] || null : null;
    },

    hasLinkedNeighbors: (nodeId) => (MapViewer.graph?.[nodeId]?.edges?.length || 0) > 0,

    createEmptyRouteState: () => ({
        originId: null,
        destinationId: null,
        pathNodes: [],
        pathEdges: [],
        totalDistance: 0,
        offlaneSegments: [],
        accessPoints: { origin: null, destination: null },
        isHybrid: false,
        advisory: ''
    }),

    measureGeometry: (geometry = []) => {
        let total = 0;
        for (let i = 1; i < geometry.length; i += 1) {
            const dx = geometry[i].x - geometry[i - 1].x;
            const dy = geometry[i].y - geometry[i - 1].y;
            total += Math.hypot(dx, dy);
        }
        return total;
    },

    getClosestPointOnSegment: (point, start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lenSq = (dx * dx) + (dy * dy);
        if (lenSq === 0) {
            return { x: start.x, y: start.y, t: 0, distance: Math.hypot(point.x - start.x, point.y - start.y) };
        }

        const t = Math.max(0, Math.min(1, (((point.x - start.x) * dx) + ((point.y - start.y) * dy)) / lenSq));
        const x = start.x + (dx * t);
        const y = start.y + (dy * t);
        return { x, y, t, distance: Math.hypot(point.x - x, point.y - y) };
    },

    buildComponents: () => {
        MapViewer.componentIndex = {};
        MapViewer.nodeComponentIndex = {};
        if (!MapViewer.graph) return;

        const visited = new Set();
        let componentCounter = 0;

        Object.keys(MapViewer.graph).forEach(nodeId => {
            if (visited.has(nodeId) || !MapViewer.hasLinkedNeighbors(nodeId)) return;

            componentCounter += 1;
            const componentId = `component_${componentCounter}`;
            const stack = [nodeId];
            const nodeIds = [];
            const edgeIds = new Set();

            while (stack.length > 0) {
                const currentId = stack.pop();
                if (visited.has(currentId)) continue;
                visited.add(currentId);
                MapViewer.nodeComponentIndex[currentId] = componentId;
                nodeIds.push(currentId);

                (MapViewer.graph[currentId]?.edges || []).forEach(neighbor => {
                    edgeIds.add(neighbor.edgeId);
                    if (!visited.has(neighbor.target)) {
                        stack.push(neighbor.target);
                    }
                });
            }

            MapViewer.componentIndex[componentId] = {
                id: componentId,
                nodeIds,
                edgeIds: Array.from(edgeIds)
            };
        });
    },

    createAccessPointForNode: (node) => ({
        kind: 'node',
        componentId: MapViewer.nodeComponentIndex[node.id] || null,
        nodeId: node.id,
        x: node.x,
        y: node.y,
        offlaneDistance: 0,
        entryOptions: [{ nodeId: node.id, entryCost: 0 }],
        label: `Linked world: ${node.name}`
    }),

    findNearestAccessPoint: (node, componentId) => {
        const component = MapViewer.componentIndex[componentId];
        if (!node || !component || node.x === undefined || node.y === undefined) return null;

        let best = null;
        const origin = { x: node.x, y: node.y };

        component.nodeIds.forEach(candidateNodeId => {
            const candidateNode = MapViewer.nodeIndex[candidateNodeId];
            if (!candidateNode || candidateNode.x === undefined || candidateNode.y === undefined) return;
            const distance = Math.hypot(candidateNode.x - origin.x, candidateNode.y - origin.y);
            if (!best || distance < best.offlaneDistance) {
                best = {
                    kind: 'node',
                    componentId,
                    nodeId: candidateNode.id,
                    x: candidateNode.x,
                    y: candidateNode.y,
                    offlaneDistance: distance,
                    entryOptions: [{ nodeId: candidateNode.id, entryCost: 0 }],
                    label: `Nearest linked world: ${candidateNode.name}`
                };
            }
        });

        component.edgeIds.forEach(edgeId => {
            const edge = MapViewer.edgeIndex[edgeId];
            if (!edge?.geometry?.length) return;

            let traversed = 0;
            const totalLength = MapViewer.edgeLengthIndex[edgeId] ?? MapViewer.measureGeometry(edge.geometry);
            for (let i = 1; i < edge.geometry.length; i += 1) {
                const start = edge.geometry[i - 1];
                const end = edge.geometry[i];
                if (!start || !end || start.x === undefined || start.y === undefined || end.x === undefined || end.y === undefined) {
                    continue;
                }
                const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
                const closest = MapViewer.getClosestPointOnSegment(origin, start, end);
                const distanceAlong = traversed + (segmentLength * closest.t);

                if (!best || closest.distance < best.offlaneDistance) {
                    best = {
                        kind: 'edge',
                        componentId,
                        edgeId,
                        x: closest.x,
                        y: closest.y,
                        offlaneDistance: closest.distance,
                        entryOptions: [
                            { nodeId: edge.source, entryCost: distanceAlong },
                            { nodeId: edge.target, entryCost: totalLength - distanceAlong }
                        ],
                        label: `Nearest hyperlane exit: ${MapViewer.nodeIndex[edge.source]?.name || 'Unknown'} - ${MapViewer.nodeIndex[edge.target]?.name || 'Unknown'}`
                    };
                }

                traversed += segmentLength;
            }
        });

        return best;
    },

    getCandidateComponentsForHybridRoute: (sourceNode, targetNode) => {
        const sourceComponentId = MapViewer.nodeComponentIndex[sourceNode.id] || null;
        const targetComponentId = MapViewer.nodeComponentIndex[targetNode.id] || null;

        if (sourceComponentId && !targetComponentId) return [sourceComponentId];
        if (!sourceComponentId && targetComponentId) return [targetComponentId];
        if (!sourceComponentId && !targetComponentId) return Object.keys(MapViewer.componentIndex);
        return [];
    },

    runDijkstra: (sourceId, targetId, componentId = null) => {
        if (!MapViewer.graph?.[sourceId] || !MapViewer.graph?.[targetId]) return null;

        const distances = {};
        const previous = {};
        const pq = new MinPriorityQueue();

        const targetNodes = componentId && MapViewer.componentIndex[componentId]
            ? MapViewer.componentIndex[componentId].nodeIds
            : Object.keys(MapViewer.graph);

        targetNodes.forEach(v => {
            distances[v] = Infinity;
            previous[v] = null;
        });

        distances[sourceId] = 0;
        pq.enqueue(sourceId, 0);

        while (!pq.isEmpty()) {
            const { node: minNode, priority: currentDist } = pq.dequeue();

            if (minNode === targetId) break;
            if (currentDist > distances[minNode]) continue;

            (MapViewer.graph[minNode]?.edges || []).forEach(neighbor => {
                const alt = distances[minNode] + neighbor.weight;
                if (alt < (distances[neighbor.target] ?? Infinity)) {
                    distances[neighbor.target] = alt;
                    previous[neighbor.target] = { node: minNode, edgeId: neighbor.edgeId };
                    pq.enqueue(neighbor.target, alt);
                }
            });
        }

        if (distances[targetId] === Infinity || distances[targetId] === undefined) return null;

        const pathEdges = [];
        const pathNodes = [];
        let curr = targetId;
        
        while (curr) {
            pathNodes.unshift(curr);
            const prev = previous[curr];
            if (prev) {
                pathEdges.unshift(prev.edgeId);
                curr = prev.node;
            } else {
                curr = null;
            }
        }

        return {
            distance: distances[targetId],
            pathNodes,
            pathEdges
        };
    },

    findBestHybridRoute: (sourceNode, targetNode) => {
        const candidateComponents = MapViewer.getCandidateComponentsForHybridRoute(sourceNode, targetNode);
        if (!candidateComponents.length) return null;

        const sourceLinked = MapViewer.hasLinkedNeighbors(sourceNode.id);
        const targetLinked = MapViewer.hasLinkedNeighbors(targetNode.id);
        let bestRoute = null;

        candidateComponents.forEach(componentId => {
            const originAccess = sourceLinked && MapViewer.nodeComponentIndex[sourceNode.id] === componentId
                ? MapViewer.createAccessPointForNode(sourceNode)
                : MapViewer.findNearestAccessPoint(sourceNode, componentId);
            const destinationAccess = targetLinked && MapViewer.nodeComponentIndex[targetNode.id] === componentId
                ? MapViewer.createAccessPointForNode(targetNode)
                : MapViewer.findNearestAccessPoint(targetNode, componentId);

            if (!originAccess || !destinationAccess) return;

            originAccess.entryOptions.forEach(originOption => {
                destinationAccess.entryOptions.forEach(destinationOption => {
                    const routeCore = MapViewer.runDijkstra(originOption.nodeId, destinationOption.nodeId, componentId);
                    if (!routeCore) return;

                    const totalDistance = originAccess.offlaneDistance
                        + destinationAccess.offlaneDistance
                        + originOption.entryCost
                        + destinationOption.entryCost
                        + routeCore.distance;

                    if (!bestRoute || totalDistance < bestRoute.totalDistance) {
                        bestRoute = {
                            totalDistance,
                            pathNodes: routeCore.pathNodes,
                            pathEdges: routeCore.pathEdges,
                            accessPoints: {
                                origin: originAccess,
                                destination: destinationAccess
                            },
                            offlaneSegments: [
                                {
                                    role: 'origin',
                                    nodeId: sourceNode.id,
                                    nodeName: sourceNode.name,
                                    distance: originAccess.offlaneDistance,
                                    access: originAccess
                                },
                                {
                                    role: 'destination',
                                    nodeId: targetNode.id,
                                    nodeName: targetNode.name,
                                    distance: destinationAccess.offlaneDistance,
                                    access: destinationAccess
                                }
                            ]
                        };
                    }
                });
            });
        });

        return bestRoute;
    },

    selectNode: (nodeId) => {
        if (!MapViewer.nodeIndex[nodeId]) return;
        MapViewer.selectedNodeId = nodeId;
        MapViewer.refreshNodeStates();
        MapViewer.renderNodeCard();
        const node = MapViewer.nodeIndex[nodeId];
        MapViewer.ui.searchInput.value = node.name;
        MapViewer.setStatus(`${node.name} selected. Set it as origin or destination, or focus it directly.`, 'info');
    },

    assignSelectedNode: (type) => {
        if (!MapViewer.selectedNodeId) {
            MapViewer.setStatus('Select a world on the map first.', 'error');
            return;
        }
        MapViewer.setRouteEndpoint(type, MapViewer.selectedNodeId);
    },

    setRouteEndpoint: (type, value, options = {}) => {
        let node = null;
        if (typeof value === 'string' && MapViewer.nodeIndex[value]) {
            // Direct UUID lookup — handles IDs from click events and renderNodeCard buttons
            node = MapViewer.nodeIndex[value];
        } else if (typeof value === 'string') {
            node = MapViewer.findNodeByName(value);
        } else if (value && value.id) {
            node = value;
        }

        const label = type === 'origin' ? 'origin' : 'destination';
        if (!node) {
            if (!options.allowPartial && value) {
                MapViewer.setStatus(`No exact world match found for the ${label}.`, 'error');
            }
            return false;
        }

        if (type === 'origin') MapViewer.routeState.originId = node.id;
        else MapViewer.routeState.destinationId = node.id;

        MapViewer.selectedNodeId = node.id;
        MapViewer.routeState.pathNodes = [];
        MapViewer.routeState.pathEdges = [];
        MapViewer.routeState.totalDistance = 0;
        MapViewer.routeState.offlaneSegments = [];
        MapViewer.routeState.accessPoints = { origin: null, destination: null };
        MapViewer.routeState.isHybrid = false;
        MapViewer.routeState.advisory = '';
        document.querySelectorAll('.map-edge.route-glow').forEach(el => el.classList.remove('route-glow', 'route-glow-reverse'));
        MapViewer.renderRouteOverlay();
        MapViewer.syncInputs();
        MapViewer.refreshNodeStates();
        MapViewer.renderNodeCard();
        MapViewer.renderSummary();
        MapViewer.setStatus(`${node.name} assigned as ${label}.`, 'success');
        return true;
    },

    calculateRoute: () => {
        if (!MapViewer.graph) return;
        const sourceNode = MapViewer.findNodeByName(MapViewer.ui.originInput.value);
        const targetNode = MapViewer.findNodeByName(MapViewer.ui.destInput.value);
        if (!sourceNode || !targetNode) {
            MapViewer.setStatus('Choose both origin and destination from valid map worlds before plotting.', 'error');
            return;
        }
        if (sourceNode.id === targetNode.id) {
            MapViewer.drawRoute([sourceNode.id], [], {
                totalDistance: 0,
                originId: sourceNode.id,
                destinationId: targetNode.id
            });
            MapViewer.setStatus('Origin and destination are the same world. The route is already complete.', 'success');
            return;
        }

        const sourceComponentId = MapViewer.nodeComponentIndex[sourceNode.id] || null;
        const targetComponentId = MapViewer.nodeComponentIndex[targetNode.id] || null;
        if (sourceComponentId && targetComponentId && sourceComponentId === targetComponentId) {
            const route = MapViewer.runDijkstra(sourceNode.id, targetNode.id);
            if (route) {
                MapViewer.drawRoute(route.pathNodes, route.pathEdges, {
                    totalDistance: route.distance,
                    originId: sourceNode.id,
                    destinationId: targetNode.id
                });
                MapViewer.setStatus(`Course plotted from ${sourceNode.name} to ${targetNode.name}.`, 'success');
                return;
            }
        }

        const hybridRoute = MapViewer.findBestHybridRoute(sourceNode, targetNode);
        if (!hybridRoute) {
            MapViewer.setStatus(`No safe path was found between ${sourceNode.name} and ${targetNode.name}.`, 'error');
            return;
        }

        MapViewer.drawRoute(hybridRoute.pathNodes, hybridRoute.pathEdges, {
            totalDistance: hybridRoute.totalDistance,
            originId: sourceNode.id,
            destinationId: targetNode.id,
            offlaneSegments: hybridRoute.offlaneSegments,
            accessPoints: hybridRoute.accessPoints,
            isHybrid: true,
            advisory: 'Nearest hyperlane exits were used. Travel beyond those exits continues through unregistered lanes and local approach paths.'
        });
        MapViewer.setStatus(`Hybrid course plotted from ${sourceNode.name} to ${targetNode.name}. Final approach includes unregistered travel beyond the nearest hyperlane exits.`, 'warning');
    },

    drawRoute: (pathNodes, pathEdges, options = {}) => {
        document.querySelectorAll('.map-edge.route-glow').forEach(el => el.classList.remove('route-glow', 'route-glow-reverse'));
        MapViewer.routeState.pathNodes = [...pathNodes];
        MapViewer.routeState.pathEdges = [...pathEdges];
        MapViewer.routeState.totalDistance = options.totalDistance ?? MapViewer.computeTotalDistance(pathEdges);
        MapViewer.routeState.originId = options.originId || pathNodes[0] || MapViewer.routeState.originId;
        MapViewer.routeState.destinationId = options.destinationId || pathNodes[pathNodes.length - 1] || MapViewer.routeState.destinationId;
        MapViewer.routeState.offlaneSegments = options.offlaneSegments || [];
        MapViewer.routeState.accessPoints = options.accessPoints || { origin: null, destination: null };
        MapViewer.routeState.isHybrid = Boolean(options.isHybrid);
        MapViewer.routeState.advisory = options.advisory || '';
        MapViewer.syncInputs();
        MapViewer.refreshNodeStates();

        pathNodes.forEach(nid => {
            const el = document.getElementById(nid);
            if (el) el.classList.add('active');
        });
        pathEdges.forEach((eid, idx) => {
            const el = document.getElementById(eid);
            if (el) {
                el.classList.add('route-glow');
                const edgeData = MapViewer.edgeIndex[eid];
                // If the edge's origin source doesn't match the node we are departing from, we are traversing it backwards
                if (edgeData && edgeData.source !== pathNodes[idx]) {
                    el.classList.add('route-glow-reverse');
                } else {
                    el.classList.remove('route-glow-reverse');
                }
            }
        });
        MapViewer.renderRouteOverlay();

        const container = MapViewer.ui.itinerary;
        container.classList.add('active');
        let cumulative = 0;
        let itineraryHtml = '';

        MapViewer.routeState.offlaneSegments
            .filter(segment => segment.role === 'origin' && segment.distance > 0)
            .forEach(segment => {
                cumulative += segment.distance;
                itineraryHtml += `
                    <div class="itinerary-step offlane">
                        <div class="itinerary-step-name">
                            <span></span>
                            <span>${Utils.escapeHtml(segment.nodeName)} to ${Utils.escapeHtml(segment.access.label)}</span>
                        </div>
                        <span class="itinerary-step-distance">${MapViewer.formatDistance(cumulative)} total</span>
                    </div>`;
            });

        pathNodes.forEach((nid, i) => {
            const node = MapViewer.nodeIndex[nid];
            if (!node) return;
            let cls = 'itinerary-step';
            if (i === 0) cls += ' origin';
            else if (i === pathNodes.length - 1) cls += ' destination';
            const edgeId = pathEdges[i - 1];
            const legDistance = edgeId ? MapViewer.computeEdgeDistance(edgeId) : 0;
            if (i > 0) cumulative += legDistance;
            itineraryHtml += `
                <div class="${cls}">
                    <div class="itinerary-step-name">
                        <span></span>
                        <span>${Utils.escapeHtml(node.name)}</span>
                    </div>
                    <span class="itinerary-step-distance">${i === 0 && cumulative === 0 ? 'Departure' : `${MapViewer.formatDistance(cumulative)} total`}</span>
                </div>`;
        });

        MapViewer.routeState.offlaneSegments
            .filter(segment => segment.role === 'destination' && segment.distance > 0)
            .forEach(segment => {
                cumulative += segment.distance;
                itineraryHtml += `
                    <div class="itinerary-step offlane destination">
                        <div class="itinerary-step-name">
                            <span></span>
                            <span>${Utils.escapeHtml(segment.access.label)} to ${Utils.escapeHtml(segment.nodeName)}</span>
                        </div>
                        <span class="itinerary-step-distance">${MapViewer.formatDistance(cumulative)} total</span>
                    </div>`;
            });

        container.innerHTML = itineraryHtml;
        MapViewer.renderSummary();
        MapViewer.zoomToRoute(options.zoomNodeIds || Array.from(new Set([
            MapViewer.routeState.originId,
            ...pathNodes,
            MapViewer.routeState.destinationId
        ].filter(Boolean))));
    },

    clearRoute: () => {
        MapViewer.routeState = MapViewer.createEmptyRouteState();
        document.querySelectorAll('.map-edge.route-glow').forEach(el => el.classList.remove('route-glow', 'route-glow-reverse'));
        MapViewer.renderRouteOverlay();
        MapViewer.syncInputs();
        MapViewer.refreshNodeStates();
        MapViewer.renderSummary();
        MapViewer.setStatus('Route cleared. Select two worlds to plot a new course.', 'info');
    },

    swapRoute: () => {
        const originId = MapViewer.routeState.originId;
        const destinationId = MapViewer.routeState.destinationId;
        if (!originId && !destinationId) {
            MapViewer.setStatus('There is no course to reverse yet.', 'error');
            return;
        }
        MapViewer.routeState.originId = destinationId;
        MapViewer.routeState.destinationId = originId;
        MapViewer.routeState.pathNodes = [];
        MapViewer.routeState.pathEdges = [];
        MapViewer.routeState.totalDistance = 0;
        MapViewer.routeState.offlaneSegments = [];
        MapViewer.routeState.accessPoints = { origin: null, destination: null };
        MapViewer.routeState.isHybrid = false;
        MapViewer.routeState.advisory = '';
        document.querySelectorAll('.map-edge.route-glow').forEach(el => el.classList.remove('route-glow', 'route-glow-reverse'));
        MapViewer.renderRouteOverlay();
        MapViewer.syncInputs();
        MapViewer.refreshNodeStates();
        MapViewer.renderSummary();
        MapViewer.setStatus('Origin and destination swapped. Plot the new course when ready.', 'info');
    },

    handleSearch: () => {
        const value = MapViewer.ui.searchInput.value;
        const node = MapViewer.findNodeByName(value);
        if (!node) {
            MapViewer.setStatus('Search needs an exact world name from the navicomputer list.', 'error');
            MapViewer.updateCrossMapHint(value, 'search');
            return;
        }
        MapViewer.hideCrossMapHint('search');
        MapViewer.selectedNodeId = node.id;
        MapViewer.refreshNodeStates();
        MapViewer.renderNodeCard();
        MapViewer.zoomToNode(node.name);
        MapViewer.setStatus(`${node.name} brought into focus.`, 'success');
    },

    // Cross-map search: look for a planet name in other maps of the same story
    crossMapSearch: (name) => {
        if (!name || !name.trim()) return [];
        const key = name.trim().toLowerCase();
        const results = MapViewer.crossMapIndex[key] || [];
        // Filter out the current map
        return results.filter(r => r.mapId !== MapViewer.currentMap.id);
    },

    // Show a cross-map hint below a navicomputer field
    updateCrossMapHint: (name, hintId) => {
        const hintEl = document.getElementById(`cross-map-hint-${hintId}`);
        if (!hintEl) return;
        if (!name || !name.trim()) { hintEl.classList.remove('visible'); return; }
        const results = MapViewer.crossMapSearch(name);
        if (!results.length) { hintEl.classList.remove('visible'); return; }
        // Check if it's also in the current map
        const key = name.trim().toLowerCase();
        const inCurrentMap = !!MapViewer.nodeNameIndex[key];
        if (inCurrentMap) { hintEl.classList.remove('visible'); return; }
        // Build link buttons for each map where it's found
        const uniqueMaps = [];
        const seen = new Set();
        results.forEach(r => { if (!seen.has(r.mapId)) { seen.add(r.mapId); uniqueMaps.push(r); } });
        const linksHtml = uniqueMaps.map(r => {
            const label = Utils.escapeHtml(r.mapName);
            return `<span class="routing-cross-map-link" onclick="MapViewer.switchToMap('${r.mapId}')">${label}</span>`;
        }).join('');
        hintEl.innerHTML = `<strong><i class="fas fa-search-location"></i> Not in current chart</strong>Found in: <div class="cross-map-links">${linksHtml}</div>`;
        hintEl.classList.add('visible');
    },

    hideCrossMapHint: (hintId) => {
        const hintEl = document.getElementById(`cross-map-hint-${hintId}`);
        if (hintEl) hintEl.classList.remove('visible');
    },

    // Switch to a different map in the viewer (navigates via router)
    switchToMap: (mapId) => {
        if (!MapViewer.storySlug) return;
        window.Router.navigate(`maps/${MapViewer.storySlug}/${mapId}`);
    },

    renderNodeCard: () => {
        const card = MapViewer.ui.nodeCard;
        const node = MapViewer.selectedNodeId ? MapViewer.nodeIndex[MapViewer.selectedNodeId] : null;
        if (!node) {
            card.className = 'routing-node-card empty';
            card.innerHTML = `<h4>Node Focus</h4><p class="routing-kicker">Click a world on the chart to inspect it and assign route endpoints.</p>`;
            return;
        }

        const meta = [];
        if (node.region) meta.push(`<span class="routing-meta-pill">Region: ${Utils.escapeHtml(node.region)}</span>`);
        if (node.sector) meta.push(`<span class="routing-meta-pill">Sector: ${Utils.escapeHtml(node.sector)}</span>`);
        const neighborCount = MapViewer.graph?.[node.id]?.edges?.length || 0;
        meta.push(`<span class="routing-meta-pill">${neighborCount} link${neighborCount === 1 ? '' : 's'}</span>`);
        if (neighborCount === 0) meta.push(`<span class="routing-meta-pill">Unlinked World</span>`);

        card.className = 'routing-node-card';
        card.innerHTML = `
            <h4>${Utils.escapeHtml(node.name)}</h4>
            <p class="routing-kicker">${neighborCount === 0 ? 'This world has no registered hyperlane links. The navicomputer will use the nearest hyperlane exit and mark the remaining approach as unregistered travel.' : 'Use this world as a launch point, destination, or just center the map around it.'}</p>
            <div class="routing-node-meta">${meta.join('')}</div>
            <div class="routing-inline-actions">
                <button class="routing-btn" type="button" onclick="MapViewer.setRouteEndpoint('origin', '${node.id}')">Set Origin</button>
                <button class="routing-btn" type="button" onclick="MapViewer.setRouteEndpoint('destination', '${node.id}')">Set Destination</button>
                <button class="routing-btn" type="button" onclick="MapViewer.selectNode('${node.id}'); MapViewer.zoomToRoute(['${node.id}'])">Center World</button>
            </div>`;
    },

    renderSummary: () => {
        const summary = MapViewer.ui.summary;
        const itinerary = MapViewer.ui.itinerary;
        const { pathNodes, totalDistance, isHybrid, advisory } = MapViewer.routeState;
        if (!pathNodes.length) {
            summary.className = 'routing-summary empty';
            summary.innerHTML = `<h4>Route Summary</h4><p class="routing-kicker">No active course. Choose an origin and destination to generate an itinerary.</p>`;
            itinerary.classList.remove('active');
            itinerary.innerHTML = '';
            return;
        }

        const hopCount = Math.max(pathNodes.length - 1, 0);
        const averageLeg = hopCount > 0 ? totalDistance / hopCount : 0;
        const profile = hopCount <= 3 ? 'Direct' : hopCount <= 7 ? 'Mid-range' : 'Long-form';
        const originNode = MapViewer.nodeIndex[MapViewer.routeState.originId] || MapViewer.nodeIndex[pathNodes[0]];
        const destinationNode = MapViewer.nodeIndex[MapViewer.routeState.destinationId] || MapViewer.nodeIndex[pathNodes[pathNodes.length - 1]];

        summary.className = 'routing-summary';
        summary.innerHTML = `
            <h4>${Utils.escapeHtml(originNode?.name || 'Route')} to ${Utils.escapeHtml(destinationNode?.name || '')}</h4>
            <div class="routing-summary-grid">
                <div class="routing-stat">
                    <span class="routing-stat-label">Distance</span>
                    <span class="routing-stat-value">${MapViewer.formatDistance(totalDistance)}</span>
                </div>
                <div class="routing-stat">
                    <span class="routing-stat-label">Hops</span>
                    <span class="routing-stat-value">${hopCount}</span>
                </div>
                <div class="routing-stat">
                    <span class="routing-stat-label">Route Profile</span>
                    <span class="routing-stat-value">${profile}</span>
                </div>
                <div class="routing-stat">
                    <span class="routing-stat-label">Avg Leg</span>
                    <span class="routing-stat-value">${hopCount > 0 ? MapViewer.formatDistance(averageLeg) : 'N/A'}</span>
                </div>
            </div>
            <div class="routing-chip-row">
                <button class="routing-btn" type="button" onclick="MapViewer.focusActiveRoute()">Center Route</button>
                <button class="routing-btn" type="button" onclick="MapViewer.swapRoute()">Reverse Route</button>
            </div>
            ${isHybrid ? `<p class="routing-kicker" style="margin-top:0.85rem; color:#d9f7ff;">${Utils.escapeHtml(advisory)}</p>` : ''}`;
    },

    refreshNodeStates: () => {
        document.querySelectorAll('.map-node').forEach(el => {
            el.classList.remove('active', 'selected');
        });

        if (MapViewer.selectedNodeId) {
            const selectedEl = document.getElementById(MapViewer.selectedNodeId);
            if (selectedEl) selectedEl.classList.add('selected');
        }

        MapViewer.routeState.pathNodes.forEach(nid => {
            const el = document.getElementById(nid);
            if (el) el.classList.add('active');
        });
    },

    syncInputs: () => {
        const originNode = MapViewer.routeState.originId ? MapViewer.nodeIndex[MapViewer.routeState.originId] : null;
        const destinationNode = MapViewer.routeState.destinationId ? MapViewer.nodeIndex[MapViewer.routeState.destinationId] : null;
        if (MapViewer.ui.originInput) MapViewer.ui.originInput.value = originNode?.name || '';
        if (MapViewer.ui.destInput) MapViewer.ui.destInput.value = destinationNode?.name || '';
    },

    setStatus: (message, type = 'info') => {
        if (!MapViewer.ui.status) return;
        MapViewer.ui.status.textContent = message;
        MapViewer.ui.status.className = 'routing-status';
        if (type === 'error') MapViewer.ui.status.classList.add('is-error');
        if (type === 'success') MapViewer.ui.status.classList.add('is-success');
        if (type === 'warning') MapViewer.ui.status.classList.add('is-warning');
    },

    toggleLayer: (key) => {
        MapViewer.displayState[key] = !MapViewer.displayState[key];
        MapViewer.applyDisplayState();
    },

    applyDisplayState: () => {
        if (!MapViewer.viewer) return;
        MapViewer.viewer.classList.toggle('hide-labels', !MapViewer.displayState.showLabels);
        MapViewer.viewer.classList.toggle('hide-hyperlanes', !MapViewer.displayState.showHyperlanes);
        if (MapViewer.ui.labelsToggle) {
            MapViewer.ui.labelsToggle.classList.toggle('active', MapViewer.displayState.showLabels);
        }
        if (MapViewer.ui.hyperlanesToggle) {
            MapViewer.ui.hyperlanesToggle.classList.toggle('active', MapViewer.displayState.showHyperlanes);
        }
    },

    computeEdgeDistance: (edgeId) => {
        return MapViewer.edgeLengthIndex[edgeId] ?? 0;
    },

    computeTotalDistance: (pathEdges) => pathEdges.reduce((sum, edgeId) => sum + MapViewer.computeEdgeDistance(edgeId), 0),

    formatDistance: (value) => `${Math.round(value).toLocaleString()} u`,

    renderRouteOverlay: () => {
        const overlay = document.getElementById('map-route-overlay-group');
        if (!overlay) return;

        const overlayParts = [];
        const seenMarkers = new Set();
        MapViewer.routeState.offlaneSegments.forEach(segment => {
            if (!segment?.access) return;
            const node = MapViewer.nodeIndex[segment.nodeId];
            if (!node) return;

            const nodeY = MapViewer.mapHeight - node.y;
            const accessY = MapViewer.mapHeight - segment.access.y;
            
            // 1. Draw the primary off-lane dashed corridor
            if (segment.distance > 0) {
                overlayParts.push(`<path class="map-offlane" d="M ${node.x} ${nodeY} L ${segment.access.x} ${accessY}"></path>`);
            }

            // 2. FILL THE GAP: If intercepting mid-edge, draw a bridge to the routing node
            if (segment.access.kind === 'edge' && MapViewer.routeState.pathNodes.length > 0) {
                const entryNodeId = segment.role === 'origin' 
                    ? MapViewer.routeState.pathNodes[0] 
                    : MapViewer.routeState.pathNodes[MapViewer.routeState.pathNodes.length - 1];
                const entryNode = MapViewer.nodeIndex[entryNodeId];
                
                if (entryNode) {
                    const entryY = MapViewer.mapHeight - entryNode.y;
                    // Matches the visual style of the main glowing route, flowing correctly
                    const reverseClass = segment.role === 'destination' ? 'route-glow-reverse' : '';
                    overlayParts.push(`<path d="M ${segment.access.x} ${accessY} L ${entryNode.x} ${entryY}" class="map-edge route-glow ${reverseClass}" style="stroke-width: 5; fill: none; pointer-events: none;"></path>`);
                }
            }

            // 3. Draw Labels/Markers
            if (segment.distance > 0 || segment.access.kind === 'edge') {
                if (segment.distance > 0 || segment.access.kind === 'edge') {
                    const markerKey = `${segment.role}:${segment.access.x}:${segment.access.y}`;
                    if (!seenMarkers.has(markerKey)) {
                        seenMarkers.add(markerKey);
                        overlayParts.push(`<circle class="map-exit-marker" cx="${segment.access.x}" cy="${accessY}" r="12"></circle>`);
                        overlayParts.push(`<text class="map-exit-label" x="${segment.access.x + 22}" y="${accessY - 16}">${Utils.escapeHtml(segment.role === 'origin' ? 'Exit' : 'Approach')}</text>`);
                    }
                }
            }
        });

        overlay.innerHTML = overlayParts.join('');
    },

    focusActiveRoute: () => {
        if (!MapViewer.routeState.pathNodes.length) {
            MapViewer.setStatus('Plot a route first, then the navicomputer can frame it for you.', 'error');
            return;
        }
        MapViewer.zoomToRoute(Array.from(new Set([
            MapViewer.routeState.originId,
            ...MapViewer.routeState.pathNodes,
            MapViewer.routeState.destinationId
        ].filter(Boolean))));
    },

    resetView: () => {
        MapViewer.centerMap();
        MapViewer.setStatus(`View reset for ${MapViewer.currentMap.name}.`, 'info');
    },

    zoomToRoute: (pathNodes) => {
        if (pathNodes.length === 0) return;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        pathNodes.forEach(nid => {
            const n = MapViewer.nodeIndex[nid];
            if (n) {
                const flippedY = MapViewer.mapHeight - n.y;
                if (n.x < minX) minX = n.x;
                if (n.x > maxX) maxX = n.x;
                if (flippedY < minY) minY = flippedY;
                if (flippedY > maxY) maxY = flippedY;
            }
        });

        const padding = 200;
        minX -= padding;
        maxX += padding;
        minY -= padding;
        maxY += padding;
        const routeW = Math.max(maxX - minX, 120);
        const routeH = Math.max(maxY - minY, 120);

        const vw = MapViewer.viewer.clientWidth;
        const vh = MapViewer.viewer.clientHeight;

        const targetScale = Math.min(vw / routeW, vh / routeH, 3);
        const targetX = (vw / 2) - ((minX + routeW / 2) * targetScale);
        const targetY = (vh / 2) - ((minY + routeH / 2) * targetScale);

        const startScale = MapViewer.state.scale;
        const startX = MapViewer.state.x;
        const startY = MapViewer.state.y;

        const duration = 1200;
        const startTime = performance.now();
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const animate = (time) => {
            let progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            const eased = easeOutCubic(progress);

            MapViewer.state.scale = startScale + (targetScale - startScale) * eased;
            MapViewer.state.x = startX + (targetX - startX) * eased;
            MapViewer.state.y = startY + (targetY - startY) * eased;

            MapViewer.clamp();
            MapViewer.update();

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },

    zoomToNode: (nodeName) => {
        const node = MapViewer.findNodeByName(nodeName);
        if (node) {
            MapViewer.selectedNodeId = node.id;
            MapViewer.refreshNodeStates();
            MapViewer.renderNodeCard();
            MapViewer.zoomToRoute([node.id]);
        }
    },

    destroy: () => {
        if (MapViewer._abortController) {
            MapViewer._abortController.abort();
            MapViewer._abortController = null;
        }
        MapViewer.viewer = null;
        MapViewer.canvas = null;
        MapViewer.img = null;
        MapViewer.ui = {};
    },

    centerMap: () => {
        if (!MapViewer.img || !MapViewer.viewer) return;
        const vw = MapViewer.viewer.clientWidth;
        const vh = MapViewer.viewer.clientHeight;
        const iw = MapViewer.img.naturalWidth;
        const ih = MapViewer.img.naturalHeight;
        const scale = Math.min(vw / iw, vh / ih, 1);
        MapViewer.state.scale = scale;
        MapViewer.state.x = (vw - iw * scale) / 2;
        MapViewer.state.y = (vh - ih * scale) / 2;
        MapViewer.update();
    },

    update: () => {
        const { x, y, scale } = MapViewer.state;
        if (!MapViewer.canvas) return;
        MapViewer.canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    },

    clamp: () => {
        if (!MapViewer.viewer || !MapViewer.img) return;
        const vw = MapViewer.viewer.clientWidth;
        const vh = MapViewer.viewer.clientHeight;
        const w = MapViewer.img.naturalWidth * MapViewer.state.scale;
        const h = MapViewer.img.naturalHeight * MapViewer.state.scale;
        if (w <= vw) MapViewer.state.x = (vw - w) / 2;
        else MapViewer.state.x = Math.min(0, Math.max(MapViewer.state.x, vw - w));
        if (h <= vh) MapViewer.state.y = (vh - h) / 2;
        else MapViewer.state.y = Math.min(0, Math.max(MapViewer.state.y, vh - h));
    },

    zoom: (factor) => {
        const oldScale = MapViewer.state.scale;
        const newScale = Math.max(0.1, Math.min(oldScale * factor, 5));
        const vw = MapViewer.viewer.clientWidth;
        const vh = MapViewer.viewer.clientHeight;
        const cx = vw / 2;
        const cy = vh / 2;
        MapViewer.state.x = cx - (cx - MapViewer.state.x) * (newScale / oldScale);
        MapViewer.state.y = cy - (cy - MapViewer.state.y) * (newScale / oldScale);
        MapViewer.state.scale = newScale;
        MapViewer.clamp();
        MapViewer.update();
    },

    onWheel: (e) => {
        e.preventDefault();
        MapViewer.zoom(e.deltaY < 0 ? 1.1 : 0.9);
    },

    onPointerDown: (e) => {
        if (e.target.closest('.map-node') || e.target.closest('.map-edge')) {
            return;
        }
        if (e.isPrimary) {
            e.preventDefault();
            MapViewer.startDrag(e.clientX, e.clientY);
        }
    },

    onTouchStart: (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            MapViewer.state.isDragging = false;
            MapViewer.state.lastDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else {
            MapViewer.startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    },

    startDrag: (x, y) => {
        MapViewer.state.isDragging = true;
        MapViewer.state.startX = x - MapViewer.state.x;
        MapViewer.state.startY = y - MapViewer.state.y;
        MapViewer.viewer.classList.add('is-dragging');
    },

    onPointerMove: (e) => {
        if (MapViewer.state.isDragging && e.isPrimary) {
            e.preventDefault();
            MapViewer.state.pendingX = e.clientX;
            MapViewer.state.pendingY = e.clientY;
            MapViewer.scheduleDragTick();
        }
    },

    onTouchMove: (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (MapViewer.state.lastDist > 0) {
                MapViewer.zoom(dist / MapViewer.state.lastDist);
                MapViewer.state.lastDist = dist;
            }
        } else if (MapViewer.state.isDragging) {
            MapViewer.state.pendingX = e.touches[0].clientX;
            MapViewer.state.pendingY = e.touches[0].clientY;
            MapViewer.scheduleDragTick();
        }
    },

    scheduleDragTick: () => {
        if (!MapViewer.state.dragTicking) {
            requestAnimationFrame(() => {
                if (MapViewer.state.isDragging) {
                    MapViewer.doDrag(MapViewer.state.pendingX, MapViewer.state.pendingY);
                }
                MapViewer.state.dragTicking = false;
            });
            MapViewer.state.dragTicking = true;
        }
    },

    doDrag: (x, y) => {
        MapViewer.state.x = x - MapViewer.state.startX;
        MapViewer.state.y = y - MapViewer.state.startY;
        MapViewer.clamp();
        MapViewer.update();
    },

    onPointerUp: (e) => {
        if (e.isPrimary) {
            MapViewer.onUp();
        }
    },

    onUp: () => {
        MapViewer.state.isDragging = false;
        if (MapViewer.viewer) MapViewer.viewer.classList.remove('is-dragging');
    },

    onResize: () => {
        if (!MapViewer.viewer || !MapViewer.img) return;
        if (MapViewer.routeState.pathNodes.length > 0) {
            MapViewer.zoomToRoute(MapViewer.routeState.pathNodes);
        } else {
            MapViewer.clamp();
            MapViewer.update();
        }
    }
};
