import { CONF } from './config.js';
import { state } from './state.js';
import { paintOnAtlas, clearAtlas, autoPackIslands, updateMeshUVs } from './atlas.js';
import { recordHistory } from './history.js';
import { exportUVTexture, importUVTexture } from './io.js';

let uvCanvas, uvCtx;
let uvTextureInput; // Hidden file input for importing textures

// Setup the UV editor UI and events
export function setupUVEditor() {
    uvCanvas = document.getElementById('uv-canvas');
    uvCtx = uvCanvas.getContext('2d');
    
    // Create hidden file input for UV texture import
    uvTextureInput = document.createElement('input');
    uvTextureInput.type = 'file';
    uvTextureInput.accept = 'image/*';
    uvTextureInput.style.display = 'none';
    uvTextureInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await importUVTexture(file);
            } catch (err) {
                console.error('Failed to import UV texture:', err);
                alert('Failed to import texture. Please try again.');
            }
        }
        uvTextureInput.value = '';
    });
    document.body.appendChild(uvTextureInput);
    
    // Close button
    document.getElementById('btn-close-uv').addEventListener('click', closeUVEditor);
    
    // Tool buttons
    document.getElementById('uv-tool-paint').addEventListener('click', () => setUVTool('paint'));
    document.getElementById('uv-tool-move').addEventListener('click', () => setUVTool('move'));
    
    // Color palette
    const palette = document.getElementById('uv-color-palette');
    CONF.colors.forEach((color, i) => {
        const el = document.createElement('div');
        el.className = `color-swatch ${i === 10 ? 'active' : ''}`;
        el.style.backgroundColor = color;
        el.addEventListener('click', () => {
            palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            el.classList.add('active');
            state.uvPaintColor = color;
        });
        palette.appendChild(el);
    });
    
    // Brush size
    document.getElementById('brush-size').addEventListener('input', (e) => {
        state.uvBrushSize = parseInt(e.target.value);
        document.getElementById('brush-label').textContent = state.uvBrushSize;
    });
    
    // Grid snap
    document.getElementById('uv-grid-snap').addEventListener('change', (e) => {
        state.uvGridSnap = parseInt(e.target.value);
        if (state.uvEditorOpen) renderUVEditor();
    });
    
    // Action buttons
    document.getElementById('btn-auto-pack').addEventListener('click', () => {
        autoPackIslands();
        renderUVEditor();
    });
    
    document.getElementById('btn-fill-island').addEventListener('click', fillSelectedIsland);
    
    document.getElementById('btn-clear-atlas').addEventListener('click', () => {
        clearAtlas();
        renderUVEditor();
    });
    
    // Export/Import UV texture buttons
    document.getElementById('btn-export-uv').addEventListener('click', exportUVTexture);
    document.getElementById('btn-import-uv').addEventListener('click', () => uvTextureInput.click());
    
    // Canvas events
    uvCanvas.addEventListener('mousedown', onUVMouseDown);
    uvCanvas.addEventListener('mousemove', onUVMouseMove);
    uvCanvas.addEventListener('mouseup', onUVMouseUp);
    uvCanvas.addEventListener('mouseleave', onUVMouseUp);
}

function setUVTool(tool) {
    state.uvTool = tool;
    document.getElementById('uv-tool-paint').className = 
        `flex-1 py-2 px-3 text-xs rounded font-medium ${tool === 'paint' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`;
    document.getElementById('uv-tool-move').className = 
        `flex-1 py-2 px-3 text-xs rounded font-medium ${tool === 'move' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`;
    uvCanvas.style.cursor = tool === 'paint' ? 'crosshair' : 'grab';
}

export function openUVEditor() {
    state.uvEditorOpen = true;
    document.getElementById('uv-editor-panel').classList.remove('hidden');
    renderUVEditor();
    updateIslandList();
}

export function closeUVEditor() {
    state.uvEditorOpen = false;
    document.getElementById('uv-editor-panel').classList.add('hidden');
    recordHistory();
}

