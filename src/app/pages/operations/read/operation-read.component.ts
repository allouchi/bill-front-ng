import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TvaService } from '../../../services/tva/tva-service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { OperationService } from '../../../services/operations/operation-service';
import Operation from '../../../models/Operation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { SharedMessagesService } from '../../../services/shared/messages.service';

import { CommonModule } from '@angular/common';
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';
import TvaInfos from '../../../models/TvaInfos';
import { AlertService } from '../../../services/alert/alertService';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { SearchComponent } from '../../../shared/search/search.component';

@Component({
  selector: 'bill-operation-read',
  imports: [
    CommonModule,
    WaitingComponent,
    SearchComponent,
    ReactiveFormsModule,
    CustomDecimalPipe,
    FormsModule,
  ],
  templateUrl: './operation-read.component.html',
  styleUrl: './operation-read.component.css',
})
export class OperationReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
  operations: Operation[] = [];
  operationsFiltred: Operation[] = [];
  exercises: Exercise[] = [];
  selectedExercice: string = '';
  tvaInfos: TvaInfos | null = null;
  tvaInfosFilterd: TvaInfos | null = null;
  selectedType: string = '';
  isAdmin = false;
  parent = 'read';
  siret: string | null = '';
  totalOperation: number = 0;
  typeOperations: string[] = ['Tous', 'DIV', 'NDF'];
  page = 0;
  size = 12;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  private searchSubject = new Subject<string>();

  router = inject(Router);
  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly authService: AuthService,
    private readonly tvaService: TvaService,
    private readonly modalService: NgbModal,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly alertService: AlertService,
    private readonly operationService: OperationService,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadExercicesRef();
    this.loadTvaInfo('Tous');
    this.loadOperations('Tous', 'Tous');
    this.selectedType = 'Tous';
    this.selectedExercice = 'Tous';

    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value: string | null) => {
          const search = value?.trim();
          if (!search) {
            this.searchTerm = '';
            return this.operationService.getOperations(
              this.siret!,
              this.selectedExercice,
              this.selectedType,
              this.page,
              this.size,
            );
          }
          this.searchTerm = search;
          return this.operationService.searchOperations(
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
        this.operationsFiltred = data.content;
        this.totalPages = data.page.totalPages;
        this.totalElements = data.page.totalElements;
        this.totalOperation = this.operations.length;
        this.isLoaded = true;
      });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  searchOperations() {
    return this.operationService
      .searchOperations(this.siret!, this.searchTerm, this.page, this.size)
      .subscribe((data) => {
        this.operations = data.content;
        this.operationsFiltred = data.content;
        this.totalPages = data.page.totalPages;
        this.totalElements = data.page.totalElements;
        this.totalOperation = this.operations.length;
        this.isLoaded = true;
      });
  }

  loadOperations(selectedExercice: string, type: string) {
    this.operationService
      .getOperations(this.siret!, selectedExercice, type, this.page, this.size)
      .subscribe({
        next: (data) => {
          if (data.page) {
            this.totalPages = data.page.totalPages;
            this.totalElements = data.page.totalElements;
          }
          this.operations = data.content;
          this.operationsFiltred = data.content;
          this.isLoaded = true;
          this.calculTotal(data.content);
          this.loadTvaInfo(selectedExercice);
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
        this.searchOperations();
      } else {
        this.loadOperations(this.selectedExercice, this.selectedType);
      }
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      if (this.searchTerm) {
        this.searchOperations();
      } else {
        this.loadOperations(this.selectedExercice, this.selectedType);
      }
    }
  }

  loadTvaInfo(exercice: string) {
    this.tvaService.findTvaInfoByExercise(this.siret!, exercice).subscribe({
      next: (tvaInfos) => {
        this.tvaInfos = tvaInfos;
        this.tvaInfosFilterd = tvaInfos;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  calculTotal(operations: Operation[]) {
    this.totalOperation = 0;
    if (operations) {
      operations.forEach((oper) => {
        this.totalOperation += oper.montantOperation;
      });
    }
  }

  setTypeValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;
    this.loadOperations(this.selectedExercice, this.selectedType);
  }

  setExerciceValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    this.loadOperations(this.selectedExercice, this.selectedType);
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

  importerOperations() {
    this.sharedMessagesService.setMessage("Ajout d'une Opération");
    this.sharedDataService.setExercices(this.exercises);
    this.router.navigate(['/operations/add']);
  }

  updateOperation(operation: Operation) {
    this.sharedMessagesService.setMessage("Edition d'une Opération");
    this.sharedDataService.setExercices(this.exercises);
    this.sharedDataService.setSelectOperation(operation);
    this.router.navigate(['/operations/edit']);
  }

  deleteOperationService(id: number) {
    this.operationService.deletedOperationById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'OPERATION', 'success');
        this.operationsFiltred = this.operations.filter(
          (oper) => oper.id !== id,
        );
        this.operations = this.operationsFiltred;
        this.calculTotal(this.operations);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteOperation(event: Event, operation: Operation) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.item = 'Operation';
    modal.componentInstance.composant = operation;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          if (operation.id) {
            this.deleteOperationService(operation.id);
          }
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
    this.searchSubject.unsubscribe(); // évite les fuites mémoire
  }
}
