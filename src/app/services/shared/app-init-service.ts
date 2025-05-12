// app-init.service.ts
import { Injectable } from '@angular/core';
import { CompanyService } from '../company/company-service';
import { SiretService } from './siret-service';
import { SharedDataService } from './shared-service';
import Company from '../../models/Company';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  
  selectedCompany!: Company;

  constructor(
    private readonly companyService: CompanyService,
    private readonly siretService: SiretService,
    private readonly sharedDataService: SharedDataService) { }

  initAppWithSubscribe(): void {
  
    this.companyService.findCompanies().subscribe((companies) => {
      this.selectedCompany = companies.find(
        (company) => company.checked === true
      )!;      
      
      const data: Map<string, any> = new Map();
      data.set('company', this.selectedCompany);
      this.sharedDataService.setData(data);
      this.siretService.setSiret(this.selectedCompany.siret);
    });   
  }
}
