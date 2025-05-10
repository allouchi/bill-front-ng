import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientService } from '../../../services/clients/client-service';
import { AlertService } from '../../../services/alert/alert.service';
import Client from '../../../models/Client';
import Adresse from '../../../models/Adresse';
import { env } from '../../../../environments/env';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../services/shared/sharedDataService';

@Component({
  selector: 'bill-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.css',
})
export class ClientEditComponent implements OnInit, OnDestroy {
  formClient!: FormGroup;
  client!: Client;
  clientId: number | null = null;
  addresseId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.formClient = this.fb.group({
      socialReason: ['', Validators.required],
      email: ['', Validators.required],
      numero: ['', Validators.required],
      rue: ['', Validators.required],
      codePostal: ['', Validators.required],
      localite: ['', Validators.required],
      pays: ['', Validators.required],
    });
    const maMap = this.sharedDataService.getData();
    this.client = maMap.get('client');
    if (this.client) {
      this.clientId = this.client.id;
      this.addresseId = this.client.adresseClient.id;

      this.formClient.patchValue({
        socialReason: this.client.socialReason,
        email: this.client.email,
        numero: this.client.adresseClient.numero,
        rue: this.client.adresseClient.rue,
        codePostal: this.client.adresseClient.codePostal,
        localite: this.client.adresseClient.localite,
        pays: this.client.adresseClient.pays,
      });
    }
  }

  addClient() {
    if (this.formClient.valid) {
      let adresseClient: Adresse = {
        id: this.addresseId,
        numero: this.formClient.get('numero')?.value,
        rue: this.formClient.get('rue')?.value,
        codePostal: this.formClient.get('codePostal')?.value,
        localite: this.formClient.get('localite')?.value,
        pays: this.formClient.get('pays')?.value,
      };

      let client: Client = {
        id: this.clientId,
        socialReason: this.formClient.get('socialReason')?.value,
        email: this.formClient.get('email')?.value,
        adresseClient: adresseClient,
      };

      this.clientService.createOrUpdateClient(client, env.siret).subscribe({
        next: () => {
          if (this.clientId) {
            this.onSuccess('UPDATE,CLIENT');
          } else {
            this.onSuccess('ADD,CLIENT');
          }

          this.router.navigate(['/clients/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [key, control] of Object.entries(this.formClient.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/clients/read']);
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
    console.log('');
  }
}
