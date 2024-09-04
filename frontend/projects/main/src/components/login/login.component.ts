import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
      private AuthenticationService: AuthenticationService,
  ) {
  }

  public login() {
    this.AuthenticationService.login('username', 'password');
  }
}
