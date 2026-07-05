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
import { AlertService } from '../../../services/alert/alertService';
import { CommonModule } from '@angular/common';
import { EntityCardComponent } from '../../../shared/entity-card/entity-card.component';
import { DetailModalComponent, DetailField } from '../../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'company-read',
  standalone: true,
  imports: [WaitingComponent, FormsModule, CommonModule, EntityCardComponent, DetailModalComponent],
  templateUrl: './company-read.component.html',
  styleUrls: ['./company-read.component.scss'],
})
export default class CompanyReadComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  isLoaded = false;
  observableEvent$ = new Subscription();
  siret: string | null = '';
  isAdmin = false;
  parent = 'read';
  statusFilter: 'all' | 'valid' | 'pending' = 'all';

  selectedCompany: Company | null = null;
  detailOpen = false;

  openDetail(company: Company): void {
    this.selectedCompany = company;
    this.detailOpen = true;
  }
  closeDetail(): void {
    this.detailOpen = false;
  }
  onEditDetail(): void {
    if (this.selectedCompany) {
      this.editCompany(new Event('click'), this.selectedCompany);
    }
    this.closeDetail();
  }
  onDeleteDetail(): void {
    if (this.selectedCompany) {
      this.deleteCompany(new Event('click'), this.selectedCompany);
    }
    this.closeDetail();
  }
  companyAddress(company: Company): string {
    const a = company.companyAdresse;
    if (!a) return '';
    return `${a.numero ?? ''}, ${a.rue ?? ''} ${a.codePostal ?? ''} ${a.localite ?? ''}`.trim();
  }
  get detailFields(): DetailField[] {
    const c = this.selectedCompany;
    if (!c) return [];
    return [
      { label: 'Raison sociale', value: c.socialReason, wide: true, section: 'Société' },
      { label: 'Siret', value: c.siret },
      { label: 'RCS', value: c.rcsName },
      { label: 'Numéro TVA', value: c.numeroTva },
      { label: 'Code APE', value: c.codeApe },
      {
        label: 'Statut',
        value: c.checked ? 'Validée' : 'En attente',
        tone: c.checked ? 'success' : 'warning',
      },
      { label: 'IBAN', value: c.numeroIban, wide: true, section: 'Banque' },
      { label: 'BIC', value: c.numeroBic },
      { label: 'Adresse', value: this.companyAddress(c), wide: true, section: 'Coordonnées' },
    ];
  }

  get validCount(): number {
    return this.companies.filter((c) => c.checked).length;
  }
  get pendingCount(): number {
    return this.companies.filter((c) => !c.checked).length;
  }
  get displayedCompanies(): Company[] {
    if (this.statusFilter === 'valid') {
      return this.companies.filter((c) => c.checked);
    }
    if (this.statusFilter === 'pending') {
      return this.companies.filter((c) => !c.checked);
    }
    return this.companies;
  }

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
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.sharedDataService.setCompanies(this.companies);
        const company = this.companies.find(
          (company) => company.checked === true,
        );
        this.libelleCompanyService.setMessage(
          this.authService.getLibelleHeader(),
        );
        this.sharedDataService.setSelectCompany(company!);
        this.isLoaded = true;
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

  deleteCompanySerice(id: number) {
    this.companyService.deleteCompanyById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'SOCIETE', 'success');
        this.loadCompanies();
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
    this.sharedDataService.setSelectCompany(company);
    this.router.navigate(['/companies/edit', company.siret]);
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
