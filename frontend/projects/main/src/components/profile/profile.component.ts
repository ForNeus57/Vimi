import { Component } from '@angular/core';
import {VerticalNavigationBarComponent} from "../vertical-navigation-bar/vertical-navigation-bar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    VerticalNavigationBarComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
