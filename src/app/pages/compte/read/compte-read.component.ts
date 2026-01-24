import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TvaService } from '../../../services/tva/tva-service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { OperationService } from '../../../services/dashboard/operation-service';
import Operation from '../../../models/Operation';
import { CommonModule } from '@angular/common';
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';
import TvaInfos from '../../../models/TvaInfos';
import { AlertService } from '../../../services/alert/alertService';
import Compte from '../../../models/Compte';
import GetMonthsOfYear from '../../../shared/utils/month-year';


@Component({
  selector: 'bill-compte-read',
  imports: [
    CommonModule,
    WaitingComponent,
    ReactiveFormsModule,
    CustomDecimalPipe,
    FormsModule,
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
  typeOperations: string[] = ['Tous', 'DIV', 'NDF', 'DGFIP', 'AUTRE'];
  monthsYear: any;

  page = 0;
  size = 12;
  totalPages = 0;
  totalElements = 0;

  router = inject(Router);
  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationService: OperationService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly tvaService: TvaService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
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
          this.operationsFiltred = data.content;
          this.totalPages = data.page.totalPages;
          this.totalElements = data.page.totalElements;
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
      this.loadOperations(
        this.selectedExercice,
        this.selectedType,
        this.selectedMonth,
      );
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadOperations(
        this.selectedExercice,
        this.selectedType,
        this.selectedMonth,
      );
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
  }
}
