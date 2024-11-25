import {Component, OnDestroy, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {Architecture} from "../../models/architecture";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {filter, Subject, takeUntil} from "rxjs";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Activation, NetworkOutput, NetworkOutputRequestData} from "../../models/network-output";
import {DataLayerService} from "../../services/data-layer/data-layer.service";
import {ColorMapProcessOutput, ColorMapRequestData, ImageSet} from "../../models/color-map";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";

@Component({
  selector: 'app-viewer-menu-file',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
  ],
  templateUrl: './viewer-menu-file.component.html',
  styleUrls: [
    './viewer-menu-file.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ViewerMenuFileComponent implements OnInit, OnDestroy {
  // TODO: Rename this to ViewMenuLayerComponent
  private readonly ngUnsubscribe = new Subject<void>();

  selectedLayerUUID = signal<string | null>(null);

  canvasElementPlacement = '1d';
  architecture: Architecture | null = null;
  layers = Array<Layer>();
  activation: Activation | null = null;

  constructor(
    private controlBarMediator: ControlBarMediatorService,
    private dataLayer: DataLayerService,
    private notificationHandler: NotificationHandlerService,
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
          if (newArchitecture != null) {
            this.layers = newArchitecture.layers.sort((a, b) => {
              if (a.layer_number < b.layer_number) {
                return -1;
              }
              if (b.layer_number > a.layer_number) {
                return 1;
              }
              return 0;
            }) ;
          } else {
            this.layers = [];
          }
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
          const layerUUID = this.selectedLayerUUID();

          if (architecture == null) {
            this.notificationHandler.info('Architecture is not selected');
            return;
          }

          if (layerUUID == null) {
            this.notificationHandler.info('Layer is not selected');
            return;
          }

          const endpointData = new NetworkOutputRequestData(
            architecture.uuid,
            calculatePayload.fileUUID,
            calculatePayload.transformationId,
            [layerUUID],
          );

          this.dataLayer.post<NetworkOutput>('api/1/network_input/process/', endpointData)
            .subscribe({
              next: (networkOutput) => {
                this.activation = networkOutput.activations[0];
                this.notificationHandler.success('Successfully calculated activations');

              },
              error: (error) => {
                this.activation = null;
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
          const activation = this.activation;

          if (activation == null) {
            this.notificationHandler.info('Activations is not calculated');
            return;
          }

          const endpointData = new ColorMapRequestData(
            activation.activation_uuid,
            applyPayload.colorMapUUID,
            applyPayload.normalization,
          );

          this.dataLayer.post<ColorMapProcessOutput>('api/1/color_map/process/', endpointData)
            .subscribe({
              next: (colorMapOutput) => {
                this.viewerControl.setNewImage(new ImageSet(
                  colorMapOutput.urls,
                  colorMapOutput.shape,
                  this.canvasElementPlacement,
                ));
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

  on1dViewModeActivation() {
    this.canvasElementPlacement = '1d';
  }

  on1dzViewModeActivation() {
    this.canvasElementPlacement = '1dz';
  }

  on2dViewModeActivation() {
    this.canvasElementPlacement = '2d';
  }
}
