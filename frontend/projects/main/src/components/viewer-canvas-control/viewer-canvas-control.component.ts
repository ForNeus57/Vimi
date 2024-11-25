import { Component } from '@angular/core';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {CameraOrientation} from "../../models/camera-orientation";
import * as THREE from "three";

@Component({
  selector: 'app-viewer-canvas-control',
  standalone: true,
  imports: [],
  templateUrl: './viewer-canvas-control.component.html',
  styleUrl: './viewer-canvas-control.component.scss'
})
export class ViewerCanvasControlComponent {

  constructor(
    private viewerController: ViewerControlService,
  ) {
  }

  onCameraReset() {
    this.viewerController.setCameraOrientation(
      new CameraOrientation(new THREE.Vector3(0, 5, 10), new THREE.Vector3(0, 0, 0), 1.0)
    );
  }

  onCanvasClear() {
    this.viewerController.setClearCanvas();
  }

  onControlsToggle() {
    this.viewerController.setControlsToggle();
  }
}
