import {Injectable} from '@angular/core';
import * as THREE from "three";
import {BehaviorSubject} from "rxjs";
import {CameraOrientation} from "../../models/camera-orientation";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {
  private newImage = new BehaviorSubject<number[][][]>([]);
  private cameraOrientation = new BehaviorSubject<CameraOrientation>(
    new CameraOrientation(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 0), 1.0)
  );
  private clearCanvas = new BehaviorSubject<void>(undefined);

  constructor(
  ) {
  }

  setClearCanvas() {
    this.clearCanvas.next();
  }

  getCleanCanvasObservable() {
    return this.clearCanvas.asObservable();
  }

  setNewImage(newImage: number[][][]) {
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
