import {Component, computed, effect, OnInit, signal, untracked} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {Architecture} from "../../models/architecture";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {NetworkInput} from "../../models/network-input";

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
  ],
  templateUrl: './viewer-menu.component.html',
  styleUrl: './viewer-menu.component.scss',
})
export class ViewerMenuComponent implements OnInit {
  controlMode = 'general';
  viewMode = '3d';

  architectures = Array<Architecture>();

  selectedArchitectureIndex = signal(-1);
  readonly selectedArchitecture = computed(() => {
    if (this.selectedArchitectureIndex() > this.architectures.length) {
      return null;
    }

    return this.architectures[this.selectedArchitectureIndex()];
  });
  readonly isSliderDisabled = computed(() => {
    return this.selectedArchitecture() == null
  });
  readonly selectedSliderMax = computed(() => {
    const architecture = this.selectedArchitecture();
    if (architecture == null) {
      return 99;
    }

    return architecture.layers.length - 1;
  });
  readonly selectedSliderEnd = computed(() => {
    return Math.max(Math.floor(this.selectedSliderMax() * 0.05), 1);
  });
  sliderStartValue = signal(0);
  sliderEndValue = signal(0);

  readonly layers = computed(() => {
    const architecture = this.selectedArchitecture()
    if (architecture) {
      return architecture.layers;
    }

    return [];
  });
  selectedLayerIndex = signal(-1);

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
  ) {
    effect(() => {
      const architecture = this.selectedArchitecture();
      if (architecture) {
        this.viewerControl.setDimensions(
          architecture.dimensions.slice(this.sliderStartValue(), this.sliderEndValue()),
        );
      }
    });
  }

  ngOnInit() {
    this.dataLayer.get<Architecture[]>('/api/1/architecture/').subscribe({
      next: (architectures) => {
        this.architectures = architectures;
        this.notificationHandler.success('Architectures loaded');
      },
      error: (error) => {
        this.notificationHandler.error('Failed to load architectures');
        this.notificationHandler.error(error);
      },
    });
  }

  onGeneralControlModeActivation() {
    this.controlMode = 'general';
  }

  onFileControlModeActivation() {
    this.controlMode = 'file';
  }

  on2dViewModeActivation() {
    this.viewMode = '2d';
  }

  on3dViewModeActivation() {
    this.viewMode = '3d';
  }

  formatSlider(value: number) {
    return `L${value + 1}`;
  }

  onFileUpload(event: any) {
    const file: File = event.target.files[0];
    const architecture = this.selectedArchitecture();

    if (file && this.selectedLayerIndex() != -1 && architecture) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.dataLayer.post<NetworkInput>(`/api/1/network_input/`, formData).subscribe({
        next: (value) => {
          const postData = {uuid: value.uuid, architecture: architecture.id,layer_index: this.selectedLayerIndex()};

          this.dataLayer.post<number[][][]>('/api/1/process/network_input/', postData).subscribe({
            next: (layerOutput) => {
              this.viewerControl.setDimensions(layerOutput);
            },
            error: (error) => {
              this.notificationHandler.error('File upload Failed');
              this.notificationHandler.error(error);
            },
          });
        },
        error: (error) => {
          this.notificationHandler.error('File upload Failed');
          this.notificationHandler.error(error);
        },
      });
    } else {
      this.notificationHandler.info('Upload file not provided');
    }
  }
}
