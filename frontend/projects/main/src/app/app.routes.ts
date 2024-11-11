import { Routes } from '@angular/router';
import {ModelViewerComponent} from "../components/model-viewer/model-viewer.component";

export const routes: Routes = [
  {
    path: 'model',
    title: 'Model',
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
