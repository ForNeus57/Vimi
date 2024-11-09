import {Component, computed, Input, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {NetworkInput} from "../../models/network-input";
import {NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Architecture} from "../../models/architecture";
import {ColorMap, ImageSet} from "../../models/color-map";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";

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
  selectedColorMapIndex = signal<number | null>(null);
  selectedFileId = signal<string | null>(null);
  selectedActivations = signal<NetworkOutput | null>(null);
  selectedNormalization = signal<string | null>(null);

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
    const fileId = this.selectedFileId();
    const layerIndex = this.selectedLayerIndex();

    return architecture == null
      || fileId == null
      || layerIndex == null;
  });
  readonly isColorMapChangeDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const colorMapIndex = this.selectedColorMapIndex();
    const activations = this.selectedActivations();

    return colorMapIndex == null
      || activations == null;
  });

  viewMode = '1d';
  colorMaps = Array<ColorMap>();

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
          this.selectedFileId.set(value.id);
        },
        error: (error) => {
          this.notificationHandler.error('File upload Failed');
          this.notificationHandler.error(error);
        },
      });
  }

  onDownloadActivations() {
    const architecture = this.internalArchitecture();
    const fileId = this.selectedFileId();
    const layerIndex = this.selectedLayerIndex();

    if (architecture == null) {
      this.notificationHandler.info('Architecture is not selected');
      return;
    }

    if (fileId == null) {
      this.notificationHandler.info('File has no UUID assigned');
      return;
    }

    if (layerIndex == null) {
      this.notificationHandler.info('Layer is not selected');
      return;
    }

    const postData = new NetworkOutputRequestData(
      architecture.id,
      fileId,
      layerIndex,
      "local",
    );
    this.dataLayer.post<NetworkOutput>('/api/1/network_input/process/', postData)
      .subscribe({
        next: (output) => {
          this.notificationHandler.success('Successfully fetched layer activations');
          this.selectedActivations.set(output);

          // TODO: Make it less dodgy
          const previousColorMap = this.selectedColorMapIndex();
          this.selectedColorMapIndex.set(this.colorMaps[0].id)
          this.onColorMapChange();
          this.selectedColorMapIndex.set(previousColorMap);
        },
        error: (error) => {
          this.notificationHandler.error('Failed to download activations');
          this.notificationHandler.error(error);
        },
      });
  }

  onColorMapChange() {
    const colorMap = this.selectedColorMapIndex();
    const activations = this.selectedActivations();

    if (colorMap == null) {
      this.notificationHandler.info('Color Map is not selected');
      return;
    }

    if (activations == null) {
      this.notificationHandler.info('Activations not downloaded');
      return;
    }

    this.viewerControl.setNewImage(new ImageSet(
      Array.from({length: activations.filters_shape[activations.filters_shape.length - 1]}, (_, filter_id) => {
        return this.dataLayer.createBackendUrl(`/api/1/color_map/process/${activations.id}/${filter_id}/${colorMap}/`);
      }),
      this.viewMode,
      activations.filters_shape,
    ));
  }

  on1dViewModeActivation() {
    this.viewMode = '1d';
  }

  on2dViewModeActivation() {
    this.viewMode = '2d';
  }
}