export function renderUVEditor() {
    if (!uvCtx) return;
    
    uvCtx.imageSmoothingEnabled = false;
    
    // Draw checkered background
    const checkSize = 16;
    for (let y = 0; y < CONF.atlasSize; y += checkSize) {
        for (let x = 0; x < CONF.atlasSize; x += checkSize) {
            uvCtx.fillStyle = ((x + y) / checkSize) % 2 === 0 ? '#e5e7eb' : '#f3f4f6';
            uvCtx.fillRect(x, y, checkSize, checkSize);
        }
    }
    
    // Draw atlas texture
    uvCtx.drawImage(state.sharedAtlasCanvas, 0, 0);
    
    // Draw grid overlay
    uvCtx.strokeStyle = 'rgba(0,0,0,0.08)';
    uvCtx.lineWidth = 1;
    for (let i = 0; i <= CONF.atlasSize; i += state.uvGridSnap) {
        uvCtx.beginPath();
        uvCtx.moveTo(i, 0);
        uvCtx.lineTo(i, CONF.atlasSize);
        uvCtx.moveTo(0, i);
        uvCtx.lineTo(CONF.atlasSize, i);
        uvCtx.stroke();
    }
    
    // Draw UV islands
    state.objects.forEach((obj, idx) => {
        if (!obj.userData.uvBounds) return;
        
        const b = obj.userData.uvBounds;
        const isSelected = obj === state.selectedUVIsland;
        
        // Island bounding box
        uvCtx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(0,0,0,0.5)';
        uvCtx.lineWidth = isSelected ? 3 : 1;
        uvCtx.setLineDash(isSelected ? [] : [4, 4]);
        uvCtx.strokeRect(b.x, b.y, b.width, b.height);
        uvCtx.setLineDash([]);
        
        // Shape outline within island
        if (obj.userData.uvShape && obj.userData.uvShape.length > 0) {
            uvCtx.strokeStyle = isSelected ? '#2563eb' : '#666';
            uvCtx.lineWidth = 2;
            uvCtx.beginPath();
            
            obj.userData.uvShape.forEach((pt, i) => {
                const px = b.x + pt.u * b.width;
                const py = b.y + (1 - pt.v) * b.height;  // Flip V for canvas (Y down)
                if (i === 0) uvCtx.moveTo(px, py);
                else uvCtx.lineTo(px, py);
            });
            
            uvCtx.closePath();
            uvCtx.stroke();
        }
        
        // Label
        uvCtx.fillStyle = isSelected ? '#1d4ed8' : '#374151';
        uvCtx.font = 'bold 11px sans-serif';
        uvCtx.fillText(`${idx + 1}`, b.x + 4, b.y + 14);
    });
}

function updateIslandList() {
    const list = document.getElementById('uv-island-list');
    list.innerHTML = '';
    
    state.objects.forEach((obj, idx) => {
        const item = document.createElement('div');
        item.className = `uv-island-item ${obj === state.selectedUVIsland ? 'selected' : ''}`;
        
        const colorDot = document.createElement('div');
        colorDot.className = 'w-3 h-3 rounded-full';
        colorDot.style.backgroundColor = obj === state.selectedUVIsland ? '#3b82f6' : '#94a3b8';
        
        const label = document.createElement('span');
        label.textContent = `Shape ${idx + 1}`;
        
        item.appendChild(colorDot);
        item.appendChild(label);
        item.addEventListener('click', () => {
            state.selectedUVIsland = obj;
            renderUVEditor();
            updateIslandList();
        });
        
        list.appendChild(item);
    });
}

function onUVMouseDown(e) {
    const rect = uvCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * CONF.atlasSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * CONF.atlasSize);
    
    if (state.uvTool === 'paint') {
        state.uvIsPainting = true;
        paintOnAtlas(x, y);
        renderUVEditor();
    } else if (state.uvTool === 'move') {
        // Find clicked island
        for (let i = state.objects.length - 1; i >= 0; i--) {
            const obj = state.objects[i];
            if (!obj.userData.uvBounds) continue;
            
            const b = obj.userData.uvBounds;
            if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
                state.selectedUVIsland = obj;
                state.uvIsDragging = true;
                state.uvDragStart = { x, y };
                state.uvDragIslandStart = { x: b.x, y: b.y };
                uvCanvas.style.cursor = 'grabbing';
                renderUVEditor();
                updateIslandList();
                return;
            }
        }
        
        state.selectedUVIsland = null;
        renderUVEditor();
        updateIslandList();
    }
}

function onUVMouseMove(e) {
    const rect = uvCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * CONF.atlasSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * CONF.atlasSize);
    
    if (state.uvTool === 'paint' && state.uvIsPainting) {
        paintOnAtlas(x, y);
        renderUVEditor();
    } else if (state.uvTool === 'move' && state.uvIsDragging && state.selectedUVIsland) {
        const dx = x - state.uvDragStart.x;
        const dy = y - state.uvDragStart.y;
        moveUVIsland(state.uvDragIslandStart.x + dx, state.uvDragIslandStart.y + dy);
    }
}

function onUVMouseUp() {
    if (state.uvIsPainting) {
        state.uvIsPainting = false;
        state.sharedAtlasTexture.needsUpdate = true;
    }
    
    if (state.uvIsDragging) {
        state.uvIsDragging = false;
        uvCanvas.style.cursor = state.uvTool === 'move' ? 'grab' : 'crosshair';
    }
}

function moveUVIsland(newX, newY) {
    if (!state.selectedUVIsland || !state.selectedUVIsland.userData.uvBounds) return;
    
    const b = state.selectedUVIsland.userData.uvBounds;
    
    // Snap to grid
    newX = Math.round(newX / state.uvGridSnap) * state.uvGridSnap;
    newY = Math.round(newY / state.uvGridSnap) * state.uvGridSnap;
    
    // Clamp to atlas bounds
    newX = Math.max(0, Math.min(CONF.atlasSize - b.width, newX));
    newY = Math.max(0, Math.min(CONF.atlasSize - b.height, newY));
    
    b.x = newX;
    b.y = newY;
    
    updateMeshUVs(state.selectedUVIsland);
    renderUVEditor();
}

function fillSelectedIsland() {
    if (!state.selectedUVIsland || !state.selectedUVIsland.userData.uvBounds) return;
    
    const b = state.selectedUVIsland.userData.uvBounds;
    const ctx = state.sharedAtlasCanvas.getContext('2d');
    ctx.fillStyle = state.uvPaintColor;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    
    state.sharedAtlasTexture.needsUpdate = true;
    renderUVEditor();
}
