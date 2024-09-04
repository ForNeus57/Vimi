import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HorizontalNavigationBarComponent} from "../components/horizontal-navigation-bar/horizontal-navigation-bar.component";
import {VerticalNavigationBarComponent} from "../components/vertical-navigation-bar/vertical-navigation-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HorizontalNavigationBarComponent, VerticalNavigationBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
