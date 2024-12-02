import {Component, OnInit} from '@angular/core';
import {ComparatorControlBarComponent} from "../comparator-control-bar/comparator-control-bar.component";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ArchitectureProcessed, ArchitectureProcessedRequest} from "../../models/architecture-processed";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Layer, LayerWithMetadata} from "../../models/layer";
import {ComparatorViewerComponent} from "../comparator-viewer/comparator-viewer.component";
import {ActivationFromLayer} from "../../models/activation";

@Component({
  selector: 'app-comparator',
  standalone: true,
  imports: [
    ComparatorControlBarComponent,
    ComparatorViewerComponent
  ],
  templateUrl: './comparator.component.html',
  styleUrl: './comparator.component.scss'
})
export class ComparatorComponent implements OnInit {

  architecturesProcessed = Array<ArchitectureProcessed>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {
    this.dataLayer.get<ArchitectureProcessedRequest[]>('api/1/architecture/processed/')
      .subscribe({
        next: (architecturesProcessed) => {
          this.architecturesProcessed = architecturesProcessed.map((value) => {
            return new ArchitectureProcessed(value.uuid, value.name, value.layer_count, []);
          });
          this.notificationHandler.success('Processed Architectures loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load processed architectures');
        },
      })
  }

  fetchLayerInfo(architectureProcessedUUID: string) {
    let architectureIndex = this.architecturesProcessed.findIndex((value) =>  {
      return value.uuid == architectureProcessedUUID;
    });

    if (architectureIndex == -1) {
      this.notificationHandler.error('Architecture with related UUID not found');
      return;
    }

    if (this.architecturesProcessed[architectureIndex].showDetails) {
      this.architecturesProcessed[architectureIndex].showDetails = false;
      return;
    }

    this.dataLayer.get<Layer[]>(`api/1/layers/?processed_architecture=${architectureProcessedUUID}`)
      .subscribe({
        next: (layers) => {
          this.architecturesProcessed[architectureIndex].layers = layers.map((value => {
            return new LayerWithMetadata(
              value.uuid,
              value.layer_number,
              value.presentation_name,
              value.presentation_dimensions,
            );
          }));
          this.architecturesProcessed[architectureIndex].showDetails = true;
          this.notificationHandler.success('Architecture layer info loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load architecture layer info');
        },
      });
  }

  fetchNetworkInputInfo(architectureProcessedUUID:string, layerUUID: string) {
    let architectureIndex = this.architecturesProcessed.findIndex((value) =>  {
      return value.uuid == architectureProcessedUUID;
    });

    if (architectureIndex == -1) {
      this.notificationHandler.error('Architecture with related UUID not found');
      return;
    }

    let layerIndex = this.architecturesProcessed[architectureIndex].layers.findIndex((value) => {
      return value.uuid == layerUUID;
    });

    if (layerIndex == -1) {
      this.notificationHandler.error('Layer with related UUID not found');
      return;
    }

    let layer = this.architecturesProcessed[architectureIndex].layers[layerIndex];

    if (layer.showDetails) {
      layer.showDetails = false;
      return;
    }

    this.dataLayer.get<ActivationFromLayer[]>(`api/1/network_input/?processed_layer=${layer.uuid}`)
      .subscribe({
        next: (networkInputs) => {
          layer.network_inputs = networkInputs;
          layer.showDetails = true;
          this.notificationHandler.success('Network Input info loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load network input info');
        },
      });
  }
}
