import {Component} from '@angular/core';
import {ViewerCanvasComponent} from "../viewer-canvas/viewer-canvas.component";
import {TopControlBarComponent} from "../top-control-bar/top-control-bar.component";
import {BottomControlBarComponent} from "../bottom-control-bar/bottom-control-bar.component";

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [
    ViewerCanvasComponent,
    TopControlBarComponent,
    BottomControlBarComponent,
  ],
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.scss',
})
export class ModelViewerComponent {
  // TODO: Rename this component so it name matches the code repo
  // TODO: Consider removing this component

  constructor(
  ) {
  }
}
