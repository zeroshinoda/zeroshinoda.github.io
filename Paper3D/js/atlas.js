import * as THREE from 'three';
import { CONF } from './config.js';
import { state } from './state.js';

// Initialize the shared texture atlas
export function initSharedAtlas() {
    state.sharedAtlasCanvas = document.createElement('canvas');
    state.sharedAtlasCanvas.width = CONF.atlasSize;
    state.sharedAtlasCanvas.height = CONF.atlasSize;
    
    const ctx = state.sharedAtlasCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CONF.atlasSize, CONF.atlasSize);
    
    state.sharedAtlasTexture = new THREE.CanvasTexture(state.sharedAtlasCanvas);
    state.sharedAtlasTexture.magFilter = THREE.NearestFilter;
    state.sharedAtlasTexture.minFilter = THREE.NearestFilter;
    state.sharedAtlasTexture.colorSpace = THREE.SRGBColorSpace;
}

// Find available space in the atlas for a new island
export function findAtlasSpace(width, height) {
    const padding = CONF.islandPadding;
    const gridSnap = state.uvGridSnap || 16;
    
    for (let y = padding; y < CONF.atlasSize - height - padding; y += gridSnap) {
        for (let x = padding; x < CONF.atlasSize - width - padding; x += gridSnap) {
            let overlaps = false;
            
            for (const obj of state.objects) {
                if (!obj.userData.uvBounds) continue;
                const b = obj.userData.uvBounds;
                
                if (x < b.x + b.width + padding &&
                    x + width + padding > b.x &&
                    y < b.y + b.height + padding &&
                    y + height + padding > b.y) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) return { x, y };
        }
    }
    
    return { x: padding, y: padding };
}

// Update mesh UVs when island is moved in the atlas
export function updateMeshUVs(mesh) {
    if (!mesh || !mesh.userData.uvBounds) return;
    
    const uvBounds = mesh.userData.uvBounds;
    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;
    
    // We need to recalculate UVs based on the geometry's vertex positions
    // The geometry has been rotated, so we need to work in the original 2D space
    
    // For cardboard shapes: geometry was created in XY, then rotated to XZ
    // The original positions were in the Shape's coordinate system
    // We stored the bbox info in userData.shapeBBox
    
    const shapeBBox = mesh.userData.shapeBBox;
    if (!shapeBBox) return;
    
    // Get the inverse of the geometry's rotation to get back to 2D coords
    // For cardboard: rotateX(PI/2) means (x, y, z) came from (x, -z, y) in original
    // For fill shapes, the geometry wasn't rotated in the same way
    
    const geomType = mesh.userData.geometryConfig?.type;
    
    for (let i = 0; i < posAttr.count; i++) {
        let localU, localV;
        
        if (geomType === 'cardboard') {
            // After rotateX(PI/2): original (x, y, 0) -> (x, 0, y)
            // local coords are centered, so range is -width/2 to +width/2
            // Flip U to match UV editor orientation
            const px = posAttr.getX(i);
            const pz = posAttr.getZ(i);
            
            localU = 1.0 - (px / shapeBBox.width + 0.5);
            localV = pz / shapeBBox.height + 0.5;
        } else {
            // Fill shape - geometry uses its own coordinate system
            const px = posAttr.getX(i);
            const py = posAttr.getY(i);
            
            localU = 1.0 - (px / shapeBBox.width + 0.5);
            localV = py / shapeBBox.height + 0.5;
        }
        
        // Clamp to valid range
        localU = Math.max(0, Math.min(1, localU));
        localV = Math.max(0, Math.min(1, localV));
        
        // Map to atlas coordinates
        const atlasU = (uvBounds.x + localU * uvBounds.width) / CONF.atlasSize;
        const atlasV = 1.0 - (uvBounds.y + (1.0 - localV) * uvBounds.height) / CONF.atlasSize;
        
        uvAttr.setXY(i, atlasU, atlasV);
    }
    
    uvAttr.needsUpdate = true;
}

// Paint on the atlas
export function paintOnAtlas(x, y) {
    const ctx = state.sharedAtlasCanvas.getContext('2d');
    ctx.fillStyle = state.uvPaintColor;
    
    const half = Math.floor(state.uvBrushSize / 2);
    for (let dy = -half; dy < state.uvBrushSize - half; dy++) {
        for (let dx = -half; dx < state.uvBrushSize - half; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < CONF.atlasSize && py >= 0 && py < CONF.atlasSize) {
                ctx.fillRect(px, py, 1, 1);
            }
        }
    }
    
    state.sharedAtlasTexture.needsUpdate = true;
}

// Clear the atlas
export function clearAtlas() {
    const ctx = state.sharedAtlasCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CONF.atlasSize, CONF.atlasSize);
    state.sharedAtlasTexture.needsUpdate = true;
}

// Auto-pack all UV islands
export function autoPackIslands() {
    const padding = CONF.islandPadding;
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;
    
    // Sort by height for better packing
    const sorted = [...state.objects]
        .filter(o => o.userData.uvBounds)
        .sort((a, b) => b.userData.uvBounds.height - a.userData.uvBounds.height);
    
    for (const obj of sorted) {
        const b = obj.userData.uvBounds;
        
        if (currentX + b.width + padding > CONF.atlasSize) {
            currentX = padding;
            currentY += rowHeight + padding;
            rowHeight = 0;
        }
        
        b.x = currentX;
        b.y = currentY;
        
        currentX += b.width + padding;
        rowHeight = Math.max(rowHeight, b.height);
        
        updateMeshUVs(obj);
    }
}
