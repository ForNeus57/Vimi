import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { ModelCompositionService } from './services/model-compositions/model-composition.service';
import {NotificationHandlerComponent} from "./components/notification-handler/notification-handler.component";


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, NotificationHandlerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    public isEditorVisible = false;

    constructor(
        private modelComposition: ModelCompositionService,
    ) {}

    ngOnInit() {
        this.modelComposition.getModelStructure().subscribe(modelStructure => {
            this.isEditorVisible = modelStructure !== null;
        });
    }
}
