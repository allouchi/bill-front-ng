import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/shared-data-service';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';

import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import Operation from '../../../models/Operation';
import { OperationService } from '../../../services/dashboard/operation-service';
import { numericFrValidator } from '../../../shared/utils/numeric-fr.validator';


@Component({
  selector: 'bill-operation-add',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './operation-add.component.html',
  styleUrl: './operation-add.component.css',
})
export class OperationAddComponent implements OnInit, OnDestroy {
  formOperation!: FormGroup;
  monthsYear!: any;
  exercises: Exercise[] | null = [];
  selectedExercise: string | null = null;
  selectedOperation!: Operation | null;
  siret: string = '';
  typeOperationValue: string[] = ['DIV', 'NDF'];

  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadMonthYear();
    this.exercises = this.sharedDataService.getExercices();
    this.siret = this.sharedDataService.getSiret();
    this.exercises = this.exercises!.filter((ex) => ex.exercise !== 'Tous');
    this.formOperation = this.fb.group({
      exercise: ['', Validators.required],
      montantOperation: ['', [Validators.required, numericFrValidator()]],
      dateOperation: ['', Validators.required],
      typeOperation: ['', Validators.required],
    });
  }

  private loadMonthYear() {
    this.monthsYear = GetMonthsOfYear();
  }

  setDateOperationValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formOperation.patchValue({
      dateOperation: selectedValue,
    });
  }

  setExerciceValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formOperation.patchValue({
      exercise: selectedValue,
    });
  }

  addOperation() {
    if (this.formOperation.valid) {
      let dateOperation = this.formOperation.get('dateOperation')?.value;
      dateOperation = dateOperation.split('-');
      let formatedDate =
        dateOperation[2] + '/' + dateOperation[1] + '/' + dateOperation[0];

      const montantOperation =
        this.formOperation.get('montantOperation')?.value;
      const montantFormat = montantOperation.toString().replace(',', '.');

      let operation: Operation = {
        id: null,
        montantOperation: montantFormat,
        exercise: this.formOperation.get('exercise')?.value,
        typeOperation: this.formOperation.get('typeOperation')?.value,
        dateOperation: formatedDate,
        siret: this.siret,
      };

      this.operationService.createOrUpdateOperation(operation).subscribe({
        next: () => {
          this.onSuccess('ADD,OPERATION');
          this.router.navigate(['/operations/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [, control] of Object.entries(this.formOperation.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/operations/read']);
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
    this.alertService.clear();
  }
}
