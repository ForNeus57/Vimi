import { Routes } from '@angular/router';
import {HomeComponent} from "../components/home/home.component";
import {RegisterComponent} from "../components/register/register.component";
import {LoginComponent} from "../components/login/login.component";
import {ProfileComponent} from "../components/profile/profile.component";
import {AuthenticatedGuard} from "../guards/authenticated/authenticated.guard";

export const routes: Routes = [
  {
    path: 'account',
    title: 'Account',
    children: [
      {
        path: 'register',
        title: 'Register',
        component: RegisterComponent,
      },
      {
        path: 'login',
        title: 'Login',
        component: LoginComponent,
      },
      {
        path: 'profile/:id',
        title: 'Profile',
        component: ProfileComponent,
        canActivate: [AuthenticatedGuard],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/account/login',
      },
      {
        path: '**',
        redirectTo: '/account/login',
      },
    ],
  },
  {
    path: 'home',
    title: 'Home',
    component: HomeComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home',
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
