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
  typeOperationValue: string[] = ['DIV', 'NDF']

  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder
  ) { }


  ngOnInit(): void {
    this.loadMonthYear();
    this.exercises = this.sharedDataService.getExercices();
    this.exercises = this.exercises!.filter((ex) => ex.exercise !== 'Tous');
    this.formOperation = this.fb.group({
      exercise: ['', Validators.required],
      montantOperation: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      dateOperation: ['', Validators.required],
      typeOperation: ['', Validators.required]
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

      let operation: Operation = {
        id: null,
        montantOperation: this.formOperation.get('montantOperation')?.value,
        exercise: this.formOperation.get('exercise')?.value,
        typeOperation: this.formOperation.get('typeOperation')?.value,
        dateOperation: formatedDate
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
      for (const [key, control] of Object.entries(this.formOperation.controls)) {
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
    console.log('');
  }
}
