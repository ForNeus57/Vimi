import {Component, computed, OnInit, signal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {Architecture} from "../../models/architecture";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {ViewerMenuFileComponent} from "../viewer-menu-file/viewer-menu-file.component";
import {ViewerMenuGeneralComponent} from "../viewer-menu-general/viewer-menu-general.component";
import {ViewerMenuDetailComponent} from "../viewer-menu-detail/viewer-menu-detail.component";
import {ColorMap, ColorMapProcessOutput, ColorMapRequestData} from "../../models/color-map";
import {Normalization} from "../../models/normalization";
import {NetworkInput} from "../../models/network-input";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";

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
    ViewerMenuGeneralComponent,
    ViewerMenuFileComponent,
    ViewerMenuDetailComponent,
  ],
  templateUrl: './viewer-menu.component.html',
  styleUrl: './viewer-menu.component.scss',
})
export class ViewerMenuComponent implements OnInit {
  selectedArchitectureIndex = signal<number | null>(null);
  selectedFileUUID = signal<string | null>(null);
  selectedNormalizationId = signal<string | null>(null);
  selectedActivation = signal<string | null>(null);
  selectedColorMapUUID = signal<string | null>(null);

  readonly selectedArchitecture = computed(() => {
    const architectureIndex = this.selectedArchitectureIndex();
    if (architectureIndex == null
        || architectureIndex < 0
        || architectureIndex >= this.architectures.length) {
      return null;
    }

    return this.architectures[architectureIndex];
  });
  readonly isDownloadActivationsDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const architecture = this.selectedArchitecture();
    const fileUUID = this.selectedFileUUID();
    const normalization = this.selectedNormalizationId();

    return architecture == null
      || fileUUID == null
      || normalization == null;
  });
  readonly isColorMapChangeDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const activations = this.selectedActivation();
    const colorMapUUID = this.selectedColorMapUUID();

    return activations == null
      || colorMapUUID == null;
  });


  controlMode = 'general';
  architectures = Array<Architecture>();
  colorMaps = Array<ColorMap>();
  normalizations = Array<Normalization>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
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

    this.dataLayer.get<ColorMap[]>('/api/1/color_map/')
      .subscribe({
        next: (colorMaps) => {
          this.colorMaps = colorMaps;
          this.notificationHandler.success('Color Maps loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load color maps');
        },
      });

    this.dataLayer.get<Normalization[]>('/api/1/activation/normalization/')
      .subscribe({
        next: (normalizations) => {
          this.normalizations = normalizations;
          this.notificationHandler.success('Normalizations loaded');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load normalizations');
        },
      });
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
    const selectedFile = files[0];
    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    this.dataLayer.post<NetworkInput>('/api/1/network_input/', formData)
      .subscribe({
        next: (value) => {
          this.notificationHandler.success(`Successfully generated file UUID for ${selectedFile.name}`);
          this.selectedFileUUID.set(value.uuid);
        },
        error: (error) => {
          this.notificationHandler.error('File upload Failed');
          this.notificationHandler.error(error);
        },
      });
  }

  onDownloadActivations() {
    const architecture = this.selectedArchitecture();
    // const layerIndex = this.selectedLayerIndex();
    const fileUUID = this.selectedFileUUID();
    const normalization = this.selectedNormalizationId();

    if (architecture == null) {
      this.notificationHandler.info('Architecture is not selected');
      return;
    }

    // if (layerIndex == null) {
    //   this.notificationHandler.info('Layer is not selected');
    //   return;
    // }

    if (fileUUID == null) {
      this.notificationHandler.info('File has no UUID assigned');
      return;
    }

    if (normalization == null) {
      this.notificationHandler.info('Normalization is not selected');
      return;
    }


    // const postData = new NetworkOutputRequestData(
    //   architecture.uuid,
    //   layerIndex,
    //   fileUUID,
    //   normalization,
    // );
    // this.dataLayer.post<NetworkOutput>('/api/1/network_input/process/', postData)
    //   .subscribe({
    //     next: (output) => {
    //       this.notificationHandler.success('Successfully fetched layer activations');
    //       this.selectedActivations.set(output.uuid);
    //
    //       // TODO: Make it less dodgy
    //       const previousColorMap = this.selectedColorMapUUID();
    //       this.selectedColorMapUUID.set(this.colorMaps[0].uuid)
    //       this.onColorMapChange();
    //       this.selectedColorMapUUID.set(previousColorMap);
    //     },
    //     error: (error) => {
    //       this.notificationHandler.error('Failed to download activations');
    //       this.notificationHandler.error(error);
    //     },
    //   });
  }

  onColorMapChange() {
    const activation = this.selectedActivation();
    const colorMap = this.selectedColorMapUUID();

    if (activation == null) {
      this.notificationHandler.info('Activations not downloaded');
      return;
    }

    if (colorMap == null) {
      this.notificationHandler.info('Color Map is not selected');
      return;
    }

    const postData = new ColorMapRequestData(
      activation,
      colorMap
    )
    this.dataLayer.post<ColorMapProcessOutput>('api/1/color_map/process/', postData)
      .subscribe({
        next: (output) => {
          // this.viewerControl.setNewImage(new ImageSet(
          //   output.urls,
          //   output.shape,
          //   this.viewMode
          // ));
        },
        error: (error) => {
          this.notificationHandler.error('Failed to apply color map');
          this.notificationHandler.error(error);
        },
      })
  }

  onGeneralControlActivation() {
    this.controlMode = 'general';
  }

  onLayerControlActivation() {
    this.controlMode = 'layer';
  }

  onDetailControlActivation() {
    this.controlMode = 'detail';
  }
}
