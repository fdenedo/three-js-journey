import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import { EXRLoader, GroundedSkybox, RGBELoader, GLTFLoader } from "three/examples/jsm/Addons.js";


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
 * Loaders
 */
const gltfLoader = new GLTFLoader(); // The model isn't compressed so don't need DRACOLoader
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const exrLoader = new EXRLoader();

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

camera.position.set(6, 8, 6);

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
});

/**
 * Environment Map
 */
// const environmentMap = cubeTextureLoader.load([
//     '/textures/environmentMap/0/px.png', // MUST BE IN THIS ORDER
//     '/textures/environmentMap/0/nx.png',
//     '/textures/environmentMap/0/py.png',
//     '/textures/environmentMap/0/ny.png',
//     '/textures/environmentMap/0/pz.png',
//     '/textures/environmentMap/0/nz.png'
// ]);

// scene.background = environmentMap;
// scene.environment = environmentMap;

// rgbeLoader.load('/textures/environmentMap/blender-lights-2k.hdr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     // scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// exrLoader.load('/textures/environmentMap/nvidiaCanvas-4k.exr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// });

// rgbeLoader.load('/textures/environmentMap/2/2k.hdr', environmentMap => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = environmentMap;

//     const skybox = new GroundedSkybox(environmentMap, 15, 70);
//     // skybox.material.wireframe = true;
//     skybox.position.y = 15;
//     scene.add(skybox);
// });

/**
 * Real-Time Environment Map
 */
const environmentMap = textureLoader.load('../public/textures/environmentMap/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg');
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;

scene.background = environmentMap;

const holyDonut = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) }) // Higher values are brighter here
);
holyDonut.layers.enable(1);
holyDonut.position.y = 3.5;
scene.add(holyDonut);

// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
    256, 
    { type: THREE.HalfFloatType }
); // Make this as small as possible for performance

scene.environment = cubeRenderTarget.texture;

// Cube camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

scene.backgroundRotation.y = 1;
scene.environmentRotation.y = 1;

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI  * 2).name('background rotation').step(0.001);
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI  * 2).name('environment rotation').step(0.001);


/**
 * Objects
 */
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
const material = new THREE.MeshStandardMaterial({
    roughness: 0,
    metalness: 1,
    color: 0xaaaaaa,
    // envMap: environmentMap // No need
});

const knot     = new THREE.Mesh(geometry, material);
knot.position.x = -4;
knot.position.y = 4;
scene.add(knot);

/**
 * Models
 */
gltfLoader.load(
    'models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.setScalar(10);
        scene.add(gltf.scene)
    }
);

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

    // Real time environment map
    if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
        cubeCamera.update(renderer, scene)
    }

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
