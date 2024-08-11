import {Component, ElementRef, viewChild, AfterViewInit, OnInit} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { ModelStructure } from '../../model/model';
import { ModelCompositionService } from '../../services/model-compositions/model-composition.service';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit, AfterViewInit {
    public modelStructure: ModelStructure | null = null;

    public editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');
    public editorOuterDiv = viewChild.required<ElementRef<HTMLDivElement>>('editorOuterDiv');

    public scene= new THREE.Scene();
    public camera: THREE.PerspectiveCamera | null = null;
    public renderer: THREE.WebGLRenderer | null = null;

    constructor(
        private modelComposition: ModelCompositionService,
    ) {}

    public ngOnInit() {
        this.modelComposition.getModelStructure().subscribe(modelStructure => {
            if (modelStructure === null) {
                return;
            }
            this.modelStructure = modelStructure;
        });
    }

    public ngAfterViewInit() {
        this.resizeCanvas();

        // this.initializeEditor();
    }

    public resizeCanvas() {
        const editorOuterDivElement = this.editorOuterDiv().nativeElement;
        const canvasWidth = Math.max(0, editorOuterDivElement.clientWidth - 1);
        const canvasHeight = Math.max(0, editorOuterDivElement.clientHeight - 1);

        this.editorCanvas().nativeElement.width = canvasWidth;
        this.editorCanvas().nativeElement.height = canvasHeight;

        console.log({
            width: canvasWidth,
            height: canvasHeight
        });

        if (this.camera === null || this.renderer === null) {
            return;
        }

        // this.camera.aspect = canvasWidth / canvasHeight;
        // this.camera.updateProjectionMatrix();

        // this.renderer.setSize(canvasWidth, canvasHeight);
        // this.renderer.render(this.scene, this.camera);
    }

    public initializeEditor() {
        const canvasElement = this.editorCanvas().nativeElement;
        const canvasWidth = canvasElement.width;
        const canvasHeight = canvasElement.height;

        const material = new THREE.MeshToonMaterial();
        this.scene.add(
            new THREE.AmbientLight(0xffffff, 0.5)
        );

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.x = 2;
        pointLight.position.y = 2;
        pointLight.position.z = 2;
        this.scene.add(pointLight);

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            material
        );

        const torus = new THREE.Mesh(
            new THREE.TorusGeometry(5, 1.5, 16, 100),
            material
        );

        this.scene.add(torus, box);

        this.camera = new THREE.PerspectiveCamera(
            75,
            canvasWidth / canvasHeight,
            0.001,
            1000
        );
        this.camera.position.z = 30;
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElement,
        });
        this.renderer.setClearColor(0xe232222, 1);
        this.renderer.setSize(canvasWidth, canvasHeight);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.update();

        const animateGeometry = () => {
            controls.update();

            // Render
            this.renderer!.render(this.scene, this.camera!);

            // Call animateGeometry again on the next frame
            window.requestAnimationFrame(animateGeometry);
        };
        animateGeometry();
    }
}
