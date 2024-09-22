import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HorizontalNavigationBarComponent} from "../components/horizontal-navigation-bar/horizontal-navigation-bar.component";
import {VerticalNavigationBarComponent} from "../components/vertical-navigation-bar/vertical-navigation-bar.component";
import {NotificationHandlerComponent} from "../components/notification-handler/notification-handler.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HorizontalNavigationBarComponent, VerticalNavigationBarComponent, NotificationHandlerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
