import * as THREE from 'three';
import { MODES } from './config.js';

// Application state - single source of truth
export const state = {
    // Current mode
    currentMode: MODES.BUILD,
    
    // Three.js core objects (set during init)
    scene: null,
    camera: null,
    renderer: null,
    orbit: null,
    transformer: null,
    raycaster: null,
    pointer: new THREE.Vector2(),
    gridHelper: null,
    
    // Camera state for mode switching
    savedCameraPos: new THREE.Vector3(10, 10, 10),
    savedTarget: new THREE.Vector3(0, 0, 0),
    
    // Drawing state
    drawPoints: [],
    drawLineMesh: null,
    drawCursorMesh: null,
    drawStartMarker: null,
    isDrawing: false,
    
    // Scene objects
    objects: [],
    selectedObject: null,
    worldAnchor: null,
    
    // Snap helpers
    snapLine: null,
    
    // Fill mode state
    fillPoints: [],
    fillMarkerMesh: null,
    fillSelectedMarkers: [],
    
    // Shared texture atlas
    sharedAtlasCanvas: null,
    sharedAtlasTexture: null,
    
    // UV Editor state
    uvEditorOpen: false,
    uvTool: 'paint',
    uvPaintColor: '#000000',
    uvBrushSize: 1,
    uvGridSnap: 16,
    selectedUVIsland: null,
    uvIsPainting: false,
    uvIsDragging: false,
    uvDragStart: { x: 0, y: 0 },
    uvDragIslandStart: { x: 0, y: 0 },
    
    // History for undo/redo
    history: [],
    historyIndex: -1
};
