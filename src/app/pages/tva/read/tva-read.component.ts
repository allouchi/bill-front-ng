import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { CompanyService } from '../../../services/companies/company-service';
import Company from '../../../models/Company';
import { ReactiveFormsModule } from '@angular/forms';
import TvaInfos from '../../../models/TvaInfos';
import { SiretService } from '../../../services/shared/siret-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bill-tva-read',
  imports: [WaitingComponent, ReactiveFormsModule],
  templateUrl: './tva-read.component.html',
  styleUrl: './tva-read.component.css',
})
export class TvaReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  companies: Company[] = [];
  exercises: Exercise[] = [];
  tvaInfos!: TvaInfos;
  tvaInfosFilterd!: TvaInfos;
  data: Map<string, any> = new Map();
  monthsYear: any;
  selectedExercice: string = 'Tous';
  siret: string = '';
  observableEvent$ = new Subscription();

  router = inject(Router);

  constructor(
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly siretService: SiretService,
    private readonly companyService: CompanyService,
    private readonly sharedMessagesService: SharedMessagesService
  ) {}

  ngOnInit(): void {
    this.observableEvent$ = this.siretService
      .getSiretObservable()
      .subscribe((siret) => {
        this.siret = siret;
      });
    console.log('TvaReadComponent : ', this.siret);
    this.loadCompanies();
    this.loadMonthYear();
    this.loadExercicesRef();
    this.loadTva('Tous');
    this.loadTvaInfo('Tous');
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

  loadTvaInfo(exercice: string) {
    this.tvaService.findTvaInfoByExercise(this.siret, exercice).subscribe({
      next: (tvaInfos) => {
        this.tvaInfos = tvaInfos;
        this.tvaInfosFilterd = tvaInfos;
        console.log();
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

  private loadTva(exercice: string) {
    this.tvaService.findTvaByExercise(this.siret, exercice).subscribe({
      next: (tvas) => {
        this.tvas = tvas;
        if (tvas) {
          tvas.forEach((tva) => {
            let date = tva.datePayment.split('/');
            //tva.datePayment = date[2] + '-' + date[1] + '-' + date[0];
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
    this.loadTvaInfo(selectedValue);
  }

  addTva() {
    this.data.set('exercices', this.exercises);
    this.data.set('months', this.monthsYear);
    this.data.set('companies', this.companies);
    this.sharedDataService.setData(this.data);
    this.sharedMessagesService.setMessage("Ajout d'une TVA");
    this.router.navigate(['/tvas/add']);
  }

  updateTva(tva: Tva) {
    this.data.set('tva', tva);
    this.data.set('exercices', this.exercises);
    this.data.set('months', this.monthsYear);
    this.data.set('companies', this.companies);
    this.sharedDataService.setData(this.data);
    this.router.navigate(['/tvas/edit']);
  }

  deleteTva(tva: Tva) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer la TVA de ${tva.month} ?`
    );
    if (ok) {
      this.tvaService.deleteTvaById(tva.id!).subscribe({
        next: () => {
          this.filtredTvas = this.tvas.filter((t) => t.id !== tva.id);
          this.onSuccess('DELETE,TVA');
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
