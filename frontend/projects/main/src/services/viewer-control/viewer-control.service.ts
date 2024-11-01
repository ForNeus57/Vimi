import {Injectable} from '@angular/core';
import * as THREE from "three";
import {BehaviorSubject} from "rxjs";
import {CameraOrientation} from "../../models/camera-orientation";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {
  private readonly newImage = new BehaviorSubject<number[][][][] | null>(null);
  private readonly cameraOrientation = new BehaviorSubject<CameraOrientation>(
    new CameraOrientation(new THREE.Vector3(0, 5, -10), new THREE.Vector3(0, 0, 0), 1.0)
  );
  private readonly clearCanvas = new BehaviorSubject<void>(undefined);

  constructor(
  ) {
  }

  setClearCanvas() {
    this.clearCanvas.next();
  }

  getCleanCanvasObservable() {
    return this.clearCanvas.asObservable();
  }

  setNewImage(newImage: number[][][][]) {
    this.newImage.next(newImage);
  }

  getNewImageObservable() {
    return this.newImage.asObservable();
  }

  setCameraOrientation(orientation: CameraOrientation) {
    this.cameraOrientation.next(orientation);
  }

  getCameraObservable() {
    return this.cameraOrientation.asObservable();
  }
}
