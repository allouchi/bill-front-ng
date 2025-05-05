import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../services/shared/sharedDataService';
import Exercise from '../../../models/Exercise';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'bill-tva-edit',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './tva-edit.component.html',
  styleUrl: './tva-edit.component.css'
})
export class TvaEditComponent implements OnInit {

  exercises: Exercise[] = [];
  formTva!: FormGroup;

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

  constructor(private readonly sharedDataService: SharedDataService, private readonly fb: FormBuilder) {
  }


  ngOnInit(): void {
    this.formTva = this.fb.group({
      company: ['', Validators.required],
      exercise: ['', Validators.required],
      datePayment: ['', Validators.required],
      montantPayment: ['', Validators.required],
      month: ['', Validators.required],
    });

    this.exercises = this.sharedDataService.getData();
    console.log("read :", this.exercises)
  }

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue)

    this.formTva.patchValue({
      month: selectedValue,
    });

  }

  addTva(form: any) {

  }

}
