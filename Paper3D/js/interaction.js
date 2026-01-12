import * as THREE from 'three';
import { CONF, MODES, SNAP_THRESHOLD } from './config.js';
import { state } from './state.js';
import { createCardboardShape, createFillShape, disposeObject } from './shapes.js';
import { recordHistory, undo, redo } from './history.js';
import { closeUVEditor } from './uv-editor.js';

// Get snapped pointer position on the grid plane
export function getSnappedPointer() {
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    state.raycaster.ray.intersectPlane(plane, target);
    
    if (target) {
        target.x = Math.round(target.x / CONF.snapUnit) * CONF.snapUnit;
        target.z = Math.round(target.z / CONF.snapUnit) * CONF.snapUnit;
        target.y = 0.02;
        return target;
    }
    return null;
}

// Get world snap points for an object
export function getWorldSnapPoints(obj) {
    if (!obj.userData.snapPoints) return [];
    
    const points = obj.userData.snapPoints.map(p => p.clone());
    obj.updateMatrixWorld();
    points.forEach(p => p.applyMatrix4(obj.matrixWorld));
    return points;
}

// Get vertex snap pointer (snapping to existing shape vertices)
export function getVertexSnapPointer() {
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObjects(state.objects, false);
    
    if (intersects.length === 0) return null;
    
    const hit = intersects[0];
    const snapPoints = getWorldSnapPoints(hit.object);
    
    let bestP = null;
    let minD = 0.5;
    
    for (const p of snapPoints) {
        const dist = p.distanceTo(hit.point);
        if (dist < minD) {
            minD = dist;
            bestP = p;
        }
    }
    
    return bestP;
}

// Handle pointer down event
export function onPointerDown(event) {
    if (event.target.closest('button') ||
        event.target.closest('.tool-panel') ||
        event.target.closest('#transform-info') ||
        event.target.closest('#uv-editor-panel')) {
        return;
    }

    if (state.currentMode === MODES.DRAW) {
        if (event.button === 0) {
            const snapPt = getSnappedPointer();
            if (snapPt) handleDrawClick(snapPt);
        }
    } else if (state.currentMode === MODES.FILL) {
        if (event.button === 0) {
            const snapPt = getVertexSnapPointer();
            if (snapPt) handleFillClick(snapPt);
        }
    } else {
        if (state.transformer.dragging) return;
        
        state.raycaster.setFromCamera(state.pointer, state.camera);
        
        const intersectables = [...state.objects];
        if (state.worldAnchor.visible) {
            intersectables.push(state.worldAnchor);
        }
        
        const intersects = state.raycaster.intersectObjects(intersectables, false);
        
        if (event.button === 0) {
            if (intersects.length > 0) {
                selectObject(intersects[0].object);
            } else {
                selectObject(null);
            }
        }
    }
}

// Handle pointer move event
export function onPointerMove(event) {
    state.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (state.currentMode === MODES.DRAW) {
        const snapPt = getSnappedPointer();
        if (snapPt) {
            state.drawCursorMesh.position.copy(snapPt);
            state.drawCursorMesh.visible = true;
            
            if (state.isDrawing) {
                updateDrawingVisuals(snapPt);
            }
            
            if (state.drawPoints.length > 2) {
                const dist = snapPt.distanceTo(state.drawPoints[0]);
                if (dist < 0.3) {
                    state.drawStartMarker.scale.setScalar(1.5);
                    state.drawCursorMesh.material.color.setHex(0x10b981);
                } else {
                    state.drawStartMarker.scale.setScalar(1);
                    state.drawCursorMesh.material.color.setHex(CONF.drawLineColor);
                }
            }
        } else {
            state.drawCursorMesh.visible = false;
        }
    } else if (state.currentMode === MODES.FILL) {
        const snapPt = getVertexSnapPointer();
        if (snapPt) {
            state.fillMarkerMesh.position.copy(snapPt);
            state.fillMarkerMesh.visible = true;
        } else {
            state.fillMarkerMesh.visible = false;
        }
    }
}

// Handle keyboard input
export function onKeyDown(event) {
    if (event.target.tagName === 'INPUT') return;
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
    }
    
    if (event.key === 'Escape') {
        if (state.uvEditorOpen) {
            closeUVEditor();
        } else if (state.currentMode === MODES.DRAW) {
            resetDrawing();
        } else if (state.currentMode === MODES.FILL) {
            resetFill();
        } else {
            selectObject(null);
        }
    }
    
    if (event.key.toLowerCase() === 'w' && state.currentMode === MODES.BUILD) {
        state.transformer.setMode('translate');
    }
    
    if (event.key.toLowerCase() === 'e' && state.currentMode === MODES.BUILD) {
        state.transformer.setMode('rotate');
    }
}

