import "./style.css"

import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { Boid } from "./classes/boid"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import Stats from "three/examples/jsm/libs/stats.module"

import { Fish } from "./classes/fish"

let boid: Boid
let instanceMesh: THREE.InstancedMesh
const FishCount = 300

const colors = [
  new THREE.Color("#74b3ce"),
  new THREE.Color("#508991"),
  new THREE.Color("#172A3A"),
  new THREE.Color("#004346"),
  new THREE.Color("#09bc8a"),
  new THREE.Color("#9e829c"),
]

export const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  100000
)

const renderer = new THREE.WebGLRenderer()
const composer = new EffectComposer(renderer)
renderer.setSize(innerWidth, innerHeight)
composer.setSize(innerWidth, innerHeight)
composer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)
const stats = Stats()
document.body.appendChild(stats.dom)

camera.position.z = 150
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = false


function addBloom() {
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 2.2, 0, 0)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(bloom)
  bloom.renderToScreen = true
}

function loadModel() {
  const modelLoader = new GLTFLoader()
  modelLoader.load("../vissen/models/Fish.glb", (gltf) => {
    const objectMesh = <THREE.Mesh>gltf.scene.children[0]
    makeInstance(objectMesh.geometry)
  })
}
function makeInstance(object: THREE.BufferGeometry) {
  const Fish = object
  const FishMaterial = new THREE.MeshBasicMaterial()
  instanceMesh = new THREE.InstancedMesh(Fish, FishMaterial, FishCount)
  instanceMesh.scale.setScalar(9)
  instanceMesh.rotateY(90)

  scene.add(instanceMesh)
  for (let i = 0; i < instanceMesh.count; i++) {
    instanceMesh.setColorAt(i, colors[randomInt(0, 6)])
  }
}

function makeBoids() {
  const fishes = []
  for (let i = 0; i < FishCount; i++) {
    const creature = new Fish()
    fishes.push(creature)
  }
  boid = new Boid(fishes)
}

function animate() {
  requestAnimationFrame(animate)

  composer.render()
  stats.update()
  boid.update()
  if (instanceMesh) {
    instanceMesh.instanceMatrix.copyArray(boid.merge())
    instanceMesh.instanceMatrix.needsUpdate = true
  }
}
function resize() {
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(devicePixelRatio)
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
}

export const randomInt = (max = 0, min = 0) =>
  Math.floor(Math.random() * (max + 1 - min)) + min

makeBoids()
loadModel()
addBloom()
animate()
window.addEventListener("resize", resize, false)
