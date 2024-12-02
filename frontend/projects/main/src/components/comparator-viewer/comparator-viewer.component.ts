import {Component, Input, OnInit, signal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ColorMap} from "../../models/color-map";
import {Normalization} from "../../models/normalization";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActivationFromLayer} from "../../models/activation";

@Component({
  selector: 'app-comparator-viewer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './comparator-viewer.component.html',
  styleUrl: './comparator-viewer.component.scss'
})
export class ComparatorViewerComponent implements OnInit {
  @Input({required: true}) architectureUUID: string = "";
  @Input({required: true}) layerUUID: string = "";
  @Input({required: true}) activations: ActivationFromLayer | null = null;

  selectedFile0UUID = signal<string | null>(null);
  selectedFile1UUID = signal<string | null>(null);
  selectedFilterIndex = signal<string | null>(null);
  selectedNormalizationId = signal<string | null>(null);
  selectedColorMapUUID = signal<string | null>(null);

  normalizations = Array<Normalization>();
  colorMaps = Array<ColorMap>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {

    this.dataLayer.get<Normalization[]>('/api/1/color_map/normalization/')
      .subscribe({
        next: (normalizations) => {
          this.normalizations = normalizations;
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load normalizations');
        },
      });

    this.dataLayer.get<ColorMap[]>('/api/1/color_map/')
      .subscribe({
        next: (colorMaps) => {
          this.colorMaps = colorMaps;
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load color maps');
        },
      });
  }
}
