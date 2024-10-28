import {Component, computed, effect, Input, signal} from '@angular/core';
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
    '../viewer-menu/viewer-menu.component.scss',
    './viewer-menu-general.component.scss',
  ]
})
export class ViewerMenuGeneralComponent {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
  };

  internalArchitecture = signal<Architecture | null>(null);
  sliderStartValue = signal(0);
  sliderEndValue = signal(0);

  readonly isSliderDisabled = computed(() => {
    return this.internalArchitecture() == null
  });
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

  constructor(
    private viewerControl: ViewerControlService,
  ) {
    effect(() => {
      const architecture = this.internalArchitecture();
      if (architecture == null) {
        return;
      }

      this.viewerControl.setDimensions(
        architecture.dimensions.slice(this.sliderStartValue(), this.sliderEndValue()),
      );
    });
  }

  formatSlider(value: number) {
    return `L${value + 1}`;
  }
}
