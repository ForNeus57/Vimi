import {Component, computed, Input, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {NetworkInput} from "../../models/network-input";
import {NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Architecture} from "../../models/architecture";
import {ColorMap, ColorMapProcessOutput, ColorMapRequestData, ImageSet} from "../../models/color-map";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";
import {Normalization} from "../../models/normalization";

@Component({
  selector: 'app-viewer-menu-file',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
  ],
  templateUrl: './viewer-menu-file.component.html',
  styleUrls: [
    '../viewer-menu/viewer-menu.component.scss',
    './viewer-menu-file.component.scss',
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

  viewMode = '1d';

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
  ) {
  }

  on1dViewModeActivation() {
    this.viewMode = '1d';
  }

  on2dViewModeActivation() {
    this.viewMode = '2d';
  }
}
