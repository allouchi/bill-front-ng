import { Routes } from '@angular/router';
import CompanyReadComponent from './pages/companies/read/company-read.component';
import FactureReadComponent from './pages/factures/read/facture-read.component';
import { ClientReadComponent } from './pages/clients/read/client-read.component';
import { PrestationReadComponent } from './pages/prestations/read/prestation-read.component';
import { ClientEditComponent } from './pages/clients/edit/client-edit.component';
import FactureEditComponent from './pages/factures/edit/facture-edit.component';
import CompanyEditComponent from './pages/companies/edit/company-edit.component';
import { PrestationEditComponent } from './pages/prestations/edit/prestation-edit.component';
import { ConsultantReadComponent } from './pages/consultants/read/consultant-read.component';
import { ConsultantEditComponent } from './pages/consultants/edit/consultant-edit.component';
import { NotFoundErrorComponent } from './layouts/error/not-found-error.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TvaReadComponent } from './pages/tva/read/tva-read.component';
import { TvaEditComponent } from './pages/tva/edit/tva-edit.component';
import { FactureAddComponent } from './pages/factures/add/facture-add.component';

import { AuthGuard } from './services/auth/auth-guard';
import { LoginComponent } from './authentification/login/login.component';
import { LogoutComponent } from './authentification/logout/logout.component';

export const BILLING_ROUTE: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'bill-dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'companies',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => CompanyReadComponent,
      },
      {
        path: 'edit',
        loadComponent: () => CompanyEditComponent,
      },
      {
        path: 'add',
        loadComponent: () => CompanyEditComponent,
      },
    ],
  },
  {
    path: 'factures',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => FactureReadComponent,
      },
      {
        path: 'edit',
        loadComponent: () => FactureEditComponent,
      },

      {
        path: 'add',
        loadComponent: () => FactureAddComponent,
      },
    ],
  },
  {
    path: 'clients',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => ClientReadComponent,
      },
      {
        path: 'edit',
        loadComponent: () => ClientEditComponent,
      },

      {
        path: 'add',
        loadComponent: () => ClientEditComponent,
      },
    ],
  },

  {
    path: 'prestations',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => PrestationReadComponent,
      },
      {
        path: 'edit',
        loadComponent: () => PrestationEditComponent,
      },
      {
        path: 'add',
        loadComponent: () => PrestationEditComponent,
      },
    ],
  },

  {
    path: 'consultants',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => ConsultantReadComponent,
      },
      {
        path: 'edit',
        loadComponent: () => ConsultantEditComponent,
      },
      {
        path: 'add',
        loadComponent: () => ConsultantEditComponent,
      },
    ],
  },
  {
    path: 'tvas',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => TvaReadComponent,
      },
      {
        path: 'add',
        loadComponent: () => TvaEditComponent,
      },
      {
        path: 'edit',
        loadComponent: () => TvaEditComponent,
      },
    ],
  },
  {
    path: '**',
    component: NotFoundErrorComponent,
  },
];
