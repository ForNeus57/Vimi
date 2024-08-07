import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { ModelCompositionService } from './services/model-compositions/model-composition.service';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    private modelComposition: ModelCompositionService;
    public isEditorVisible: boolean;

    public constructor(modelComposition: ModelCompositionService) {
        this.modelComposition = modelComposition;
        this.isEditorVisible = false;

        this.modelComposition.getModelStructure().subscribe(modelStructure => {
            this.isEditorVisible = modelStructure !== null;
        });
    }
}
