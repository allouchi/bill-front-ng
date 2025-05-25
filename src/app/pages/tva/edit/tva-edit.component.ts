import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/shared-data-service';

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
import { AlertService } from '../../../services/alert/alert-messages.service';

import Company from '../../../models/Company';
import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';
import GetMonthsOfYear from '../../../shared/utils/month-year';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css',
})
export class TvaEditComponent implements OnInit, OnDestroy {
  formTva!: FormGroup;
  tva: Tva | null = null;
  monthsYear!: any;
  companies: Company[] | null = [];
  exercices: Exercise[] | null = [];
  selectedExercise: Exercise | null = null;
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
      monthPayment: ['', Validators.required],
    });

    this.loadMonthYear();
    this.loadExercicesRef();

    this.companies = this.sharedDataService.getCompanies();
    this.tva = this.sharedDataService.getSelectedTva();
    this.exercices = this.sharedDataService.getExercices();

    if (this.tva) {
      this.tvaId = this.tva.id;
      const selectedCompany = this.companies!.find(
        (c) => c.siret == this.tva!.siret
      )?.socialReason;

      const selectedExercice = this.exercices!.find(
        (c) => c.exercise == this.tva!.exercise
      )?.exercise;

      //25/05/2025
      const datePaiement = this.tva.datePayment.split('/');
      let formatedDate =
        datePaiement[2] + '-' + datePaiement[1] + '-' + datePaiement[0];
      this.formTva.patchValue({
        monthPayment: this.tva.monthPayment,
        exercise: selectedExercice,
        datePayment: formatedDate,
        montantPayment: this.tva.montantPayment,
        company: selectedCompany,
      });
    }
  }

  private loadMonthYear() {
    this.monthsYear = GetMonthsOfYear();
  }

  private loadExercicesRef() {
    this.tvaService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercices = exercises;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formTva.patchValue({
      monthPayment: selectedValue,
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
      const selectedSiret = this.companies!.find(
        (c) => c.socialReason == selectedRaisonSocial
      )?.siret;

      let tvaModif: Tva = {
        id: this.tvaId,
        monthPayment: this.formTva.get('monthPayment')?.value,
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
