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

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
})

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load('./textures/bakedShadow.jpg')
const simpleShadow = textureLoader.load('./textures/simpleShadow.jpg')
bakedShadow.colorSpace = THREE.SRGBColorSpace
simpleShadow.colorSpace = THREE.SRGBColorSpace

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

// Activate Shadows
renderer.shadowMap.enabled = false; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap

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

// DirectionalLight
const directionalLight = new THREE.DirectionalLight();
directionalLight.intensity = 1.5
directionalLight.position.set(2, 2, -2)
scene.add(directionalLight);
lightTweaks.add(directionalLight, 'intensity')
.name("directional intensity")
.min(0)
.max(3)
.step(0.001);
lightTweaks.add(directionalLight.position, 'x').name("directional x").min(-5).max(5).step(0.001);
lightTweaks.add(directionalLight.position, 'y').name("directional y").min(-5).max(5).step(0.001);
lightTweaks.add(directionalLight.position, 'z').name("directional z").min(-5).max(5).step(0.001);

// Note performance
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024) // Increase for better-looking shadows (pow of 2)

// Example of how to optimise things
console.log(directionalLight.shadow)
const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightHelper)
directionalLightHelper.visible = false
lightTweaks.add(directionalLightHelper, 'visible').name('directional shadow helper')

directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.bottom = -2
// directionalLight.shadow.radius = 10 // Doesn't work with PCFSoftShadowMap

lightTweaks.add(directionalLight.shadow.camera, 'near')
    .name("shadow cam near")
    .min(0)
    .max(20)
    .step(0.1)
    .onChange(() => {
        directionalLight.shadow.camera.updateProjectionMatrix()
    })

lightTweaks.add(directionalLight.shadow.camera, 'far')
    .name("shadow cam far")
    .min(0)
    .max(20)
    .step(0.1)
    .onChange(() => {
        directionalLight.shadow.camera.updateProjectionMatrix()
    })

lightTweaks.add(directionalLight.shadow, 'radius')
    .name("shadow radius")
    .min(0)
    .max(50)
    .step(1)
    .onChange(() => {
        directionalLight.shadow.camera.updateProjectionMatrix()
    })

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3);

spotLight.castShadow = true
spotLight.shadow.mapSize.set(1024, 1024)
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6
// spotLight.shadow.camera.fov = 30 // THIS CAN:T BE CHANGED ANYMORE

spotLight.position.set(0, 2, 2)
scene.add(spotLight, spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(spotLightCameraHelper)
spotLightCameraHelper.visible = false
lightTweaks.add(spotLightCameraHelper, 'visible').name('spot shadow helper')

// PointLight
const pointLight = new THREE.PointLight(0xffffff, 2.7)

pointLight.castShadow = true
pointLight.shadow.mapSize.set(1024, 1024)

pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
scene.add(pointLightCameraHelper)
pointLightCameraHelper.visible = false
lightTweaks.add(pointLightCameraHelper, 'visible').name('point shadow helper')


/**
 * Materials
 */
const materialTweaks = gui.addFolder("Materials")

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
materialTweaks.add(material, 'metalness').min(0).max(1).step(0.001);
materialTweaks.add(material, 'roughness').min(0).max(1).step(0.001);

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32), 
    material
);
sphere.castShadow = true

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5), 
    // new THREE.MeshBasicMaterial({ map: bakedShadow })
    material
);
floor.rotation.x = - Math.PI * 0.5;
floor.position.y = -0.5;
floor.receiveShadow = true

scene.add(sphere, floor)

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow
    })
)
sphereShadow.rotation.x = -Math.PI / 2
sphereShadow.position.y = floor.position.y + 0.01 // Prevent z fighting
scene.add(sphereShadow)

gui.add(sphereShadow.material, 'opacity').listen()

/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

/**
 * Animation Loop
*/

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime()

    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3)) * 1.5

    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.6

    controls.update();
    directionalLightHelper.update();
    renderer.render(scene, camera);
    stats.update();
}
