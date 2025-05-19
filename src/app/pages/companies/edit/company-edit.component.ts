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
  company!: Company;
  companyId!: number | null;
  adresseId!: number | null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router
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
    });

    const maMap = this.sharedDataService.getData();
    this.company = maMap.get('company');
    if (this.company) {
      this.companyId = this.company.id;
      this.adresseId = this.company.companyAdresse.id;

      this.formCompany.patchValue({
        socialReason: this.company.socialReason,
        status: this.company.status,
        siret: this.company.siret,
        rcsName: this.company.rcsName,
        numeroTva: this.company.numeroTva,
        codeApe: this.company.codeApe,
        numeroIban: this.company.numeroIban,
        numeroBic: this.company.numeroBic,
        numero: this.company.companyAdresse.numero,
        rue: this.company.companyAdresse.rue,
        codePostal: this.company.companyAdresse.codePostal,
        localite: this.company.companyAdresse.localite,
        pays: this.company.companyAdresse.pays,
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
        socialReason: this.formCompany.get('socialReason')?.value,
        status: this.formCompany.get('status')?.value,
        siret: this.formCompany.get('siret')?.value,
        rcsName: this.formCompany.get('rcsName')?.value,
        numeroTva: this.formCompany.get('numeroTva')?.value,
        codeApe: this.formCompany.get('codeApe')?.value,
        numeroIban: this.formCompany.get('numeroIban')?.value,
        numeroBic: this.formCompany.get('numeroBic')?.value,
        companyAdresse: adresseCompany,
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
