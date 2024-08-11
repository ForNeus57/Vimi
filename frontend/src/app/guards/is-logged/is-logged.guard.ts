import { CanActivateFn } from '@angular/router';

export const isLoggedGuard: CanActivateFn = (route, state) => {
  return true;
};
