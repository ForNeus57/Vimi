import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {Architecture} from "../../models/architecture";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {ViewerMenuFileComponent} from "../viewer-menu-file/viewer-menu-file.component";
import {ViewerMenuGeneralComponent} from "../viewer-menu-general/viewer-menu-general.component";

@Component({
  selector: 'app-viewer-menu',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    MatSlider,
    MatSliderThumb,
    MatSliderRangeThumb,
    ViewerMenuFileComponent,
    ViewerMenuGeneralComponent,
  ],
  templateUrl: './viewer-menu.component.html',
  styleUrl: './viewer-menu.component.scss',
})
export class ViewerMenuComponent implements OnInit {
  selectedArchitectureIndex: WritableSignal<number | null> = signal(null);

  readonly selectedArchitecture = computed(() => {
    const architectureId = this.selectedArchitectureIndex();
    if (architectureId == null
        || architectureId < 0
        || architectureId >= this.architectures.length) {
      return null;
    }

    return this.architectures[architectureId];
  });

  controlMode = 'general';
  architectures = Array<Architecture>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  ngOnInit() {
    this.dataLayer.get<Architecture[]>('/api/1/architecture/')
      .subscribe({
        next: (architectures) => {
          this.architectures = architectures;
          this.notificationHandler.success('Architectures loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load architectures');
        },
      });
  }

  onGeneralControlActivation() {
    this.controlMode = 'general';
  }

  onFileControlActivation() {
    this.controlMode = 'file';
  }
}
