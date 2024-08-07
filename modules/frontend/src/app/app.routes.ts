import { Routes } from '@angular/router';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { AccountComponent } from './components/account/account.component';
import { EditorComponent } from './components/editor/editor.component';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
    {
        path: 'settings',
        component: SettingsComponent,
        title: 'Settings'
    },
    {
        path: 'model-manager',
        component: FileManagerComponent,
        title: 'Model Manager'
    },
    {
        path: 'editor',
        component: EditorComponent,
        title: 'Editor'
    },
    {
        path: 'account',
        component: AccountComponent,
        title: 'Account'
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home'
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Page Not Found'
    }
];
