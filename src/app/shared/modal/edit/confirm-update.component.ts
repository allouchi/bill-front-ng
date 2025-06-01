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

  constructor(private readonly activeModal: NgbActiveModal) {}

  ngOnInit() {
    // setTimeout(() => this.confirmBtn.nativeElement.focus(), 0);
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirmEdit(): void {
    if (this.item == 'Company') {
      this.editCompany(this.composant);
    }

    if (this.item == 'Prestation') {
      this.editPrestation(this.composant);
    }

    if (this.item == 'Facture') {
      this.editFacture(this.composant);
    }

    if (this.item == 'Consultant') {
      this.editConsultant(this.composant);
    }

    if (this.item == 'Client') {
      this.editClient(this.composant);
    }

    if (this.item == 'Tva') {
      this.editTva(this.composant);
    }

    if (this.item == 'User') {
      this.editUser(this.composant);
    }
    this.activeModal.close('confirm');
  }

  editCompany(composant: any) {}

  editPrestation(composant: any) {}

  editFacture(composant: any) {}

  editConsultant(composant: any) {}

  editClient(composant: any) {}

  editTva(composant: any) {}

   editUser(composant: any) {}
}
