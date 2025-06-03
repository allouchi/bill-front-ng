import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import Exercise from '../../../models/Exercise';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { TvaService } from '../../../services/tva/tva-service';
import TvaInfos from '../../../models/TvaInfos';
import Tva from '../../../models/Tva';

@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './facture-read.component.html',
  styleUrls: ['./facture-read.component.scss'],
})
export default class FactureReadComponent implements OnInit, OnDestroy {
  factures: Facture[] = [];
  filtredFactures: Facture[] = [];
  exercises: Exercise[] = [];
  tvaInfos!: TvaInfos;
  tvaInfosFilterd!: TvaInfos;
  tvas: Tva[] = [];
  filtredTvas: Tva[] = [];
  siret: string = '';
  isLoaded = false;
  isAdmin = false;
  observableEvent$ = new Subscription();
  parent = 'read';
  private readonly router = inject(Router);

  constructor(
    private readonly factureService: FactureService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly modalService: NgbModal,
    public readonly authService: AuthService,
    private readonly tvaService: TvaService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadExercisesRef();
    this.loadFactures();   
    this.loadTva('Tous');
    this.loadTvaInfo('Tous');
  }

  private loadFactures() {
    this.factureService.findFacturesBySiret(this.siret).subscribe({
      next: (factures) => {
        setTimeout(() => {
          this.factures = factures;
          this.filtredFactures = factures;
          this.isLoaded = true;
        }, 500);
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
        this.filtredTvas = tvas;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }
  private loadTvaInfo(exercice: string) {
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


  private loadExercisesRef() {
    this.factureService.findExercisesRef().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private filterFactures(selectedValue: string) {
    if (this.factures && selectedValue !== 'Tous') {
      this.filtredFactures = this.factures.filter(
        (facture) => facture.dateFacturation.substring(6) == selectedValue
      );
    } else {
      this.filtredFactures = this.factures;
    }
  }

  private filterTvas(selectedValue: string) {
    if (this.tvas && selectedValue !== 'Tous') {
      this.filtredTvas = this.tvas.filter(
        (tva) => tva.exercise == selectedValue
      );
    } else {
      this.filtredTvas = this.tvas;
    }
    this.loadTvaInfo(selectedValue);
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.filterFactures(selectedValue);
    this.filterTvas(selectedValue);
  }

  deleteFacture(event: Event, facture: Facture) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modal.componentInstance.item = 'Facture';
    modal.componentInstance.composant = facture;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.onSuccess('DELETE,FACTURE');
          this.filtredFactures = this.factures.filter(
            (item) => item.id !== facture.id
          );
          this.factures = this.filtredFactures;
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  updateFacture(facture: Facture) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${facture.numeroFacture}" ?`
    );
    if (ok) {
      this.sharedDataService.setSelectedFacture(facture);
      this.router.navigate(['factures/edit']);
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
