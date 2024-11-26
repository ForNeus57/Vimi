import { Routes } from '@angular/router';
import {ModelViewerComponent} from "../components/model-viewer/model-viewer.component";
import {ComparatorComponent} from "../components/comparator/comparator.component";

export const routes: Routes = [
  {
    path: 'model',
    title: 'Model',
    component: ModelViewerComponent,
  },
  {
    path: 'comparator',
    title: 'Comparator',
    component: ComparatorComponent,
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
