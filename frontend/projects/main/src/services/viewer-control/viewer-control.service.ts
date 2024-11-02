import {Injectable} from '@angular/core';
import * as THREE from "three";
import {BehaviorSubject} from "rxjs";
import {CameraOrientation} from "../../models/camera-orientation";
import {ImageSet} from "../../models/color-map";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {
  private readonly imageSet = new BehaviorSubject<ImageSet | null>(null);
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

  setNewImage(imageSet: ImageSet) {
    this.imageSet.next(imageSet);
  }

  getNewImageObservable() {
    return this.imageSet.asObservable();
  }

  setCameraOrientation(orientation: CameraOrientation) {
    this.cameraOrientation.next(orientation);
  }

  getCameraObservable() {
    return this.cameraOrientation.asObservable();
  }
}
