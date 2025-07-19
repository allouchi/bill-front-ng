import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TvaService } from '../../../services/tva/tva-service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import TvaInfos from '../../../models/TvaInfos';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth-service';
import { OperationService } from '../../../services/dashboard/operation-service';
import Operation from '../../../models/Operation';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alert-messages.service';

@Component({
  selector: 'bill-operation-read',
  imports: [WaitingComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './operation-read.component.html',
  styleUrl: './operation-read.component.css',
})
export class OperationReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
   operations: Operation[] = [];
  operationsFiltred: Operation[] = [];
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

    private readonly sharedDataService: SharedDataService,
    private readonly operationSerice: OperationService,
    private readonly authService: AuthService,
    private readonly tvaService: TvaService,
    private readonly modalService: NgbModal,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.siret = this.sharedDataService.getSiret();
    this.isAdmin = this.authService.isAdmin();
    this.loadExercicesRef();
    this.loadOperations();
  }

  loadOperations() {
    this.operationSerice.getOperations().subscribe({
      next: (operations) => {
        this.operations = operations;
        this.operationsFiltred = operations;
        this.isLoaded = true;
      },
      error: (err) => {
        this.onError(err);
        this.isLoaded = true;
      },
    });
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    if (this.operations) {
      this.operationsFiltred = this.operations.filter(o => o.exercise == selectedValue);
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
          this.operationsFiltred = this.operations.filter((oper) => oper.id !== operation.id);
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
    console.log('')
  }

}
