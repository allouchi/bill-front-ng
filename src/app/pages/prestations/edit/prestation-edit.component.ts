import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { AlertService } from '../../../services/alert/alert.service';
import Prestation from '../../../models/Prestation';
import Consultant from '../../../models/Consultant';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { CommonModule } from '@angular/common';
import { SiretService } from '../../../services/shared/siret-service';


@Component({
  selector: 'bill-prestation-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: 'prestation-edit.component.html',
  styleUrl: './prestation-edit.component.css',
})
export class PrestationEditComponent implements OnInit, OnDestroy {
  formPrestation!: FormGroup;
  selectedClient: string = '';
  selectedConsultant: string = '';
  consultants: Consultant[] = [];
  clients: Client[] = [];
  siret: string = '';

  router = inject(Router);

  constructor(
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly clientService: ClientService,
    private readonly consultantService: ConsultantService,
    private readonly fb: FormBuilder,
    private readonly siretService: SiretService

  ) {}

  ngOnInit(): void {
    this.formPrestation = this.fb.group({
      client: ['', Validators.required],
      consultant: ['', Validators.required],
      tarifHT: ['', Validators.required],
      numeroCommande: ['', Validators.required],
      delaiPaiement: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
    });

    this.siret = this.siretService.getSiret();
    console.log('PrestationEditComponent : ', this.siret);
    this.loadClients();
    this.loadConsultants();
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
    this.formPrestation.patchValue({
      client: selectedValue,
    });
  }

  setConsultantValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.formPrestation.patchValue({
      consultant: selectedValue,
    });
  }

  addPrestation() {
    if (this.formPrestation.valid) {
      let prestation: Prestation = {
        id: 0,
        client: this.formPrestation.get('company')?.value,
        consultant: this.formPrestation.get('company')?.value,
        tarifHT: this.formPrestation.get('tarifHT')?.value,
        numeroCommande: this.formPrestation.get('numeroCommande')?.value,
        delaiPaiement: this.formPrestation.get('delaiPaiement')?.value,
        dateFin: this.formPrestation.get('dateFin')?.value,
        dateDebut: this.formPrestation.get('dateDebut')?.value,
      };

      this.prestationService
        .createOrUpdatePrestation(prestation, this.siret, false, null)
        .subscribe({
          next: () => {
            this.onSuccess('ADD,PRESTATION');
            this.router.navigate(['/prestations/read']);
          },
          error: (err) => {
            this.onError(err);
          },
        });
    } else {
      for (const [key, control] of Object.entries(
        this.formPrestation.controls
      )) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/prestations/read']);
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }
}
