import {Component, computed, effect, OnInit, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {NgClass} from "@angular/common";
import {Architecture} from "../../models/architecture";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {ColorMap} from "../../models/color-map";
import {Normalization} from "../../models/normalization";
import {InputTransformation} from "../../models/input-transformation";

@Component({
  selector: 'app-top-control-bar',
  standalone: true,
  imports: [
    FormsModule,
    NgClass
  ],
  templateUrl: './top-control-bar.component.html',
  styleUrls: [
    './top-control-bar.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class TopControlBarComponent implements OnInit {
  selectedArchitectureUUID = signal<string | null>(null);

  // readonly selectedArchitecture = computed(() => {
  //   const architectureUUID = this.selectedArchitectureUUID();
  //   const architectureElement = this.architectures.find((value) => value.uuid == architectureUUID);
  //   const architecture = architectureElement ?? null;
  //
  //   this.controlBarMediator.setArchitecture(architecture);
  //   return architecture;
  // });

  canvasViewMode = "general";

  architectures = Array<Architecture>();
  inputTransformations = Array<InputTransformation>();
  colorMaps = Array<ColorMap>();
  normalizations = Array<Normalization>();

  constructor(
    private controlBarMediator: ControlBarMediatorService,
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
  ) {
    effect(() => {
      const architectureUUID = this.selectedArchitectureUUID();
      const architectureElement = this.architectures.find((value) => value.uuid == architectureUUID);
      const architecture = architectureElement ?? null;

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

    this.dataLayer.get<InputTransformation[]>('api/1/activation/input_transformation/')
      .subscribe({
        next: (inputTransformations) => {
          this.inputTransformations = inputTransformations;
          this.notificationHandler.success('Input Transformations loaded');
        },
      })

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

  onDetailControl() {
    if (this.canvasViewMode === "detail") {
      return;
    }

    this.canvasViewMode = "detail";
    this.controlBarMediator.setViewMode(this.canvasViewMode);
  }
}
