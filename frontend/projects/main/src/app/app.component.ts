import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NotificationHandlerComponent} from "../components/notification-handler/notification-handler.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationHandlerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
