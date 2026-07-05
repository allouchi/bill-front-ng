import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestationService } from '../../../services/prestations/prestation.service';
import Prestation from '../../../models/Prestation';
import Consultant from '../../../models/Consultant';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { numericFrValidator } from '../../../shared/utils/numeric-fr.validator';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alertService';

@Component({
  selector: 'bill-prestation-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: 'prestation-edit.component.html',
  styleUrl: './prestation-edit.component.css',
})
export class PrestationEditComponent implements OnInit, OnDestroy {
  formPrestation!: FormGroup;
  selectedClient: Client | null = null;
  selectedConsultant: Consultant | null = null;
  selectedPrestation: Prestation | null = null;

  consultants: Consultant[] = [];
  clients: Client[] = [];
  siret: string | null = '';
  isEdit = false;
  observableEvent$ = new Subscription();

  router = inject(Router);

  constructor(
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly clientService: ClientService,
    private readonly consultantService: ConsultantService,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formPrestation = this.fb.group({
      client: ['', Validators.required],
      consultant: ['', Validators.required],
      tarifHT: ['', [Validators.required, numericFrValidator()]],
      numeroCommande: ['', Validators.required],
      delaiPaiement: ['', [Validators.required, numericFrValidator()]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
    });

    this.siret = this.sharedDataService.getSiret();
    this.selectedPrestation = this.sharedDataService.getSelectedPrestation();
    this.loadClients();
    this.loadConsultants();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      // Instant seed from the list navigation, if it matches...
      if (
        this.selectedPrestation &&
        this.selectedPrestation.id === Number(idParam)
      ) {
        this.populateForm(this.selectedPrestation);
      }
      // ...but always (re)fetch by id so refresh / deep-link works.
      this.prestationService.getPrestationById(Number(idParam)).subscribe({
        next: (prestation) => this.populateForm(prestation),
        error: (err) => this.onError(err),
      });
    }
  }

  private populateForm(prestation: Prestation | null): void {
    if (!prestation) return;
    this.selectedPrestation = prestation;
    this.selectedClient = prestation.client ?? null;
    this.selectedConsultant = prestation.consultant ?? null;
    this.sharedMessagesService.setMessage("Mise à jour d'une Prestation");
    this.formPrestation.patchValue({
      client: prestation.client?.socialReason ?? '',
      consultant: prestation.consultant?.firstName ?? '',
      tarifHT: prestation.tarifHT,
      numeroCommande: prestation.numeroCommande,
      delaiPaiement: prestation.delaiPaiement,
      dateDebut: this.toInputDate(prestation.dateDebut),
      dateFin: this.toInputDate(prestation.dateFin),
    });
  }

  /** Normalise a backend date (dd/MM/yyyy or yyyy-MM-dd) to the yyyy-MM-dd an <input type=date> needs. */
  private toInputDate(date?: string): string {
    if (!date) return '';
    if (date.includes('/')) {
      const [d, m, y] = date.split('/');
      return `${y}-${m}-${d}`;
    }
    return date.substring(0, 10);
  }

  private loadClients() {
    this.clientService.findClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private loadConsultants() {
    this.consultantService.findConsultants().subscribe({
      next: (consultants) => {
        this.consultants = consultants;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setClientValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedClient = this.clients.find(
      (c) => c.socialReason == selectedValue
    )!;

    this.formPrestation.patchValue({
      client: selectedValue,
    });
  }

  setConsultantValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedConsultant = this.consultants.find(
      (c) => c.firstName === selectedValue
    )!;

    this.formPrestation.patchValue({
      consultant: selectedValue,
    });
  }

  addPrestation() {
    let prestationId: number | null = null;
    if (this.selectedPrestation) {
      prestationId = this.selectedPrestation.id;
    }

    if (this.formPrestation.valid) {
      let prestation: Prestation = {
        id: prestationId,
        client: this.selectedClient!,
        consultant: this.selectedConsultant!,
        tarifHT: this.formPrestation.get('tarifHT')?.value,
        numeroCommande: this.formPrestation.get('numeroCommande')?.value,
        delaiPaiement: this.formPrestation.get('delaiPaiement')?.value,
        dateFin: this.formPrestation.get('dateFin')?.value,
        dateDebut: this.formPrestation.get('dateDebut')?.value,
        clientPrestation: this.formPrestation.get('client')?.value,
        designation: 'La Prestation est réalisée pour le compte de ',
        quantite: 0,
        isPrestaNoteValid: false,
      };

      this.prestationService
        .createOrUpdatePrestation(prestation, this.siret!)
        .subscribe({
          next: () => {
            this.alertService.show(
              prestationId ? 'UPDATE' : 'ADD',
              'PRESTATION',
              'success',
            );
            this.router.navigate(['/prestations/read']);
          },
          error: (err) => {
            this.onError(err);
          },
        });
    } else {
      for (const [, control] of Object.entries(this.formPrestation.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.sharedMessagesService.setMessage('Liste des Opérations');
    this.router.navigate(['/prestations/read']);
  }

  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