// Handle context menu (right-click)
export function onContextMenu(event) {
    if (state.currentMode !== MODES.BUILD) return;
    
    event.preventDefault();
    
    state.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObjects(state.objects, false);
    
    if (intersects.length > 0) {
        selectObject(intersects[0].object);
        
        const menu = document.getElementById('context-menu');
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        menu.classList.remove('hidden');
        
        setTimeout(() => menu.classList.remove('scale-95', 'opacity-0'), 10);
    }
}

// Hide context menu
export function hideContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu.classList.contains('hidden')) {
        menu.classList.add('scale-95', 'opacity-0');
        setTimeout(() => menu.classList.add('hidden'), 100);
    }
}

// Select an object
export function selectObject(obj) {
    state.selectedObject = obj;
    const infoPanel = document.getElementById('transform-info');
    
    if (state.currentMode === MODES.BUILD) {
        if (obj) {
            state.transformer.attach(obj);
            infoPanel.classList.remove('hidden');
            updateTransformUI();
        } else {
            state.transformer.detach();
            infoPanel.classList.add('hidden');
        }
    } else if (state.currentMode === MODES.PAINT) {
        state.transformer.detach();
        infoPanel.classList.add('hidden');
        state.selectedUVIsland = obj;
    }
}

// Update transform UI inputs
export function updateTransformUI() {
    if (!state.selectedObject) return;
    if (document.activeElement.classList.contains('transform-input')) return;
    
    const p = state.selectedObject.position;
    const r = state.selectedObject.rotation;
    const s = state.selectedObject.scale;
    
    const toDeg = (rad) => parseFloat((rad * (180 / Math.PI)).toFixed(1));
    const fmt = (num) => parseFloat(num.toFixed(2));
    
    document.getElementById('inp-pos-x').value = fmt(p.x);
    document.getElementById('inp-pos-y').value = fmt(p.y);
    document.getElementById('inp-pos-z').value = fmt(p.z);
    document.getElementById('inp-rot-x').value = toDeg(r.x);
    document.getElementById('inp-rot-y').value = toDeg(r.y);
    document.getElementById('inp-rot-z').value = toDeg(r.z);
    document.getElementById('inp-scl-x').value = fmt(s.x);
    document.getElementById('inp-scl-y').value = fmt(s.y);
    document.getElementById('inp-scl-z').value = fmt(s.z);
}

// Apply transform from UI inputs
export function applyTransformFromUI() {
    if (!state.selectedObject) return;
    
    const px = parseFloat(document.getElementById('inp-pos-x').value) || 0;
    const py = parseFloat(document.getElementById('inp-pos-y').value) || 0;
    const pz = parseFloat(document.getElementById('inp-pos-z').value) || 0;
    const rx = parseFloat(document.getElementById('inp-rot-x').value) || 0;
    const ry = parseFloat(document.getElementById('inp-rot-y').value) || 0;
    const rz = parseFloat(document.getElementById('inp-rot-z').value) || 0;
    const sx = parseFloat(document.getElementById('inp-scl-x').value) || 1;
    const sy = parseFloat(document.getElementById('inp-scl-y').value) || 1;
    const sz = parseFloat(document.getElementById('inp-scl-z').value) || 1;
    
    state.selectedObject.position.set(px, py, pz);
    state.selectedObject.rotation.set(rx * (Math.PI / 180), ry * (Math.PI / 180), rz * (Math.PI / 180));
    state.selectedObject.scale.set(sx, sy, sz);
}

// Find best snap point between objects
export function findBestSnap() {
    if (!state.selectedObject || state.selectedObject.userData.isAnchor) {
        return null;
    }
    
    const myPoints = getWorldSnapPoints(state.selectedObject);
    let closestDist = SNAP_THRESHOLD;
    let snapDelta = null;
    let snapStart = null;
    let snapEnd = null;
    
    for (const other of state.objects) {
        if (other === state.selectedObject) continue;
        
        const otherPoints = getWorldSnapPoints(other);
        
        for (const myP of myPoints) {
            for (const otherP of otherPoints) {
                const dist = myP.distanceTo(otherP);
                if (dist < closestDist) {
                    closestDist = dist;
                    snapDelta = new THREE.Vector3().subVectors(otherP, myP);
                    snapStart = myP;
                    snapEnd = otherP;
                }
            }
        }
    }
    
    if (snapDelta) {
        return { delta: snapDelta, start: snapStart, end: snapEnd };
    }
    return null;
}

// Perform snap after dragging
export function performSnap() {
    const snap = findBestSnap();
    if (snap) {
        state.selectedObject.position.add(snap.delta);
        state.snapLine.visible = false;
        updateTransformUI();
    }
}

