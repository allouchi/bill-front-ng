import { Component, OnDestroy, OnInit } from '@angular/core';
import Company from '../../../models/Company';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company/company-service';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { SiretService } from '../../../services/shared/siret-service';
import { LibelleCompanyService } from '../../../services/shared/libelle-company-service';

@Component({
  selector: 'company-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './company-read.component.html',
  styleUrls: ['./company-read.component.scss'],
})
export default class CompanyReadComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  filtredCompanies: Company[] = [];
  isLoaded = false;

  constructor(
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly siretService: SiretService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly libelleCompanyService: LibelleCompanyService
  ) {}

  ngOnInit(): void {
    const siret = this.siretService.getSiret();
    console.log('CompanyReadComponent : ', siret);
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        setTimeout(() => {
          this.companies = companies;
          this.filtredCompanies = this.companies;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
        this.isLoaded = true;
      },
    });
  }

  deleteCompany(company: Company) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${company.socialReason}" ?`
    );
    if (ok) {
      this.companyService.deleteCompanyById(company.id!).subscribe({
        next: () => {
          this.onSuccess('DELETE,SOCIETE');
          this.filtredCompanies = this.companies.filter(
            (item) => item.id !== company.id
          );
        },
        error: (err) => {
          this.onError(err);
          this.isLoaded = true;
        },
      });
    }
  }

  setCompanyValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    const company = this.companies.find(
      (company) => company.siret === selectedValue
    );
    company!.checked = true;

    this.libelleCompanyService.setMessage(company?.socialReason!);

    this.companyService.createOrUpdateCompany(company!).subscribe({
      next: () => {
        this.onSuccess('UPDATE,SOCIETE');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  updateCompany(company: Company) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${company.socialReason}" ?`
    );
    if (ok) {
      const data: Map<string, any> = new Map();
      data.set('company', company);
      this.sharedDataService.setData(data);
      this.router.navigate(['/companies/edit']);
    }
  }

  addCampany() {
    this.sharedMessagesService.setMessage("Ajout d'une Société");
    this.router.navigate(['/companies/add']);
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    console.log();
  }
}
