import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import Exercise from '../../../models/Exercise';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SiretService } from '../../../services/shared/siret-service';



@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './facture-read.component.html',
  styleUrls: ['./facture-read.component.scss'],
})
export default class FactureReadComponent implements OnInit, OnDestroy {
  factures: Facture[] = [];
  filtredFactures: Facture[] = [];
  exercises: Exercise[] = [];
  siret: string = '';
  isLoaded = true;
  private readonly router = inject(Router);

  constructor(
    private readonly factureService: FactureService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly siretService: SiretService

  ) {}

  ngOnInit(): void {
    this.siret = this.siretService.getSiret();
    console.log('FactureReadComponent : ', this.siret);
    this.loadExercisesRef();
    this.loadFactures();
  }

  private loadFactures() {
    this.factureService.findFacturesBySiret(this.siret).subscribe({
      next: (factures) => {
        setTimeout(() => {
          this.factures = factures;
          this.filtredFactures = factures;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private loadExercisesRef() {
    this.factureService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (this.factures && selectedValue !== 'Tous') {
      this.filtredFactures = this.factures.filter(
        (facture) => facture.dateFacturation.substring(6) == selectedValue
      );
    } else {
      this.filtredFactures = this.factures;
    }
  }

  deleteFacture(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${facture.numeroFacture}" ?`
    );
    if (ok) {
      this.factureService.deleteFactureById(facture.id!).subscribe({
        next: () => {
          this.onSuccess('DELETE,FACTURE');
          this.filtredFactures = this.factures.filter(
            (item) => item.id !== facture.id
          );
        },
        error: (err) => {
          this.onError(err);
        },
      });
    }
  }

  updateFacture(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${facture.numeroFacture}" ?`
    );
    if (ok) {
      const data: Map<string, any> = new Map();
      data.set('facture', facture);
      this.sharedDataService.setData(data);
      this.router.navigate(['factures/edit']);
    }
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
