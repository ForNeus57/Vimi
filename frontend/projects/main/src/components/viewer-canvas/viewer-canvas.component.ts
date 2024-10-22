import {AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, PLATFORM_ID, viewChild} from '@angular/core';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import * as THREE from "three";
import {isPlatformServer} from "@angular/common";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";

@Component({
  selector: 'app-viewer-canvas',
  standalone: true,
  imports: [
    ViewerMenuComponent,
  ],
  templateUrl: './viewer-canvas.component.html',
  styleUrl: './viewer-canvas.component.scss',
})
export class ViewerCanvasComponent implements OnInit, AfterViewInit {
  private readonly platform = inject(PLATFORM_ID);
  private continueAnimation = true;
  private objectNames = Array<string>();

  editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1., 0.001, 100000);
  controls: OrbitControls | null = null;
  renderer: THREE.WebGLRenderer | null = null;

  geometry = new THREE.SphereGeometry(1, 1, 1);
  material = new THREE.MeshBasicMaterial();
  dummyObject = new THREE.Object3D();

  // I hate the fact it has to be like that
  animate = () => {
    if (this.controls && this.renderer && this.continueAnimation) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate);
    }
  };

  constructor(
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
  ) {}

  ngOnInit() {
    this.viewerControl.getDimensionsObservable()
      .subscribe((dimensions) => {
        if (isPlatformServer(this.platform)) {
          return;
        }

        this.continueAnimation = false;

        // Clean up after previous canvas usage
        this.objectNames.forEach((objectName) => {
          const previousObject= this.scene.getObjectByName(objectName);
          if (previousObject) {
            this.scene.remove(previousObject);
          } else {
            this.notificationHandler.error(`Attempted to remove a non existent object: "${objectName}"`);
          }
        });
        this.objectNames.length = 0;

        let z_dimension = 0
        dimensions.forEach((layer, index) => {
          const geometry = new THREE.BoxGeometry(layer[0], layer[1], layer[2]);
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(Math.random() * 0xffffff)
          });
          const layerMesh = new THREE.Mesh(geometry, material);

          layerMesh.name = index.toString()
          layerMesh.position.z = z_dimension + layer[2] / 2;
          layerMesh.updateMatrix();

          this.objectNames.push(layerMesh.name);
          this.scene.add(layerMesh);

          z_dimension += 50 + layer[2];
        });

        this.continueAnimation = true;
        this.animate();
        // const neededElements = dimensions.reduce(
        //   (acc, val) => acc + val.reduce((a, b) => a * b, 1),
        //   0,
        // );

        // const mesh = new THREE.InstancedMesh(this.geometry, this.material, neededElements);
        // mesh.name = '0';
        // this.scene.add(mesh);

        // let counter = 0;
        // let distance = 0;
        // for (let o = 0; o < dimensions.length; o++) {
        //   const layerColor = new THREE.Color(Math.random() * 0xffffff);

          // for (let i = 0; i < dimensions[o][0]; i++) {
          //   for (let j = 0; j < dimensions[o][1]; j++) {
          //     for (let k = 0; k < dimensions[o][2]; k++) {
          //       this.dummyObject.position.x = k;
          //       this.dummyObject.position.y = j;
          //       this.dummyObject.position.z = distance;
          //       this.dummyObject.updateMatrix();
          //
          //       mesh.setMatrixAt(counter, this.dummyObject.matrix);
          //       mesh.setColorAt(counter, layerColor);
          //
          //       counter++;
          //     }
          //   }
          //   distance += 1;
          // }
          // distance += 100;
        // }
      });
  }

  ngAfterViewInit() {
    if (isPlatformServer(this.platform)) {
      return;
    }

    const canvasElement = this.editorCanvas().nativeElement;
    const canvasWidth = canvasElement.clientWidth;
    const canvasHeight = canvasElement.clientHeight;

    // Add and configure camera
    this.camera.aspect = canvasWidth / canvasHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = 30;
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, canvasElement);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);

    const axesHelper = new THREE.AxesHelper(50000);
    this.scene.add(axesHelper);
  }

  @HostListener('window:resize')
  onWindowResize() {
    const canvasElement = this.editorCanvas().nativeElement;

    this.camera.aspect = canvasElement.clientWidth / canvasElement.clientHeight;
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
    }
  }
}
