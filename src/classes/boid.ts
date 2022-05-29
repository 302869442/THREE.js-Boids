import * as THREE from "three"
import { scene } from "../main"
import { Fish } from "./fish"

export class Boid {
  Fishes: Fish[]
  seek: { maxForce: number }
  align: { effectiveRange: number, maxForce: number }
  separate: { effectiveRange: number, maxForce: number }
  choesin: { effectiveRange: number}
  maxSpeed: number
  boidContainer: Container
  
  constructor(Fishes: Fish[] = []) {
    this.Fishes = Fishes
    this.boidContainer = new Container(1500, 100, 100)
    this.maxSpeed = 3
    this.choesin = {effectiveRange: 100}
    this.separate = { effectiveRange: 70, maxForce: 0.2 }
    this.seek = { maxForce: 0.04 }
    this.align = { effectiveRange: 85, maxForce: 0.16 }
    this.boidContainer.mesh.geometry.computeBoundingSphere()
  }
  /**
   *
   * @param currentFish fish to move away from the container
   * @param  radius radius of the container
   * @returns vector representing the velocity of the object
   */
  containBoids(currentFish: Fish, radius = 500): THREE.Vector3 {
    const boundingSphereRadius = 14.84082207965583 * 2
    const distance = radius - currentFish.position.length() - boundingSphereRadius
    const steerVector = currentFish.position.clone()
    steerVector.normalize()
    steerVector.multiplyScalar(-1 / Math.pow(distance, 2))
    steerVector.multiplyScalar(Math.pow(currentFish.velocity.length(), 3))
    return steerVector
  }

  merge() {
    const toMatrixArray: THREE.Matrix4[] = new Array(this.Fishes.length).fill(new THREE.Matrix4)
    const typedArray = new Array()
    for (const [index, matrix] of toMatrixArray.entries()) {        
        matrix.setPosition(this.Fishes[index].position)
        matrix.lookAt(
          this.Fishes[index].position,
          new THREE.Vector3().setFromEuler(this.Fishes[index].rotation),
          new THREE.Vector3(0, 1, 0)
        )
        matrix.elements.forEach((element: number) => {
          typedArray.push(element)
        })
    }  
    return typedArray
  }

  update() {
    for (const fish of this.Fishes) {
      fish.applyForce(this.alignment(fish))
      fish.applyForce(this.Separation(fish))
      fish.applyForce(this.Cohesion(fish))
      fish.applyForce(
        this.containBoids(
          fish,
          this.boidContainer.mesh.geometry.boundingSphere?.radius
        )
      )
      fish.update()
    }
  }

  searchBoids(currentFish: Fish, target = new THREE.Vector3()) {
    const maxSpeed = this.maxSpeed
    const maxForce = this.seek.maxForce
    const toGoalVector = new THREE.Vector3()
    toGoalVector.subVectors(target, currentFish.position)
    toGoalVector.normalize()
    toGoalVector.multiplyScalar(maxSpeed)
    const steerVector = new THREE.Vector3()
    steerVector.subVectors(toGoalVector, currentFish.velocity)
    // limit force
    if (steerVector.length() > maxForce) {
      steerVector.clampLength(0, maxForce)
    }
    return steerVector
  }

  /**
   *
   * @param currentFish
   * @returns alignment velocity
   */
  alignment(currentFish: Fish) {
    const sumVector = new THREE.Vector3()
    let cnt = 0
    const effectiveRange = this.align.effectiveRange

    for (const fish of this.Fishes) {
      const dist = currentFish.position.distanceTo(fish.position)
      if (dist > 0 && dist < effectiveRange) {
        sumVector.add(fish.velocity)
        cnt++
      }
    }
    const steerVector = this.getSteerVector(sumVector, cnt, currentFish)
    return steerVector
  }

  Separation(currentFish: Fish) {
    const sumVector = new THREE.Vector3()
    let cnt = 0
    const effectiveRange = this.separate.effectiveRange

    for (const fish of this.Fishes) {
      const dist = currentFish.position.distanceTo(fish.position)
      if (dist > 0 && dist < effectiveRange) {
        let toMeVector = new THREE.Vector3()
        toMeVector.subVectors(currentFish.position, fish.position)
        toMeVector.normalize()
        toMeVector.divideScalar(dist)
        sumVector.add(toMeVector)
        cnt++
      }
    }
    const steerVector = this.getSteerVector(sumVector, cnt, currentFish)
    return steerVector
  }

  Cohesion(currentFish: Fish) {
    const sumVector = new THREE.Vector3()
    let cnt = 0
    const effectiveRange = this.choesin.effectiveRange
    const steerVector = new THREE.Vector3()

    this.Fishes.forEach((creature) => {
      const dist = currentFish.position.distanceTo(creature.position)
      if (dist > 0 && dist < effectiveRange) {
        sumVector.add(creature.position)
        cnt++
      }
    })

    if (cnt > 0) {
      sumVector.divideScalar(cnt)
      steerVector.add(this.searchBoids(currentFish, sumVector))
    }

    return steerVector
  }
  getSteerVector(sumVector: THREE.Vector3, cnt: number, currentFish: Fish) {
    const steerVector = new THREE.Vector3()
    if (cnt > 0) {
      sumVector.divideScalar(cnt)
      sumVector.normalize()
      sumVector.multiplyScalar(this.maxSpeed)

      steerVector.subVectors(sumVector, currentFish.velocity)
      if (steerVector.length() > this.separate.maxForce) {
        steerVector.clampLength(0, this.separate.maxForce)
      }
    }
    return steerVector
  }
}
export class Container {
  mesh: THREE.Mesh

  constructor(radius = 400, widthSegments = 10, heightSegments = 10) {
    const geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    )
    const material = new THREE.MeshBasicMaterial()
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.visible = false
    this.addContainer()
  }
  addContainer() {
    scene.add(this.mesh)
  }
}