import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import JoursOuvres from '../../../shared/utils/time-calcul';
import Prestation from '../../../models/Prestation';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';

@Component({
  selector: 'bill-facture-add',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, WaitingComponent],
  templateUrl: './facture-add.component.html',
  styleUrl: './facture-add.component.css',
})
export class FactureAddComponent implements OnInit {
  formFacture!: FormGroup;
  selectedPrestation: Prestation | null = null;
  selectedMonth: number = 0;
  monthsYear: any;
  siret: string = '';
  isUpload: boolean = true;
  observableEvent$ = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly sharedDataService: SharedDataService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.formFacture = this.fb.group({
      monthFacture: ['', Validators.required],
      numeroCommande: [{ value: '', disabled: true }],
      quantite: ['', Validators.required],
      clientPrestation: [{ value: '', disabled: true }],
    });

    this.selectedPrestation = this.sharedDataService.getSelectedPrestation();
    this.monthsYear = GetMonthsOfYear();
    this.siret = this.sharedDataService.getSiret();
    this.formFacture.patchValue({
      id: this.selectedPrestation!.id,
      tarifHT: this.selectedPrestation!.tarifHT,
      delaiPaiement: this.selectedPrestation!.delaiPaiement,
      consultant: this.selectedPrestation!.consultant,
      client: this.selectedPrestation!.client,
      facture: this.selectedPrestation!.facture,
      designation: this.selectedPrestation!.designation,
      numeroCommande: this.selectedPrestation!.numeroCommande,
      clientPrestation: this.selectedPrestation!.clientPrestation,
      quantite: this.selectedPrestation!.quantite,
      dateDebut: this.selectedPrestation!.dateDebut,
      dateFin: this.selectedPrestation!.dateFin,
      siret: this.selectedPrestation!.siret,
    });
  }

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const nbJoursOuvres = JoursOuvres(selectedValue);
    this.selectedMonth = +selectedValue;
    this.formFacture.patchValue({
      quantite: nbJoursOuvres,
    });
  }

  private editFacture(prestation: Prestation) {
    prestation.id = this.selectedPrestation!.id;
    this.isUpload = false;
    this.prestationService
      .createOrUpdatePrestation(
        prestation,
        this.siret,
        false,
        this.selectedMonth
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/factures/read']);
          this.onSuccess('ADD,FACTURE');
          this.isUpload = true;
        },
        error: (err) => {
          this.isUpload = true;
          this.onError(err);
        },
      });
  }

  addFacture() {
    if (this.formFacture.valid) {
      let prestation: Prestation = {
        id: null,
        quantite: this.formFacture.get('quantite')?.value,
        numeroCommande: this.formFacture.get('numeroCommande')?.value,
        clientPrestation: this.formFacture.get('clientPrestation')?.value,
        designation: 'La Prestation est réalisée pour le compte de ',
        tarifHT: this.selectedPrestation!.tarifHT,
        delaiPaiement: this.selectedPrestation!.delaiPaiement,
        consultant: this.selectedPrestation!.consultant,
        client: this.selectedPrestation!.client,
        dateFin: this.selectedPrestation!.dateFin,
        dateDebut: this.selectedPrestation!.dateDebut,
        siret: this.selectedPrestation!.siret,
      };

      this.editFacture(prestation);
    } else {
      for (const [key, control] of Object.entries(this.formFacture.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  cancel() {
    this.router.navigate(['/factures/read']);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
