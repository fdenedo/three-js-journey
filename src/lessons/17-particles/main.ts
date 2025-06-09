import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";

/**
 * DEBUG
 */
const gui = new GUI({
    title: 'Debug'
});

const debugObject = {
    color: 0xf9a7f4,
};

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
})

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const particleTexture = textureLoader.load('./textures/particles/9.png')

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
// scene.background = new THREE.Color(0x303030); // Dark Grey


/**
 * Objects
 */

/**
 * Particles
 */
function generateRandomPoints(numberOfPoints, min, max) {
    const arr = new Float32Array(numberOfPoints * 3);
    for (let i = 0; i < numberOfPoints * 3; i++) {
        arr[i] = min + Math.random() * (max - min);
    }
    return arr;
}

function generateRandomColors(numberOfPoints) {
    const arr = new Float32Array(numberOfPoints * 3);
    for (let i = 0; i < numberOfPoints * 3; i++) {
        arr[i] = Math.random();
    }
    return arr;
}

const particleGeometry = new THREE.BufferGeometry();
const count = 20000;
particleGeometry.setAttribute(
    'position', 
    new THREE.BufferAttribute(generateRandomPoints(count, -5, 5), 3)
);
particleGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(generateRandomColors(count), 3)
);

const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    alphaMap: particleTexture,
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    size: 0.05,
    sizeAttenuation: true
});
particleMaterial.blending = THREE.AdditiveBlending

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

const timer = new Timer();

/**
 * Animation Loop
 */
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();

    // particles.rotation.y = elapsedTime;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // DON'T DO THIS!! USE A CUSTOM SHADER, this is bad for performance
        // Look pretty tho
        // const x = particleGeometry.attributes.position.array[i3]
        // particleGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x); // y
        // particleGeometry.attributes.position.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
