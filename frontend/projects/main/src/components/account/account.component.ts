import { Component } from '@angular/core';
import {VerticalNavigationBarComponent} from "../vertical-navigation-bar/vertical-navigation-bar.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {

}
