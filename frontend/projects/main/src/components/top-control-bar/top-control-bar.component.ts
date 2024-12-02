import {Component, computed, effect, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {NgClass, PercentPipe, TitleCasePipe} from "@angular/common";
import {Architecture} from "../../models/architecture";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {ColorMap} from "../../models/color-map";
import {Normalization} from "../../models/normalization";
import {InputTransformation} from "../../models/input-transformation";
import {NetworkInput} from "../../models/network-input";
import {CalculatePayload} from "../../models/calculate-payload";
import {ApplyPayload} from "../../models/apply-payload";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Prediction} from "../../models/network-output";
import {filter, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-top-control-bar',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    PercentPipe,
  ],
  templateUrl: './top-control-bar.component.html',
  styleUrls: [
    './top-control-bar.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class TopControlBarComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  selectedArchitectureUUID = signal<string | null>(null);
  selectedFileUUID = signal<string | null>(null);
  selectedInputTransformationId = signal<string | null>(null);
  selectedNormalizationId = signal<string | null>(null);
  selectedColorMapUUID = signal<string | null>(null);

  readonly selectedArchitecture = computed(() => {
    const architectureUUID = this.selectedArchitectureUUID();
    const architectureElement = this.architectures.find((value) => value.uuid == architectureUUID);
    return architectureElement ?? null;
  });
  readonly isDownloadActivationsDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const architecture = this.selectedArchitecture();
    const fileUUID = this.selectedFileUUID();
    const inputTransformationId = this.selectedInputTransformationId();

    return architecture == null
      || fileUUID == null
      || inputTransformationId == null;
  });
  readonly isColorMapChangeDisabled = computed(() => {
    // TODO: Fix the fact that this do not update once in a while
    const normalization = this.selectedNormalizationId();
    const colorMapUUID = this.selectedColorMapUUID();

    return normalization == null
      || colorMapUUID == null;
  });

  canvasViewMode = "general";

  architectures = Array<Architecture>();
  inputTransformations = Array<InputTransformation>();
  colorMaps = Array<ColorMap>();
  normalizations = Array<Normalization>();

  fileName: string | null = null;
  predictions = Array<Prediction>();

  constructor(
    private controlBarMediator: ControlBarMediatorService,
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
    effect(() => {
      const architecture = this.selectedArchitecture();
      this.controlBarMediator.setArchitecture(architecture);
    });
  }

  ngOnInit() {
    this.controlBarMediator.setViewMode(this.canvasViewMode);

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

    this.dataLayer.get<InputTransformation[]>('api/1/network_input/transformation/')
      .subscribe({
        next: (inputTransformations) => {
          this.inputTransformations = inputTransformations;
          this.notificationHandler.success('Input Transformations loaded');
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

    this.dataLayer.get<Normalization[]>('/api/1/color_map/normalization/')
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

    this.controlBarMediator.getPredictions()
      .pipe(
        filter((value) => value.length != 0),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (predictions) => {
          this.predictions = predictions.sort((valA, valB) => {
            return valA.prediction_number - valB.prediction_number
          });
        },
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

    const selectedFile = files[0];
    this.fileName = selectedFile.name;
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

  onGeneralControl() {
    if (this.canvasViewMode === "general") {
      return;
    }

    this.canvasViewMode = "general";
    this.controlBarMediator.setViewMode(this.canvasViewMode);
  }

  onLayerControl() {
    if (this.canvasViewMode === "layer") {
      return;
    }

    this.canvasViewMode = "layer";
    this.controlBarMediator.setViewMode(this.canvasViewMode);
  }

  onDownloadActivations() {
    const fileUUID = this.selectedFileUUID();
    const transformationId = this.selectedInputTransformationId();

    if (fileUUID == null) {
      this.notificationHandler.info('File has no UUID assigned');
      return;
    }

    if (transformationId == null) {
      this.notificationHandler.info('Transformation is not assigned');
      return;
    }

    this.controlBarMediator.setCalculatePayload(new CalculatePayload(
      fileUUID,
      transformationId,
    ));
  }

  onColorMapChange() {
    const normalization = this.selectedNormalizationId();
    const colorMapUUID = this.selectedColorMapUUID();
    const colorMap = this.colorMaps.find((value) => value.uuid == colorMapUUID) ?? null;

    if (normalization == null) {
      this.notificationHandler.info('Normalization is not assigned');
      return;
    }

    if (colorMapUUID == null) {
      this.notificationHandler.info('Color Map is not assigned');
      return;
    }

    if (colorMap == null) {
      this.notificationHandler.error('Unknown color map UUID found')
      return;
    }

    this.controlBarMediator.setApplyPayload(new ApplyPayload(
      normalization,
      colorMapUUID,
    ));
    this.controlBarMediator.setIndicator(
      colorMap.indicator
    );
  }
}
