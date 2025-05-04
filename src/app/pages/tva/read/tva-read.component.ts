import { Component, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert.service';
import { env } from '../../../../environments/env';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';

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
    }else{
      this.filtredTvas = this.tvas;
    }
  }


  updateTva(tva: Tva) {

  }

  deleteTva(tva: Tva) {

  }
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
