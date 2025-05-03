import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { env } from '../../../../environments/env';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';

@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './facture-read.component.html',
  styleUrls: ['./facture-read.component.scss'],
})
export default class FactureReadComponent implements OnInit, OnDestroy {
  factures: Facture[] = [];
  isLoaded = false;
  private readonly router = inject(Router);

  constructor(
    private readonly factureService: FactureService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  private loadFactures() {
    this.factureService.findFacturesBySiret(env.siret).subscribe({
      next: (factures) => {
        setTimeout(() => {
          this.factures = factures;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });
  }

  deleteFactue(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${facture.numeroFacture}" ?`
    );
    if (ok) {
      this.factureService.deleteFactureById(facture.id).subscribe({
        next: () => {
          this.onSuccess('deleted');
          this.factures = this.factures.filter(
            (item) => item.id !== facture.id
          );
        },
        error: (err) => {
          this.onError(err);
        },
        complete: () => {
          console.log('Requête terminée.');
        },
      });
    }
  }

  updateFacture(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${facture.numeroFacture}" ?`
    );
    if (ok) {
      this.factureService.updateFacture(facture).subscribe({
        next: () => {
          this.onSuccess('updated');
          this.loadFactures();
        },
        error: (err) => {
          this.onError(err);
        },
        complete: () => {
          console.log('Requête terminée.');
        },
      });
    }
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show('Opération réussie !', 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.show('Une erreur est survenue.', 'error');
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
