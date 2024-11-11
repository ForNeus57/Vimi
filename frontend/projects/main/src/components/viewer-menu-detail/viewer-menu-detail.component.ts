import {Component, Input, signal} from '@angular/core';
import {Architecture} from "../../models/architecture";

@Component({
  selector: 'app-viewer-menu-detail',
  standalone: true,
  imports: [],
  templateUrl: './viewer-menu-detail.component.html',
  styleUrl: './viewer-menu-detail.component.scss'
})
export class ViewerMenuDetailComponent {
  @Input({required: true})
  set architecture(newArchitecture: Architecture | null) {
    this.internalArchitecture.set(newArchitecture);
  };

  internalArchitecture = signal<Architecture | null>(null);

}
