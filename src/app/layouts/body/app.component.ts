

import { FooterComponent } from '../footer/footer.component';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeaderComponent } from '../header/header.component';
import { CompanyService } from '../../services/company/company-service';
import Company from '../../models/Company';
import { SharedDataService } from '../../services/shared/sharedDataService';

@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bill-front-ng';
  selectedCompany!: Company | undefined;

  constructor(
    private readonly companyService: CompanyService,
    private readonly sharedDataService: SharedDataService
  ) {}

  ngOnInit() {
    this.companyService.findCompanies().subscribe((companies) => {
      this.selectedCompany = companies.find(
        (company) => company.checked == true
      );
      const data: Map<string, any> = new Map();
      data.set('siret', this.selectedCompany?.siret);
      console.log('debut : ', this.selectedCompany?.siret);
      this.sharedDataService.setData(data);
    });
  }
}

