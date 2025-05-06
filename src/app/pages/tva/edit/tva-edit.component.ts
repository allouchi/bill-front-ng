import { Component, inject, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/sharedDataService';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css',
})
export class TvaEditComponent implements OnInit {
  formTva!: FormGroup;
  tva!: Tva;

  monthYear = [
    { id: 0, label: '' },
    { id: 1, label: 'Janvier' },
    { id: 2, label: 'Février' },
    { id: 3, label: 'Mars' },
    { id: 4, label: 'Avril' },
    { id: 5, label: 'Mai' },
    { id: 6, label: 'Juin' },
    { id: 7, label: 'Juillet' },
    { id: 8, label: 'Août' },
    { id: 9, label: 'Septembre' },
    { id: 10, label: 'Octobre' },
    { id: 11, label: 'Novembre' },
    { id: 12, label: 'Décembre' },
  ];

  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.formTva = this.fb.group({
      siret: ['', Validators.required],
      exercise: ['', Validators.required],
      datePayment: ['', Validators.required],
      montantPayment: ['', Validators.required],
      month: ['', Validators.required],
    });
    const maMap = this.sharedDataService.getData();
    this.tva = maMap.get('tva');

    if (this.tva) {
      this.formTva.patchValue({
        month: this.tva.month,
        exercise: this.tva.exercise,
        datePayment: this.tva.datePayment,
        montantPayment: this.tva.montantPayment,
        siret: this.tva.siret,
      });
    }

    //console.log(this.formTva.value);
  }

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formTva.patchValue({
      month: selectedValue,
    });
  }

  addTva() {
    if (this.formTva.valid) {
      let tvaModif: Tva = {
        id: this.tva.id,
        month: this.formTva.get('month')?.value,
        exercise: this.formTva.get('moexercisenth')?.value,
        datePayment: this.formTva.get('datePayment')?.value,
        montantPayment: this.formTva.get('montantPayment')?.value,
        siret: this.formTva.get('siret')?.value,
      };
      this.tvaService.createOrUpdateTva(tvaModif);

      this.tvaService.createOrUpdateTva(tvaModif).subscribe({
        next: () => {
          this.onSuccess('updated');
          this.router.navigate(['/tvas/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    }
  }

  cancel() {}

  private onSuccess(respSuccess: any) {
    this.alertService.show('Opération réussie !', 'success');
  }

  private onError(error: any) {
    this.alertService.show('Une erreur est survenue.', 'error');
  }
}
