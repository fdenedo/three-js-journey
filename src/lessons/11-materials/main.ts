import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * DEBUG
 */
const gui = new GUI({
    title: 'Debug'
});
// gui.hide();

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
})

// const debugObject = {

// };

/**
 * Initial Setup
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

camera.position.z = 4;

// Set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Set up window resize callback
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
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load('../public/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('../public/textures/door/alpha.jpg');
const doorHeightTexture = textureLoader.load('../public/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('../public/textures/door/normal.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('../public/textures/door/ambientOcclusion.jpg');
const doorMetalnessTexture = textureLoader.load('../public/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('../public/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('../public/textures/matcaps/8.png');
const gradientTexture = textureLoader.load('../public/textures/gradients/5.jpg');

doorColorTexture.colorSpace = THREE.SRGBColorSpace
matcapTexture.colorSpace = THREE.SRGBColorSpace

scene.background = new THREE.Color(0x303030); // Dark Grey

// MeshBasicMaterial
// const material = new THREE.MeshBasicMaterial();
// material.map = doorColorTexture;
// material.wireframe = true;
// material.transparent = true;
// material.opacity = 0.2;
// material.alphaMap = doorAlphaTexture;
// material.side = THREE.DoubleSide;

// MeshNormalMaterial
// const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;

// MeshMatcapMaterial
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// MeshDepthMaterial
// const material = new THREE.MeshDepthMaterial();

// MeshLambertMaterial - *** FIRST ONE THAT NEEDS LIGHTS ***
// Hard to get something realistic here
// const material = new THREE.MeshLambertMaterial();

// MeshPhongMaterial
// Better for realism, still a bit hard
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff);

// MeshToonMaterial
// const material = new THREE.MeshToonMaterial();
// gradientTexture.generateMipmaps = false;
// gradientTexture.magFilter = THREE.NearestFilter;
// material.gradientMap = gradientTexture; // remember this is tiny, need magFilter

// MeshStandardMaterial - called standard for the PBR standard
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 1
// material.roughness = 1
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.displacementMap = doorHeightTexture // need subdivisions
// material.displacementScale = 0.05
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.8, 0.8)
// material.transparent = true
// material.alphaMap = doorAlphaTexture

// gui.add(material, 'metalness').min(0).max(1).step(0.01)
// gui.add(material, 'roughness').min(0).max(1).step(0.01)

// MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial();
material.metalness = 0
material.roughness = 0
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.displacementMap = doorHeightTexture // need subdivisions
// material.displacementScale = 0.05
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.8, 0.8)
// material.transparent = true
// material.alphaMap = doorAlphaTexture

gui.add(material, 'metalness').min(0).max(1).step(0.01)
gui.add(material, 'roughness').min(0).max(1).step(0.01)

// Clearcoat
// material.clearcoat = 1
// material.clearcoatRoughness = 0

// gui.add(material, 'clearcoat').min(0).max(1).step(0.01)
// gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.01)

// Sheen
// material.sheen = 1
// material.sheenRoughness = 0.25
// material.sheenColor.set(1, 1, 1)

// gui.add(material, 'sheen').min(0).max(1).step(0.01)
// gui.add(material, 'sheenRoughness').min(0).max(1).step(0.01)
// gui.addColor(material, 'sheenColor')

// Iridescence
// material.iridescence = 1
// material.iridescenceIOR = 1
// material.iridescenceThicknessRange = [100, 80]

// gui.add(material, 'iridescence').min(0).max(1).step(0.01)
// gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.001)
// gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1)
// gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1)

// Transmission
material.transmission = 1
material.ior = 1.5
material.thickness = 0.5

gui.add(material, 'transmission').min(0).max(1).step(0.001)
gui.add(material, 'ior').min(1).max(10).step(0.001)
gui.add(material, 'thickness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphereGeo = new THREE.SphereGeometry(0.5, 64, 64);
const planeGeo = new THREE.PlaneGeometry(1, 1, 100, 100);
const torusGeo = new THREE.TorusGeometry(0.4, 0.2, 64, 128);

const sphere = new THREE.Mesh(sphereGeo, material);
sphere.position.x = -2;

const plane = new THREE.Mesh(planeGeo, material);

const torus = new THREE.Mesh(torusGeo, material);
torus.position.x = 2;

scene.add(sphere, plane, torus);

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 30);
// scene.add(pointLight)

// pointLight.position.set(2, 3, 4);

/**
 * Environment Map
 */
const rgbeLoader = new RGBELoader();
rgbeLoader.load('../public/textures/environmentMap/2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = envMap
    scene.environment = envMap
})

// Add stats
const stats = new Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();

// This function is the callback called by the renderer whenever it finishes rendering
function animate() {
    const elapsedTime = clock.getElapsedTime();
    [sphere, plane, torus].forEach(obj => {
        obj.rotation.y = 0.1 * elapsedTime
        obj.rotation.x = -0.15 * elapsedTime
    })

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
