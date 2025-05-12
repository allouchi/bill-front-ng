import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/shared-service';

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

import Company from '../../../models/Company';
import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css',
})
export class TvaEditComponent implements OnInit, OnDestroy {
  formTva!: FormGroup;
  tva!: Tva;
  monthsYear!: any;
  companies: Company[] = [];
  exercices: Exercise[] = [];
  tvaId!: number | null;

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
      this.tvaId = this.tva.id;
      const selectedCompany = this.companies.find(
        (c) => c.siret == this.tva.siret
      )?.socialReason;

      const selectedExercice = this.exercices.find(
        (c) => c.exercise == this.tva.exercise
      )?.exercise;

      this.formTva.patchValue({
        month: this.tva.month,
        exercise: selectedExercice,
        datePayment: this.tva.datePayment,
        montantPayment: this.tva.montantPayment,
        company: selectedCompany,
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
      const selectedRaisonSocial = this.formTva.get('company')?.value;

      const selectedSiret = this.companies.find(
        (c) => c.socialReason == selectedRaisonSocial
      )?.siret;

      let tvaModif: Tva = {
        id: this.tvaId,
        month: this.formTva.get('month')?.value,
        exercise: this.formTva.get('exercise')?.value,
        datePayment: this.formTva.get('datePayment')?.value,
        montantPayment: this.formTva.get('montantPayment')?.value,
        siret: selectedSiret!,
      };

      this.tvaService.createOrUpdateTva(tvaModif).subscribe({
        next: () => {
          if (this.tvaId) {
            this.onSuccess('UPDATE,TVA');
          } else {
            this.onSuccess('ADD,TVA');
          }

          this.router.navigate(['/tvas/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [key, control] of Object.entries(this.formTva.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/tvas/read']);
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

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }
}
