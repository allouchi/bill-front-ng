// app-init.service.ts
import { Injectable } from '@angular/core';
import { CompanyService } from '../companies/company-service';
import Company from '../../models/Company';
import { AlertService } from '../alert/alertService';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  selectedCompany!: Company;

  constructor(
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService
  ) { }

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
    this.selectedCompany = companies.find(
      (company) => company.checked === true
    )!;
  }

  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
