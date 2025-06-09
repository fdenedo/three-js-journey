import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

/**
 * DEBUG
 */
const gui = new GUI({
    title: 'Debug'
});

const debugObject = {
    color: 0xf9a7f4,
    raycastColor: 0xff0000
};

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Canvas
 */
const canvas = document.querySelector("canvas.webgl")!;

const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.z = 3;

/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * Base Interaction
 */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", (event) => {
    const guiContainer = gui.domElement;
    if (guiContainer.contains(event.target as Node)) {
        return;
    }

    const fullscreenElement = document.fullscreenElement

    if (!fullscreenElement) {
        canvas?.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

/**
 * Background Colour
 */
scene.background = new THREE.Color(0x303030); // Dark Grey


/**
 * Objects
 */
const geometry = new THREE.SphereGeometry(0.5, 32, 32);

const sphere1  = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: debugObject.color }));
const sphere2  = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: debugObject.color }));
sphere2.position.x = -2;
const sphere3  = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: debugObject.color }));
sphere3.position.x = 2;
scene.add(sphere1, sphere2, sphere3);

// This is as the raycaster is sent out immediately
// Otherwise, all three of them will be seen at distance 2.5, as Three.js will
// see them as the middle one as they have not yet been updated
sphere1.updateMatrixWorld();
sphere2.updateMatrixWorld();
sphere3.updateMatrixWorld();

const objects = [sphere1, sphere2, sphere3];

/**
 * Mouse
 */
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('click', () => {
    if (currentIntersect) {
        
    }
})

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

const timer = new Timer();
let lastTime = 0;

let currentIntersect = null;

/**
 * Model
 */
let model = null;

const gltfLoader = new GLTFLoader();
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene;
        model.position.y = -1.2;
        scene.add(model);
    }
);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 2.1)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Animation Loop
 */
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    sphere1.position.y = Math.sin(elapsedTime * 0.25) * 1.5;
    sphere2.position.y = Math.sin(elapsedTime * 0.5) * 1.5;
    sphere3.position.y = Math.sin(elapsedTime * 0.75) * 1.5;

    // const rayOrigin = new THREE.Vector3(-3, 0, 0);
    // const rayDirection = new THREE.Vector3(1, 0, 0); // Need to normalise
    // rayDirection.normalize();

    // raycaster.set(rayOrigin, rayDirection);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects);
    // if (intersects.toString() !== lastIntersects.toString()) {
    //     lastIntersects = intersects[0];
    // }

    for (const obj of objects) {
        if (intersects.map((intersect) => intersect.object).includes(obj)) {
            obj.material.color.set(debugObject.raycastColor);
        } else {
            obj.material.color.set(debugObject.color);
        }
    }

    if (intersects.length) {
        if (currentIntersect === null) {
            console.log('mouse enter')
        }
        currentIntersect = intersects[0]; 
    } else {
        if (currentIntersect) {
            console.log('mouse leave')
        }
        currentIntersect = null;
    }

    if (model) {
        raycaster.setFromCamera(mouse, camera);
        const duckIntersect = raycaster.intersectObject(model);
        
        if (duckIntersect.length) {
            model.scale.set(1.2, 1.2, 1.2);
        } else {
            model.scale.set(1, 1, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
