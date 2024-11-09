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
  private objectsToDisposal = Array();
  private standardGap = 10;

  editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, 1., 0.001, 10000);
  private controls: MapControls | null = null;
  private renderer: THREE.WebGLRenderer | null = null;

  // I hate the fact it has to be like that
  private animate = () => {
    if (this.controls != null
        && this.renderer != null
        && this.continueAnimation != null) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate);
    }
  };

  constructor(
    private viewerControl: ViewerControlService,
  ) {}

  ngOnInit() {
    this.viewerControl.getNewImageObservable()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        filter((activation) => activation != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((imageSet) => {
        this.continueAnimation = false;

        const textureLoader = new THREE.TextureLoader();
        const maximumHeight = imageSet.shape[0];
        if (imageSet.mode == '1d') {
          let xDimensionCumulative = 0;
          const totalXLength = imageSet.textureUrls.length * imageSet.shape[1] + (imageSet.textureUrls.length - 1) * this.standardGap;

          imageSet.textureUrls.forEach((texture) => {
            const geometry = new THREE.BoxGeometry(imageSet.shape[1], imageSet.shape[0], 1);
            const material = new THREE.MeshBasicMaterial({
              // TODO: Implement error handling here
              map: textureLoader.load(texture.href),
            });
            const layerMesh = new THREE.Mesh(geometry, material);

            layerMesh.position.x = xDimensionCumulative + imageSet.shape[1] / 2 - totalXLength / 2;
            layerMesh.position.y = maximumHeight / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(geometry);
            this.objectsToDisposal.push(material);
            this.scene.add(layerMesh);

            xDimensionCumulative += this.standardGap + imageSet.shape[1];

            const grid = new THREE.GridHelper(totalXLength * 1.25, totalXLength / 100);
            this.objectsToDisposal.push(grid);
            this.scene.add(grid);
          });
        } else if (imageSet.mode == '2d') {
          let xDimensionCumulative = 0;
          let yDimensionCumulative = 0;
          let xCellNumber = 0;
          let yCellNumber = 0;
          const cellNumbers = Math.ceil(Math.sqrt(imageSet.textureUrls.length))
          const totalXLength = cellNumbers * imageSet.shape[0] + (cellNumbers - 1) * this.standardGap;
          const totalYLength = cellNumbers * imageSet.shape[1] + (cellNumbers - 1) * this.standardGap;

          imageSet.textureUrls.forEach((texture) => {
            const geometry = new THREE.BoxGeometry(imageSet.shape[1], imageSet.shape[0], 1);
            const material = new THREE.MeshBasicMaterial({
              // TODO: Implement error handling here
              map: textureLoader.load(texture.href),
            });
            const layerMesh = new THREE.Mesh(geometry, material);

            layerMesh.position.x = xDimensionCumulative + imageSet.shape[1] / 2 - totalXLength / 2;
            layerMesh.position.y = yDimensionCumulative + imageSet.shape[0] / 2;
            // layerMesh.position.y = maximumHeight / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(geometry);
            this.objectsToDisposal.push(material);
            this.scene.add(layerMesh);

            xDimensionCumulative += this.standardGap + imageSet.shape[1];

            xCellNumber++;
            yCellNumber++;

            if (xCellNumber == cellNumbers) {
              xCellNumber = 0;
              yDimensionCumulative += this.standardGap + imageSet.shape[0];
              xDimensionCumulative = 0;
            }

            const grid = new THREE.GridHelper(totalXLength * 1.25, totalXLength / 100);
            this.objectsToDisposal.push(grid);
            this.scene.add(grid);
          });

        } else {
          // TODO: Throw error that unknown mode was hit
        }

        // if (dimensions.every(item => item.every(item2 => !Array.isArray(item2)))) {
        //   dimensions = dimensions as number[][]
        //   let z_dimension = 0
        //   dimensions.forEach((layer, index) => {
        //     const geometry = new THREE.BoxGeometry(layer[0], layer[1], layer[2]);
        //     const material = new THREE.MeshBasicMaterial({
        //       color: new THREE.Color(Math.random() * 0xffffff)
        //     });
        //     const layerMesh = new THREE.Mesh(geometry, material);
        //
        //     layerMesh.name = index.toString()
        //     layerMesh.position.z = z_dimension + layer[2] / 2;
        //     layerMesh.updateMatrix();
        //
        //     this.objectsToDisposal.push(layerMesh.name);
        //     this.scene.add(layerMesh);
        //
        //     z_dimension += 50 + layer[2];
        //   });
        //
        //   const grid = new THREE.GridHelper(z_dimension * 3, z_dimension * 3 / 100);
        //   this.objectsToDisposal.push(grid.name);
        //   this.scene.add(grid);
        // } else {
        // const objectCount = imageSet.length * imageSet[0].length * imageSet[0][0].length * imageSet[0][0][0].length;
        //
        // const geometry = new BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshBasicMaterial();
        // const mesh = new THREE.InstancedMesh(geometry, material, objectCount);
        // mesh.matrixAutoUpdate = false;
        // this.objectsToDisposal.push(mesh);
        // this.objectsToDisposal.push(material);
        // this.objectsToDisposal.push(geometry);
        // this.scene.add(mesh);
        //
        // const obj = new THREE.Object3D();
        // obj.position.z = this.z_shift;
        // let counter = 0;
        // let distanceX = 0;
        // const color = new THREE.Color();
        //
        // for (let i = 0; i < imageSet.length; ++i) {
        //   for (let j = 0; j < imageSet[i].length; ++j) {
        //     for (let k = 0; k < imageSet[i][j].length; ++k) {
        //       obj.position.x = distanceX;
        //       obj.position.y = k * 1.05;
        //       obj.updateMatrix();
        //       obj.matrixAutoUpdate = false;
        //       mesh.setMatrixAt(counter, obj.matrix);
        //
        //       color.set(
        //         imageSet[i][j][k][0] / 255,
        //         imageSet[i][j][k][1] / 255,
        //         imageSet[i][j][k][2] / 255,
        //       );
        //       mesh.setColorAt(counter, color);
        //
        //       counter++;
        //     }
        //     distanceX += 1.05;
        //   }
        //   distanceX += 10;
        // }

        // const grid = new THREE.GridHelper(distanceX * 1.5, distanceX * 3 / 100);
        // grid.position.x = distanceX / 2;
        // const grid = new THREE.GridHelper(1000, 30);
        // this.objectsToDisposal.push(grid);
        // this.scene.add(grid);

        this.continueAnimation = true;
        this.animate();
      });

    this.viewerControl.getCameraObservable()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((orientation) => {
        this.camera.position.set(orientation.position.x, orientation.position.y, orientation.position.z);
        this.camera.lookAt(orientation.lookAt);
        this.camera.zoom = orientation.zoom;

        this.camera.updateProjectionMatrix();
      });

    this.viewerControl.getCleanCanvasObservable()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe(() => {
        this.continueAnimation = false;

        this.objectsToDisposal.forEach((object) => {
          object.dispose();
          this.scene.remove(object);
        });
        this.objectsToDisposal.length = 0;

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

    this.camera.aspect = canvasWidth / canvasHeight;
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera);

    this.controls = new MapControls(this.camera, canvasElement);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);

    const grid = new THREE.GridHelper(100, 10);
    this.objectsToDisposal.push(grid);
    this.scene.add(grid);

    this.animate();
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
