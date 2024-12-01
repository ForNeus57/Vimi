import {Component, OnInit} from '@angular/core';
import {ComparatorControlBarComponent} from "../comparator-control-bar/comparator-control-bar.component";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ArchitectureProcessed, ArchitectureProcessedRequest} from "../../models/architecture-processed";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";

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

  }
}
