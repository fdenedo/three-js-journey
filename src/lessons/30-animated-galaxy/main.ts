import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';
import { Timer } from "three/addons/misc/Timer.js";
import galaxyVertexShader from './shaders/galaxy/vertex.glsl';
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl';

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

camera.position.set(3, 3, 3);

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
    count: 200000,
    size: 0.02,
    radius: 5,
    branches: 3,
    randomness: 1.5,
    randomnessPower: 3,
    insideColor: 0xff6030,
    outsideColor: 0x1b3984,
    sceneHelper: false
}

let branchDirectionVectors: THREE.Vector3[] = [];

let geometry: THREE.BufferGeometry, 
    material: THREE.ShaderMaterial, 
    points: THREE.Points,
    helperGeo: THREE.BufferGeometry,
    helperMat: THREE.LineBasicMaterial,
    helpers: THREE.Line[] = [];

const getBranchDirectionVectors = (branches: number) => {
    if (branchDirectionVectors.length !== branches) {
        branchDirectionVectors = [];

        for (let i = 0; i < branches; i++) {
            const branchAngle = i / params.branches * 2 * Math.PI;
            branchDirectionVectors.push(new THREE.Vector3(
                Math.sin(branchAngle),
                0,
                Math.cos(branchAngle)
            ));
        }
    }

    return branchDirectionVectors;
}

/**
 * Deffo need to try to matrix-ify this
 * Could then get the GPU to do all of this, too
 * 
 * @param position 
 * @returns 
 */
const applyRandomTransform = (position: THREE.Vector3) => {
    // Calculate 2 perpendicular vectors at the point
    const perpendicularXZ = new THREE.Vector3(
        -position.z,
        0,
        position.x
    );
    const perpendicularY = new THREE.Vector3(0, 1, 0);

    // Get length as a percentage of the total branch length
    // Multiply the offset ammount by this to get a cone shape
    const positionPercentOfBranch = position.length() / params.radius;

    // Get random angle and radius amount for offset
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomOffsetAmount = Math.pow(Math.random(), params.randomnessPower) 
        * params.randomness 
        // * positionPercentOfBranch;
    
    // Use the perpendicular vectors as new basis vectors
    const offsetDirectionXZ = perpendicularXZ.multiplyScalar(
        (randomOffsetAmount * Math.cos(randomAngle)) / params.radius
    );
    const offsetDirectionY = perpendicularY.multiplyScalar(
        randomOffsetAmount * Math.sin(randomAngle) * positionPercentOfBranch
    );
    const offsetVector = offsetDirectionXZ.add(offsetDirectionY);

    return position.add(offsetVector);
}

const generateGalaxy = () => {
    if (points) {
        // ALways clear
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    if (helpers.length > 0) {
        helperGeo.dispose();
        helperMat.dispose();
        helpers.forEach(helper => scene.remove(helper))
        helpers = [];
    }

    // Geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const particleScales = new Float32Array(params.count * 1);

    const colorIn = new THREE.Color(params.insideColor);
    const colorOut = new THREE.Color(params.outsideColor);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(particleScales, 1));

    /**
     * Scene Helper
     */
    const origin = new THREE.Vector3();
    if (params.sceneHelper) {
        for (let i = 0; i < params.branches; i++) {
            const branchAngle = i / params.branches * 2 * Math.PI;
            const branchEndPoint = new THREE.Vector3(
                params.radius * Math.sin(branchAngle),
                0,
                params.radius * Math.cos(branchAngle)
            );
            const points = [origin, branchEndPoint];
            helperGeo = new THREE.BufferGeometry().setFromPoints(points);
            helperMat = new THREE.LineBasicMaterial({ color: 0xff0000 });

            helpers.push(new THREE.Line(
                helperGeo,
                helperMat
            ));
            helpers.forEach(helper => scene.add(helper));
        }
    }
    
    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;
        const branch = getBranchDirectionVectors(params.branches)[i % params.branches];
        const rand = Math.random();

        const positionRadius = rand * params.radius;
        const position = branch.clone().multiplyScalar(positionRadius);
        const offsetPosition = applyRandomTransform(position);

        positions[i3    ] = offsetPosition.x;
        positions[i3 + 1] = offsetPosition.y;
        positions[i3 + 2] = offsetPosition.z;

        const mixedColor = colorIn.clone();
        mixedColor.lerp(colorOut, positionRadius / params.radius);

        colors[i3    ] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        // Scales
        particleScales[i] = Math.random();
    }

    // Material
    // My GPU can't handle points with no size
    material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms: { 
            uAlpha: { value: params.sceneHelper ? 0.2 : 1 },
            uSize: { value: 8 * renderer.getPixelRatio() },
            uTime: { value: 0 }
        },
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
    });

    // Particles
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'radius').min(0.1).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(params, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy);
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy);
gui.add(params, 'sceneHelper').onFinishChange(generateGalaxy);

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

    material.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
