import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';

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

window.addEventListener("dblclick", () => {
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

/**
 * Lights
 */
const lightTweaks = gui.addFolder("Lights")

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)
lightTweaks.add(ambientLight, 'intensity')
    .name("ambient intensity")
    .min(0)
    .max(3)
    .step(0.001);

const directionLight = new THREE.DirectionalLight();
scene.add(directionLight);
lightTweaks.add(directionLight, 'intensity')
    .name("directional intensity")
    .min(0)
    .max(3)
    .step(0.001);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9);
scene.add(hemisphereLight);

const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 2);
// pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

// RectAreaLight only works with MeshStandardMaterial and MeshPhysicalMaterial
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 3, 1);
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight);

const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)

// To rotate the spotlight, need to move the target
scene.add(spotLight.target)
spotLight.target.position.set(0, 0, 0)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64), 
    material
);
sphere.position.x = -2;

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1), 
    material
);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.2, 64, 128), 
    material
);
torus.position.x = 2;

scene.add(sphere, cube, torus);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10), 
    material
);
floor.rotation.x = - Math.PI * 0.5;
floor.position.y = -1;

scene.add(floor)


/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

// const clock = new THREE.Clock();

/**
 * Animation Loop
 */
function animate() {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
