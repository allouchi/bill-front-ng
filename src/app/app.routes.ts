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



export const BILLING_ROUTE: Routes = [
    {
        path: "",
        component: PrestationReadComponent
    },
    {
        path: "bill-dashboard",
        component: DashboardComponent
    },
    {
        path: 'companies',
        component: CompanyReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => CompanyReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => CompanyEditComponent
            }
        ]
    },
    {
        path: 'factures',
        component: FactureReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => FactureReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => FactureEditComponent
            }
        ]
    },
    {
        path: 'clients',
        component: ClientReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => ClientReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => ClientEditComponent
            }
        ]
    },

    {
        path: 'prestations',
        component: PrestationReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => PrestationReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => PrestationEditComponent
            }
        ]
    },

    {
        path: 'consultants',
        component: ConsultantReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => ConsultantReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => ConsultantEditComponent
            }
        ]
    },
    {
        path: 'tvas',
        component: TvaReadComponent,
        children: [
            {
                path: 'read',
                loadComponent: () => TvaReadComponent
            },
            {
                path: 'edit/:id',
                loadComponent: () => TvaEditComponent
            }
        ]
    },
    {
        path: "**",
        component: NotFoundErrorComponent
    }

];
