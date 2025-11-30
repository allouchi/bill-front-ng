import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';

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
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';
import { AlertService } from '../../../services/alert/alertService';
import Facture from '../../../models/Facture';

@Component({
  selector: 'bill-tva-read',
  imports: [
    WaitingComponent,
    ReactiveFormsModule,
    CustomDecimalPipe,
    FormsModule,
  ],
  templateUrl: './tva-read.component.html',
  styleUrl: './tva-read.component.css',
})
export class TvaReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  factures: Facture[] = [];
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
  totalTvaFacture!: number;
  totalDebitTva!: number;
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
    this.loadMonthInYear();
    this.loadExercicesRef();
    const currentExercice = new Date().getFullYear();
    this.selectedExercice = currentExercice.toString();
    this.loadTva(this.selectedExercice);
    this.loadTvaInfo(this.selectedExercice);
    this.sharedDataService.setSelectedExercise(this.selectedExercice);
  }

  private loadMonthInYear() {
    this.monthsYear = GetMonthsOfYear();
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

  calculateTotals() {
    if (!this.tvaInfosFilterd) return;
    console.log(this.tvaInfosFilterd);
    this.totalTvaFacture = this.filtredTvas.reduce(
      (sum, t) => sum + (t.montantTvaFacture || 0),
      0
    );
    this.totalDebitTva = this.filtredTvas.reduce(
      (sum, t) => sum + (t.montantPayment || 0),
      0
    );
  }

  loadTvaInfo(exercice: string) {
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
  private loadMonthYear(nbMonth: string): string | undefined {
    let months;
    const monthsYear = GetMonthsOfYear();
    if (monthsYear) {
      months = monthsYear.find((m) => m.id === nbMonth)!.label;
    }
    return months;
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

  private addLabelMonthTva() {
    if (this.tvas) {
      this.tvas.forEach((tva) => {
        let montPaymentDate = tva.datePayment.substring(3, 5);
        const monthPayment = this.loadMonthYear(montPaymentDate) || '';
        let month = tva.numeroFacture.substring(4, 6);
        const monthFacture = this.loadMonthYear(month);
        if (monthFacture) {
          tva.monthFacture = ' (' + monthFacture!.substring(0, 3) + '.)';
        }
        tva.monthPayment = ' (' + monthPayment!.substring(0, 3) + '.)';
      });
    }
  }

  private loadTva(exercice: string) {
    this.tvaService.findTvaByExercise(this.siret, exercice).subscribe({
      next: (tvas) => {
        this.tvas = tvas;
        this.filtredTvas = tvas;
        this.isLoaded = true;
        this.addLabelMonthTva();
        this.calculateTotals();
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    this.sharedDataService.setSelectedExercise(this.selectedExercice);
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

  deleteTvaSerice(id: number) {
    this.tvaService.deleteTvaById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'TVA', 'success');
        this.loadTva(this.selectedExercice);
      },
      error: (err) => {
        this.onError(err);
      },
    });
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
          this.deleteTvaSerice(tva.id!);
          this.filtredTvas = this.tvas.filter((t) => t.id !== tva.id);
          this.tvas = this.filtredTvas;
          this.loadTvaInfo(this.selectedExercice);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