// Preview snap line while dragging
export function previewSnap() {
    const snap = findBestSnap();
    if (snap) {
        state.snapLine.geometry.setFromPoints([snap.start, snap.end]);
        state.snapLine.visible = true;
    } else {
        state.snapLine.visible = false;
    }
}

// Handle draw mode click
function handleDrawClick(point) {
    document.getElementById('draw-guide').classList.remove('visible');
    
    if (state.drawPoints.length > 2) {
        if (point.distanceTo(state.drawPoints[0]) < 0.3) {
            finishShape();
            return;
        }
    }
    
    state.drawPoints.push(point);
    state.isDrawing = true;
    updateDrawingVisuals(point);
}

// Finish drawing and create shape
function finishShape() {
    if (state.drawPoints.length < 3) return;
    
    const mesh = createCardboardShape(state.drawPoints);
    resetDrawing();
    
    import('./ui.js').then(m => m.switchMode(MODES.BUILD));
    selectObject(mesh);
    recordHistory();
}

// Reset drawing state
export function resetDrawing() {
    state.drawPoints = [];
    state.isDrawing = false;
    state.drawLineMesh.visible = false;
    state.drawStartMarker.visible = false;
    
    if (state.currentMode === MODES.DRAW) {
        document.getElementById('draw-guide').classList.add('visible');
    }
}

// Update drawing visuals
function updateDrawingVisuals(currentPoint) {
    if (!state.isDrawing && state.drawPoints.length === 0) return;
    
    const points = [...state.drawPoints];
    if (currentPoint) points.push(currentPoint);
    
    state.drawLineMesh.geometry.setFromPoints(points);
    state.drawLineMesh.visible = true;
    
    if (state.drawPoints.length > 0) {
        state.drawStartMarker.position.copy(state.drawPoints[0]);
        state.drawStartMarker.position.y = 0.02;
        state.drawStartMarker.visible = true;
    }
}

// Handle fill mode click
function handleFillClick(point) {
    document.getElementById('fill-guide').classList.remove('visible');
    
    for (const p of state.fillPoints) {
        if (p.distanceTo(point) < 0.01) return;
    }
    
    state.fillPoints.push(point);
    
    const marker = state.fillMarkerMesh.clone();
    marker.position.copy(point);
    marker.visible = true;
    marker.material = marker.material.clone();
    marker.material.color.setHex(0x00ffff);
    state.scene.add(marker);
    state.fillSelectedMarkers.push(marker);
    
    if (state.fillPoints.length === 3) {
        const mesh = createFillShape(state.fillPoints[0], state.fillPoints[1], state.fillPoints[2]);
        resetFill();
        
        import('./ui.js').then(m => m.switchMode(MODES.BUILD));
        selectObject(mesh);
        recordHistory();
    }
}

// Reset fill state
export function resetFill() {
    state.fillPoints = [];
    state.fillSelectedMarkers.forEach(m => state.scene.remove(m));
    state.fillSelectedMarkers = [];
    state.fillMarkerMesh.visible = false;
    
    if (state.currentMode === MODES.FILL) {
        document.getElementById('fill-guide').classList.add('visible');
    }
}

// Delete selected object
export function deleteSelected() {
    if (state.selectedObject && !state.selectedObject.userData.isAnchor) {
        state.transformer.detach();
        state.objects = state.objects.filter(o => o !== state.selectedObject);
        disposeObject(state.selectedObject);
        state.selectedObject = null;
        document.getElementById('transform-info').classList.add('hidden');
        recordHistory();
        hideContextMenu();
    }
}

// Duplicate selected object
export function duplicateSelected() {
    if (!state.selectedObject || state.selectedObject.userData.isAnchor) return;
    
    const original = state.selectedObject;
    const conf = original.userData.geometryConfig;
    let clone;
    
    if (conf.type === 'cardboard') {
        const points = conf.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        clone = createCardboardShape(points, true);
    } else if (conf.type === 'fill') {
        const pts = conf.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        clone = createFillShape(pts[0], pts[1], pts[2], true);
    }
    
    if (clone) {
        clone.position.copy(original.position).addScalar(1);
        clone.rotation.copy(original.rotation);
        clone.scale.copy(original.scale);
        state.scene.add(clone);
        state.objects.push(clone);
        selectObject(clone);
        recordHistory();
    }
    
    hideContextMenu();
}

// Toggle anchor visibility
export function toggleAnchorVisibility() {
    state.worldAnchor.visible = !state.worldAnchor.visible;
    
    const btn = document.getElementById('btn-toggle-anchor');
    btn.classList.toggle('text-slate-300', !state.worldAnchor.visible);
    btn.classList.toggle('text-slate-500', state.worldAnchor.visible);
    
    if (!state.worldAnchor.visible && state.selectedObject === state.worldAnchor) {
        selectObject(null);
    }
}
