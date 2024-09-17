import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  // TODO: Implement client side validation
  private readonly url = 'http://localhost:8000/api/1/authentication/user/register/';

  public registrationForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  })

  constructor(
    private http: HttpClient,
    private authentication: AuthenticationService,
  ) {}

  ngOnInit() {
  }

  onSubmit() {
    this.http.post(this.url, this.registrationForm.value).subscribe(
      (response) => {
        console.log(response);
        // this.authentication.login(this.registrationForm.value);
      },
      (error) => {
        console.log(error);
      }
    )
  }

  onReset() {
    this.registrationForm.reset();
  }
}
