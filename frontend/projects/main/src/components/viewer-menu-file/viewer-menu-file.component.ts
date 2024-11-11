import {Component, computed, OnDestroy, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {NgClass} from "@angular/common";
import {Architecture} from "../../models/architecture";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {filter, Subject, takeUntil} from "rxjs";

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

  selectedLayerIndex = signal<number | null>(null);

  canvasElementPlacement = '1d';
  architecture: Architecture | null = null;
  layers = Array<Layer>();

  constructor(
    private controlBarMediator: ControlBarMediatorService,
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
            this.layers = newArchitecture.layers.map((value) => new Layer(newArchitecture.layers.indexOf(value), value));
          } else {
            this.layers = [];
          }
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
