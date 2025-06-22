import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CompanyService } from '../../../services/companies/company-service';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { Router } from '@angular/router';
import Adresse from '../../../models/Adresse';
import Company from '../../../models/Company';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';

@Component({
  selector: 'company-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgScrollbarModule,
    NgbCollapseModule,
  ],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss'],
})
export default class CompanyEditComponent implements OnInit, OnDestroy {
  formCompany!: FormGroup;
  company: Company | null = null;
  companyId: number | null = null;
  adresseId: number | null = null;
  currentUrl: string = '';
  isEdit: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router,
    private readonly sharedMessagesService: SharedMessagesService
  ) {}
  ngOnInit(): void {
    this.formCompany = this.fb.group({
      socialReason: ['', Validators.required],
      status: ['', Validators.required],
      siret: ['', Validators.required],
      rcsName: ['', Validators.required],
      numeroTva: ['', Validators.required],
      codeApe: ['', Validators.required],
      numeroIban: ['', Validators.required],
      numeroBic: ['', Validators.required],
      numero: ['', Validators.required],
      rue: ['', Validators.required],
      codePostal: ['', Validators.required],
      localite: ['', Validators.required],
      pays: ['', Validators.required],
      checked: [''],
    });

    this.currentUrl = this.router.url;
    if (this.currentUrl.includes('/edit')) {
      this.company = this.sharedDataService.getSelectedCompany();
      this.isEdit = true;
      this.sharedMessagesService.setMessage(
        `Mise à jour de ${this.company?.socialReason}`
      );
      this.buildDataCompany(this.company);
    }
  }

  buildDataCompany(company: Company | null) {
    if (company) {
      this.companyId = company.id;
      this.adresseId = company.companyAdresse.id;
      this.formCompany.patchValue({
        socialReason: company.socialReason,
        status: company.status,
        siret: company.siret,
        rcsName: company.rcsName,
        numeroTva: company.numeroTva,
        codeApe: company.codeApe,
        numeroIban: company.numeroIban,
        numeroBic: company.numeroBic,
        numero: company.companyAdresse.numero,
        rue: company.companyAdresse.rue,
        codePostal: company.companyAdresse.codePostal,
        localite: company.companyAdresse.localite,
        pays: company.companyAdresse.pays,
        checked: company.checked,
      });
    }
  }

  get f() {
    return this.formCompany?.controls;
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key;
    if (!/^\d$/.test(charCode)) {
      event.preventDefault();
    }
  }

  addCompany() {
    if (this.formCompany.valid) {
      let adresseCompany: Adresse = {
        id: this.adresseId,
        numero: this.formCompany.get('numero')?.value,
        rue: this.formCompany.get('rue')?.value,
        codePostal: this.formCompany.get('codePostal')?.value,
        localite: this.formCompany.get('localite')?.value,
        pays: this.formCompany.get('pays')?.value,
      };

      let company: Company = {
        id: this.companyId,
        checked: this.company!.checked,
        socialReason: this.formCompany.get('socialReason')?.value,
        status: this.formCompany.get('status')?.value,
        siret: this.formCompany.get('siret')?.value,
        rcsName: this.formCompany.get('rcsName')?.value,
        numeroTva: this.formCompany.get('numeroTva')?.value,
        codeApe: this.formCompany.get('codeApe')?.value,
        numeroIban: this.formCompany.get('numeroIban')?.value,
        numeroBic: this.formCompany.get('numeroBic')?.value,
        companyAdresse: adresseCompany,
        prestations: this.company?.prestations,
      };

      this.companyService.createOrUpdateCompany(company).subscribe({
        next: () => {
          if (this.companyId) {
            this.onSuccess('UPDATE,SOCIETE');
          } else {
            this.onSuccess('ADD,SOCIETE');
          }
          this.router.navigate(['/companies/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [key, control] of Object.entries(this.formCompany.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['/companies/read']);
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
