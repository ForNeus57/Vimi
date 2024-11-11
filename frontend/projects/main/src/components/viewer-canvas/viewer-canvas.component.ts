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
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import * as THREE from "three";
import {isPlatformServer} from "@angular/common";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {filter, Subject, takeUntil} from "rxjs";
import {ImageSet} from "../../models/color-map";

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
  private controls: OrbitControls | null = null;
  private renderer: THREE.WebGLRenderer | null = null;

  // TODO: I hate the fact it has to be like that
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

        this.cleanCanvas()

        const textureLoader = new THREE.TextureLoader();
        const maximumHeight = imageSet.shape[0];
        if (imageSet.mode == '1d') {
          let xDimensionCumulative = 0;
          const totalXLength = imageSet.textureUrls.length * imageSet.shape[1] + (imageSet.textureUrls.length - 1) * this.standardGap;

          imageSet.textureUrls.forEach((textureUrl) => {
            const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet)

            layerMesh.position.x = xDimensionCumulative + imageSet.shape[1] / 2 - totalXLength / 2;
            layerMesh.position.y = maximumHeight / 2;
            layerMesh.updateMatrix();

            this.objectsToDisposal.push(layerMesh);
            this.scene.add(layerMesh);

            xDimensionCumulative += this.standardGap + imageSet.shape[1];
          });

          const grid = new THREE.GridHelper(totalXLength * 1.25, totalXLength / 100);
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
            const layerMesh = this.createMesh(textureLoader, textureUrl, imageSet)

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
          this.objectsToDisposal.push(grid);
          this.scene.add(grid);
        } else {
          // TODO: Throw error that unknown mode was hit
        }

        this.continueAnimation = true;
        this.animate();
      });

    this.viewerControl.getCameraObservable()
      .pipe(
        filter(() => !isPlatformServer(this.platform)),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((orientation) => {
        if (this.controls != null) {
          this.controls.reset();
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
        this.objectsToDisposal.push(grid);
        this.scene.add(grid);

        this.continueAnimation = true;
        this.animate();
      });
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

    this.controls = new OrbitControls(this.camera, canvasElement);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(canvasWidth, canvasHeight);

    const grid = new THREE.GridHelper(100, 10);
    this.objectsToDisposal.push(grid);
    this.scene.add(grid);

    this.controls.saveState();

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

  private createMesh(loader: THREE.TextureLoader, urls: string[], imageSet: ImageSet) {
    return new THREE.Mesh(
      new THREE.BoxGeometry(imageSet.shape[1], imageSet.shape[0], 1),
      [
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[0])
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[1])
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[2])
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[3])
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[4])
        }),
        new THREE.MeshBasicMaterial({
          // TODO: Implement error handling here
          map: loader.load(urls[5])
        }),
      ],
    );
  }
}
