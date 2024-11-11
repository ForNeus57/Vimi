import {Component} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-horizontal-navigation-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass,],
  templateUrl: './horizontal-navigation-bar.component.html',
  styleUrl: './horizontal-navigation-bar.component.scss'
})
export class HorizontalNavigationBarComponent {
  constructor(
      private router: Router,
  ) {
  }

  public checkIfActive(route: string) {
    // TODO: Fix that the selected link is not highlighted
    return this.router.url === route;
  }

}
