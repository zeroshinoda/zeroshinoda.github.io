// Main entry point for Cardboard Constructor
import { state } from './state.js';
import { initSharedAtlas } from './atlas.js';
import { initScene, initControls, createWorldAnchor, setupHelpers, onWindowResize, animate } from './scene.js';
import { setupUI, closeDropdowns } from './ui.js';
import { setupUVEditor } from './uv-editor.js';
import { recordHistory } from './history.js';
import { onPointerDown, onPointerMove, onKeyDown, onContextMenu, hideContextMenu } from './interaction.js';

// Initialize the application
function init() {
    // Setup Three.js scene
    initScene();
    initControls();
    createWorldAnchor();
    setupHelpers();
    
    // Initialize shared texture atlas
    initSharedAtlas();
    
    // Setup UI
    setupUI();
    setupUVEditor();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('click', hideContextMenu);
    document.addEventListener('click', closeDropdowns);
    
    // Record initial state
    recordHistory();
    
    // Start render loop
    animate();
    
    console.log('Cardboard Constructor initialized');
}

// Start the application
init();
