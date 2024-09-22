import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private userId = 'ee77409b-9fd4-40f5-b218-6a05b9b722e5';
  private token = 'b8b72e58-38d8-4f15-b1a3-bc18d64875d3';

  constructor(
      private http: HttpClient,
      private router: Router,
  ) {
  }

    public login(identifier: string, password: string) {
      const loginState = true;

      this.router.navigate(['/account', 'profile', this.userId]).then(
        // TODO: Implement this callback if redirect not successful
        (success) => {
          // console.log(success);
        }
      );

      this.isLoggedIn.next(loginState);
      return loginState;
    }

    public logout() {
      const loginState = false;

      this.router.navigate(['/account', 'login']).then(
        // TODO: Implement this callback if redirect not successful
        (success) => {
          // console.log(success);
        }
      );

      this.isLoggedIn.next(loginState);
    }

  public getAuthToken() {
    return this.token;
  }

  public getUserId() {
    return this.userId;
  }

  public getIsLoggedInObs() {
    return this.isLoggedIn.asObservable();
  }

    public getIsLoggedIn() {
      return this.isLoggedIn.value;
    }
}
