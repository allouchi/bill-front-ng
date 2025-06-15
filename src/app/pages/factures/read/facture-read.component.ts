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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { DetailFactureComponent } from '../../../shared/modal/detail/detail-facture.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [CommonModule, WaitingComponent, ReactiveFormsModule, FormsModule],
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
  selectedExercice: string = '';

  private readonly router = inject(Router);

  constructor(
    private readonly factureService: FactureService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly modalService: NgbModal,
    public readonly authService: AuthService,
    private readonly tvaService: TvaService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadExercisesRef();
    this.loadFactures();
    const currentExercice = new Date().getFullYear();
    this.loadTva(currentExercice.toString());
    this.loadTvaInfo(currentExercice.toString());
  }

  private loadFactures() {
    this.factureService.findFacturesBySiret(this.siret).subscribe({
      next: (factures) => {
        setTimeout(() => {
          this.factures = factures;
          this.filtredFactures = factures;
          this.isLoaded = true;
          const currentExercice = new Date().getFullYear();
          this.selectedExercice = currentExercice.toString();
          this.filterFactures(currentExercice.toString());
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

  updateFacture(event: Event, facture: Facture) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
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
          this.onSuccess('UPDATE,FACTURE');
          this.sharedDataService.setSelectedFacture(facture);
          this.router.navigate(['factures/edit']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  downloadFacture(facture: Facture) {
    this.factureService.downloadPdfFacture(facture.id!).subscribe({
      next: (dataPDF) => {
        const byteCharacters = atob(dataPDF.contentBase64); // decode base64
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = dataPDF.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  detailFacture(event: Event, facture: Facture) {
    event.preventDefault();
    const modal = this.modalService.open(DetailFactureComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modal.componentInstance.facture = facture;
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
