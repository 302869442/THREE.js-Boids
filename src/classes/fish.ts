import * as THREE from "three"
import { randFloatSpread } from "three/src/math/MathUtils"
import { randomInt } from "../main"

export class Fish {
  position: THREE.Vector3 = new THREE.Vector3()
  rotation: THREE.Euler = new THREE.Euler()
  velocity: THREE.Vector3
  acceleration: THREE.Vector3 = new THREE.Vector3()
  maxSpeed: number
  wonder: THREE.Vector3 = new THREE.Vector3()
  quaternion: THREE.Quaternion = new THREE.Quaternion()
  quaternionRotation: THREE.Quaternion = new THREE.Quaternion()

  constructor() {
    this.initPosition()
    this.velocity = new THREE.Vector3(
      randomInt(100, -100) * 0.1,
      randomInt(100, -100) * 0.1,
      randomInt(100, -100) * 0.1
    )
    this.maxSpeed = 3
  }

  applyForce(f: THREE.Vector3): void {
    this.acceleration.add(f.clone())
  }

  initPosition(): void {
    this.position.x = randFloatSpread(1000)
    this.position.y = randFloatSpread(1000)
    this.position.z = randFloatSpread(1000)
  }

  update(): void {
    const maxSpeed = this.maxSpeed
    this.velocity.add(this.acceleration)

    // limit velocity
    if (this.velocity.length() > maxSpeed) {
      this.velocity.clampLength(0, maxSpeed)
    }

    this.position.add(this.velocity)
    this.acceleration.multiplyScalar(0)

    //update rotation
    const head = this.velocity.clone()
    head.multiplyScalar(10)
    head.add(this.position)

    this.rotation.setFromVector3(head, "XYZ")
    this.quaternion.slerp(
      this.quaternionRotation.setFromEuler(this.rotation),
      1
    )
  }
}
