import { Component, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

import { ModelStructure } from '../../model/model';
import { ModelCompositionService } from '../../services/model-compositions/model-composition.service';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css'
})
export class EditorComponent implements AfterViewInit {
    private modelComposition: ModelCompositionService;
    public modelStructure: ModelStructure | null;

    public editorCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('editorCanvas');
    public editorOuterDiv = viewChild.required<ElementRef<HTMLDivElement>>('editorOuterDiv');

    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera | null;
    public renderer: THREE.WebGLRenderer | null;


    public constructor(modelComposition: ModelCompositionService) {
        this.modelComposition = modelComposition;
        this.modelStructure = null;

        this.modelComposition.getModelStructure().subscribe(modelStructure => {
            if (modelStructure === null) {
                return;
            }
            this.modelStructure = modelStructure;
        });

        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
    }

    public ngAfterViewInit() {
        this.resizeCanvas({
            target: {
                innerWidth: this.editorOuterDiv().nativeElement.clientWidth,
                innerHeight: this.editorOuterDiv().nativeElement.clientHeight
            }
        });

        this.initializeEditor();
    }

    public resizeCanvas(event: any) {
        this.editorCanvas().nativeElement.width = event.target.innerWidth;
        this.editorCanvas().nativeElement.height = event.target.innerWidth;

        if (this.camera === null || this.renderer === null) {
            return;
        }

        this.camera.aspect = this.editorCanvas().nativeElement.width / this.editorCanvas().nativeElement.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.editorCanvas().nativeElement.width, this.editorCanvas().nativeElement.height);
        this.renderer.render(this.scene, this.camera);
    }

    public initializeEditor() {
        const material = new THREE.MeshToonMaterial();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

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
            this.editorCanvas().nativeElement.width / this.editorCanvas().nativeElement.height,
            0.001,
            1000
        );
        this.camera.position.z = 30;
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.editorCanvas().nativeElement,
        });
        this.renderer.setClearColor(0xe232222, 1);
        this.renderer.setSize(this.editorCanvas().nativeElement.width, this.editorCanvas().nativeElement.height);

        const clock = new THREE.Clock();

        const animateGeometry = () => {
            const elapsedTime = clock.getElapsedTime();

            // Update animation objects
            box.rotation.x = elapsedTime;
            box.rotation.y = elapsedTime;
            box.rotation.z = elapsedTime;

            torus.rotation.x = -elapsedTime;
            torus.rotation.y = -elapsedTime;
            torus.rotation.z = -elapsedTime;

            // Render
            this.renderer!.render(this.scene, this.camera!);

            // Call animateGeometry again on the next frame
            window.requestAnimationFrame(animateGeometry);
        };

        animateGeometry();
    }

}
