import {Component, computed, Input, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {Architecture} from "../../models/architecture";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-viewer-menu-file',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
  ],
  templateUrl: './viewer-menu-file.component.html',
  styleUrls: [
    './viewer-menu-file.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ViewerMenuFileComponent {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
    this.selectedLayerIndex.set(null);
  };

  internalArchitecture = signal<Architecture | null>(null);
  selectedLayerIndex = signal<number | null>(null);

  readonly computedLayers = computed(() => {
    const architecture = this.internalArchitecture();
    if (architecture) {
      const layers = architecture.layers;
      return layers.map((value) => new Layer(layers.indexOf(value), value));
    }

    return [];
  });

  canvasElementPlacement = '1d';

  constructor(
  ) {
  }

  on1dViewModeActivation() {
    this.canvasElementPlacement = '1d';
  }

  on2dViewModeActivation() {
    this.canvasElementPlacement = '2d';
  }
}
