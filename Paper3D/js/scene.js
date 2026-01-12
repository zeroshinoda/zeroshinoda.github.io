import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { CONF, MODES } from './config.js';
import { state } from './state.js';
import { recordHistory } from './history.js';

// Initialize the Three.js scene
export function initScene() {
    const container = document.getElementById('canvas-container');

    // Scene
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(CONF.bgColor);
    state.scene.fog = new THREE.Fog(CONF.bgColor, 15, 50);

    // Camera
    state.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    state.camera.position.set(10, 10, 10);
    state.camera.lookAt(0, 0, 0);

    // Renderer
    state.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(state.renderer.domElement);

    // Lights - brighter ambient for accurate texture colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    state.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(5, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    state.scene.add(dirLight);

    // Grid
    state.gridHelper = new THREE.GridHelper(
        CONF.gridSize,
        CONF.gridDivisions,
        0x94a3b8,
        0xcbd5e1
    );
    state.scene.add(state.gridHelper);

    // Raycaster
    state.raycaster = new THREE.Raycaster();
}

// Initialize controls (orbit and transform)
export function initControls() {
    // Orbit controls
    state.orbit = new OrbitControls(state.camera, state.renderer.domElement);
    state.orbit.enableDamping = true;
    state.orbit.dampingFactor = 0.05;
    state.orbit.maxPolarAngle = Math.PI / 2 - 0.05;

    // Transform controls
    state.transformer = new TransformControls(state.camera, state.renderer.domElement);
    state.transformer.setTranslationSnap(CONF.snapUnit);
    state.transformer.setRotationSnap(CONF.rotationSnap);

    state.transformer.addEventListener('dragging-changed', (event) => {
        state.orbit.enabled = !event.value;
        if (!event.value && state.currentMode === MODES.BUILD) {
            // Import dynamically to avoid circular dependency
            import('./interaction.js').then(m => m.performSnap());
            recordHistory();
        }
    });

    state.transformer.addEventListener('change', () => {
        if (state.transformer.dragging && state.currentMode === MODES.BUILD) {
            import('./interaction.js').then(m => {
                m.previewSnap();
                m.updateTransformUI();
            });
        }
    });

    state.scene.add(state.transformer);
}

// Create the world anchor (origin marker)
export function createWorldAnchor() {
    const axes = new THREE.AxesHelper(2);
    
    const baseGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const baseMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.5
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    axes.add(base);
    
    state.worldAnchor = axes;
    state.worldAnchor.position.set(0, 0, 0);
    state.worldAnchor.name = "World_Anchor";
    state.worldAnchor.userData.isAnchor = true;
    state.worldAnchor.visible = false;
    
    state.scene.add(state.worldAnchor);
}

// Setup drawing helpers (cursors, lines, markers)
export function setupHelpers() {
    // Draw line
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: CONF.drawLineColor,
        linewidth: 2
    });
    state.drawLineMesh = new THREE.Line(lineGeometry, lineMaterial);
    state.drawLineMesh.frustumCulled = false;
    state.scene.add(state.drawLineMesh);

    // Draw cursor
    const cursorGeo = new THREE.RingGeometry(0.1, 0.2, 16);
    cursorGeo.rotateX(-Math.PI / 2);
    const cursorMat = new THREE.MeshBasicMaterial({
        color: CONF.drawLineColor,
        side: THREE.DoubleSide
    });
    state.drawCursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    state.drawCursorMesh.visible = false;
    state.scene.add(state.drawCursorMesh);

    // Start marker
    const startGeo = new THREE.CircleGeometry(0.25, 16);
    startGeo.rotateX(-Math.PI / 2);
    const startMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.8
    });
    state.drawStartMarker = new THREE.Mesh(startGeo, startMat);
    state.drawStartMarker.visible = false;
    state.drawStartMarker.position.y = 0.02;
    state.scene.add(state.drawStartMarker);

    // Snap line
    const snapGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3()
    ]);
    const snapMat = new THREE.LineBasicMaterial({
        color: 0x39ff14,
        linewidth: 3,
        depthTest: false,
        opacity: 0.8,
        transparent: true
    });
    state.snapLine = new THREE.Line(snapGeo, snapMat);
    state.snapLine.renderOrder = 999;
    state.snapLine.visible = false;
    state.scene.add(state.snapLine);

    // Fill marker
    const fillMarkerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const fillMarkerMat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.8,
        depthTest: false
    });
    state.fillMarkerMesh = new THREE.Mesh(fillMarkerGeo, fillMarkerMat);
    state.fillMarkerMesh.renderOrder = 999;
    state.fillMarkerMesh.visible = false;
    state.scene.add(state.fillMarkerMesh);
}

// Handle window resize
export function onWindowResize() {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
export function animate() {
    requestAnimationFrame(animate);
    state.orbit.update();
    state.renderer.render(state.scene, state.camera);
}
