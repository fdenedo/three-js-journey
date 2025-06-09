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

/**
 * Base
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
 * Galaxy
 */
const params = {
    count: 100000,
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: 0xff6030,
    outsideColor: 0x1b3984
}

let geometry: THREE.BufferGeometry, 
    material: THREE.PointsMaterial, 
    points: THREE.Points;

const generateGalaxy = () => {
    if (points) {
        // ALways clear
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    // Geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);

    const colorIn = new THREE.Color(params.insideColor);
    const colorOut = new THREE.Color(params.outsideColor);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * params.radius;
        const branchAngle = (i % params.branches) * 2 * Math.PI / params.branches;
        const spinAngle = radius * params.spin;

        const xRand = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness;
        const yRand = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness;
        const zRand = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness;

        positions[i3    ] = radius * Math.sin(branchAngle + spinAngle) + xRand;
        positions[i3 + 1] = yRand;
        positions[i3 + 2] = radius * Math.cos(branchAngle + spinAngle) + zRand;

        const mixedColor = colorIn.clone();
        mixedColor.lerp(colorOut, radius / params.radius);

        colors[i3    ] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    // Material
    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // Particles
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'radius').min(0.1).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(params, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy);

generateGalaxy();

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

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
