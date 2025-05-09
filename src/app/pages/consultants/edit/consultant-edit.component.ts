import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { AlertService } from '../../../services/alert/alert.service';
import Consultant from '../../../models/Consultant';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { env } from '../../../../environments/env';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-consultant-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './consultant-edit.component.html',
  styleUrl: './consultant-edit.component.css'
})
export class ConsultantEditComponent implements OnInit, OnDestroy {


  formConsultant!: FormGroup;

  constructor(private readonly fb: FormBuilder,
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {

  }

  ngOnInit(): void {
    this.formConsultant = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      fonction: ['', Validators.required],
    });
  }

  addConsultant() {
    if (this.formConsultant.valid) {
      let consultant: Consultant = {
        id: 0,
        firstName: this.formConsultant.get('firstName')?.value,
        email: this.formConsultant.get('email')?.value,
        lastName: this.formConsultant.get('lastName')?.value,
        fonction: this.formConsultant.get('fonction')?.value,
      };

      this.consultantService.createOrUpdateConsultant(consultant, env.siret).subscribe({
        next: (Consultant) => {
          this.onSuccess("Le Consultant " + Consultant.firstName + " a été ajouté !")
          this.router.navigate(['/consultants/read'])
        },
        error: (err) => {
          this.onError(err);
        }
      });

    } else {
      for (const [key, control] of Object.entries(this.formConsultant.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }

  }

  cancel() {
  }


  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {

    this.alertService.show('Une erreur est survenue.', 'error');
  }
  ngOnDestroy(): void {
    console.log("");
  }
}
