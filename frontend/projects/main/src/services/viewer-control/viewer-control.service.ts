import {Injectable} from '@angular/core';
import * as THREE from "three";
import {BehaviorSubject} from "rxjs";
import {CameraOrientation} from "../../models/camera-orientation";

@Injectable({
  providedIn: 'root'
})
export class ViewerControlService {
  private dimensionsToShow = new BehaviorSubject<number[][] | number[][][][]>([]);
  private orientationSubject = new BehaviorSubject<CameraOrientation>(
    new CameraOrientation(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 0), 1.0)
  );

  constructor(
  ) {
  }

  setDimensions(newDimensions: number[][] | number[][][][]) {
    this.dimensionsToShow.next(newDimensions);
  }

  getDimensionsObservable() {
    return this.dimensionsToShow.asObservable();
  }

  setCameraOrientation(orientation: CameraOrientation) {
    this.orientationSubject.next(orientation);
  }

  getCameraObservable() {
    return this.orientationSubject.asObservable();
  }
}
