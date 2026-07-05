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
import { EditUserComponent } from './pages/users/edit/user-edit.component';
import PrestationExtendComponent from './pages/prestations/add/prestation-extend.component';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { UserReadComponent } from './pages/users/read/user-read.component';
import { AddUserComponent } from './pages/users/add/user-add.component';
import { OperationAddComponent } from './pages/operations/add/operation-add.component';
import { OperationEditComponent } from './pages/operations/edit/operation-edit.component';
import { OperationReadComponent } from './pages/operations/read/operation-read.component';
import { CompteReadComponent } from './pages/compte/read/compte-read.component';


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
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'operations',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => OperationReadComponent,
      },
      {
        path: 'edit/:id',
        loadComponent: () => OperationEditComponent,
      },
      {
        path: 'add',
        loadComponent: () => OperationAddComponent,
      },
    ],
  },

  {
    path: 'compte',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'read',
        loadComponent: () => CompteReadComponent,
      }
    ],
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
        path: 'edit/:siret',
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
        path: 'edit/:id',
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
        path: 'edit/:id',
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
        path: 'edit/:id',
        loadComponent: () => PrestationEditComponent,
      },
      {
        path: 'add',
        loadComponent: () => PrestationEditComponent,
      },
      {
        path: 'extend',
        loadComponent: () => PrestationExtendComponent,
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
        path: 'edit/:id',
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
        path: 'edit/:id',
        loadComponent: () => TvaEditComponent,
      },
    ],
  },

  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'edit/:userName',
        loadComponent: () => EditUserComponent,
      },
      {
        path: 'add',
        loadComponent: () => AddUserComponent,
      },
      {
        path: 'read',
        loadComponent: () => UserReadComponent,
      },
    ],
  },
  {
    path: '**',
    component: NotFoundErrorComponent,
  },
];
