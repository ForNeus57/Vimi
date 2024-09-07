import { CanActivateFn } from '@angular/router';
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {inject} from "@angular/core";

export const AuthenticatedGuard: CanActivateFn = (route, state) => {
  const authentication = inject(AuthenticationService);

  return authentication.getIsLoggedIn()
    && authentication.getAuthToken() !== null
    && authentication.getUserId() !== null
    && authentication.getUserId() === route.params['id'];
};
