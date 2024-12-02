import {Component, OnInit} from '@angular/core';
import {ComparatorControlBarComponent} from "../comparator-control-bar/comparator-control-bar.component";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ArchitectureProcessed, ArchitectureProcessedRequest} from "../../models/architecture-processed";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Layer} from "../../models/layer";

@Component({
  selector: 'app-comparator',
  standalone: true,
  imports: [
    ComparatorControlBarComponent
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

  fetchLayerInfo(uuid: string) {
    let architectureIndex = this.architecturesProcessed.findIndex((value) =>  {
      return value.uuid == uuid;
    });

    if (architectureIndex == -1) {
      this.notificationHandler.error('Architecture with related UUID not found');
      return;
    }

    if (this.architecturesProcessed[architectureIndex].layers.length != 0) {
      this.architecturesProcessed[architectureIndex].layers = [];
      return;
    }

    this.dataLayer.get<Layer[]>(`api/1/layers/?processed_architecture=${uuid}`)
      .subscribe({
        next: (layers) => {
          this.architecturesProcessed[architectureIndex].layers = layers;
          this.notificationHandler.success('Architecture layer info loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load architecture layer info');
        },
      })
  }
}
