import {Component, ElementRef, OnInit, viewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {catchError, throwError} from "rxjs";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  // TODO: Implement client side validation
  private readonly url = 'http://localhost:8000/api/1/authentication/user/register/';

  public passwordInputType = 'password';
  public confirmPasswordInputType = 'password';

  public registrationForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  })

  public constructor(
    private http: HttpClient,
    private authentication: AuthenticationService,
    private notificationHandler: NotificationHandlerService,
  ) {}

  public ngOnInit() {
  }

  public onSubmit() {
    throw new Error("AAAAAAA");
    // this.notificationHandler.handleError(new Error("AAAAAAA"));
    // this.http.post(this.url, this.registrationForm.value).pipe(
    //   catchError(err => {
    //     // return throwError(err);
    //     this.notificationHandler.handleError(err);
    //     return throwError(err);
    //   })
    // );
  }

  public onReset() {
    this.registrationForm.reset();
  }

  public onPasswordToggle() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  public onConfirmPasswordToggle() {
    this.confirmPasswordInputType = this.confirmPasswordInputType === 'password' ? 'text' : 'password';
  }
}
