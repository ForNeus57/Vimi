import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthenticationService} from "../../services/authentication/authentication.service";

@Component({
  selector: 'app-horizontal-navigation-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,],
  templateUrl: './horizontal-navigation-bar.component.html',
  styleUrl: './horizontal-navigation-bar.component.scss'
})
export class HorizontalNavigationBarComponent implements OnInit {
  public isLoggedIn: boolean = false;

  constructor(
      private AuthenticationService: AuthenticationService,
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

}
