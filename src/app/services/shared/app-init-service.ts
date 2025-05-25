// app-init.service.ts
import { Injectable } from '@angular/core';
import { CompanyService } from '../companies/company-service';
import Company from '../../models/Company';
import { AlertService } from '../alert/alert-messages.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  selectedCompany!: Company;

  constructor(
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService
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
