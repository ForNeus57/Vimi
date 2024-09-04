import { CanActivateFn } from '@angular/router';
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {inject} from "@angular/core";

export const AuthenticatedGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  return authenticationService.getIsLoggedIn();
};
