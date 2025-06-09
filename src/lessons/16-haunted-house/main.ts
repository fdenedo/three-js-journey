import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from "three/examples/jsm/Addons.js";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from 'three/addons/misc/Timer.js'

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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.set(4, 2, 5);

/**
 * Lights
 */
const lightTweaks = gui.addFolder("Lights");

const ambientLight = new THREE.AmbientLight(0x86cdff, 0.23)
scene.add(ambientLight)
lightTweaks.add(ambientLight, 'intensity')
    .name("ambient intensity")
    .min(0)
    .max(3)
    .step(0.001);

const directionLight = new THREE.DirectionalLight(0x86cdff, 0.7);
directionLight.position.set(5, 2, -8)
scene.add(directionLight);
lightTweaks.add(directionLight, 'intensity')
    .name("directional intensity")
    .min(0)
    .max(3)
    .step(0.001);

directionLight.castShadow = true;

const ghost1 = new THREE.PointLight(0x8800ff, 6);
const ghost2 = new THREE.PointLight(0xff0088, 6);
const ghost3 = new THREE.PointLight(0xff0000, 6);
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
scene.add(ghost1, ghost2, ghost3)

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const floorAlphaTexture = textureLoader.load('./textures/16-haunted-house/floor/alpha.jpg');
const floorColorTexture = textureLoader.load('./textures/16-haunted-house/floor/forest_leaves_02_1k/diffuse.jpg');
const floorARMTexture = textureLoader.load('./textures/16-haunted-house/floor/forest_leaves_02_1k/arm.jpg');
const floorNormalTexture = textureLoader.load('./textures/16-haunted-house/floor/forest_leaves_02_1k/nor_gl.jpg');
const floorDisplacementTexture = textureLoader.load('./textures/16-haunted-house/floor/forest_leaves_02_1k/disp.jpg');

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

[floorColorTexture, floorARMTexture, floorNormalTexture, floorDisplacementTexture]
    .forEach(texture => {
        texture.repeat.set(4, 4)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
    });

const wallARMTexture = textureLoader.load('./textures/16-haunted-house/walls/cracked_concrete_wall_1k/arm.jpg');
const wallColorTexture = textureLoader.load('./textures/16-haunted-house/walls/cracked_concrete_wall_1k/diff.jpg');
const wallNormalTexture = textureLoader.load('./textures/16-haunted-house/walls/cracked_concrete_wall_1k/nor_gl.jpg');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

[wallColorTexture, wallARMTexture, wallNormalTexture]
    .forEach(texture => {
        texture.repeat.set(2, 2)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
    });

const roofARMTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/arm.jpg');
const roofBumpTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/bump.png');
const roofColorTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/diff.jpg');
const roofNormalTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/nor_gl.jpg');
const roofDisplacementTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/disp.jpg');
const roofSpecularTexture = textureLoader.load('./textures/16-haunted-house/roof/roof_07_1k/spec.jpg');

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

[roofColorTexture, roofARMTexture, roofNormalTexture, roofBumpTexture, roofDisplacementTexture, roofSpecularTexture]
    .forEach(texture => {
        texture.repeat.set(3, 1)
        texture.wrapS = THREE.RepeatWrapping
        // texture.wrapT = THREE.RepeatWrapping
    });

export const bushArmTexture = textureLoader.load('../public/textures/16-haunted-house/bush/forest_leaves_03_1k/arm.jpg');
export const bushDiffuseTexture = textureLoader.load('../public/textures/16-haunted-house/bush/forest_leaves_03_1k/diff.jpg');
export const bushNormalTexture = textureLoader.load('../public/textures/16-haunted-house/bush/forest_leaves_03_1k/nor_gl.jpg');

bushDiffuseTexture.colorSpace = THREE.SRGBColorSpace;

export const graveArmTexture = textureLoader.load('../public/textures/16-haunted-house/grave/coral_fort_wall_01_1k/arm.jpg');
export const graveDiffuseTexture = textureLoader.load('../public/textures/16-haunted-house/grave/coral_fort_wall_01_1k/diff.jpg');
export const graveNormalTexture = textureLoader.load('../public/textures/16-haunted-house/grave/coral_fort_wall_01_1k/nor_gl.jpg');

graveDiffuseTexture.colorSpace = THREE.SRGBColorSpace;

[graveArmTexture, graveDiffuseTexture, graveNormalTexture]
    .forEach(texture => {
        texture.repeat.set(0.3, 0.4)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
    });

