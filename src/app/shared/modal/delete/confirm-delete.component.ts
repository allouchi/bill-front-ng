import { Component,  OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { CommonModule } from '@angular/common';
import { FactureService } from '../../../services/factures/facture.service';
import { ClientService } from '../../../services/clients/client-service';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { CompanyService } from '../../../services/companies/company-service';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { UserService } from '../../../services/user/user-service';
import User from '../../../models/User';

@Component({
  selector: 'bill-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.css',
})
export class ConfirmDeleteComponent implements OnInit {
  item: any;
  composant: any;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly alertService: AlertService,
    private readonly tvaService: TvaService,
    private readonly factureService: FactureService,
    private readonly clientService: ClientService,
    private readonly consultantService: ConsultantService,
    private readonly companyService: CompanyService,
    private readonly prestationService: PrestationService,
    private readonly userService: UserService
  ) {}

  ngOnInit() {}

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(): void {
    if (this.item == 'Company') {
      this.deleteCompany(this.composant.id);
    }

    if (this.item == 'Prestation') {
      this.deletePrestation(this.composant.id);
    }

    if (this.item == 'Facture') {
      this.deleteFacture(this.composant.id);
    }

    if (this.item == 'Consultant') {
      this.deleteConsultant(this.composant.id);
    }

    if (this.item == 'Client') {
      this.deleteClient(this.composant.id);
    }

    if (this.item == 'Tva') {
      this.deleteTva(this.composant.id);
    }

    if (this.item == 'User') {
      this.deleteUser(this.composant);
    }
    this.activeModal.close('confirm');
  }

  deleteUser(user: User) {
    this.userService.deleteUser(user.id!).subscribe({
      next: () => {
        this.onSuccess('DELETE,USER');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteCompany(id: number) {
    this.companyService.deleteCompanyById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,COMPANY');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deletePrestation(id: number) {
    this.prestationService.deletePrestationById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,PRESTATION');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteFacture(id: number) {
    this.factureService.deleteFactureById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,FACTURE');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteConsultant(id: number) {
    this.consultantService.deleteConsultantById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,CONSULTANT');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteClient(id: number) {
    this.clientService.deleteClientById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,CLIENT');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteTva(id: number) {
    this.tvaService.deleteTvaById(id).subscribe({
      next: () => {
        this.onSuccess('DELETE,TVA');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {}
}
