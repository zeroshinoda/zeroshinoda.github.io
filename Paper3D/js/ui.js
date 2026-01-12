import { MODES } from './config.js';
import { state } from './state.js';
import { clearScene, undo, redo } from './history.js';
import { openUVEditor } from './uv-editor.js';
import {
    selectObject,
    deleteSelected,
    duplicateSelected,
    toggleAnchorVisibility,
    hideContextMenu,
    applyTransformFromUI,
    resetDrawing,
    resetFill
} from './interaction.js';
import { saveProject, loadProject, exportGLTF, handleTextureImport } from './io.js';

// Setup all UI event listeners
export function setupUI() {
    // Mode buttons
    document.getElementById('mode-draw').addEventListener('click', () => switchMode(MODES.DRAW));
    document.getElementById('mode-build').addEventListener('click', () => switchMode(MODES.BUILD));
    document.getElementById('mode-fill').addEventListener('click', () => switchMode(MODES.FILL));
    document.getElementById('mode-paint').addEventListener('click', () => switchMode(MODES.PAINT));

    // Transform tools
    document.getElementById('tool-move').addEventListener('click', () => state.transformer.setMode('translate'));
    document.getElementById('tool-rotate').addEventListener('click', () => state.transformer.setMode('rotate'));
    
    // Action buttons
    document.getElementById('btn-delete').addEventListener('click', deleteSelected);
    document.getElementById('btn-clear').addEventListener('click', () => clearScene());
    document.getElementById('btn-cancel-draw').addEventListener('click', resetDrawing);
    document.getElementById('btn-cancel-fill').addEventListener('click', resetFill);
    
    // Anchor controls
    document.getElementById('btn-anchor').addEventListener('click', () => selectObject(state.worldAnchor));
    document.getElementById('btn-toggle-anchor').addEventListener('click', toggleAnchorVisibility);
    
    // Undo/Redo
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-redo').addEventListener('click', redo);

    // File operations
    document.getElementById('btn-export').addEventListener('click', exportGLTF);
    document.getElementById('btn-save').addEventListener('click', saveProject);
    document.getElementById('btn-load').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    document.getElementById('btn-import-tex').addEventListener('click', () => document.getElementById('texture-input').click());
    document.getElementById('texture-input').addEventListener('change', handleTextureImport);

    // Context menu
    document.getElementById('ctx-duplicate').addEventListener('click', duplicateSelected);
    document.getElementById('ctx-delete').addEventListener('click', deleteSelected);
    
    // Menu dropdown
    document.getElementById('btn-menu').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('menu-dropdown').classList.toggle('show');
    });

    // Transform inputs
    document.querySelectorAll('.transform-input').forEach(input => {
        input.addEventListener('change', applyTransformFromUI);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyTransformFromUI();
                input.blur();
            }
        });
    });

    // UV Editor button
    document.getElementById('btn-open-uv').addEventListener('click', openUVEditor);
}

// Handle file selection for loading projects
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => loadProject(e.target.result);
    reader.readAsText(file);
    event.target.value = '';
}

// Close dropdown menus when clicking outside
export function closeDropdowns(e) {
    if (!e.target.closest('#btn-menu')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    }
}

// Switch between modes
export function switchMode(mode) {
    if (state.currentMode === mode) return;

    // Camera transitions for draw mode
    if (mode === MODES.DRAW && state.currentMode !== MODES.DRAW) {
        state.savedCameraPos.copy(state.camera.position);
        state.savedTarget.copy(state.orbit.target);
        state.camera.position.set(0, 25, 0);
        state.orbit.target.set(0, 0, 0);
        state.orbit.enableRotate = false;
        state.orbit.update();
    } else if (mode !== MODES.DRAW && state.currentMode === MODES.DRAW) {
        state.camera.position.copy(state.savedCameraPos);
        state.orbit.target.copy(state.savedTarget);
        state.orbit.enableRotate = true;
        state.orbit.update();
    }

    state.currentMode = mode;
    
    // Update mode button states
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');

    // Show/hide tool panels
    ['build', 'draw', 'fill', 'paint'].forEach(m => {
        const el = document.getElementById('tools-' + m);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('flex');
        }
    });
    
    const activeTool = document.getElementById('tools-' + mode);
    if (activeTool) {
        activeTool.classList.remove('hidden');
        activeTool.classList.add('flex');
    }

    // Reset state
    state.transformer.detach();
    state.selectedObject = null;
    document.getElementById('transform-info').classList.add('hidden');
    
    resetDrawing();
    resetFill();
    
    // Show/hide guides
    document.getElementById('draw-guide').classList.remove('visible');
    document.getElementById('fill-guide').classList.remove('visible');

    if (mode === MODES.DRAW) {
        document.getElementById('draw-guide').classList.add('visible');
    } else if (mode === MODES.FILL) {
        document.getElementById('fill-guide').classList.add('visible');
    }
}
