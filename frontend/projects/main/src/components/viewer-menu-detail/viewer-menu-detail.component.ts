import {Component, computed, Input, signal} from '@angular/core';
import {Architecture} from "../../models/architecture";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-viewer-menu-detail',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './viewer-menu-detail.component.html',
  styleUrls: [
    './viewer-menu-detail.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class ViewerMenuDetailComponent {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
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

  constructor(
  ) {
  }
}
