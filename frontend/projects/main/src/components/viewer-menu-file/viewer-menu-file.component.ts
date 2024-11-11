import {Component, computed, Input, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {NetworkInput} from "../../models/network-input";
import {NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Architecture} from "../../models/architecture";
import {ColorMap, ColorMapProcessOutput, ColorMapRequestData, ImageSet} from "../../models/color-map";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";
import {Normalization} from "../../models/normalization";

@Component({
  selector: 'app-viewer-menu-file',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
  ],
  templateUrl: './viewer-menu-file.component.html',
  styleUrls: [
    '../viewer-menu/viewer-menu.component.scss',
    './viewer-menu-file.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ViewerMenuFileComponent implements OnInit {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
    this.selectedLayerIndex.set(null);
  };

  internalArchitecture = signal<Architecture | null>(null);
  selectedLayerIndex = signal<number | null>(null);
  selectedColorMapUUID = signal<string | null>(null);
  selectedFileUUID = signal<string | null>(null);
  selectedActivations = signal<string | null>(null);
  selectedNormalizationId = signal<string | null>(null);

  readonly computedLayers = computed(() => {
    const architecture = this.internalArchitecture();
    if (architecture) {
      const layers = architecture.layers;
      return layers.map((value) => new Layer(layers.indexOf(value), value));
    }

    return [];
  });
  readonly isDownloadActivationsDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const architecture = this.internalArchitecture();
    const fileUUID = this.selectedFileUUID();
    const layerIndex = this.selectedLayerIndex();
    const normalization = this.selectedNormalizationId();

    return architecture == null
      || fileUUID == null
      || layerIndex == null
      || normalization == null;
  });
  readonly isColorMapChangeDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const colorMapIndex = this.selectedColorMapUUID();
    const activations = this.selectedActivations();

    return colorMapIndex == null
      || activations == null;
  });

  viewMode = '1d';
  colorMaps = Array<ColorMap>();
  normalizations = Array<Normalization>();

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private viewerControl: ViewerControlService,
  ) {
  }

  ngOnInit() {
    this.dataLayer.get<ColorMap[]>('/api/1/color_map/')
      .subscribe({
        next: (colorMaps) => {
          this.colorMaps = colorMaps;
          this.notificationHandler.success('Color Maps loaded');
        },
        error: (error) => {
          this.notificationHandler.error('Failed to load color maps');
          this.notificationHandler.error(error);
        },
      });

    this.dataLayer.get<Normalization[]>('/api/1/activation/normalization/')
      .subscribe({
        next: (normalizations) => {
          this.normalizations = normalizations;
          this.notificationHandler.success('Normalizations loaded');
        },
        error: (error) => {
          this.notificationHandler.error('Failed to load normalizations');
          this.notificationHandler.error(error);
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
    const architecture = this.internalArchitecture();
    const layerIndex = this.selectedLayerIndex();
    const fileUUID = this.selectedFileUUID();
    const normalization = this.selectedNormalizationId();

    if (architecture == null) {
      this.notificationHandler.info('Architecture is not selected');
      return;
    }

    if (layerIndex == null) {
      this.notificationHandler.info('Layer is not selected');
      return;
    }

    if (fileUUID == null) {
      this.notificationHandler.info('File has no UUID assigned');
      return;
    }

    if (normalization == null) {
      this.notificationHandler.info('Normalization is not selected');
      return;
    }


    const postData = new NetworkOutputRequestData(
      architecture.uuid,
      layerIndex,
      fileUUID,
      normalization,
    );
    this.dataLayer.post<NetworkOutput>('/api/1/network_input/process/', postData)
      .subscribe({
        next: (output) => {
          this.notificationHandler.success('Successfully fetched layer activations');
          this.selectedActivations.set(output.uuid);

          // TODO: Make it less dodgy
          const previousColorMap = this.selectedColorMapUUID();
          this.selectedColorMapUUID.set(this.colorMaps[0].uuid)
          this.onColorMapChange();
          this.selectedColorMapUUID.set(previousColorMap);
        },
        error: (error) => {
          this.notificationHandler.error('Failed to download activations');
          this.notificationHandler.error(error);
        },
      });
  }

  onColorMapChange() {
    const activation = this.selectedActivations();
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
          this.viewerControl.setNewImage(new ImageSet(
            output.urls,
            output.shape,
            this.viewMode
          ));
        },
        error: (error) => {
          this.notificationHandler.error('Failed to apply color map');
          this.notificationHandler.error(error);
        },
      })
  }

  on1dViewModeActivation() {
    this.viewMode = '1d';
  }

  on2dViewModeActivation() {
    this.viewMode = '2d';
  }
}
