import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {JsonPipe, KeyValuePipe, NgClass, TitleCasePipe} from "@angular/common";
import {NotificationHandlerService} from "../../services/notification-handler/notification-handler.service";
import {Router} from "@angular/router";
import {RegistrationErrors} from "../../models/registration-errors";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    KeyValuePipe,
    TitleCasePipe,
    JsonPipe,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // TODO: Implement client side validation
  private readonly configUrl = 'http://localhost:8000/api/1/config/frontend/registration/';
  private readonly url = 'http://localhost:8000/api/1/authentication/user/register/';

  public passwordInputType = 'password';
  public passwordConfirmInputType = 'password';

  public usernameServerError = '';
  public firstNameServerError = '';
  public lastNameServerError = '';
  public emailServerError = '';
  public passwordServerError = '';
  public passwordConfirmServerError = '';

  public isSubmitted = false;

  public registrationForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    password_confirm: new FormControl('', [Validators.required]),
  }, {validators: passwordMatchValidator});

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationHandler: NotificationHandlerService,
  ) {
  }

  public onSubmit() {
    this.registrationForm.setErrors({serverError: true});
    this.isSubmitted = true;

    this.http.post(this.url, this.registrationForm.value, {observe: "response"}).subscribe(
      response => {
        switch (response.status) {
          case 201:
            this.notificationHandler.success('Registration Successful');
            this.router.navigate(['/account/login']);
            break;
        }
      },
      error => {
        switch (error.status) {
          case 400:
            const errors = error.error as RegistrationErrors;
            if (errors.username) {
              this.registrationForm.controls.username.setErrors({serverError: true});
              this.usernameServerError = errors.username[0];
            }
            if (errors.first_name) {
              this.registrationForm.controls.first_name.setErrors({serverError: true});
              this.firstNameServerError = errors.first_name[0];
            }
            if (errors.last_name) {
              this.registrationForm.controls.last_name.setErrors({serverError: true});
              this.lastNameServerError = errors.last_name[0];
            }
            if (errors.email) {
              this.registrationForm.controls.email.setErrors({serverError: true});
              this.emailServerError = errors.email[0];
            }
            if (errors.password) {
              this.registrationForm.controls.password.setErrors({serverError: true});
              this.passwordServerError = errors.password[0];
            }
            if (errors.password_confirm) {
              this.registrationForm.controls.password_confirm.setErrors({serverError: true});
              this.passwordConfirmServerError = errors.password_confirm[0];
            }
            this.notificationHandler.error('Invalid Registration Data');
            break;

          default:
            this.notificationHandler.error(`Unknown HTTP Error Occurred: ${error.status}`);
            break;
        }
      },
    );
  }

  public onReset() {
    this.isSubmitted = false;
    this.notificationHandler.info('Form Restarted');
    this.registrationForm.reset();
  }

  public onPasswordToggle() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  public onConfirmPasswordToggle() {
    this.passwordConfirmInputType = this.passwordConfirmInputType === 'password' ? 'text' : 'password';
  }
}

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const name = control.get('password');
  const role = control.get('password_confirm');

  return name && role && name.value !== role.value ? {passwordMissMatch: true} : null;
};