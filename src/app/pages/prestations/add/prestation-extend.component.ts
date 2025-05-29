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

import { AlertService } from '../../../services/alert/alert-messages.service';

import { SharedDataService } from '../../../services/shared/shared-data-service';
import Prestation from '../../../models/Prestation';
import { PrestationService } from '../../../services/prestations/prestation.service';

@Component({
  selector: 'bill-prestation-extend',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './prestation-extend.component.html',
  styleUrls: ['./prestation-extend.component.css'],
})
export default class PrestationExtendComponent implements OnInit {
  formPrestation!: FormGroup;
  prestation: Prestation | null = null;
  siret: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService
  ) {}
  ngOnInit(): void {
    this.prestation = this.sharedDataService.getSelectedPrestation();
    let dateFin =  this.prestation?.dateFin;
    let formatedDate = dateFin?.split('/');
    dateFin = formatedDate![2]+'-'+ formatedDate![1]+  '-'+formatedDate![0];

    this.siret = this.sharedDataService.getSiret();
    this.formPrestation = this.fb.group({
      dateFin: [dateFin, Validators.required],
    });
  }

  prolongePrestation() {
    if (this.formPrestation.valid) {
      this.formPrestation.patchValue({
        dateFin: this.formPrestation.get('dateFin')?.value,
      });

      this.prestation!.dateFin =
        this.formPrestation.get('dateFin')?.value;
      this.prestationService.updateDatePrestation(this.prestation!, this.siret).subscribe({
        next: () => {
          this.onSuccess('UPDATE,PRESTATION');
          this.router.navigate(['/prestations/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [key, control] of Object.entries(this.formPrestation.controls)) {
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
