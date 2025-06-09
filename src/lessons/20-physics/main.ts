import * as THREE from "three";
import * as CANNON from "cannon-es";
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

const params = {
    color: 0xf9a7f4,
    createSphere: () => {
        createSphere(
            Math.random() * 0.5, 
            { 
                x: (Math.random() - 0.5) * 3,
                y: 3,
                z: (Math.random() - 0.5) * 3 
            }
        );
    },
    createCube: () => {
        createCube(
            Math.random(), 
            { 
                x: (Math.random() - 0.5) * 3,
                y: 3,
                z: (Math.random() - 0.5) * 3 
            }
        );
    },
    reset: () => {
        for (const obj of objectsToUpdate) {
            obj.body.removeEventListener('collide', playHitSound);
            world.removeBody(obj.body);

            scene.remove(obj.mesh);
        }

        objectsToUpdate.splice(0, objectsToUpdate.length);
    }
};

gui.add(params, 'createSphere').name('Create Sphere');
gui.add(params, 'createCube').name('Create Cube');
gui.add(params, 'reset').name('Reset');

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.show(gui._hidden);
    }
});

/**
 * Sounds
 */
const hitSound = new Audio('./sounds/hit.mp3');
const playHitSound = (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal();

    if (impactStrength > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMap/0/px.png',
    '/textures/environmentMap/0/nx.png',
    '/textures/environmentMap/0/py.png',
    '/textures/environmentMap/0/ny.png',
    '/textures/environmentMap/0/pz.png',
    '/textures/environmentMap/0/nz.png'
]);

/**
 * Physics
 */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

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

camera.position.set(- 3, 3, 3);
scene.add(camera);

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
 * Objects
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
);
floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

/**
 * Physics
 */
const defaultMaterial = new CANNON.Material('default');
// const concreteMaterial = new CANNON.Material('concrete');
// const plasticMaterial = new CANNON.Material('plastic');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
// floorBody.material = defaultMaterial;
world.addBody(floorBody);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = - 7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = - 7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Stats
 */
const stats = new Stats();
document.body.appendChild(stats.dom);

const timer = new Timer();
let lastTime = 0;

const objectsToUpdate = [];

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
});

const createSphere = (radius: number, position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        material
    );
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
}

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const createCube = (size: number, position) => {
    const mesh = new THREE.Mesh(
        cubeGeometry,
        material
    );
    mesh.scale.set(size, size, size);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
}

createSphere(0.5, { x: 0, y: 3, z: 0 });

/**
 * Animation Loop
 */
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    // Wind
    // sphereBody.applyForce(
    //     new CANNON.Vec3(-0.5, 0, 0), // Push by this much
    //     sphereBody.position // Push from centre of world
    // );

    world.step(1 / 60, deltaTime, 5);

    for (const obj of objectsToUpdate) {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    }

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
