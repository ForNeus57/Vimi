import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-horizontal-navigation-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass,],
  templateUrl: './horizontal-navigation-bar.component.html',
  styleUrl: './horizontal-navigation-bar.component.scss'
})
export class HorizontalNavigationBarComponent implements OnInit {
  public isLoggedIn: boolean = false;

  constructor(
      private AuthenticationService: AuthenticationService,
      private router: Router,
  ) {
  }

  public ngOnInit() {
    this.AuthenticationService.getIsLoggedInObs().subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  public logout() {
    this.AuthenticationService.logout();
  }

  public checkIfActive(route: string): boolean {
    // TODO: Fix that the selected link is not highlighted
    return this.router.url === route;
  }

}
