import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConsultantService } from '../../../services/consultants/consultant-service';

import Consultant from '../../../models/Consultant';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Subscription } from 'rxjs';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { customEmailValidator } from '../../../shared/utils/numeric-fr.validator';
import { AlertService } from '../../../services/alert/alertService';

@Component({
  selector: 'bill-consultant-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './consultant-edit.component.html',
  styleUrl: './consultant-edit.component.css',
})
export class ConsultantEditComponent implements OnInit, OnDestroy {
  formConsultant!: FormGroup;
  consultant: Consultant | null = null;
  consultantId: number | null = null;
  siret: string = '';
  observableEvent$ = new Subscription();
  currentUrl: string = '';
  isEdit: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router,
    private readonly sharedMessagesService: SharedMessagesService
  ) { }

  ngOnInit(): void {
    this.formConsultant = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, customEmailValidator]],
      fonction: ['', Validators.required],
    });

    this.currentUrl = this.router.url;
    this.siret = this.sharedDataService.getSiret();

    if (this.currentUrl.includes('/edit')) {
      this.consultant = this.sharedDataService.getSelectedConsultant();
      this.isEdit = true;
      this.sharedMessagesService.setMessage(
        `Mise à jour de ${this.consultant?.firstName} ${this.consultant?.lastName}`
      );
    }

    if (this.consultant) {
      this.consultantId = this.consultant.id;
      this.formConsultant.patchValue({
        firstName: this.consultant.firstName,
        lastName: this.consultant.lastName,
        email: this.consultant.email,
        fonction: this.consultant.fonction,
      });
    }
  }

  addConsultant() {
    if (this.formConsultant.valid) {
      let consultant: Consultant = {
        id: this.consultantId,
        firstName: this.formConsultant.get('firstName')?.value,
        email: this.formConsultant.get('email')?.value,
        lastName: this.formConsultant.get('lastName')?.value,
        fonction: this.formConsultant.get('fonction')?.value,
        hasPrestation: true
      };

      this.consultantService
        .createOrUpdateConsultant(consultant, this.siret)
        .subscribe({
          next: () => {
            if (this.consultantId) {
              this.alertService.show('UPDATE', 'CONSULTANT', 'success');
            } else {
              this.alertService.show('ADD', 'CONSULTANT', 'success');
            }
            this.router.navigate(['/consultants/read']);
          },
          error: (err) => {
            this.onError(err);
          },
        });
    } else {
      for (const [, control] of Object.entries(this.formConsultant.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/consultants/read']);
  }


  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }
  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
