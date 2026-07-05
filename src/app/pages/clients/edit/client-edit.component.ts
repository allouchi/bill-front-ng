import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { ClientService } from '../../../services/clients/client-service';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { AlertService } from '../../../services/alert/alertService';
import { I18nService } from '../../../shared/translate/i18nService';
import { AuthService } from '../../../services/auth/auth-service';

import Client from '../../../models/Client';
import Adresse from '../../../models/Adresse';
import EmailClient from '../../../models/EmailClient';
import { CountryService } from '../../../services/shared/country-service';

@Component({
  selector: 'bill-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css'],
})
export class ClientEditComponent implements OnInit, OnDestroy {
  formClient!: FormGroup;
  client: Client | null = null;
  clientId: number | null = null;
  adresseId: number | null = null;
  siret = '';
  currentUrl = '';
  isEdit = false;

  private subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly i18nService: I18nService,
    private readonly authService: AuthService,
    private readonly countryService: CountryService,
    private readonly route: ActivatedRoute,
  ) { }

  // ========================
  // INIT
  // ========================
  ngOnInit(): void {
    const userLang = this.authService.getUserLang();
    if (userLang) {
      this.i18nService.switchLang(userLang);
    }

    this.initForm();

    this.currentUrl = this.router.url;
    this.siret = this.sharedDataService.getSiret()!;

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      // Instant seed from the list navigation, if present...
      const seed = this.sharedDataService.getSelectedClient();
      if (seed && seed.id === Number(idParam)) {
        this.initEditMode(seed);
      }
      // ...but always (re)fetch by id so refresh / deep-link works.
      this.clientService.getClientById(Number(idParam)).subscribe({
        next: (client) => this.initEditMode(client),
        error: (err) => this.onError(err),
      });
    }
  }

  // ========================
  // FORM INIT
  // ========================
  private initForm(): void {
    this.formClient = this.fb.group({
      socialReason: ['', Validators.required],
      emails: this.fb.array([], atLeastOneEmailValidator),
      numero: ['', Validators.required],
      rue: ['', Validators.required],
      codePostal: ['', Validators.required],
      localite: ['', Validators.required],
      pays: ['France', Validators.required],
    });

    this.addEmail();

    this.formClient
      .get('codePostal')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe((value) => {
        this.findCommune(value);
      });
  }

  // ========================
  // GETTERS
  // ========================
  get emailsFormArray(): FormArray {
    return this.formClient.get('emails') as FormArray;
  }

  // ========================
  // EDIT MODE
  // ========================
  private initEditMode(client: Client | null): void {
    this.client = client;
    if (!this.client) return;

    this.isEdit = true;
    this.clientId = this.client.id;
    this.adresseId = this.client.adresseClient.id;

    this.sharedMessagesService.setMessage(
      `Mise à jour de ${this.client.socialReason}`,
    );

    this.emailsFormArray.clear();

    this.client.emails.forEach((mail: EmailClient) => {
      this.emailsFormArray.push(
        this.fb.group({
          id: [mail.id],
          email: [mail.email, [Validators.required, Validators.email]],
        }),
      );
    });

    this.formClient.patchValue({
      socialReason: this.client.socialReason,
      numero: this.client.adresseClient.numero,
      rue: this.client.adresseClient.rue,
      codePostal: this.client.adresseClient.codePostal,
      localite: this.client.adresseClient.localite,
      pays: this.client.adresseClient.pays,
    });
  }

  // ========================
  // EMAIL ACTIONS
  // ========================
  addEmail(): void {
    this.emailsFormArray.push(
      this.fb.group({
        id: [null],
        email: ['', [Validators.required, Validators.email]],
      }),
    );
  }

  removeEmail(index: number): void {
    if (this.emailsFormArray.length > 1) {
      this.emailsFormArray.removeAt(index);
    }
  }

  // ========================
  // INPUT HELPERS
  // ========================
  allowOnlyNumbers(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // ========================
  // SUBMIT
  // ========================
  addClient(): void {
    if (this.formClient.invalid) {
      this.markFormGroupTouched(this.formClient);
      return;
    }

    const adresseClient: Adresse = {
      id: this.adresseId,
      numero: this.formClient.value.numero,
      rue: this.formClient.value.rue,
      codePostal: this.formClient.value.codePostal,
      localite: this.formClient.value.localite,
      pays: this.formClient.value.pays,
    };

    const emailClient: EmailClient[] = this.formClient.value.emails.map(
      (mail: { id: number | null; email: string }) => ({
        id: mail.id,
        email: mail.email,
      }),
    );

    const client: Client = {
      id: this.clientId,
      socialReason: this.formClient.value.socialReason,
      emails: emailClient,
      adresseClient,
      hasPrestation: true,
      remoteError: ''
    };

    this.clientService.createOrUpdateClient(client, this.siret).subscribe({
      next: () => {
        this.alertService.show(
          this.clientId ? 'UPDATE' : 'ADD',
          'CLIENT',
          'success',
        );
        this.router.navigate(['/clients/read']);
      },
      error: (err) => this.onError(err),
    });
  }

  cancel(): void {
    this.router.navigate(['/clients/read']);
  }

  // ========================
  // VALIDATION HELPER
  // ========================
  private markFormGroupTouched(control: FormGroup | FormArray): void {
    Object.values(control.controls).forEach((ctrl) => {
      if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
        this.markFormGroupTouched(ctrl);
      } else {
        ctrl.markAsTouched();
      }
    });
  }

  // ========================
  // ERROR / CLEANUP
  // ========================
  private onError(error: any): void {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
    this.subscriptions.unsubscribe();
  }

  findCommune(code: string) {
    this.countryService.findByCodePotal(code).subscribe({
      next: (commune) => {
        if (commune[0]) {
          this.formClient.patchValue({
            localite: commune[0].nom,
          });
        } else {
          this.formClient.patchValue({
            localite: '',
          });
        }
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }
}

/* ========================
   CUSTOM VALIDATOR
======================== */
export function atLeastOneEmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const emails = control as FormArray;
  return emails && emails.length > 0
    ? null
    : { required: true };
}
