import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild
} from '@angular/core';

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import {isPlatformServer} from "@angular/common";
import {ViewerCanvasComponent} from "../viewer-canvas/viewer-canvas.component";

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [
    ViewerMenuComponent,
    ViewerCanvasComponent,
  ],
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.scss',
})
export class ModelViewerComponent {
  constructor(
    // private modelShapeService: ModelShapeService,
  ) {
  }
}