const doorColorTexture = textureLoader.load('./textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg');
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Objects
 */
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 128, 128),
    new THREE.MeshStandardMaterial({
        transparent: true,
        alphaMap: floorAlphaTexture,
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.25,
        displacementBias: -0.13
    })
)
ground.rotation.x = -Math.PI * 0.5
scene.add(ground)

const groundTweaks = gui.addFolder('Ground');
groundTweaks.add(ground.material, 'displacementScale').min(0).max(1).step(0.001)
groundTweaks.add(ground.material, 'displacementBias').min(-1).max(1).step(0.001)

// Put everything in a group
// House container
const house = new THREE.Group()
scene.add(house)

const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
    })
)
walls.position.y += 2.5 / 2
house.add(walls)

// NOTE: this causes problems because of the way ConeGeometry normals are defined
// Can create the geometry yourself, or use Blender
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        normalMap: roofNormalTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
    })
)
roof.position.y += 2.5 + 0.75 // Walls + 1/2 height of cone as cone origin is centre
roof.rotation.y = Math.PI * 0.25
house.add(roof)

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 64, 64),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: doorColorTexture,
        normalMap: doorNormalTexture,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.y = 1
door.position.z = 2 + 0.001
house.add(door)

const bushGeo = new THREE.SphereGeometry(1, 16, 16)
const bushMat = new THREE.MeshStandardMaterial({
    color: 0xccffcc,
    aoMap: bushArmTexture,
    roughnessMap: bushArmTexture,
    metalnessMap: bushArmTexture,
    map: bushDiffuseTexture,
    normalMap: bushNormalTexture
});

const bush1 = new THREE.Mesh(bushGeo, bushMat)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
bush1.rotation.x = -0.75

const bush2 = new THREE.Mesh(bushGeo, bushMat)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
bush2.rotation.x = -0.75

const bush3 = new THREE.Mesh(bushGeo, bushMat)
bush3.scale.setScalar(0.4)
bush3.position.set(-0.8, 0.1, 2.2)
bush3.rotation.x = -0.75

const bush4 = new THREE.Mesh(bushGeo, bushMat)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)
bush4.rotation.x = -0.75

house.add(bush1, bush2, bush3, bush4)

const graveGeo = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMat = new THREE.MeshStandardMaterial({
    color: 0x707070,
    aoMap: graveArmTexture,
    roughnessMap: graveArmTexture,
    metalnessMap: graveArmTexture,
    map: graveDiffuseTexture,
    normalMap: graveNormalTexture
})

const graves = new THREE.Group()
scene.add(graves)

for(let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 4;

    const x = Math.sin(angle) * radius;
    const y = Math.random() * 0.4;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeo, graveMat);
    grave.position.set(x, y, z);
    grave.rotation.x = (Math.random() - 0.5) * 0.4;
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;

    graves.add(grave);
}

const doorLight = new THREE.PointLight(0xff7d46, 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
ground.receiveShadow = true;

for (const grave of graves.children) {
    grave.castShadow = true;
    grave.receiveShadow = true;
}

// Shadow Mappings
directionLight.shadow.mapSize.set(256, 256);
directionLight.shadow.camera.top = 8;
directionLight.shadow.camera.right = 8;
directionLight.shadow.camera.left = -8;
directionLight.shadow.camera.bottom = -8;
directionLight.shadow.camera.near = 1;
directionLight.shadow.camera.far = 20;

[ghost1, ghost2, ghost3].forEach(ghost => {
    ghost.shadow.mapSize.set(256, 256);
    ghost.shadow.camera.far = 10;
})

/**
 * Sky
 */
const sky = new Sky();
sky.scale.setScalar(100);
scene.add(sky);

sky.material.uniforms['turbidity'].value = 10;
sky.material.uniforms['rayleigh'].value = 3;
sky.material.uniforms['mieCoefficient'].value = 0.1;
sky.material.uniforms['mieDirectionalG'].value = 0.95;
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95);

/**
 * Fog
 */
// scene.fog = new THREE.Fog(0x02343f, 10, 13);
scene.fog = new THREE.FogExp2(0x02343f, 0.1);

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

    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.7) * Math.sin(ghost1Angle * 3.45);

    const ghost2Angle = -elapsedTime * 0.38;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.7) * Math.sin(ghost2Angle * 3.45);

    const ghost3Angle = (elapsedTime + Math.PI) * 0.23;
    ghost3.position.x = Math.cos(ghost3Angle) * 6;
    ghost3.position.z = Math.sin(ghost3Angle) * 6;
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.7) * Math.sin(ghost3Angle * 3.45);


    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
