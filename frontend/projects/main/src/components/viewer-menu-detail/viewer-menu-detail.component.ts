import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {Architecture} from "../../models/architecture";
import {Layer} from "../../models/layer";
import {FormsModule} from "@angular/forms";
import {filter, Subject, takeUntil} from "rxjs";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";

@Component({
  selector: 'app-viewer-menu-detail',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './viewer-menu-detail.component.html',
  styleUrls: [
    './viewer-menu-detail.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class ViewerMenuDetailComponent implements OnInit, OnDestroy {
    // TODO: Rename this to ViewMenuLayerComponent
  private readonly ngUnsubscribe = new Subject<void>();

  selectedLayerIndex = signal<number | null>(null);

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
}
