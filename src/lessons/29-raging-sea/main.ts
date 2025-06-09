import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import vertexShader from './shaders/water/vertex.glsl';
import fragmentShader from './shaders/water/fragment.glsl';

/**
 * DEBUG
 */
const gui = new GUI({
    title: 'Debug'
});

const params = {
    color: 0xf9a7f4,
};

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
})

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

camera.position.setScalar(1);

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
 * Objects
 */
const waterGeometry = new THREE.PlaneGeometry(2, 2, 128, 128);
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uBigElevation: { value: 0.1 },
        uBigFrequency: { value: new THREE.Vector2(4, 1.5) },
    }
});
gui.add(waterMaterial.uniforms.uBigElevation, 'value', 0, 1, 0.01).name('big elevation');
gui.add(waterMaterial.uniforms.uBigFrequency.value, 'x', -20, 20, 0.01).name('frequency x');
gui.add(waterMaterial.uniforms.uBigFrequency.value, 'y', -20, 20, 0.01).name('frequency y');

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = - Math.PI * 0.5
scene.add(water);

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
    waterMaterial.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
