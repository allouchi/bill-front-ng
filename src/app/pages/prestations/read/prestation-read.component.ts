import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import Prestation from '../../../models/Prestation';
import { ConsultantNamePipe } from '../../../utils/consultantName-pipe';
import { ClientNamePipe } from '../../../utils/clientName-pipe';

@Component({
  selector: 'bill-prestation-read',
  standalone: true,
  imports: [ConsultantNamePipe, ClientNamePipe],
  templateUrl: './prestation-read.component.html',
  styleUrl: './prestation-read.component.css',
})
export class PrestationReadComponent implements OnInit, OnDestroy {
  prestations!: Prestation[];

  constructor(
    private readonly prestationService: PrestationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.prestationService.getPrestationsBySiret('85292702900011').subscribe({
      next: (prestations) => {
        this.onResponseSuccess(prestations);
      },
      error: (err) => {
        this.onResponseError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });
  }

  deletePrestation(prestaion: Prestation) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${prestaion.numeroCommande}" ?`
    );
    if (ok) {
      console.log(prestaion.numeroCommande);
    }
  }

  onConfirm() {}

  updatePrestation(prestation: Prestation) {
    console.log(prestation);
  }

  private onResponseSuccess(prestations: Prestation[]) {
    this.prestations = prestations;
  }

  private onResponseError(error: any) {
    console.log('error :', error);
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }
}
