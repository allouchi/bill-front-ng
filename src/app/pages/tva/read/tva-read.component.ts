import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert.service';
import { env } from '../../../../environments/env';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/sharedDataService';
import { Router } from '@angular/router';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { CompanyService } from '../../../services/company/company-service';
import Company from '../../../models/Company';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'bill-tva-read',
  imports: [WaitingComponent, ReactiveFormsModule],
  templateUrl: './tva-read.component.html',
  styleUrl: './tva-read.component.css',
})
export class TvaReadComponent implements OnInit, OnDestroy {
  isLoaded = true;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  companies: Company[] = [];
  exercises: Exercise[] = [];
  data: Map<string, any> = new Map();
  monthsYear: any;
  CONTEXT = 'edit';

  router = inject(Router);

  constructor(
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadMonthYear();
    this.loadExercicesRef();
    this.loadTva();
  }

  private loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private loadMonthYear() {
    this.monthsYear = GetMonthsOfYear();
  }

  private loadExercicesRef() {
    this.tvaService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private loadTva() {
    this.tvaService.findTvaByExercise(env.siret, 'Tous').subscribe({
      next: (tvas) => {
        this.tvas = tvas;
        if (tvas) {
          tvas.forEach((tva) => {
            let date = tva.datePayment.split('/');
            tva.datePayment = date[2] + '-' + date[1] + '-' + date[0];
          });
        }
        setTimeout(() => {
          this.filtredTvas = tvas;
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
    if (this.tvas && selectedValue !== 'Tous') {
      this.filtredTvas = this.tvas.filter(
        (tva) => tva.exercise == selectedValue
      );
    } else {
      this.filtredTvas = this.tvas;
    }
  }

  addTva() {
    this.data.set('exercices', this.exercises);
    this.data.set('months', this.monthsYear);
    this.data.set('companies', this.companies);
    this.data.set('CONTEXT', 'add');
    this.sharedDataService.setData(this.data);
    this.router.navigate(['/tvas/add']);
  }

  updateTva(tva: Tva) {
    this.data.set('tva', tva);
    this.data.set('exercices', this.exercises);
    this.data.set('months', this.monthsYear);
    this.data.set('companies', this.companies);
    this.sharedDataService.setData(this.data);
    this.router.navigate(['/tvas/add']);
  }

  deleteTva(tva: Tva) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer la TVA de ${tva.month} ?`
    );
    if (ok) {
      this.tvaService.deleteTvaById(tva.id!).subscribe({
        next: () => {
          this.filtredTvas = this.tvas.filter((t) => t.id !== tva.id);
          this.onSuccess('La Tva est supprimée avec succès !');
        },
        error: (err) => {
          this.onError(err);
        },
      });
    }
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.show('Une erreur est survenue.', 'error');
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
