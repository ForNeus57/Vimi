import {Component} from '@angular/core';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import {ViewerCanvasComponent} from "../viewer-canvas/viewer-canvas.component";

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [
    ViewerMenuComponent,
    ViewerCanvasComponent,
  ],
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.scss',
})
export class ModelViewerComponent {
  constructor(
  ) {
  }
}
