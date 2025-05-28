import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import Prestation from '../../../models/Prestation';
import { ConsultantNamePipe } from '../../../shared/pipes/consultantName-pipe';
import { ClientNamePipe } from '../../../shared/pipes/clientName-pipe';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../shared/modal/confirm-modal.component';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'bill-prestation-read',
  standalone: true,
  imports: [
    CommonModule,
    ConsultantNamePipe,
    ClientNamePipe,
    WaitingComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './prestation-read.component.html',
  styleUrl: './prestation-read.component.css',
})
export class PrestationReadComponent implements OnInit, OnDestroy {
  prestations!: Prestation[];
  isLoaded = false;
  siret: string = '';
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  selectedDate: Date = new Date();
  formPresta!: FormGroup;
  monthsYear: any;
  observableEvent$ = new Subscription();
  isAdmin = false;

  private readonly router = inject(Router);
  constructor(
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly sharedDataService: SharedDataService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.formPresta = this.fb.group({
      prestaDateFin: ['', Validators.required],
    });
    this.siret = this.sharedDataService.getSiret();
    this.loadPrestations();
  }

  loadPrestations() {
    this.prestationService.getPrestationsBySiret(this.siret).subscribe({
      next: (prestations) => {
        setTimeout(() => {
          this.prestations = prestations;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }  

  deletePrestation(event: Event, prestation: Prestation) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmModalComponent, { size: 'lg', backdrop: 'static' });
    modal.componentInstance.item = "Prestation";
    modal.componentInstance.composant = prestation

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.prestations = this.prestations.filter((t) => t.id !== prestation.id);
        }
      })
      .catch(() => {
        console.log("Annulé")
      });
  } 

  updatePrestaDateFin() {
    const dateFin = this.formPresta.get('prestaDateFin')?.value;
    this.selectedPrestation.dateFin = dateFin;
    this.prestationService
      .updateDatePrestation(this.selectedPrestation, this.siret)
      .subscribe({
        next: () => {
          this.onSuccess('UPDATE,PRESTATION');
        },
        error: (err) => {
          this.onError(err);
        },
      });
  }

  addPrestation() {
    this.sharedMessagesService.setMessage("Ajout d'une Prestation");
    this.router.navigate(['/prestations/add']);
  }

  addNewFacture(prestation: Prestation) {
    const ok = confirm(`Voulez-vous éditer la facture ?`);
    if (ok) {
      this.sharedDataService.setSelectedPrestation(prestation);
      this.router.navigate(['/factures/add']);
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

  prolongerPrestation(prestation: Prestation) {}

  openModalFacture(prestation: Prestation) {}

  ngOnDestroy(): void {
    this.alertService.clear();
    if (this.observableEvent$) {
      this.observableEvent$.unsubscribe();
    }
  }
}
