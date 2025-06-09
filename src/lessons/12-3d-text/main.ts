import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/Addons.js";
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
})

// Set background colour
scene.background = new THREE.Color(0x303030); // Dark Grey

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const matcapTexture = textureLoader.load('./textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */
const fontLoader = new FontLoader();
fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Hello World!',
            {
                font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            } 
        )

        // textGeometry.computeBoundingBox();
        // textGeometry.translate(
        //     - (textGeometry.boundingBox!.max.x - 0.02) * 0.5,
        //     - (textGeometry.boundingBox!.max.y - 0.02) * 0.5,
        //     - (textGeometry.boundingBox!.max.z - 0.03) * 0.5,
        // )
        // textGeometry.computeBoundingBox();
        // console.log(textGeometry.boundingBox);

        // Same as code above (pretty much)
        textGeometry.center();

        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        console.time('donuts')

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)

        for (let i = 0; i < 300; i++) {
            const donut = new THREE.Mesh(donutGeometry, material)

            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI 
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            donut.scale.set(scale, scale, scale)
            
            scene.add(donut)
        }

        console.timeEnd('donuts')

        // const donutGeometry = new THREE.BufferGeometry();
        // donutGeometry.setAttribute
    }
)

// Add stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// const clock = new THREE.Clock();

function animate() {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}
