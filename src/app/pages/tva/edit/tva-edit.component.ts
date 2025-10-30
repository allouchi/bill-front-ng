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

import Company from '../../../models/Company';
import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { numericFrValidator } from '../../../shared/utils/numeric-fr.validator';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alertService';
import Facture from '../../../models/Facture';
import { FactureService } from '../../../services/factures/facture.service';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css',
})
export class TvaEditComponent implements OnInit, OnDestroy {
  formTva!: FormGroup;
  tva: Tva | null = null;
  companies: Company[] | null = [];
  factures: Facture[] = [];
  exercices: Exercise[] | null = [];
  selectedExercise: Exercise | null = null;
  tvaId!: number | null;
  siret: string = '';
  selectedCompany!: Company;
  currentUrl: string = '';
  isEdit: boolean = false;
  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly factureService: FactureService
  ) { }

  ngOnInit(): void {
    this.formTva = this.fb.group({
      company: [{ value: '', disabled: true }],
      exercise: [{ value: '', disabled: true }, Validators.required],
      datePayment: ['', Validators.required],
      montantPayment: ['', [Validators.required, numericFrValidator()]],
      numeroFacture: ['', Validators.required],
    });

    this.currentUrl = this.router.url;

    if (this.currentUrl.includes('/edit')) {
      this.isEdit = true;
    }

    this.companies = this.sharedDataService.getCompanies();
    this.tva = this.sharedDataService.getSelectedTva();
    this.exercices = this.sharedDataService.getExercices();
    this.siret = this.sharedDataService.getSiret();

    this.exercices = this.exercices!.filter((ex) => ex.exercise !== 'Tous');

    if (this.companies) {
      this.companies.forEach((c) => {
        if (c.siret == this.siret) {
          this.selectedCompany = c;
        }
      });

      this.formTva.patchValue({
        company: this.selectedCompany,
      });
    }

    if (this.tva) {
      this.tvaId = this.tva.id;
      const selectedCompany = this.companies!.find(
        (c) => c.siret == this.tva!.siret
      )?.socialReason;

      const selectedExercice = this.exercices.find(
        (c) => c.exercise == this.tva!.exercise
      )?.exercise;

      const datePaiement = this.tva.datePayment.split('/');
      let formatedDate =
        datePaiement[2] + '-' + datePaiement[1] + '-' + datePaiement[0];
      const formattedMontant = this.tva.montantPayment.toFixed(2);

      this.formTva.patchValue({
        numeroFacture: this.tva.numeroFacture,
        exercise: selectedExercice,
        datePayment: formatedDate,
        montantPayment: formattedMontant,
        company: selectedCompany,
      });
    }

    const selectedExercice = this.sharedDataService.getSelectedExercise();

    if (selectedExercice) {
      this.loadFacturesByExercise(selectedExercice);
    }
  }

  loadFacturesByExercise(exercice: string) {
    this.factureService.findBySiretAndExercice(this.siret, exercice).subscribe({
      next: (factures) => {
        this.factures = factures;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setFactureNumero(event: Event) {
    const factureNumero = (event.target as HTMLSelectElement).value;
    if (factureNumero) {
      const selectedExercice = factureNumero.substring(0, 4);
      this.formTva.patchValue({
        numeroFacture: factureNumero,
      });

      this.formTva.patchValue({
        exercise: selectedExercice,
      });
    }
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

  private loadMonthYear(nbMonth: string): string | undefined {
    let months;
    const monthsYear = GetMonthsOfYear();
    if (monthsYear) {
      months = monthsYear.find(m => m.id === nbMonth)?.label;
    }
    return months;
  }

  addTva() {
    if (this.formTva.valid) {
      let monthPayment = this.formTva.get('numeroFacture')?.value;
      monthPayment = monthPayment.substring(4, 6);
      monthPayment = this.loadMonthYear(monthPayment);

      const selectedRaisonSocial = this.formTva.get('company')?.value;
      const selectedSiret = this.companies!.find(
        (c) => c.socialReason == selectedRaisonSocial
      )?.siret;
      const formattedMontant = this.formTva
        .get('montantPayment')
        ?.value.replace(',', '.');
      let tvaModif: Tva = {
        id: this.tvaId,
        numeroFacture: this.formTva.get('numeroFacture')?.value,
        exercise: this.formTva.get('exercise')?.value,
        datePayment: this.formTva.get('datePayment')?.value,
        montantPayment: formattedMontant,
        siret: selectedSiret!,
        monthPayment: monthPayment
      };

      this.tvaService.createOrUpdateTva(tvaModif).subscribe({
        next: () => {
          if (this.tvaId) {
            this.alertService.show('UPDATE', 'TVA', 'success');
          } else {
            this.alertService.show('ADD', 'TVA', 'success');
          }
          this.sharedMessagesService.setMessage('Liste des TVAs');
          this.router.navigate(['/tvas/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [, control] of Object.entries(this.formTva.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/tvas/read']);
  }

  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
