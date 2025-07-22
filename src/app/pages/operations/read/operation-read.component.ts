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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { CommonModule } from '@angular/common';
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';

@Component({
  selector: 'bill-operation-read',
  imports: [
    CommonModule,
    WaitingComponent,
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
  selectedType: string = '';
  isAdmin = false;
  parent = 'read';

  totalOperation: number = 0;
  typeOperations: string[] = ['Tous', 'DIV', 'NDF'];
  router = inject(Router);
  constructor(
    private readonly sharedDataService: SharedDataService,
    private readonly operationSerice: OperationService,
    private readonly authService: AuthService,
    private readonly tvaService: TvaService,
    private readonly modalService: NgbModal,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadExercicesRef();
    this.loadOperations();
  }

  loadOperations() {
    this.operationSerice.getOperations().subscribe({
      next: (operations) => {
        this.operations = operations;
        this.operationsFiltred = operations;
        this.selectedType = 'Tous';
        this.selectedExercice = 'Tous';
        this.isLoaded = true;
        this.calculTotal(operations);
      },
      error: (err) => {
        this.onError(err);
        this.isLoaded = true;
      },
    });
  }

  calculTotal(operations: Operation[]) {
    if (operations) {
      operations.forEach((oper) => {
        this.totalOperation += oper.montantOperation;
      });
    }
  }

  filterByExercice(selectedExeciceValue: string) {
    if (this.operations) {
      if (selectedExeciceValue == 'Tous') {
        if (this.selectedType == 'Tous') {
          this.operationsFiltred = this.operations;
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) => o.typeOperation == this.selectedType
          );
        }
      } else {
        if (this.selectedType == 'Tous') {
          this.operationsFiltred = this.operations.filter(
            (o) => o.exercise == selectedExeciceValue
          );
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) =>
              o.exercise == selectedExeciceValue &&
              o.typeOperation == this.selectedType
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
            (o) => o.exercise == this.selectedExercice
          );
        }
      } else {
        if (this.selectedExercice == 'Tous') {
          this.operationsFiltred = this.operations.filter(
            (o) => o.typeOperation == selectedTypeValue
          );
        } else {
          this.operationsFiltred = this.operations.filter(
            (o) =>
              o.exercise == this.selectedExercice &&
              o.typeOperation == selectedTypeValue
          );
        }
      }
      this.operationsFiltred.forEach((oper) => {
        this.totalOperation += oper.montantOperation;
      });
    }
  }

  setTypeValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;
    this.filterByType(selectedValue);
  }

  setExerciceValue(event: Event) {
    this.totalOperation = 0;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    this.filterByExercice(selectedValue);
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

  addOperation() {
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
          this.operationsFiltred = this.operations.filter(
            (oper) => oper.id !== operation.id
          );
          this.operations = this.operationsFiltred;
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
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
