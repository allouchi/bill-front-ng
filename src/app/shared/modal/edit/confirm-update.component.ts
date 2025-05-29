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


@Component({
  selector: 'bill-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-update.component.html',
  styleUrl: './confirm-update.component.css',
})
export class ConfirmEditComponent implements OnInit {
  item: any;
  composant: any;
  state: boolean = false;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly alertService: AlertService,
    private readonly tvaService: TvaService,
    private readonly factureService: FactureService,
    private readonly clientService: ClientService,
    private readonly consultantService: ConsultantService,
    private readonly companyService: CompanyService,
    private readonly prestationService: PrestationService
  ) {}

  ngOnInit() {
    // setTimeout(() => this.confirmBtn.nativeElement.focus(), 0);
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirmEdit(): void {
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
      this.deleteFacture(this.composant.id);
    }
    this.activeModal.close('confirm');
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
