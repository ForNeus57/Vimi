import * as THREE from "three";

export class CameraOrientation {
  constructor(
    public position: THREE.Vector3,
    public lookAt: THREE.Vector3,
    public zoom: number,
  ) {
  }
}