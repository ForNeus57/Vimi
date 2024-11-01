import { Component } from '@angular/core';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {CameraOrientation} from "../../models/camera-orientation";
import * as THREE from "three";

@Component({
  selector: 'app-viewer-secondary-menu',
  standalone: true,
  imports: [],
  templateUrl: './viewer-secondary-menu.component.html',
  styleUrl: './viewer-secondary-menu.component.scss'
})
export class ViewerSecondaryMenuComponent {

  constructor(
    private viewerController: ViewerControlService,
  ) {
  }

  onCameraReset() {
    this.viewerController.setCameraOrientation(
      new CameraOrientation(new THREE.Vector3(0, 5, -10), new THREE.Vector3(0, 0, 0), 1.0)
    )
  }
}
