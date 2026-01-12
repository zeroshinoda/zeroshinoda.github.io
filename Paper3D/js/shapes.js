import * as THREE from 'three';
import { CONF } from './config.js';
import { state } from './state.js';
import { findAtlasSpace } from './atlas.js';

// Create a cardboard shape from points drawn on the grid
export function createCardboardShape(points, returnOnly = false) {
    // Create 2D shape from points (using X and Z from world coords)
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();

    // Create geometry
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.computeBoundingBox();
    
    // Get center for positioning
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    
    // Get bounding box dimensions BEFORE centering (in shape's 2D space)
    const bbox = geometry.boundingBox;
    const shapeWidth = bbox.max.x - bbox.min.x;
    const shapeHeight = bbox.max.y - bbox.min.y;
    
    // Calculate UV island size in pixels
    const uvWidth = Math.max(32, Math.ceil(shapeWidth * CONF.pixelsPerUnit / 16) * 16);
    const uvHeight = Math.max(32, Math.ceil(shapeHeight * CONF.pixelsPerUnit / 16) * 16);
    
    // Find space in atlas
    const placement = findAtlasSpace(uvWidth, uvHeight);
    const uvBounds = {
        x: placement.x,
        y: placement.y,
        width: uvWidth,
        height: uvHeight
    };
    
    // Apply UVs based on actual geometry vertex positions
    // Map each vertex from shape space to atlas UV space
    const posAttr = geometry.attributes.position;
    const uvs = [];
    
    for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        
        // Normalize to 0-1 within the shape's bounding box
        // Flip U (1 - localU) to match UV editor orientation
        const localU = 1.0 - (vx - bbox.min.x) / shapeWidth;
        const localV = (vy - bbox.min.y) / shapeHeight;
        
        // Map to atlas coordinates
        const atlasU = (uvBounds.x + localU * uvBounds.width) / CONF.atlasSize;
        const atlasV = 1.0 - (uvBounds.y + (1.0 - localV) * uvBounds.height) / CONF.atlasSize;
        
        uvs.push(atlasU, atlasV);
    }
    
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    // Store the outline points for UV editor display
    // Match the flipped U coordinate
    const uvShape = points.map(p => ({
        u: 1.0 - (p.x - bbox.min.x) / shapeWidth,
        v: (p.z - bbox.min.y) / shapeHeight
    }));
    
    // Center the geometry
    geometry.translate(-center.x, -center.y, 0);
    
    // Rotate to lie flat on XZ plane
    geometry.rotateX(Math.PI / 2);
    
    // Create material with shared atlas texture
    // Use MeshBasicMaterial for accurate unlit texture colors
    const material = new THREE.MeshBasicMaterial({
        map: state.sharedAtlasTexture,
        side: THREE.DoubleSide
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(center.x, 0.05, center.y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store metadata
    mesh.userData.uvBounds = uvBounds;
    mesh.userData.uvShape = uvShape;
    mesh.userData.geometryConfig = {
        type: 'cardboard',
        points: points.map(p => ({ x: p.x, y: p.y, z: p.z }))
    };
    
    // Store bbox info for UV recalculation when moving islands
    mesh.userData.shapeBBox = {
        minX: bbox.min.x,
        minY: bbox.min.y,
        width: shapeWidth,
        height: shapeHeight
    };

    // Calculate snap points (corners) in local space after rotation
    const localSnapPoints = points.map(p => {
        const localX = p.x - center.x;
        const localY = p.z - center.y;
        // After rotateX(PI/2): (x, y, 0) -> (x, 0, y)
        return new THREE.Vector3(localX, 0, localY);
    });
    mesh.userData.snapPoints = localSnapPoints;

    // Add edge outline
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.3,
        transparent: true
    }));
    mesh.add(line);

    if (!returnOnly) {
        state.scene.add(mesh);
        state.objects.push(mesh);
    }
    
    return mesh;
}

