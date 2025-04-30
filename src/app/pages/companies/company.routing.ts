import { Routes } from '@angular/router';
import CompanyReadComponent from './read/company-read.component';

export const COMPANY_ROUTE: Routes = [
  {
    path: 'company',
    component: CompanyReadComponent,
    children: [
      {
        path: 'read',
        loadComponent: () => import('./read/company-read.component')
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/company-edit.component')
      }     
    ]
  }
];

