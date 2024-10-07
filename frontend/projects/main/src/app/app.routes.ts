import { Routes } from '@angular/router';
import {HomeComponent} from "../components/home/home.component";
import {RegisterComponent} from "../components/register/register.component";
import {LoginComponent} from "../components/login/login.component";
import {ProfileComponent} from "../components/profile/profile.component";
import {AuthenticatedGuard} from "../guards/authenticated/authenticated.guard";
import {ModelComponent} from "../components/model/model.component";
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
    path: 'home',
    title: 'Home',
    component: HomeComponent,
  },
  {
    path: 'model',
    title: 'Model',
    children: [
      {
        path: ':id',
        title: 'Modle Viewer',
        component: ModelViewerComponent,
      },
      {
        path: '',
        component: ModelComponent,
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
    redirectTo: '/home',
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
