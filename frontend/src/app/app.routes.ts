import { Routes } from '@angular/router';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { AccountComponent } from './components/account/account.component';
import { EditorComponent } from './components/editor/editor.component';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AccountDetailsComponent } from "./components/account-details/account-details.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";

import { isLoggedGuard } from "./guards/is-logged/is-logged.guard";

export const routes: Routes = [
    {
        path: 'settings',
        component: SettingsComponent,
        title: 'Settings',
        canActivate: [isLoggedGuard,],
    },
    {
        path: 'model-manager',
        component: FileManagerComponent,
        title: 'Model Manager',
        canActivate: [isLoggedGuard,],
    },
    {
        path: 'editor',
        component: EditorComponent,
        title: 'Editor',
        canActivate: [isLoggedGuard,],
    },
    {
        path: 'account',
        component: AccountComponent,
        title: 'Account',
        children: [
            {
                path: 'login',
                component: LoginComponent,
                title: 'Login',
            },
            {
                path: 'register',
                component: RegisterComponent,
                title: 'Register',
            },
            {
                path: 'forgot-password',
                component: ForgotPasswordComponent,
                title: 'Forgot Password',
            },
            {
                path: 'details',
                component: AccountDetailsComponent,
                title: 'Account Details',
                canActivate: [isLoggedGuard,],
            },
        ],
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home',
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Page Not Found',
    },
];
