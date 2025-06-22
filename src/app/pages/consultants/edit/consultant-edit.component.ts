import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { AlertService } from '../../../services/alert/alert-messages.service';
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
  ) {}

  ngOnInit(): void {
    this.formConsultant = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      fonction: ['', Validators.required],
    });   

    this.currentUrl = this.router.url;
    if (this.currentUrl.includes('/edit')) {
      this.consultant = this.sharedDataService.getSelectedConsultant();
      this.siret = this.sharedDataService.getSiret();
      this.isEdit = true;
      this.sharedMessagesService.setMessage(`Mise à jour de ${this.consultant?.firstName} ${this.consultant?.lastName}`);
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
      };

      this.consultantService
        .createOrUpdateConsultant(consultant, this.siret)
        .subscribe({
          next: () => {
            if (this.consultantId) {
              this.onSuccess('UPDATE,CONSULTANT');
            } else {
              this.onSuccess('ADD,CONSULTANT');
            }
            this.router.navigate(['/consultants/read']);
          },
          error: (err) => {
            this.onError(err);
          },
        });
    } else {
      for (const [key, control] of Object.entries(
        this.formConsultant.controls
      )) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/consultants/read']);
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
