import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import * as THREE from "three";
import {isPlatformServer} from "@angular/common";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {filter, Subject, takeUntil} from "rxjs";
import {ColorMapProcessOutput, ImageSet} from "../../models/color-map";
import {ViewerCanvasControlComponent} from "../viewer-canvas-control/viewer-canvas-control.component";
import {
  ViewerCanvasColorMapIndicatorComponent
} from "../viewer-canvas-color-map-indicator/viewer-canvas-color-map-indicator.component";
import {MapControls} from "three/addons/controls/MapControls.js";

@Component({
  selector: 'app-viewer-canvas',
  standalone: true,
  imports: [
    ViewerCanvasControlComponent,
    ViewerCanvasColorMapIndicatorComponent,
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
  private camera = new THREE.PerspectiveCamera(75, 1., 0.001, 100000);
  private orbitControls: OrbitControls | null = null;
  private mapControls: MapControls | null = null;
  private renderer: THREE.WebGLRenderer | null = null;

  // TODO: I hate the fact it has to be like that
  private animate = () => {
    if (this.orbitControls != null
        && this.mapControls != null
        && this.renderer != null
        && this.continueAnimation != null) {
      if (this.orbitControls.enabled) {
        this.orbitControls.update();
      }
      if (this.mapControls.enabled) {
        this.mapControls.update();
      }
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

        this.cleanCanvas()

        const textureLoader = new THREE.TextureLoader();
        const maximumHeight = imageSet.shape[0];
        if (imageSet.mode == '1d') {
          let xDimensionCumulative = 0;
          const totalXLength = imageSet.textureUrls.length * imageSet.shape[1] + (imageSet.textureUrls.length - 1) * this.standardGap;

          imageSet.textureUrls.forEach((textureUrl) => {
            const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet);

            layerMesh.position.x = xDimensionCumulative + imageSet.shape[1] / 2 - totalXLength / 2;
            layerMesh.position.y = maximumHeight / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(layerMesh);
            this.scene.add(layerMesh);

            xDimensionCumulative += this.standardGap + imageSet.shape[1];
          });

          const grid = new THREE.GridHelper(totalXLength * 1.25, totalXLength / 1000);
          grid.position.y = -0.1;
          this.objectsToDisposal.push(grid);
          this.scene.add(grid);
        } else if (imageSet.mode == '1dz') {
          let zDimensionCumulative = 0;
          const zGap = this.standardGap * 15;
          const totalZLength = imageSet.textureUrls.length + (imageSet.textureUrls.length - 1) * zGap;

          imageSet.textureUrls.forEach((textureUrl, index) => {
            const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet);

            layerMesh.position.y = maximumHeight / 2;
            layerMesh.position.z = zDimensionCumulative + 0.5 - totalZLength / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(layerMesh);
            this.scene.add(layerMesh);

            zDimensionCumulative += zGap + 0.5;
          });

          const grid = new THREE.GridHelper(totalZLength * 1.25, totalZLength / 1000);
          grid.position.y = -0.1;
          this.objectsToDisposal.push(grid);
          this.scene.add(grid);
        } else if (imageSet.mode == '2d') {
          let xDimensionCumulative = 0;
          let yDimensionCumulative = 0;
          let xCellNumber = 0;
          let yCellNumber = 0;
          const cellNumbers = Math.ceil(Math.sqrt(imageSet.textureUrls.length))
          const totalXLength = cellNumbers * imageSet.shape[1] + (cellNumbers - 1) * this.standardGap;

          imageSet.textureUrls.forEach((textureUrl) => {
            const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet);

            layerMesh.position.x = xDimensionCumulative + imageSet.shape[1] / 2 - totalXLength / 2;
            layerMesh.position.y = yDimensionCumulative + imageSet.shape[0] / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(layerMesh);
            this.scene.add(layerMesh);

            xDimensionCumulative += this.standardGap + imageSet.shape[1];

            xCellNumber++;
            yCellNumber++;

            if (xCellNumber == cellNumbers) {
              xCellNumber = 0;
              xDimensionCumulative = 0;
              yDimensionCumulative += this.standardGap + imageSet.shape[0];
            }
          });

          const grid = new THREE.GridHelper(totalXLength * 1.25, totalXLength / 100);
          grid.position.y = -0.1;
          this.objectsToDisposal.push(grid);
          this.scene.add(grid);
        } else {
          // TODO: Throw error that unknown mode was hit
        }

        this.continueAnimation = true;
        this.animate();
      });

    this.viewerControl.getImageSet3d()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        filter((newImageSet3d) => newImageSet3d != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (newImageSet3d) => {
          this.continueAnimation = false;

          this.cleanCanvas()

          const zGap = this.standardGap * 7.5;
          const zGapBig = this.standardGap * 30;
          const totalZLength = newImageSet3d.reduce((prev, value) => {
            return prev + value.urls.length + (value.urls.length - 1) * zGap;
          }, 0) + (newImageSet3d.length - 1) * zGapBig;
          let zDimensionCumulative = 0;

          const textureLoader = new THREE.TextureLoader();
          newImageSet3d.forEach((imageSet) => {
            const totalZLengthSmall = imageSet.urls.length + (imageSet.urls.length - 1) * zGap;
            const maximumHeight = imageSet.shape[0];

            imageSet.urls.forEach((textureUrl) => {
              const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet);

              layerMesh.position.y = maximumHeight / 2;
              layerMesh.position.z = zDimensionCumulative + 0.5 - totalZLength / 2;
              layerMesh.updateMatrix();

              this.objectsToDisposal.push(layerMesh);
              this.scene.add(layerMesh);
              zDimensionCumulative += zGap + 0.5;
            });

            zDimensionCumulative += zGapBig;
          });

          const grid = new THREE.GridHelper(totalZLength * 1.25, totalZLength / 10000);
          grid.position.y = -0.1;
          this.objectsToDisposal.push(grid);
          this.scene.add(grid);

          this.continueAnimation = true;
          this.animate();
        },
      });

    this.viewerControl.getCameraObservable()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((orientation) => {
        if (this.orbitControls != null) {
          this.orbitControls.reset();
        }
        if (this.mapControls != null) {
          this.mapControls.reset();
        }
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
        this.cleanCanvas()

        const grid = new THREE.GridHelper(100, 10);
        grid.position.y = -0.1;
        this.objectsToDisposal.push(grid);
        this.scene.add(grid);

        this.continueAnimation = true;
        this.animate();
      });

    this.viewerControl.getControlsToggleObservable()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({
        next: () => {
          if (this.orbitControls != null) {
            this.orbitControls.enabled = !this.orbitControls.enabled;
          }
          if (this.mapControls != null) {
            this.mapControls.enabled = !this.mapControls.enabled;
          }
        },
      })
  }

  ngOnDestroy() {
    this.cleanCanvas();
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

    this.orbitControls = new OrbitControls(this.camera, canvasElement);
    this.mapControls = new MapControls(this.camera, canvasElement);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const grid = new THREE.GridHelper(100, 10);
    grid.position.y = -0.1;
    this.objectsToDisposal.push(grid);
    this.scene.add(grid);

    this.orbitControls.saveState();
    this.mapControls.saveState();
    this.orbitControls.enabled = false;
    this.mapControls.enabled = true;

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

  private cleanCanvas() {
    this.objectsToDisposal.forEach((object) => {
      this.scene.remove(object);
      object.geometry.dispose();
      if (object.material.map != null) {
        object.material.forEach((tex: any) => { tex.map.dispose(); });
      } else {
        object.material.dispose();
      }
    });
    this.objectsToDisposal.length = 0;
  }

  private createMesh(loader: THREE.TextureLoader, urls: string[], imageSet: ImageSet | ColorMapProcessOutput) {
    const textures = [
      loader.load(urls[0]),
      loader.load(urls[1]),
      loader.load(urls[2]),
      loader.load(urls[3]),
      loader.load(urls[4]),
      loader.load(urls[5]),
    ]

    textures.forEach((texture) => {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
    });

    return new THREE.Mesh(
      new THREE.BoxGeometry(imageSet.shape[1], imageSet.shape[0], 1),
      [
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[0],
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[1],
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[2],
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[3],
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[4],
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: textures[5],
        }),
      ],
    );
  }
}
