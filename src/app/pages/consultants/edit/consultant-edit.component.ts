import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConsultantService } from '../../../services/consultants/consultant-service';

import Consultant from '../../../models/Consultant';
import { ActivatedRoute, Router } from '@angular/router';
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
  siret: string | null = '';
  observableEvent$ = new Subscription();
  currentUrl: string = '';
  isEdit: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formConsultant = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, customEmailValidator]],
      fonction: ['', Validators.required],
    });

    this.siret = this.sharedDataService.getSiret();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      // Instant seed from the list navigation, if present...
      const seed = this.sharedDataService.getSelectedConsultant();
      if (seed && seed.id === Number(idParam)) {
        this.populateForm(seed);
      }
      // ...but always (re)fetch by id so refresh / deep-link works.
      this.consultantService.getConsultantById(Number(idParam)).subscribe({
        next: (consultant) => this.populateForm(consultant),
        error: (err) => this.onError(err),
      });
    }
  }

  private populateForm(consultant: Consultant | null): void {
    if (!consultant) return;
    this.consultant = consultant;
    this.consultantId = consultant.id;
    this.sharedMessagesService.setMessage(
      `Mise à jour de ${consultant.firstName} ${consultant.lastName}`
    );
    this.formConsultant.patchValue({
      firstName: consultant.firstName,
      lastName: consultant.lastName,
      email: consultant.email,
      fonction: consultant.fonction,
    });
  }

  addConsultant() {
    if (this.formConsultant.valid) {
      let consultant: Consultant = {
        id: this.consultantId,
        firstName: this.formConsultant.get('firstName')?.value,
        email: this.formConsultant.get('email')?.value,
        lastName: this.formConsultant.get('lastName')?.value,
        fonction: this.formConsultant.get('fonction')?.value,
        hasPrestation: true,
        remoteError: ''
      };

      this.consultantService.createOrUpdateConsultant(consultant).subscribe({
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
