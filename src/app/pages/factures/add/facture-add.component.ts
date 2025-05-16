import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import JoursOuvres from '../../../shared/utils/time-calcul';
import Prestation from '../../../models/Prestation';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SiretService } from '../../../services/shared/siret-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bill-facture-add',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './facture-add.component.html',
  styleUrl: './facture-add.component.css',
})
export class FactureAddComponent implements OnInit {
  formFacture!: FormGroup;
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  monthsYear: any;
  siret: string = '';
  observableEvent$ = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly siretService: SiretService,
    private readonly sharedDataService: SharedDataService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.formFacture = this.fb.group({
      month: ['', Validators.required],
      numeroCommande: ['', Validators.required],
      quantite: ['', Validators.required],
      clientPrestation: ['', Validators.required],
    });

    this.observableEvent$ = this.siretService.getSiretObservable().subscribe(siret => {
      this.siret = siret;
    });
    const mapData = this.sharedDataService.getData();
    this.selectedPrestation = mapData.get('prestation');
    this.monthsYear = GetMonthsOfYear();
    let formatDateDebut = this.selectedPrestation.dateDebut?.split('/');
    const dateDebut =
      formatDateDebut![2] +
      '-' +
      formatDateDebut![1] +
      '-' +
      formatDateDebut![0];
    let formatDateFin = this.selectedPrestation.dateFin?.split('/');
    const dateFin =
      formatDateFin![2] + '-' + formatDateFin![1] + '-' + formatDateFin![0];

    this.formFacture.patchValue({
      id: this.selectedPrestation.id,
      tarifHT: this.selectedPrestation.tarifHT,
      delaiPaiement: this.selectedPrestation.delaiPaiement,
      consultant: this.selectedPrestation.consultant,
      client: this.selectedPrestation.client,
      facture: this.selectedPrestation.facture,
      designation: this.selectedPrestation.designation,
      numeroCommande: this.selectedPrestation.numeroCommande,
      clientPrestation: this.selectedPrestation.clientPrestation,
      quantite: this.selectedPrestation.quantite,
      dateDebut: dateDebut,
      dateFin: dateFin,
      siret: this.selectedPrestation.siret,
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

  private addNewFacture(prestation: Prestation) {
    const ok = confirm(`Voulez-vous éditer la facture ?`);
    if (ok) {
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
          },
          error: (err) => {
            this.onError(err);
          },
        });
    }
  }

  addFacture() {
    if (this.formFacture.valid) {
      let prestation: Prestation = {
        id: null,
        quantite: this.formFacture.get('quantite')?.value,
        numeroCommande: this.formFacture.get('numeroCommande')?.value,
        clientPrestation: this.formFacture.get('clientPrestation')?.value,
        designation: 'La Prestation est réalisée pour le compte de ',
        tarifHT: this.selectedPrestation.tarifHT,
        delaiPaiement: this.selectedPrestation.delaiPaiement,
        consultant: this.selectedPrestation.consultant,
        client: this.selectedPrestation.client,
        dateFin: this.selectedPrestation.dateFin,
        dateDebut: this.selectedPrestation.dateDebut,
        siret: this.selectedPrestation.siret,
      };

      this.addNewFacture(prestation);
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

  cancel() {}

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
