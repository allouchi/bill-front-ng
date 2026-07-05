import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TvaService } from '../../../services/tva/tva-service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { OperationService } from '../../../services/operations/operation-service';
import { CommonModule } from '@angular/common';
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';
import TvaInfos from '../../../models/TvaInfos';
import { AlertService } from '../../../services/alert/alertService';
import Compte from '../../../models/Compte';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { SearchComponent } from '../../../shared/search/search.component';
import { EntityCardComponent } from '../../../shared/entity-card/entity-card.component';
import { DetailModalComponent, DetailField } from '../../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'bill-compte-read',
  imports: [
    CommonModule,
    WaitingComponent,
    SearchComponent,
    ReactiveFormsModule,
    CustomDecimalPipe,
    FormsModule,
    EntityCardComponent,
    DetailModalComponent,
  ],
  templateUrl: './compte-read.component.html',
  styleUrl: './compte-read.component.css',
})
export class CompteReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
  operations: Compte[] = [];
  operationsFiltred: Compte[] = [];
  exercises: Exercise[] = [];
  selectedExercice: string = '';
  tvaInfos: TvaInfos | null = null;
  tvaInfosFilterd: TvaInfos | null = null;
  selectedType: string = '';
  selectedMonth: string = '';
  isAdmin = false;
  parent = 'read';
  siret: string | null = '';
  totalOperation: number = 0;
  typeOperations: string[] = ['Tous', 'DIV', 'NDF', 'TVA', 'DGFIP', 'FACTURE', 'AUTRE'];
  monthsYear: any;

  page = 0;
  size = 12;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  private searchSubject = new Subject<string>();

  selectedCompte: Compte | null = null;
  detailOpen = false;

  openDetail(compte: Compte): void {
    this.selectedCompte = compte;
    this.detailOpen = true;
  }
  closeDetail(): void {
    this.detailOpen = false;
  }
  get detailFields(): DetailField[] {
    const o = this.selectedCompte;
    if (!o) return [];
    return [
      { label: 'Date', value: o.dateOperation, section: 'Opération' },
      { label: 'Type', value: o.typeOperation },
      { label: 'Description', value: o.descriptionOperation, wide: true },
      { label: 'Montant', value: new CustomDecimalPipe().transform(o.montantOperation) + ' €', isMoney: true, section: 'Montants' },
      { label: 'Exercice', value: o.exercise, tone: 'brand' },
    ];
  }

  get sommeMontant(): number {
    return (this.operations ?? []).reduce(
      (sum, o) => sum + (Number(o.montantOperation) || 0),
      0,
    );
  }

  router = inject(Router);
  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly tvaService: TvaService,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    if (!this.siret) {
      this.operations = [];
      this.operationsFiltred = [];
      this.isLoaded = true;
      return;
    }
    this.loadExercicesRef();
    this.selectedType = 'Tous';
    this.selectedExercice = 'Tous';
    this.selectedMonth = 'Tous';
    this.loadOperations(
      this.selectedExercice,
      this.selectedType,
      this.selectedMonth,
    );
    this.monthsYear = GetMonthsOfYear();

    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value: string | null) => {
          const search = value?.trim();

          if (!search) {
            this.searchTerm = '';
            return this.operationService.getComptes(
              this.siret!,
              this.selectedExercice,
              this.selectedType,
              this.selectedMonth,
              this.page,
              this.size,
            );
          }

          this.searchTerm = search;
          return this.operationService.searchComptes(
            this.siret!,
            search,
            this.page,
            this.size,
          );
        }),
        catchError((err) => {
          this.onError(err);
          return of({
            content: [],
            page: { totalPages: 0, totalElements: 0 },
          });
        }),
      )
      .subscribe((data) => {
        this.operations = data.content;
        this.totalPages = data.page.totalPages;
        this.totalElements = data.page.totalElements;
        this.totalOperation = this.operations.length;
        this.isLoaded = true;
      });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }
  searchComptes() {
    this.operationService
      .searchComptes(this.siret!, this.searchTerm, this.page, this.size)
      .subscribe((data) => {
        this.operations = data.content;
        this.totalPages = data.page.totalPages;
        this.totalElements = data.page.totalElements;
        this.totalOperation = this.operations.length;
        this.isLoaded = true;
      });
  }

  loadOperations(selectedExercice: string, type: string, month: string) {
    this.operationService
      .getComptes(
        this.siret!,
        selectedExercice,
        type,
        month,
        this.page,
        this.size,
      )
      .subscribe({
        next: (data) => {
          this.operations = data.content;
          if (data.page) {
            this.totalPages = data.page.totalPages;
            this.totalElements = data.page.totalElements;
          }
          this.isLoaded = true;
          this.totalOperation = this.operations.length;
        },
        error: (err) => {
          this.onError(err);
          this.isLoaded = true;
        },
      });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchTerm) {
        this.searchComptes();
      } else {
        this.loadOperations(
          this.selectedExercice,
          this.selectedType,
          this.selectedMonth,
        );
      }
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      if (this.searchTerm) {
        this.searchComptes();
      } else {
        this.loadOperations(
          this.selectedExercice,
          this.selectedType,
          this.selectedMonth,
        );
      }
    }
  }

  setMonthValue(event: Event) {
    const selectedMonth = (event.target as HTMLSelectElement).value;
    this.selectedMonth = selectedMonth;
    if (selectedMonth == '00') {
      this.selectedMonth = 'Tous';
    }

    this.loadOperations(
      this.selectedExercice,
      this.selectedType,
      this.selectedMonth,
    );
  }

  setTypeValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;
    this.loadOperations(
      this.selectedExercice,
      this.selectedType,
      this.selectedMonth,
    );
  }

  setExerciceValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    this.loadOperations(
      this.selectedExercice,
      this.selectedType,
      this.selectedMonth,
    );
  }

  filterByExercice(selectedExeciceValue: string) {
    if (this.operations) {
      if (selectedExeciceValue == 'Tous') {
        if (this.selectedType == 'Tous') {
          this.operationsFiltred = this.operations;
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) => o.typeOperation == this.selectedType,
          );
        }
      } else {
        if (this.selectedType == 'Tous') {
          this.operationsFiltred = this.operations.filter(
            (o) => o.exercise == selectedExeciceValue,
          );
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) =>
              o.exercise == selectedExeciceValue &&
              o.typeOperation == this.selectedType,
          );
        }
      }
      this.operationsFiltred.forEach((oper) => {
        this.totalOperation += oper.montantOperation;
      });
    }
  }

  filterByType(selectedTypeValue: string) {
    if (this.operations) {
      if (selectedTypeValue == 'Tous') {
        if (this.selectedExercice == 'Tous') {
          this.operationsFiltred = this.operations;
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) => o.exercise == this.selectedExercice,
          );
        }
      } else {
        if (this.selectedExercice == 'Tous') {
          this.operationsFiltred = this.operations.filter(
            (o) => o.typeOperation == selectedTypeValue,
          );
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) =>
              o.exercise == this.selectedExercice &&
              o.typeOperation == selectedTypeValue,
          );
        }
      }
      this.operationsFiltred.forEach((oper) => {
        this.totalOperation += oper.montantOperation;
      });
    }
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

  importOperations() {
    this.operationService.importOperations(this.siret!).subscribe({
      next: (operations) => {
        this.operations = operations;
        this.operationsFiltred = operations;
        this.alertService.show('IMPORT', 'COMPTE', 'success');
      },
      error: (error) => {
        this.onError(error);
      },
    });
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
    this.searchSubject.unsubscribe();
  }
}
