// app-init.service.ts
import { Injectable } from '@angular/core';
import { CompanyService } from '../company/company-service';
import { SiretDataService } from './siret-save-service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  
  selectedSiret: string = '';

  constructor(
    private readonly companyService: CompanyService,
    private readonly siretDataService: SiretDataService) {}

  // Pas de return de Promise ici
  initAppWithSubscribe(): void {
  
    this.companyService.findCompanies().subscribe((companies) => {
      this.selectedSiret = companies.find(
        (company) => company.checked == true
      )?.siret!;
      
      console.log('debut : ', this.selectedSiret);
      this.siretDataService.setSiret(this.selectedSiret);
    });   
  }
}
