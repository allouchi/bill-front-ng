import { Component, OnInit } from '@angular/core';
import Company from '../../../models/Company';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company/company-service';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';

@Component({
  selector: 'company-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './company-read.component.html',
  styleUrls: ['./company-read.component.scss'],
})
export default class CompanyReadComponent implements OnInit {
  companies: Company[] = [];
  isLoaded = false;

  constructor(
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        setTimeout(() => {
          this.companies = companies;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
        this.isLoaded = true;
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show('Opération réussie !', 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.show('Une erreur est survenue.', 'error');
  }

  deleteCompany(company: Company) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${company.socialReason}" ?`
    );
    if (ok) {
      console.log(company.socialReason);
    }
  }

  updateCompany(company: Company) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${company.socialReason}" ?`
    );
    if (ok) {
      console.log(company.socialReason);
    }
  }

  ngOnDestroy(): void {
    console.log('Method not implemented.');
  }
}
