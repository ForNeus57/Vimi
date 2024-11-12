import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {filter, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-viewer-canvas-color-map-indicator',
  standalone: true,
  imports: [
    NgOptimizedImage,
  ],
  templateUrl: './viewer-canvas-color-map-indicator.component.html',
  styleUrl: './viewer-canvas-color-map-indicator.component.scss'
})
export class ViewerCanvasColorMapIndicatorComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  indicator: string | null = null;

  constructor(
    private controlBarMediator: ControlBarMediatorService,
  ) {
  }

  ngOnInit() {
    this.controlBarMediator.getIndicator()
      .pipe(
        filter((indicator) => indicator != null),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (indicator) => {
          this.indicator = indicator;
        },
      })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
