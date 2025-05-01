import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [],
  templateUrl: './facture-read.component.html',
  styleUrls: ['./facture-read.component.scss'],
})
export default class FactureReadComponent implements OnInit, OnDestroy {
  factures: Facture[] = [];

  constructor(
    private readonly factureService: FactureService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.factureService.findFacturesBySiret('85292702900011').subscribe({
      next: (factures) => {
        this.onResponseSuccess(factures);
      },
      error: (err) => {
        this.onResponseError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });
  }

  private onResponseSuccess(factures: Facture[]) {
    this.factures = factures;
  }

  deleteFactue(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${facture.numeroFacture}" ?`
    );
    if (ok) {
      console.log(facture.numeroFacture);
    }
  }

  onConfirm() {}

  updateFacture(facture: Facture) {
    console.log(facture);
  }

  private onResponseError(error: any) {
    console.log('error :', error);
  }
  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }
}
