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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import TvaInfos from '../../../models/TvaInfos';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'bill-tva-read',
  imports: [WaitingComponent, ReactiveFormsModule, FormsModule],
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
  selectedExercice: string = '';
  siret: string = '';
  observableEvent$ = new Subscription();
  router = inject(Router);
  isAdmin = false;
  parent = 'read';

  constructor(
    private readonly tvaService: TvaService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly companyService: CompanyService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.siret = this.sharedDataService.getSiret();
    this.isAdmin = this.authService.isAdmin();
    this.loadCompanies();
    this.loadMonthYear();
    this.loadExercicesRef();
    const currentExercice = new Date().getFullYear();
    this.selectedExercice = currentExercice.toString();
    this.loadTva(this.selectedExercice);
    this.loadTvaInfo(this.selectedExercice);
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
    console.log(exercice);
    this.tvaService.findTvaInfoByExercise(this.siret, exercice).subscribe({
      next: (tvaInfos) => {
        this.tvaInfos = tvaInfos;
        this.tvaInfosFilterd = tvaInfos;
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
    this.loadTvaInfo(selectedValue);
    this.loadTva(selectedValue);
  }

  addTva() {
    this.sharedMessagesService.setMessage("Ajout d'une TVA");
    this.sharedDataService.setSelectedTva(null);
    this.sharedDataService.setCompanies(this.companies);
    this.sharedDataService.setExercices(this.exercises);
    this.router.navigate(['/tvas/add']);
  }

  updateTva(tva: Tva) {
    this.sharedDataService.setSelectedTva(tva);
    this.sharedMessagesService.setMessage("Mise à jour d'une TVA");
    this.sharedDataService.setExercices(this.exercises);
    this.sharedDataService.setCompanies(this.companies);
    this.router.navigate(['/tvas/edit']);
  }

  deleteTva(event: Event, tva: Tva) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.item = 'Tva';
    modal.componentInstance.composant = tva;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.filtredTvas = this.tvas.filter((t) => t.id !== tva.id);
          this.tvas = this.filtredTvas;
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
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
