import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { CONF } from './config.js';
import { state } from './state.js';
import { serializeScene, deserializeScene, recordHistory } from './history.js';
import { renderUVEditor } from './uv-editor.js';

// Export UV texture with wireframe guides as PNG
export function exportUVTexture() {
    const exportSize = 1024;
    const scale = exportSize / CONF.atlasSize;
    
    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');
    
    // Disable smoothing for pixel-perfect scaling
    ctx.imageSmoothingEnabled = false;
    
    // Draw the atlas texture scaled up
    ctx.drawImage(state.sharedAtlasCanvas, 0, 0, exportSize, exportSize);
    
    // Draw wireframe guides for each shape
    ctx.strokeStyle = '#ff00ff';  // Magenta for visibility
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    for (let idx = 0; idx < state.objects.length; idx++) {
        const obj = state.objects[idx];
        if (!obj.userData.uvBounds || !obj.userData.uvShape) continue;
        
        const b = obj.userData.uvBounds;
        
        // Draw bounding box
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(
            b.x * scale,
            b.y * scale,
            b.width * scale,
            b.height * scale
        );
        
        // Draw shape outline (wireframe)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        
        obj.userData.uvShape.forEach((pt, i) => {
            const px = (b.x + pt.u * b.width) * scale;
            const py = (b.y + (1 - pt.v) * b.height) * scale;  // Flip V for canvas
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        });
        
        ctx.closePath();
        ctx.stroke();
        
        // Draw vertex markers
        ctx.fillStyle = '#00ffff';  // Cyan dots at vertices
        obj.userData.uvShape.forEach((pt) => {
            const px = (b.x + pt.u * b.width) * scale;
            const py = (b.y + (1 - pt.v) * b.height) * scale;
            
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw shape label
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`Shape ${idx + 1}`, b.x * scale + 8, b.y * scale + 20);
    }
    
    // Download the image
    const link = document.createElement('a');
    link.download = 'uv_texture_guide.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

// Import UV texture from image file
export function importUVTexture(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const ctx = state.sharedAtlasCanvas.getContext('2d');
                
                // Clear and draw the imported image, scaling to atlas size
                ctx.clearRect(0, 0, CONF.atlasSize, CONF.atlasSize);
                ctx.drawImage(img, 0, 0, CONF.atlasSize, CONF.atlasSize);
                
                state.sharedAtlasTexture.needsUpdate = true;
                
                if (state.uvEditorOpen) {
                    renderUVEditor();
                }
                
                recordHistory();
                resolve();
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Save project to JSON file
export function saveProject() {
    const projectData = serializeScene();
    const json = JSON.stringify(projectData);
    const blob = new Blob([json], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cardboard_project.json';
    link.click();
}

// Load project from JSON string
export function loadProject(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        deserializeScene(data);
        recordHistory();
    } catch (err) {
        console.error("Failed to load project:", err);
        alert("Error loading project file.");
    }
}

// Export scene to GLTF format
export function exportGLTF() {
    const exporter = new GLTFExporter();
    const anchorPos = state.worldAnchor.position.clone();
    const exportScene = new THREE.Scene();

    // Clone objects and adjust positions relative to anchor
    for (const obj of state.objects) {
        const clone = obj.clone();
        clone.position.sub(anchorPos);

        // Create high-res texture
        const highResCanvas = document.createElement('canvas');
        highResCanvas.width = 1024;
        highResCanvas.height = 1024;
        const ctx = highResCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(state.sharedAtlasCanvas, 0, 0, 1024, 1024);
        
        const newTex = new THREE.CanvasTexture(highResCanvas);
        newTex.colorSpace = THREE.SRGBColorSpace;
        newTex.magFilter = THREE.NearestFilter;
        newTex.minFilter = THREE.NearestFilter;
        
        const newMat = obj.material.clone();
        newMat.map = newTex;
        clone.material = newMat;
        
        exportScene.add(clone);
    }
    
    exporter.parse(
        exportScene,
        (gltf) => {
            const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'cardboard_model.gltf';
            link.click();
        },
        (error) => {
            console.error('Export error:', error);
            alert("Export failed. See console for details.");
        },
        { binary: false }
    );
}

// Import texture image into atlas
export function handleTextureImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const ctx = state.sharedAtlasCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, CONF.atlasSize, CONF.atlasSize);
            state.sharedAtlasTexture.needsUpdate = true;
            
            if (state.uvEditorOpen) {
                renderUVEditor();
            }
            
            recordHistory();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}
