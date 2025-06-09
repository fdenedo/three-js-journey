import * as THREE from "three";
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import gsap from "gsap";

/**
 * DEBUG
 */
const gui = new GUI({
    title: 'Debug'
});

const params = {
    materialColor: 0xffeded
};
gui.addColor(params, 'materialColor')
    .onChange(() => {
        material.color.set(params.materialColor);
        particleMaterial.color.set(params.materialColor);
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

const gradientTexture = textureLoader.load('./textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Canvas
 */
const canvas = document.getElementById("canvas")!;

/**
 * Base
 */
const scene    = new THREE.Scene();

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
cameraGroup.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



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
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.floor(scrollY / window.innerHeight);
    if (newSection !== currentSection) {
        currentSection = newSection;

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;
})

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({ 
    color: params.materialColor ,
    gradientMap: gradientTexture
});

const objectDistance = 4;

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
);

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
);

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
);

mesh1.position.y = -objectDistance * 0;
mesh2.position.y = -objectDistance * 1;
mesh3.position.y = -objectDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    positions[i3    ] = (Math.random() - 0.5) * 10; 
    positions[i3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length; 
    positions[i3 + 2] = (Math.random() - 0.5) * 10; 
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: params.materialColor,
    size: 0.02,
    sizeAttenuation: true,
    depthWrite: false,

});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

const timer = new Timer();
let previousTime = 0;

/**
 * Animation Loop
 */
function animate() {
    timer.update();
    const elapsedTime = timer.getElapsed();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    camera.position.y = -scrollY / window.innerHeight * objectDistance;

    const parralaxX = cursor.x * 0.5;
    const parralaxY = -cursor.y * 0.5;
    cameraGroup.position.x += (parralaxX - cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y += (parralaxY - cameraGroup.position.y) * 5 * deltaTime;

    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    renderer.render(scene, camera);
}
