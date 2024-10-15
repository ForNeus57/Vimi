import {Component, OnInit, signal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {Architecture} from "../../models/architecture";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-viewer-menu',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './viewer-menu.component.html',
  styleUrl: './viewer-menu.component.scss'
})
export class ViewerMenuComponent implements OnInit {
  architectureId = signal(0);
  layerName = signal('');
  filter = signal(0);

  architectures = Array<Architecture>();
  layers = Array<string>();
  filters = 0;

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService
  ) {
  }

  ngOnInit() {
    this.dataLayer.get<Array<Architecture>>('/api/1/architecture').subscribe({
      next: (data) => {
        this.architectures = data;
        console.log('Architectures loaded', this.architectures);
      },
      error: (error) => {
        this.notificationHandler.error('Failed to load architectures');
      },
    });

    // this.architectureName.valueChanges.subscribe((selectedArchitectureId) => {
    //   if (selectedArchitectureId === null) {
    //     return;
    //   }
    //
    //   const resultingLayers = this.architectures.find(
    //     (architecture) => architecture.id === selectedArchitectureId
    //   )?.layers;
    //
    //   if (resultingLayers === undefined) {
    //     return;
    //   }
    //
    //   this.layers = resultingLayers;
    // });
    //
    // this.layerName.valueChanges.subscribe((selectedLayer) => {
    //   if (selectedLayer === null) {
    //     return;
    //   }
    //
    //   this.filters = this.layers.indexOf(selectedLayer);
    // });
  }

  protected readonly Array = Array;
}
