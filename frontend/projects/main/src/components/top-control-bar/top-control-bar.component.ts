import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ControlBarMediatorService} from "../../services/control-bar-mediator/control-bar-mediator.service";
import {NgClass} from "@angular/common";

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

  canvasViewMode = "general";

  constructor(
    private controlBarMediator: ControlBarMediatorService,
  ) {
  }

  ngOnInit() {
    this.controlBarMediator.setViewMode(this.canvasViewMode);
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
