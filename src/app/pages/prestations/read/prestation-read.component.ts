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
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { Util } from '../../../shared/utils/utils';
import { AlertService } from '../../../services/alert/alertService';

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
  siret: string | null = '';
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  selectedDate: Date = new Date();
  formPresta!: FormGroup;
  monthsYear: any;
  observableEvent$ = new Subscription();
  isAdmin = false;
  parent = 'read';
  remoteClientError = false;
  remoteConsultantError = false;

  private readonly router = inject(Router);
  constructor(
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly sharedDataService: SharedDataService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.formPresta = this.fb.group({
      prestaDateFin: ['', Validators.required],
    });
    this.siret = this.sharedDataService.getSiret();
    this.loadPrestations();
  }

  loadPrestations() {
    this.prestationService.getPrestationsBySiret(this.siret!).subscribe({
      next: (prestations) => {
        this.prestations = prestations;
        if (this.prestations) {

          this.prestations.forEach((p) => {
            if (p.client?.remoteError) {
              this.remoteClientError = true;
            }
            if (p.consultant?.remoteError) {
              this.remoteConsultantError = true;
            }
            p.isPrestaNoteValid = Util.isPrestaNotValid(p.dateFin!);
            if (p.facture && p.facture.length > 0) {
              p.deletePresta = false;
            } else {
              p.deletePresta = true;
            }
          });
        }

        this.isLoaded = true;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deletePrestation(event: Event, prestation: Prestation) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.item = 'Prestation';
    modal.componentInstance.composant = prestation;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.prestations = this.prestations.filter(
            (t) => t.id !== prestation.id
          );
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  updatePrestaDateFin() {
    const dateFin = this.formPresta.get('prestaDateFin')?.value;
    this.selectedPrestation.dateFin = dateFin;
    this.prestationService
      .updateDatePrestation(this.selectedPrestation)
      .subscribe({
        next: () => {
          this.alertService.show('UPDATE', 'PRESTATION', 'success');
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

  editNewFacture(event: Event, prestation: Prestation) {
    event.preventDefault();
    this.sharedDataService.setSelectedPrestation(prestation);
    this.sharedMessagesService.setMessage("Edition d'une nouvelle facture");
    this.parent = 'edit';
    this.router.navigate(['/factures/add']);
  }


  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  prolongerPrestation(prestation: Prestation) {
    this.sharedDataService.setSelectedPrestation(prestation);
    this.router.navigate(['/prestations/extend']);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
    if (this.observableEvent$) {
      this.observableEvent$.unsubscribe();
    }
  }
}
