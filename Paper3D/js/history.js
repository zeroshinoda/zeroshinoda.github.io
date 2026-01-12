import * as THREE from 'three';
import { MAX_HISTORY, CONF } from './config.js';
import { state } from './state.js';
import { createCardboardShape, createFillShape, disposeObject } from './shapes.js';
import { updateMeshUVs } from './atlas.js';

// Serialize the current scene state
export function serializeScene() {
    return {
        objects: state.objects.map(obj => ({
            transform: {
                position: obj.position.toArray(),
                rotation: obj.rotation.toArray(),
                scale: obj.scale.toArray()
            },
            geometryConfig: obj.userData.geometryConfig,
            uvBounds: obj.userData.uvBounds,
            uvShape: obj.userData.uvShape,
            snapPoints: obj.userData.snapPoints.map(p => ({ x: p.x, y: p.y, z: p.z }))
        })),
        atlasData: state.sharedAtlasCanvas.toDataURL()
    };
}

// Deserialize and restore a scene state
export function deserializeScene(data) {
    clearSceneInternal();
    
    // Restore atlas texture
    if (data.atlasData) {
        const img = new Image();
        img.onload = () => {
            const ctx = state.sharedAtlasCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            state.sharedAtlasTexture.needsUpdate = true;
        };
        img.src = data.atlasData;
    }
    
    // Handle both old format (array) and new format (object with objects array)
    const objData = data.objects || data;
    
    for (const item of objData) {
        const conf = item.geometryConfig;
        let mesh;
        
        if (conf.type === 'cardboard') {
            const points = conf.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
            mesh = createCardboardShape(points, true);
        } else if (conf.type === 'fill') {
            const pts = conf.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
            mesh = createFillShape(pts[0], pts[1], pts[2], true);
        }
        
        if (mesh) {
            mesh.position.fromArray(item.transform.position);
            mesh.rotation.fromArray(item.transform.rotation);
            mesh.scale.fromArray(item.transform.scale);
            
            // Restore UV data
            if (item.uvBounds) {
                mesh.userData.uvBounds = item.uvBounds;
                mesh.userData.uvShape = item.uvShape;
                updateMeshUVs(mesh);
            }
            
            state.scene.add(mesh);
            state.objects.push(mesh);
        }
    }
}

// Internal clear without recording history
function clearSceneInternal() {
    state.transformer.detach();
    state.objects.forEach(o => disposeObject(o));
    state.objects = [];
    state.selectedObject = null;
    document.getElementById('transform-info').classList.add('hidden');
}

// Record current state to history
export function recordHistory() {
    // Remove any redo history
    if (state.historyIndex < state.history.length - 1) {
        state.history.splice(state.historyIndex + 1);
    }
    
    state.history.push(serializeScene());
    
    // Limit history size
    if (state.history.length > MAX_HISTORY + 1) {
        state.history.shift();
    } else {
        state.historyIndex++;
    }
    
    updateUndoRedoUI();
}

// Undo last action
export function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        deserializeScene(state.history[state.historyIndex]);
        updateUndoRedoUI();
    }
}

// Redo last undone action
export function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        deserializeScene(state.history[state.historyIndex]);
        updateUndoRedoUI();
    }
}

// Update undo/redo button states
export function updateUndoRedoUI() {
    document.getElementById('btn-undo').disabled = state.historyIndex <= 0;
    document.getElementById('btn-redo').disabled = state.historyIndex >= state.history.length - 1;
}

// Clear the entire scene
export function clearScene(record = true) {
    clearSceneInternal();
    if (record) recordHistory();
}
