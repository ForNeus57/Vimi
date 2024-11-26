import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-comparator-control-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './comparator-control-bar.component.html',
  styleUrls: [
    './comparator-control-bar.component.scss',
    '../model-viewer/model-viewer-list.scss',
  ]
})
export class ComparatorControlBarComponent {

}
