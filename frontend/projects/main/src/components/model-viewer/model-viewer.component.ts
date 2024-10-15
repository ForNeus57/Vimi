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
import {ModelShapeService} from "../../services/model-shape/model-shape.service";

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import {isPlatformBrowser, isPlatformServer} from "@angular/common";

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [
    ViewerMenuComponent
  ],
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.scss'
})
export class ModelViewerComponent implements OnInit, AfterViewInit {
  private readonly platform = inject(PLATFORM_ID);
  editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');

  shape: Array<Array<number>> = [[10, 10, 10], [10, 10, 10]];

  scene = new THREE.Scene();
  public camera: THREE.PerspectiveCamera | null = null;
  public renderer: THREE.WebGLRenderer | null = null;

  constructor(
    // private modelShapeService: ModelShapeService,
  ) {
  }

  ngOnInit() {
    // this.modelShapeService.modelShape.subscribe(
    //   modelShape => {
    //     this.shape = modelShape;
    //   }
    // );
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platform)) {
      return;
    }

    const canvasElement = this.editorCanvas().nativeElement;

    const canvasWidth = canvasElement.clientWidth;
    const canvasHeight = canvasElement.clientHeight;

    // this.shape = this.shape.slice(0, 20);
    const needed_elements = this.shape.reduce(
      (acc, val) => acc + val.reduce((a, b) => a * b, 1), 0
    );

    const geometry = new THREE.SphereGeometry(1, 1, 1)
    const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), needed_elements);
    this.scene.add(mesh);

    const object = new THREE.Object3D();
    let counter = 0;
    for (let o = 0; o < this.shape.length; o++) {
      const x1 = this.shape[o][0];
      const y1 = this.shape[o][1];
      const z1 = this.shape[o][2];

      for (let i = 0; i < x1; i++) {
        for (let j = 0; j < y1; j++) {
          for (let k = 0; k < z1; k++) {
            object.position.x = i * 3;
            object.position.y = j * 3;
            object.position.z = k * 3 + o * 500;
            object.updateMatrix();
            mesh.setMatrixAt(counter, object.matrix);
            mesh.setColorAt(counter, new THREE.Color(Math.random() * 0xffffff));
            counter++;
          }
        }
      }
    }
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.001,
      10000
    );
    this.camera.position.z = 30;
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();

    const animateGeometry = () => {
      controls.update();
      this.renderer!.render(this.scene, this.camera!);
      window.requestAnimationFrame(animateGeometry);
    };
    animateGeometry();
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.camera || !this.renderer) {
      return;
    }

    const canvasElement = this.editorCanvas().nativeElement;

    this.camera!.aspect = canvasElement.clientWidth / canvasElement.clientHeight;
    this.camera!.updateProjectionMatrix();
    this.renderer!.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
  }
}
