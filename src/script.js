import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
 import firefliesFragmentShader from './Shaders/FireFlies/fragment.glsl';
 import firefliesVertexShader from './Shaders/FireFlies/vertex.glsl';
 import portalFragmentShader from './Shaders/Portal/fragment.glsl';
 import portalVertexShader from './Shaders/Portal/vertex.glsl';


/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Textures
const bakedTexture = textureLoader.load('./Final-Baking.png');
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

// Creating Material 
const bakedMaterial = new THREE.MeshBasicMaterial({map : bakedTexture })

const emissionMaterial = new THREE.MeshBasicMaterial({color: '#ffffff'})

const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader, 
    fragmentShader: portalFragmentShader, 
    uniforms: {
        uTime: {value: 0}
    }
   
})


// loading the model 
gltfLoader.load(
    'Portal.glb', 
    (gltf)=>
    {
        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial
        })
        // gltf.scene.children.find(child => child.name ==='Baked').material = bakedMaterial;
        scene.add(gltf.scene)
        gltf.scene.children.find(child => child.name ==='PortalLight').material = portalLightMaterial;
        gltf.scene.children.find(child => child.name ==='PoleLight').material = emissionMaterial;
        gltf.scene.children.find(child => child.name ==='PoleLight2').material = emissionMaterial;

    }
)

// FireFlies 

//Geometry

const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 40; 
const positionArray = new Float32Array(firefliesCount* 3);
const scaleArray = new Float32Array(firefliesCount);

 for( let i=0; i<firefliesCount; i++ ){
    positionArray[i*3 +0] = (Math.random() - 0.5) * 4
    positionArray[i*3 +1] = Math.random() * 2
    positionArray[i*3 +2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
 }


firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray,3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(positionArray,1))

// Material 

const firefliesMaterial = new THREE.ShaderMaterial({
   
    vertexShader: firefliesVertexShader, 
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
        uTime : {value:0},
        uPixelRatio:{ value : Math.min(window.devicePixelRatio, 2)}, 
        uSize:{ value : 100.0}
            }
})

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)

scene.add(fireflies)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //update fireflied
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#201919')
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    //updaing the uTime
    firefliesMaterial.uniforms.uTime.value = elapsedTime;
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()