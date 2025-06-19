import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FactureService } from '../../../services/factures/facture.service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import Facture from '../../../models/Facture';
import { SharedDataService } from '../../../services/shared/shared-data-service';

@Component({
  selector: 'bill-facture-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './facture-edit.component.html',
  styleUrls: ['./facture-edit.component.scss'],
})
export default class FactureEditComponent implements OnInit {
  formFacture!: FormGroup;
  facture: Facture | null = null;
  numeroFacture: string | null = '';
  parent = 'read';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly factureService: FactureService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService
  ) {}
  ngOnInit(): void {
    this.facture = this.sharedDataService.gertSelectedFacture();
    this.numeroFacture = this.facture!.numeroFacture;
    this.formFacture = this.fb.group({
      dateEncaissement: ['', Validators.required],
    });
  }

  updateFacture() {
    if (this.formFacture.valid) {
      this.formFacture.patchValue({
        dateEncaissement: this.formFacture.get('dateEncaissement')?.value,
      });

      this.facture!.dateEncaissement =
        this.formFacture.get('dateEncaissement')?.value;

      this.factureService.updateFacture(this.facture!).subscribe({
        next: () => {
          this.onSuccess('UPDATE,FACTURE');
          this.router.navigate(['/factures/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [key, control] of Object.entries(this.formFacture.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
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

  cancel() {
    this.router.navigate(['/factures/read']);
  }
}
