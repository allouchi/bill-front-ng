import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/shared-data-service';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';

import Exercise from '../../../models/Exercise';
import { CommonModule } from '@angular/common';
import Operation from '../../../models/Operation';
import { OperationService } from '../../../services/dashboard/operation-service';

@Component({
  selector: 'bill-operation-edit',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './operation-edit.component.html',
  styleUrl: './operation-edit.component.css',
})
export class OperationEditComponent implements OnInit, OnDestroy {
  formOperation!: FormGroup;  
  monthsYear!: any;
  exercises: Exercise[] | null = [];
  selectedExercise: string | null = null;  
  selectedOperation!: Operation | null;
  typeOperationValue: string[]= ['DIV', 'NDF']
  router = inject(Router);

  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder
  ) { }


  ngOnInit(): void {
   
    this.exercises = this.sharedDataService.getExercices();
    this.selectedOperation = this.sharedDataService.getSelectedOperration(); 
    this.exercises = this.exercises!.filter((ex) => ex.exercise !== 'Tous'); 
    let formatedDate;
    if (this.selectedOperation) {
      const dateOperation = this.selectedOperation.dateOperation.split('/');
      formatedDate =
        dateOperation[2] + '-' + dateOperation[1] + '-' + dateOperation[0];    
    }
  
    
    this.formOperation = this.fb.group({
      exercise: [this.selectedOperation?.exercise, Validators.required],
      montantOperation: [this.selectedOperation?.montantOperation, [Validators.required, Validators.pattern('^[0-9]+$')]],
      dateOperation: [formatedDate, Validators.required],
      typeOperation: [this.selectedOperation?.typeOperation, Validators.required]
    });   
  }

  numericValidator(control: FormControl) {
  const value = control.value;
  return isNaN(value) ? { notNumeric: true } : null;
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
    
      let operation: Operation = {
        id: this.selectedOperation!.id,
        montantOperation: this.formOperation.get('montantOperation')?.value,
        exercise: this.formOperation.get('exercise')?.value,
        typeOperation: this.formOperation.get('typeOperation')?.value,
        dateOperation: formatedDate
      };

      console.log(operation)

      this.operationService.createOrUpdateOperation(operation).subscribe({
        next: () => {
          this.onSuccess('EDIT,OPERATION');
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
