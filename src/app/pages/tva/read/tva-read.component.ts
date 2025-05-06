import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert.service';
import { env } from '../../../../environments/env';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/sharedDataService';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-tva-read',
  imports: [WaitingComponent],
  templateUrl: './tva-read.component.html',
  styleUrl: './tva-read.component.css',
})
export class TvaReadComponent implements OnInit, OnDestroy {
  isLoaded = true;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  exercises: Exercise[] = [];

  router = inject(Router);

  constructor(
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.loadExercicesRef();
    this.loadTva();
  }

  private loadExercicesRef() {
    this.tvaService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.isLoaded = true;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (this.tvas && selectedValue !== 'Tous') {
      this.filtredTvas = this.tvas.filter(
        (tva) => tva.exercise == selectedValue
      );
    } else {
      this.filtredTvas = this.tvas;
    }
  }

  addTva() {
    this.sharedDataService.setData(this.exercises);
    this.router.navigate(['/tvas/add']);
  }

  updateTva(tva: Tva) {
    console.log(tva);
    this.sharedDataService.setData(this.exercises);
    this.router.navigate(['/tvas/add']);
  }

  deleteTva(tva: Tva) {}
  private loadTva() {
    this.tvaService.findByExercise(env.siret, '2024').subscribe({
      next: (tvas) => {
        this.tvas = tvas;
        this.isLoaded = true;
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
