import {Component, computed, effect, OnInit, signal, WritableSignal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {Architecture} from "../../models/architecture";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {NetworkInput} from "../../models/network-input";
import {NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";

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

  selectedArchitectureIndex: WritableSignal<number | null> = signal(null);
  readonly selectedArchitecture = computed(() => {
    const architectureId = this.selectedArchitectureIndex();
    if (architectureId == null) {
      return null;
    }

    return this.architectures[architectureId];
  });
  readonly isSliderDisabled = computed(() => {
    return this.selectedArchitecture() == null
  });
  readonly selectedSliderMax = computed(() => {
    const architecture = this.selectedArchitecture();
    if (architecture == null) {
      return 1;
    }

    return architecture.layers.length - 1;
  });
  readonly selectedSliderEnd = computed(() => {
    return Math.max(Math.floor(this.selectedSliderMax() * 0.5), 1);
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
  selectedLayerIndex: WritableSignal<number | null> = signal(null);

  selectedFile: File | null = null;
  selectedFileUUID: string | null = null

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
  ) {
    effect(() => {
      const architecture = this.selectedArchitecture();
      if (architecture == null) {
        return;
      }

      this.viewerControl.setDimensions(
        architecture.dimensions.slice(this.sliderStartValue(), this.sliderEndValue()),
      );
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

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files == null) {
      this.notificationHandler.info('No files provided');
      return;
    }

    if (files.length > 1) {
      this.notificationHandler.info('Too many files provided');
      return;
    }

    // TODO: Check if the files change and if not do not make an request
    this.selectedFile = files[0];

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.dataLayer.post<NetworkInput>('/api/1/network_input/', formData).subscribe({
      next: (value) => {
        this.selectedFileUUID = value.uuid;
        this.notificationHandler.success('Successfully generated file UUID');
      },
      error: (error) => {
        this.notificationHandler.error('File upload Failed');
        this.notificationHandler.error(error);
      },
    });
  }

  onFileUpload() {
    const architecture = this.selectedArchitecture();
    const layerIndex = this.selectedLayerIndex();

    if (this.selectedFileUUID == null) {
      this.notificationHandler.info('File has no UUID assigned');
      return;
    }

    if (architecture == null) {
      this.notificationHandler.info('Architecture is not selected');
      return;
    }

    if (layerIndex == null) {
      this.notificationHandler.info('Layer is not selected');
      return;
    }

    const postData = new NetworkOutputRequestData(this.selectedFileUUID, architecture.id, layerIndex);
    this.dataLayer.post<NetworkOutput>('/api/1/process/network_input/', postData).subscribe({
      next: (layerOutput) => {
        this.notificationHandler.success('Successfully fetched layer activations');
        this.viewerControl.setDimensions(layerOutput.output);
      },
      error: (error) => {
        this.notificationHandler.error('File upload Failed');
        this.notificationHandler.error(error);
      },
    });
  }
}
