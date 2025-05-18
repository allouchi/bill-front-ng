// app-init.service.ts
import { Injectable } from '@angular/core';
import { CompanyService } from '../company/company-service';
import { SiretService } from './siret-service';
import { SharedDataService } from './shared-data-service';
import Company from '../../models/Company';
import { AlertService } from '../alert/alert-messages.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  selectedCompany!: Company;

  constructor(
    private readonly companyService: CompanyService,
    private readonly siretService: SiretService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService
  ) {}

  initAppWithSubscribe(): void {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        this.onSuccess(companies);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private onSuccess(companies: Company[]) {
    //this.alertService.show(respSuccess, 'success');
    this.selectedCompany = companies.find(
      (company) => company.checked === true
    )!;

    const data: Map<string, any> = new Map();
    data.set('company', this.selectedCompany);
    this.sharedDataService.setData(data);
    this.siretService.setSiret(this.selectedCompany.siret);
  }

  private onError(error: any) {
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
