import {Component, Input, OnDestroy, OnInit, signal} from '@angular/core';
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ColorMap} from "../../models/color-map";
import {Normalization} from "../../models/normalization";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  ActivationComparatorEndpointData,
  ActivationComparatorResults,
  ActivationFromLayer
} from "../../models/activation";
import {
  ViewerCanvasColorMapIndicatorComponent
} from "../viewer-canvas-color-map-indicator/viewer-canvas-color-map-indicator.component";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {PercentPipe, TitleCasePipe} from "@angular/common";

@Component({
  selector: 'app-comparator-viewer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ViewerCanvasColorMapIndicatorComponent,
    PercentPipe,
    TitleCasePipe
  ],
  templateUrl: './comparator-viewer.component.html',
  styleUrls: [
    './comparator-viewer.component.scss',
    '../top-control-bar/top-control-bar.component.scss',
  ],
})
export class ComparatorViewerComponent implements OnInit, OnDestroy {
  @Input({required: true}) architectureUUID: string = "";
  @Input({required: true}) layerUUID: string = "";
  @Input({required: true}) activations: ActivationFromLayer | null = null;

  selectedFile0UUID = signal<string | null>(null);
  selectedFile1UUID = signal<string | null>(null);
  selectedFilterIndex = signal<string | null>(null);
  selectedNormalizationId = signal<string | null>(null);
  selectedColorMapUUID = signal<string | null>(null);

  normalizations = Array<Normalization>();
  colorMaps = Array<ColorMap>();
  comparisonResults: ActivationComparatorResults | null = null;

  constructor(
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
    private controlBarMediator: ControlBarMediatorService,
  ) {
  }

  ngOnInit() {

    this.dataLayer.get<Normalization[]>('/api/1/color_map/normalization/')
      .subscribe({
        next: (normalizations) => {
          this.normalizations = normalizations;
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load normalizations');
        },
      });

    this.dataLayer.get<ColorMap[]>('/api/1/color_map/')
      .subscribe({
        next: (colorMaps) => {
          this.colorMaps = colorMaps;
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load color maps');
        },
      });
  }

  onCompareClick() {
    const file0UUID = this.selectedFile0UUID();
    const file1UUID = this.selectedFile1UUID();
    const filterIndex = this.selectedFilterIndex();
    const normalization = this.selectedNormalizationId();
    const colorMapUUID = this.selectedColorMapUUID();

    if (file0UUID == null) {
      this.notificationHandler.info('First File not selected');
      return;
    }

    if (file1UUID == null) {
      this.notificationHandler.info('Second File not selected');
      return;
    }

    if (filterIndex == null) {
      this.notificationHandler.info('Filter Index not selected');
      return;
    }

    if (normalization == null) {
      this.notificationHandler.info('Normalization not selected');
      return;
    }

    if (colorMapUUID == null) {
      this.notificationHandler.info('Color Map not selected');
      return;
    }

    const filterIndexInteger = parseInt(filterIndex);

    if (isNaN(filterIndexInteger)) {
      this.notificationHandler.error('Filter Index is not convertable to Integer')
      return;
    }

    const endpointData = new ActivationComparatorEndpointData(
      file0UUID,
      file1UUID,
      filterIndexInteger,
      normalization,
      colorMapUUID,
    );

    this.dataLayer.post<ActivationComparatorResults>('api/1/activation/compare/', endpointData)
      .subscribe({
        next: (results) => {
          this.comparisonResults = results;
          let colorMap = this.colorMaps.find((value) => {
            return value.uuid == colorMapUUID;
          });
          // TODO: Fix the second case
          if (colorMap != undefined) {
            this.controlBarMediator.setIndicator(colorMap.indicator);
          }
          this.notificationHandler.success('Successfully loaded activation comparison results');
        },
        error: (error) => {
          this.notificationHandler.error(error);
          this.notificationHandler.error('Failed to load activation comparison results');
        },
      });
  }

  ngOnDestroy() {
    this.controlBarMediator.setIndicator('');
  }
}
