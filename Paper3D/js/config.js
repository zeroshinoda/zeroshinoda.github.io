// Configuration constants
export const CONF = {
    gridSize: 20,
    gridDivisions: 20,
    snapUnit: 1.0,
    rotationSnap: 5 * (Math.PI / 180),
    bgColor: 0xe2e8f0,
    drawColor: 0x3b82f6,
    drawLineColor: 0x2563eb,
    colors: ['#ffffff', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#555555', '#000000'],
    atlasSize: 512,
    islandPadding: 8,
    pixelsPerUnit: 32  // How many texture pixels per world unit
};

export const MODES = {
    BUILD: 'build',
    DRAW: 'draw',
    FILL: 'fill',
    PAINT: 'paint'
};

export const SNAP_THRESHOLD = 1.0;
export const MAX_HISTORY = 10;
