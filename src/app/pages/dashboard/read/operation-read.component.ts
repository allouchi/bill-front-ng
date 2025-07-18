import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import Tva from '../../../models/Tva';
import { TvaService } from '../../../services/tva/tva-service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import Exercise from '../../../models/Exercise';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/companies/company-service';
import Company from '../../../models/Company';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import TvaInfos from '../../../models/TvaInfos';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth/auth-service';
import { OperationService } from '../../../services/dashboard/operation-service';
import Operation from '../../../models/Operation';

@Component({
  selector: 'bill-operation-read',
  imports: [WaitingComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './operation-read.component.html',
  styleUrl: './operation-read.component.css',
})
export class OperationReadComponent implements OnInit, OnDestroy {
  isLoaded = false;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  operations: Operation[] = [];
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
  ) {}

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
        this.isLoaded = true;
        console.log(operations);
      },
      error: (err) => {
        //this.onError(err);
        this.isLoaded = true;
      },
    });
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    
  }

  private loadExercicesRef() {
    this.tvaService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
      },
      error: (err) => {
        //this.onError(err);
      },
    });
  }

  addOperation() {
    
  }

  updateOperation(operation: Operation) {
    
  }

  deleteOperation(event: Event,operation: Operation) {
    
  }

  ngOnDestroy(): void {
    console.log('')
  }
  
}
