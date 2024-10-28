import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  viewChild
} from '@angular/core';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import * as THREE from "three";
import {isPlatformServer} from "@angular/common";
import {MapControls} from 'three/addons/controls/MapControls.js';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {BoxGeometry} from "three";
import {filter, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-viewer-canvas',
  standalone: true,
  imports: [
    ViewerMenuComponent,
  ],
  templateUrl: './viewer-canvas.component.html',
  styleUrl: './viewer-canvas.component.scss',
})
export class ViewerCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  private readonly platform = inject(PLATFORM_ID);
  private continueAnimation = true;
  private objectNames = Array<string>();

  editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1., 0.001, 100000);
  controls: MapControls | null = null;
  renderer: THREE.WebGLRenderer | null = null;

  material = new THREE.MeshBasicMaterial();

  // I hate the fact it has to be like that
  animate = () => {
    if (this.controls != null
        && this.renderer != null
        && this.continueAnimation != null) {
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
      .pipe(
        filter((() => !isPlatformServer(this.platform))),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((dimensions) => {
        this.continueAnimation = false;

        this.objectNames.forEach((objectName) => {
          const previousObject= this.scene.getObjectByName(objectName);
          if (previousObject) {
            this.scene.remove(previousObject);
          } else {
            this.notificationHandler.error(`Attempted to remove a non existent object: "${objectName}"`);
          }
        });
        this.objectNames.length = 0;

        if (dimensions.every(item => item.every(item2 => !Array.isArray(item2)))) {
          dimensions = dimensions as number[][]
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
        } else {
          dimensions = dimensions as number[][][][]

          const objectCount = dimensions.reduce(
            (curr, cum) => curr + cum.reduce(
              (curr2, cum2) => curr2 + cum2.length,
              0
            ),
            0
          );

          const material = new THREE.MeshBasicMaterial();
          const mesh = new THREE.InstancedMesh(new BoxGeometry(1, 1, 1), material, objectCount);
          mesh.name = '0';

          this.objectNames.push(mesh.name);
          this.scene.add(mesh);

          const obj = new THREE.Object3D();
          obj.position.z = 0;
          let counter = 0;
          let distanceX = 0;

          for (let i = 0;  i < dimensions.length; ++i) {
            for (let j = 0; j < dimensions[i].length; ++j) {
              for (let k = 0; k < dimensions[i][j].length; ++k) {
                obj.position.x = distanceX;
                obj.position.y = k * 1.05;
                obj.updateMatrix();

                mesh.setMatrixAt(counter, obj.matrix);

                const color = new THREE.Color(dimensions[i][j][k][0] / 255, dimensions[i][j][k][1] / 255, dimensions[i][j][k][2] / 255);
                mesh.setColorAt(counter, color);
                counter++;
              }
              distanceX += 1.05;
            }
            distanceX += 10;
          }
        }

        this.continueAnimation = true;
        this.animate();
      });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    this.camera.position.z = 50;
    this.scene.add(this.camera);

    this.controls = new MapControls(this.camera, canvasElement);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);
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
