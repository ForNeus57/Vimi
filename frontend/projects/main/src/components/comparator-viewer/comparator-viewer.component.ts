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
  @Input({required: true}) networkInputs: Array<ActivationFromLayer> = [];

  selectedColorMapUUID = signal<string | null>(null);

  colorMaps = Array<ColorMap>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {

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
