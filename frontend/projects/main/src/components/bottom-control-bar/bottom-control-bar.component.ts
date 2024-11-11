import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {ViewerMenuGeneralComponent} from "../viewer-menu-general/viewer-menu-general.component";
import {ViewerMenuFileComponent} from "../viewer-menu-file/viewer-menu-file.component";
import {ViewerMenuDetailComponent} from "../viewer-menu-detail/viewer-menu-detail.component";

@Component({
  selector: 'app-bottom-control-bar',
  standalone: true,
  imports: [
    ViewerMenuGeneralComponent,
    ViewerMenuFileComponent,
    ViewerMenuDetailComponent
  ],
  templateUrl: './bottom-control-bar.component.html',
  styleUrls: [
    './bottom-control-bar.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class BottomControlBarComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  currentCanvasViewMode = "";

  constructor(
    private controlBarMediator: ControlBarMediatorService,
  ) {
  }

  ngOnInit() {
    this.controlBarMediator.getViewModeObservable()
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (newViewMode) => {
          this.currentCanvasViewMode = newViewMode;
        },
      })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
