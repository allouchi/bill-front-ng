import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../services/clients/client-service';
import { AlertService } from '../../../services/alert/alert.service';
import Client from '../../../models/Client';
import Adresse from '../../../models/Adresse';
import { env } from '../../../../environments/env';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.css'
})
export class ClientEditComponent implements OnInit, OnDestroy {


  formClient!: FormGroup;

  constructor(private readonly fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {

  }



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

  }

  addClient() {
    if (this.formClient.valid) {
      let adresseClient: Adresse = {
        id: 0,
        numero: this.formClient.get('numero')?.value,
        rue: this.formClient.get('rue')?.value,
        codePostal: this.formClient.get('codePostal')?.value,
        localite: this.formClient.get('localite')?.value,
        pays: this.formClient.get('pays')?.value,
      }

      let client: Client = {
        id: 0,
        socialReason: this.formClient.get('socialReason')?.value,
        email: this.formClient.get('email')?.value,
        adresseClient: adresseClient
      };

      this.clientService.createOrUpdateClient(client, env.siret).subscribe({
        next: (client) => {
          this.onSuccess("Le client " + client.socialReason + " a été ajouté !")
          this.router.navigate(['/clients/read'])
        },
        error: (err) => {
          this.onError(err);
        }
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
  }


  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {

    this.alertService.show('Une erreur est survenue.', 'error');
  }
  ngOnDestroy(): void {
    console.log("");
  }

}
