import {Component, computed, effect, Input, signal, ViewEncapsulation} from '@angular/core';
import {Architecture} from "../../models/architecture";
import {ViewerControlService} from "../../services/viewer-control/viewer-control.service";
import {MatSlider, MatSliderRangeThumb} from "@angular/material/slider";

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
export class ViewerMenuGeneralComponent {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
  };

  internalArchitecture = signal<Architecture | null>(null);

  readonly isSliderDisabled = computed(() => {
    return this.internalArchitecture() == null
  });
  // TODO: Fix so that if I change the architecture the slider values restart
  readonly selectedSliderMax = computed(() => {
    const architecture = this.internalArchitecture();
    if (architecture == null) {
      return 1;
    }

    return architecture.layers.length - 1;
  });
  readonly selectedSliderEnd = computed(() => {
    return Math.max(Math.floor(this.selectedSliderMax() * 0.5), 1);
  });

  sliderStartValue = 0;
  sliderEndValue = 0;

  constructor(
    private viewerControl: ViewerControlService,
  ) {}

  onCanvasUpdate() {
    const architecture = this.internalArchitecture();
    if (architecture == null) {
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
