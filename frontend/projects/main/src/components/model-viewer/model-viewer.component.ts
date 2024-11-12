import {Component} from '@angular/core';
import {ViewerMenuComponent} from "../viewer-menu/viewer-menu.component";
import {ViewerCanvasComponent} from "../viewer-canvas/viewer-canvas.component";
import {ViewerSecondaryMenuComponent} from "../viewer-secondary-menu/viewer-secondary-menu.component";
import {TopControlBarComponent} from "../top-control-bar/top-control-bar.component";
import {BottomControlBarComponent} from "../bottom-control-bar/bottom-control-bar.component";

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [
    ViewerMenuComponent,
    ViewerCanvasComponent,
    ViewerSecondaryMenuComponent,
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