// Create a fill shape from 3 points (triangle to fill gaps)
export function createFillShape(p1, p2, p3, returnOnly = false) {
    // Calculate center of triangle
    const center = new THREE.Vector3()
        .addVectors(p1, p2)
        .add(p3)
        .divideScalar(3);
    
    // Build a local coordinate system
    const forward = new THREE.Vector3().subVectors(p2, p1).normalize();
    const temp = new THREE.Vector3().subVectors(p3, p1).normalize();
    const normal = new THREE.Vector3().crossVectors(forward, temp).normalize();
    const up = new THREE.Vector3().crossVectors(normal, forward).normalize();
    
    // Create transformation matrix
    const matrix = new THREE.Matrix4().makeBasis(forward, up, normal);
    matrix.setPosition(center);
    const inverse = matrix.clone().invert();
    
    // Transform points to local 2D space
    const l1 = p1.clone().applyMatrix4(inverse);
    const l2 = p2.clone().applyMatrix4(inverse);
    const l3 = p3.clone().applyMatrix4(inverse);
    
    // Create 2D shape
    const shape = new THREE.Shape();
    shape.moveTo(l1.x, l1.y);
    shape.lineTo(l2.x, l2.y);
    shape.lineTo(l3.x, l3.y);
    shape.closePath();

    // Create geometry
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.computeBoundingBox();
    
    const bbox = geometry.boundingBox;
    const shapeWidth = bbox.max.x - bbox.min.x;
    const shapeHeight = bbox.max.y - bbox.min.y;
    
    // Calculate UV island size
    const uvWidth = Math.max(32, Math.ceil(shapeWidth * CONF.pixelsPerUnit / 16) * 16);
    const uvHeight = Math.max(32, Math.ceil(shapeHeight * CONF.pixelsPerUnit / 16) * 16);
    
    // Find space in atlas
    const placement = findAtlasSpace(uvWidth, uvHeight);
    const uvBounds = {
        x: placement.x,
        y: placement.y,
        width: uvWidth,
        height: uvHeight
    };
    
    // Apply UVs based on actual geometry vertices
    const posAttr = geometry.attributes.position;
    const uvs = [];
    
    for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        
        // Flip U to match UV editor orientation
        const localU = 1.0 - (vx - bbox.min.x) / shapeWidth;
        const localV = (vy - bbox.min.y) / shapeHeight;
        
        const atlasU = (uvBounds.x + localU * uvBounds.width) / CONF.atlasSize;
        const atlasV = 1.0 - (uvBounds.y + (1.0 - localV) * uvBounds.height) / CONF.atlasSize;
        
        uvs.push(atlasU, atlasV);
    }
    
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    // Store outline for UV editor (with flipped U)
    const uvShape = [
        { u: 1.0 - (l1.x - bbox.min.x) / shapeWidth, v: (l1.y - bbox.min.y) / shapeHeight },
        { u: 1.0 - (l2.x - bbox.min.x) / shapeWidth, v: (l2.y - bbox.min.y) / shapeHeight },
        { u: 1.0 - (l3.x - bbox.min.x) / shapeWidth, v: (l3.y - bbox.min.y) / shapeHeight }
    ];
    
    // Create material - unlit for accurate colors
    const material = new THREE.MeshBasicMaterial({
        map: state.sharedAtlasTexture,
        side: THREE.DoubleSide
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(center);
    mesh.quaternion.setFromRotationMatrix(matrix);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store metadata
    mesh.userData.snapPoints = [l1.clone(), l2.clone(), l3.clone()];
    mesh.userData.uvBounds = uvBounds;
    mesh.userData.uvShape = uvShape;
    mesh.userData.geometryConfig = {
        type: 'fill',
        points: [p1, p2, p3].map(p => ({ x: p.x, y: p.y, z: p.z }))
    };
    mesh.userData.shapeBBox = {
        minX: bbox.min.x,
        minY: bbox.min.y,
        width: shapeWidth,
        height: shapeHeight
    };

    // Add edge outline
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.3,
        transparent: true
    }));
    mesh.add(line);

    if (!returnOnly) {
        state.scene.add(mesh);
        state.objects.push(mesh);
    }
    
    return mesh;
}

// Dispose of a Three.js object properly
export function disposeObject(obj) {
    if (!obj) return;
    
    if (obj.removeFromParent) {
        obj.removeFromParent();
    } else {
        state.scene.remove(obj);
    }

    obj.traverse((child) => {
        if (child.isMesh || child.isLineSegments || child.isLine) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
}
