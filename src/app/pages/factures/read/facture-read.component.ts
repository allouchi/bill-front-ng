import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/factures/facture.service';
import Facture from '../../../models/Facture';
import { ActivatedRoute, Router } from '@angular/router';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import Exercise from '../../../models/Exercise';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { TvaService } from '../../../services/tva/tva-service';
import TvaInfos from '../../../models/TvaInfos';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { DetailFactureComponent } from '../../../shared/modal/detail/detail-facture.component';
import { CommonModule } from '@angular/common';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { CustomDecimalPipe } from '../../../shared/pipes/customDecimal-pipe';
import { AlertService } from '../../../services/alert/alertService';

import EmailClient from '../../../models/EmailClient';


@Component({
  selector: 'bill-facture-read',
  standalone: true,
  imports: [
    CommonModule,
    WaitingComponent,
    ReactiveFormsModule,
    CustomDecimalPipe,
    FormsModule,
  ],
  templateUrl: './facture-read.component.html',
  styleUrls: ['./facture-read.component.scss'],
})
export default class FactureReadComponent implements OnInit, OnDestroy {
  factures: Facture[] = [];
  exercises: Exercise[] = [];
  tvaInfos!: TvaInfos;
  siret: string | null = '';
  isLoaded = false;
  isAdmin = false;
  observableEvent$ = new Subscription();
  parent = 'read';
  sendMail = false;
  selectedExercice: string = '';
  page = 0;
  size = 12;
  totalPages = 0;
  totalElements = 0;
  totalTvaFacture!: number;
  totalDebitTva!: number;
  emailAdresses: string[] = [];
  isEdition: string | null = null;
  nbLignesFacture = 0;

  private readonly router = inject(Router);

  constructor(
    private readonly factureService: FactureService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly tvaService: TvaService,
    private readonly sharedMessagesService: SharedMessagesService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.selectedExercice = new Date().getFullYear().toString();
    this.loadExercisesRef();
    this.isEdition = this.sharedDataService.getIsEditionFacture();

    if (this.isEdition) {
      this.selectedExercice = 'Tous';
      this.sharedDataService.setIsEditionFacture('');
    }
    this.loadFacturesByExercise(this.selectedExercice);
    this.loadTvaInfo(this.selectedExercice);
  }

  calculateTotals() {
    if (!this.factures) return;
    this.totalTvaFacture = this.factures.reduce(
      (sum, t) => sum + (t.montantTVA || 0),
      0
    );
    this.totalDebitTva = this.factures.reduce(
      (sum, t) => sum + (t.montantTvaPaye || 0),
      0
    );
  }

  private loadTvaInfo(exercice: string) {
    this.tvaService.findTvaInfoByExercise(this.siret!, exercice).subscribe({
      next: (tvaInfos) => {
        this.tvaInfos = tvaInfos;
        this.calculateTotals();
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

  loadFacturesBySiret() {
    this.factureService
      .findFacturesBySiret(this.siret!, this.page, this.size)
      .subscribe({
        next: (data) => {
          this.factures = data.content;
          this.nbLignesFacture = this.factures.length;
          this.totalPages = data.page.totalPages;
          this.totalElements = data.page.totalElements;
          this.isLoaded = true;
          this.loadTvaInfo(this.selectedExercice);
        },
        error: (err) => {
          this.onError(err);
        },
      });
  }

  loadFacturesByExercise(exercice: string) {
    this.factureService
      .findFacturesByExercice(this.siret!, exercice, this.page, this.size)
      .subscribe({
        next: (data) => {
          this.factures = data.content;
          this.totalPages = data.page.totalPages;
          this.totalElements = data.page.totalElements;
          this.nbLignesFacture = this.factures.length;
          this.isLoaded = true;
          this.loadTvaInfo(this.selectedExercice);
        },
        error: (err) => {
          this.onError(err);
        },
      });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      if (this.selectedExercice === 'Tous') {
        this.loadFacturesBySiret();
      } else {
        this.loadFacturesByExercise(this.selectedExercice);
      }
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      if (this.selectedExercice === 'Tous') {
        this.loadFacturesBySiret();
      } else {
        this.loadFacturesByExercise(this.selectedExercice);
      }
    }
  }

  setYearValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedExercice = selectedValue;
    this.page = 0;
    if (this.selectedExercice === 'Tous') {
      this.loadFacturesBySiret();
    } else {
      this.loadFacturesByExercise(this.selectedExercice);
    }
  }

  deleteFactureService(id: number) {
    this.factureService.deleteFactureById(id).subscribe({
      next: () => {
        const nbElements = (this.totalElements - 1) % this.size;
        if (this.page > 0 && nbElements == 0) {
          this.page--;
        }
        if (this.selectedExercice === 'Tous') {
          this.loadFacturesBySiret();
        } else {
          this.loadFacturesByExercise(this.selectedExercice);
        }
      },
      error: (err) => {
        this.onError(err);
      },
    });
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
          this.alertService.show('DELETE', 'FACTURE', 'success');
          this.deleteFactureService(facture.id!);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  cancelModif(event: Event, facture: Facture) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modal.componentInstance.item = 'Facture';
    modal.componentInstance.composant = facture;
    facture.dateEncaissement = '';
    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          this.sharedDataService.setSelectedFacture(facture);
          this.sharedMessagesService.setMessage('Mise à jour de Facture');
          this.factureService.updateFacture(facture).subscribe({
            next: () => {
              if (this.selectedExercice === 'Tous') {
                this.loadFacturesBySiret();
              } else {
                this.loadFacturesByExercise(this.selectedExercice);
              }
              this.alertService.show('UPDATE', 'FACTURE', 'success');
              this.router.navigate(['/factures/read']);
            },
            error: (err) => {
              this.onError(err);
            },
          });
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
        if (result.comment === 'confirm') {
          this.alertService.show('UPDATE', 'FACTURE', 'success');
          this.sharedDataService.setSelectedFacture(facture);
          this.sharedMessagesService.setMessage('Mise à jour de Facture');
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
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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

  private envoyerFacture(id: number, mails: EmailClient[]) {
    this.isLoaded = false;
    this.sendMail = true;
    this.factures.forEach((facture) => {
      if (facture.id == id) {
        facture.sended = true;
      }
    });

    this.factureService.envoyerFacture(id, mails).subscribe({
      next: () => {
        this.isLoaded = true;
        this.alertService.show('SEND', 'MAIL', 'success');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  choixDestinataires(event: Event, id: number, mailsAdresse: string[]) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modal.componentInstance.item = 'ChoiceDest';
    modal.componentInstance.composant = mailsAdresse;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          this.envoyerFacture(id, result.mails);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  sendFacture(event: Event, facture: Facture) {
    const id = facture.id;
    this.factureService.getClientMails(id!).subscribe({
      next: (mails) => {
        this.emailAdresses = mails;
        this.choixDestinataires(event, id!, mails);
      },
      error: (err) => {
        this.onError(err);
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
