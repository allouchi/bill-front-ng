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
import GetMonthsOfYear from '../../../shared/utils/month-year';
import Company from '../../../models/Company';
import Exercise from '../../../models/Exercise';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css',
})
export class TvaEditComponent implements OnInit {
  formTva!: FormGroup;
  tva!: Tva;
  monthsYear!: any;
  companies: Company[] = [];
  exercices: Exercise[] = [];
  CONTEXT = '';

  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.formTva = this.fb.group({
      company: ['', Validators.required],
      exercise: ['', Validators.required],
      datePayment: ['', Validators.required],
      montantPayment: ['', Validators.required],
      month: ['', Validators.required],
    });
    const maMap = this.sharedDataService.getData();
    this.tva = maMap.get('tva');
    this.monthsYear = maMap.get('months');
    this.companies = maMap.get('companies');
    this.exercices = maMap.get('exercices');

    if (this.tva) {
      this.formTva.patchValue({
        month: this.monthsYear,
        exercise: this.exercices,
        datePayment: this.tva.datePayment,
        montantPayment: this.tva.montantPayment,
        company: this.companies,
      });
    }
  }

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formTva.patchValue({
      month: selectedValue,
    });
  }

  setCompanyValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formTva.patchValue({
      company: selectedValue,
    });
  }

  setExerciceValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formTva.patchValue({
      exercise: selectedValue,
    });
  }

  addTva() {
    if (this.formTva.valid) {
      let tvaModif: Tva = {
        id: 0,
        month: this.formTva.get('month')?.value,
        exercise: this.formTva.get('exercise')?.value,
        datePayment: this.formTva.get('datePayment')?.value,
        montantPayment: this.formTva.get('montantPayment')?.value,
        siret: this.formTva.get('company')?.value,
      };

      console.log(tvaModif);

      this.tvaService.createOrUpdateTva(tvaModif).subscribe({
        next: () => {
          this.onSuccess('updated');
          this.router.navigate(['/tvas/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      console.log('non : ', this.formTva.value);
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
