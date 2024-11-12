import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Architecture} from "../../models/architecture";
import {MatSlider, MatSliderRangeThumb} from "@angular/material/slider";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {Subject, takeUntil} from "rxjs";

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
  sliderEndValue = 0;

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
          this.isSliderDisabled = newArchitecture == null;
          this.selectedSliderMax = this.architecture == null? 1: (this.architecture.layers.length - 1)
          this.selectedSliderEnd = Math.max(Math.floor(this.selectedSliderMax * 0.5), 1);
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
