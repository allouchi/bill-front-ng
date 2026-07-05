import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { AlertService } from '../../../services/alert/alertService';

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
    private readonly sharedDataService: SharedDataService,
    private readonly route: ActivatedRoute
  ) { }
  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.formFacture = this.fb.group({
      dateEncaissement: [today, Validators.required],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const seed = this.sharedDataService.getSelectedFacture();
    if (seed && (!idParam || seed.id === Number(idParam))) {
      this.setFacture(seed);
      return;
    }

    // Deep-link / refresh: no seed. There is no GET facture-by-id endpoint,
    // so resolve it from the siret-scoped (noPage) list.
    const siret = this.sharedDataService.getSiret();
    if (idParam && siret) {
      this.factureService.findBySiretAndExercice(siret, '').subscribe({
        next: (factures) => {
          const found = factures.find((f) => f.id === Number(idParam));
          if (found) {
            this.setFacture(found);
          } else {
            this.router.navigate(['/factures/read']);
          }
        },
        error: (err) => this.onError(err),
      });
    } else {
      this.router.navigate(['/factures/read']);
    }
  }

  private setFacture(facture: Facture): void {
    this.facture = facture;
    this.numeroFacture = facture.numeroFacture ?? '';
  }

  encaisserFacture() {
    if (this.formFacture.valid) {
      this.formFacture.patchValue({
        dateEncaissement: this.formFacture.get('dateEncaissement')?.value,
      });

      this.facture!.dateEncaissement =
        this.formFacture.get('dateEncaissement')?.value;

      this.factureService.updateFacture(this.facture!).subscribe({
        next: () => {
          this.alertService.show('UPDATE', 'FACTURE', 'success');
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


  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  cancel() {
    this.router.navigate(['/factures/read']);
  }
}
