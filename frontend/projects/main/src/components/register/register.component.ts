import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication/authentication.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly url = 'http://localhost:8000/api/1/authentication/register/user/';

  constructor(
    private http: HttpClient,
    private authentication: AuthenticationService,
  ) {}
}
