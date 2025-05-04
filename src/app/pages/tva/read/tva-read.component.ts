import { Component, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert.service';
import { env } from '../../../../environments/env';
import Exercise from '../../../models/Exercise';

@Component({
  selector: 'bill-tva-read',
  imports: [],
  templateUrl: './tva-read.component.html',
  styleUrl: './tva-read.component.css',
})
export class TvaReadComponent implements OnInit, OnDestroy {
  isLoaded = true;
  tvas: Tva[] = [];
  exercises: Exercise[] = [];

  constructor(
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadExercicesRef();
    this.loadTva();
  }

  private loadExercicesRef() {
    this.tvaService.findExercisesRef().subscribe({
      next: (exercises) => {
        setTimeout(() => {
          this.exercises = exercises;
          this.isLoaded = true;
        }, 500);
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
    }
  }

  private loadTva() {
    this.tvaService.findByExercise(env.siret, '2024').subscribe({
      next: (tvas) => {
        setTimeout(() => {
          this.tvas = tvas;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
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
