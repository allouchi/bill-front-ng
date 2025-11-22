import { Component, OnDestroy, OnInit } from '@angular/core';
import Company from '../../../models/Company';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/companies/company-service';

import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { LibelleCompanyService } from '../../../services/shared/libelle-company-service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { AlertService } from '../../../services/alert/alertService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'company-read',
  standalone: true,
  imports: [WaitingComponent, FormsModule, CommonModule],
  templateUrl: './company-read.component.html',
  styleUrls: ['./company-read.component.scss'],
})
export default class CompanyReadComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  filtredCompanies: Company[] = [];
  isLoaded = false;
  selectedSiret: string = '';
  observableEvent$ = new Subscription();
  siret: string = '';
  isAdmin = false;
  parent = 'read';

  constructor(
    private readonly modalService: NgbModal,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadCompanies();
  }

  loadCompanies() {
    this.companies = this.sharedDataService.getCompanies();
    this.filtredCompanies = this.companies
    const company = this.companies.find(
      (company) => company.checked === true
    );
    this.libelleCompanyService.setMessage(
      this.authService.getLibelleHeader()
    );
    this.sharedDataService.setSelectCompany(company!);
    this.isLoaded = true;
    // Réorganiser : les éléments "checked" d'abord
    this.companies.sort((a, b) => {
      if (a.checked === b.checked) return 0;
      return a.checked ? -1 : 1;
    });
  }

  deleteCompanySerice(id: number) {
    this.companyService.deleteCompanyById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'SOCIETE', 'success');
        this.filtredCompanies = this.companies.filter((item) => item.id !== id);
        this.companies = this.filtredCompanies;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteCompany(event: Event, company: Company) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Company';
    modal.componentInstance.composant = company;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          if (company.id) {
            this.deleteCompanySerice(company.id);
          }
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  setCompanyValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.companies.forEach((item) => {
      if (item.siret === selectedValue) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });

    const company = this.companies.find(
      (company) => company.siret === selectedValue
    );

    this.sharedDataService.setSelectCompany(company!);
    this.sharedDataService.setPrestations(company!.prestations!);
    this.sharedDataService.setSiret(company!.siret);
    this.libelleCompanyService.setMessage(this.authService.getLibelleHeader());
    this.companyService.createOrUpdateCompany(company!).subscribe({
      next: () => {
        this.libelleCompanyService.setMessage(company?.socialReason!);
        // Réorganiser : les éléments "checked" d'abord
        this.companies.sort((a, b) => {
          if (a.checked === b.checked) return 0;
          return a.checked ? -1 : 1;
        });
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  editCompany(event: Event, company: Company) {
    event.preventDefault();
    this.sharedMessagesService.setMessage('Modifier une Société');
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Company';
    modal.componentInstance.composant = company;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          this.sharedDataService.setSelectCompany(company);
          this.router.navigate(['/companies/edit']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  addCampany() {
    this.sharedMessagesService.setMessage("Ajout d'une Société");
    this.router.navigate(['/companies/add']);
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
