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
import { EntityCardComponent } from '../../../shared/entity-card/entity-card.component';
import { DetailModalComponent, DetailField } from '../../../shared/detail-modal/detail-modal.component';

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
    EntityCardComponent,
    DetailModalComponent,
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

  selectedPrestationDetail: Prestation | null = null;
  detailOpen = false;

  openDetail(prestation: Prestation): void {
    this.selectedPrestationDetail = prestation;
    this.detailOpen = true;
  }
  closeDetail(): void {
    this.detailOpen = false;
  }
  onEditDetail(): void {
    if (this.selectedPrestationDetail) {
      this.editPrestation(new Event('click'), this.selectedPrestationDetail);
    }
    this.closeDetail();
  }
  onDeleteDetail(): void {
    if (this.selectedPrestationDetail) {
      this.deletePrestation(new Event('click'), this.selectedPrestationDetail);
    }
    this.closeDetail();
  }
  clientName(p: Prestation): string {
    return p.client?.socialReason ?? '';
  }
  consultantName(p: Prestation): string {
    const c = p.consultant;
    if (!c) return '';
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
  }
  dateRange(p: Prestation): string {
    const parts = [p.dateDebut, p.dateFin].filter((d) => !!d);
    return parts.join(' → ');
  }
  private money(v: number | null | undefined): string {
    return v == null ? '—' : `${v} €`;
  }
  get detailFields(): DetailField[] {
    const p = this.selectedPrestationDetail;
    if (!p) return [];
    return [
      { label: 'Numéro de commande', value: p.numeroCommande, section: 'Prestation' },
      { label: 'Désignation', value: p.designation, wide: true },
      { label: 'Client', value: this.clientName(p) },
      { label: 'Consultant', value: this.consultantName(p) },
      { label: 'Date début', value: p.dateDebut, section: 'Planning' },
      { label: 'Date fin', value: p.dateFin },
      { label: 'Tarif HT', value: this.money(p.tarifHT), isMoney: true, section: 'Montants' },
      { label: 'Quantité', value: p.quantite },
      { label: 'Délai de paiement', value: p.delaiPaiement != null ? p.delaiPaiement + ' j' : null },
      {
        label: 'Facturable',
        value: p.isPrestaNoteValid ? 'Oui' : 'Pas encore',
        tone: p.isPrestaNoteValid ? 'success' : 'default',
      },
    ];
  }

  get totalHT(): number {
    return (this.prestations ?? []).reduce((sum, p) => sum + (Number(p.tarifHT) || 0), 0);
  }
  get facturableCount(): number {
    return (this.prestations ?? []).filter((p) => p.isPrestaNoteValid).length;
  }
  get nonFactureesCount(): number {
    return (this.prestations ?? []).filter((p) => p.deletePresta).length;
  }

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
    if (!this.siret) {
      this.prestations = [];
      this.isLoaded = true;
      return;
    }
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
        if (result === 'confirm' && prestation.id) {
          this.deletePrestationService(prestation.id);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  private deletePrestationService(id: number) {
    this.prestationService.deletePrestationById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'PRESTATION', 'success');
        this.loadPrestations();
      },
      error: (err) => {
        this.onError(err);
      },
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

  editPrestation(event: Event, prestation: Prestation) {
    event.preventDefault();
    this.sharedDataService.setSelectedPrestation(prestation);
    this.sharedMessagesService.setMessage("Mise à jour d'une Prestation");
    this.router.navigate(['/prestations/edit', prestation.id]);
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
