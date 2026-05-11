import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import Facture from '../../../models/Facture';

@Component({
  selector: 'bill-detail-facture',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail-facture.component.html',
  styleUrl: './detail-facture.component.css',
})
export class DetailFactureComponent implements OnInit {
  facture: Facture | null = null;
  factureForm!: FormGroup;
  numeroFacture: string = '';
  dateFacturation: string = '';
  status: boolean = false;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder
  ) { }
  ngOnInit(): void {
    this.factureForm = this.fb.group({
      dateEncaissement: [
        {
          value: this.facture?.dateEncaissement
            ? this.facture?.dateEncaissement
            : 'Facture non acquitée',
          disabled: true,
        },
      ],
      factureStatus: [{ value: this.facture?.factureStatus, disabled: true }],
      statusDesc: [{ value: this.facture?.statusDesc, disabled: true }],
      penalite: [{ value: this.facture?.fraisRetard, disabled: true }],
      nbJourRetard: [{ value: this.facture?.nbJourRetard, disabled: true }],
    });

    this.numeroFacture = this.facture!.numeroFacture!;
    this.dateFacturation = this.facture!.dateFacturation!;
    if (this.facture!.dateEncaissement) {
      this.status = true;
    }
  }

  fermer(): void {
    this.activeModal.dismiss('cancel');
  }
}
