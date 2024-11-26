import { Component } from '@angular/core';
import {ComparatorControlBarComponent} from "../comparator-control-bar/comparator-control-bar.component";

@Component({
  selector: 'app-comparator',
  standalone: true,
  imports: [
    ComparatorControlBarComponent
  ],
  templateUrl: './comparator.component.html',
  styleUrl: './comparator.component.scss'
})
export class ComparatorComponent {

}
