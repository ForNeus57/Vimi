import { Routes } from '@angular/router';
import {RegisterComponent} from "../components/register/register.component";
import {LoginComponent} from "../components/login/login.component";
import {ProfileComponent} from "../components/profile/profile.component";
import {AuthenticatedGuard} from "../guards/authenticated/authenticated.guard";
import {ModelViewerComponent} from "../components/model-viewer/model-viewer.component";

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
    path: 'model',
    title: 'Model',
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Model Viewer',
        component: ModelViewerComponent,
      },
      {
        path: '**',
        redirectTo: '/model',
      },
    ]
  },
  {
    path: 'model-viewer/:id',
    title: 'Model Viewer',
    component: ModelViewerComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/model',
  },
  {
    path: '**',
    redirectTo: '/model',
  },
];
