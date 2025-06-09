import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl'

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

camera.position.z = 1;

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
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

const material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uColor: { value: new THREE.Color('orange') },
        uPattern: { value: 49 },
        uIsColoured: { value: true },
        uAnimate: { value: true },
        uTime: { value: 0 }
    }
});
gui.add(material.uniforms.uPattern, 'value', 0, 49, 1).name('pattern');
gui.add(material.uniforms.uIsColoured, 'value').name('is coloured?');
gui.add(material.uniforms.uAnimate, 'value').name('animate');

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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

    material.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
