import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Architecture} from "../../models/architecture";
import {MatSlider, MatSliderRangeThumb} from "@angular/material/slider";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {filter, forkJoin, Subject, takeUntil} from "rxjs";
import {Activation, NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ColorMapProcessOutput, ColorMapRequestData} from "../../models/color-map";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";

@Component({
  selector: 'app-viewer-menu-general',
  standalone: true,
  imports: [
    MatSlider,
    MatSliderRangeThumb
  ],
  templateUrl: './viewer-menu-general.component.html',
  styleUrls: [
    './viewer-menu-general.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ViewerMenuGeneralComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  architecture: Architecture | null = null;

  isSliderDisabled = true;
  selectedSliderMax = 1;
  selectedSliderEnd = 1;
  sliderStartValue = 0;
  sliderEndValue = 1;

  activations: Activation[] | null = null;

  constructor(
    private controlBarMediator: ControlBarMediatorService,
    private notificationHandler: NotificationHandlerService,
    private dataLayer: DataLayerService,
    private viewerControl: ViewerControlService,
  ) {
  }

  ngOnInit() {
    this.controlBarMediator.getArchitectureObservable()
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (newArchitecture) => {
          this.architecture = newArchitecture;
          this.isSliderDisabled = newArchitecture == null;
          this.selectedSliderMax = this.architecture == null? 1: (this.architecture.layers.length - 1)
          this.selectedSliderEnd = Math.max(Math.floor(this.selectedSliderMax * 0.25), 1);
        },
      });

    this.controlBarMediator.getCalculatePayloadObservable()
      .pipe(
        filter((calculatePayload) => calculatePayload != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (calculatePayload) => {
          const architecture = this.architecture;

          if (architecture == null) {
            this.notificationHandler.info('Architecture is not selected');
            return;
          }

          const layers = architecture.layers.slice(this.sliderStartValue, this.sliderEndValue);


          const endpointData = new NetworkOutputRequestData(
            architecture.uuid,
            calculatePayload.fileUUID,
            calculatePayload.transformationId,
            layers.map((layer) => layer.uuid),
          );

          this.dataLayer.post<NetworkOutput>('api/1/network_input/process/', endpointData)
            .subscribe({
              next: (networkOutput) => {
                this.activations = networkOutput.activations;
                this.controlBarMediator.setPredictions(networkOutput.predictions);
                this.notificationHandler.success('Successfully calculated activations');
              },
              error: (error) => {
                this.activations = null;
                this.controlBarMediator.setPredictions([]);
                this.notificationHandler.error(error);
                this.notificationHandler.error('Failed to calculate activations');
              },
            });
        },
      });


    this.controlBarMediator.getApplyPayload()
      .pipe(
        filter((applyPayload) => applyPayload != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (applyPayload) => {
          const activations = this.activations;

          if (activations == null) {
            this.notificationHandler.info('Activations is not calculated');
            return;
          }

          forkJoin(activations.map((activation) => {
            const endpointData = new ColorMapRequestData(
              activation.activation_uuid,
              applyPayload.colorMapUUID,
              applyPayload.normalization,
            );

            return this.dataLayer.post<ColorMapProcessOutput>('api/1/color_map/process/', endpointData)
          }))
            .subscribe({
              next: (colorMapOutputs) => {
                this.viewerControl.setImageSet3d(colorMapOutputs);
              },
              error: (error) => {
                this.notificationHandler.error(error);
                this.notificationHandler.error('Failed to apply color map');
              },
            });
        },
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onCanvasUpdate() {
    if (this.architecture == null) {
      return;
    }

    // this.viewerControl.setNewImage(
    //   architecture.dimensions.slice(this.sliderStartValue, this.sliderEndValue),
    // );
  }

  onSliderStartChange(newValue: number) {
    this.sliderStartValue = newValue;
  }

  onSliderEndChange(newValue: number) {
    this.sliderEndValue = newValue;
  }

  formatSlider(value: number) {
    return `L${value + 1}`;
  }
}
