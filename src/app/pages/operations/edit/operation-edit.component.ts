import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedDataService } from '../../../services/shared/shared-data-service';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';
import Operation from '../../../models/Operation';
import { OperationService } from '../../../services/operations/operation-service';
import { numericFrValidator } from '../../../shared/utils/numeric-fr.validator';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alertService';

@Component({
  selector: 'bill-operation-edit',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './operation-edit.component.html',
  styleUrl: './operation-edit.component.css',
  encapsulation: ViewEncapsulation.None
})
export class OperationEditComponent implements OnInit, OnDestroy {
  formOperation!: FormGroup;
  monthsYear!: any;
  exercises: Exercise[] | null = [];
  selectedExercise: string | null = null;
  selectedOperation!: Operation | null;
  typeOperationValue: string[] = ['DIV', 'NDF'];
  siret: string | null = '';
  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder,
    private readonly sharedMessagesService: SharedMessagesService
  ) { }

  ngOnInit(): void {
    const exercisces = this.sharedDataService.getExercices();
    this.selectedOperation = this.sharedDataService.getSelectedOperation();
    this.siret = this.sharedDataService.getSiret();
    this.exercises = exercisces!.filter((ex) => ex.exercise !== 'Tous');
    let formatedDate;
    if (this.selectedOperation) {
      const dateOperation = this.selectedOperation.dateOperation.split('/');
      formatedDate =
        dateOperation[2] + '-' + dateOperation[1] + '-' + dateOperation[0];
    }

    const formattedMontant =
      this.selectedOperation?.montantOperation.toFixed(2);

    this.formOperation = this.fb.group({
      exercise: [this.selectedOperation?.exercise, Validators.required],
      montantOperation: [
        formattedMontant,
        [Validators.required, numericFrValidator()],
      ],
      dateOperation: [formatedDate, Validators.required],
      typeOperation: [
        this.selectedOperation?.typeOperation,
        Validators.required,
      ],
    });
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

  updateOperation() {
    if (this.formOperation.valid) {
      let dateOperation = this.formOperation.get('dateOperation')?.value;
      dateOperation = dateOperation.split('-');
      let formatedDate =
        dateOperation[2] + '/' + dateOperation[1] + '/' + dateOperation[0];
      const montantOperation =
        this.formOperation.get('montantOperation')?.value;
      const montantFormat = montantOperation.toString().replace(',', '.');
      let operation: Operation = {
        id: this.selectedOperation!.id,
        montantOperation: montantFormat,
        exercise: this.formOperation.get('exercise')?.value,
        typeOperation: this.formOperation.get('typeOperation')?.value,
        dateOperation: formatedDate,
        siret: this.siret!,
      };

      this.operationService.createOrUpdateOperation(operation).subscribe({
        next: () => {
          this.alertService.show('UPDATE', 'OPERATION', 'success');
          this.sharedMessagesService.setMessage('Liste des Opérations');
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


  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
