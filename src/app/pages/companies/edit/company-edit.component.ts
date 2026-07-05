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

import { ActivatedRoute, Router } from '@angular/router';
import Adresse from '../../../models/Adresse';
import Company from '../../../models/Company';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { CountryService } from '../../../services/shared/country-service';
import { AlertService } from '../../../services/alert/alertService';
import { debounceTime } from 'rxjs';

export interface Country {
  name: { common: string; official: string };
  cca2: string;
  flags: { png: string; svg: string };
  capital?: string[];
  region?: string;
  translations: {
    fra?: { official: string; common: string };
  };
}

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
  countries?: Partial<Country[]>;
  selectedCountry = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly countryService: CountryService,
    private readonly route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.loadCountries();

    this.formCompany = this.fb.group({
      socialReason: ['', Validators.required],
      status: ['', Validators.required],
      siret: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      rcsName: ['', Validators.required],
      numeroTva: ['', Validators.required],
      codeApe: ['', Validators.required],
      numeroIban: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z0-9]{27,34}$/)],
      ],
      numeroBic: ['', Validators.required],
      numero: ['', Validators.required],
      rue: ['', Validators.required],
      codePostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      localite: ['', Validators.required],
      pays: ['France', Validators.required],
      checked: [''],
    });

    const siretParam = this.route.snapshot.paramMap.get('siret');
    if (siretParam) {
      this.isEdit = true;
      // Instant seed from the list navigation, if it matches...
      const seed = this.sharedDataService.getSelectedCompany();
      if (seed && seed.siret === siretParam) {
        this.company = seed;
        this.sharedMessagesService.setMessage(
          `Mise à jour de ${seed.socialReason}`,
        );
        this.buildDataCompany(this.company);
      }
      // ...but always (re)fetch by siret so refresh / deep-link works.
      this.companyService.getCompanyBySiret(siretParam).subscribe({
        next: (data: any) => {
          const company = Array.isArray(data) ? data[0] : data;
          this.company = company;
          this.sharedMessagesService.setMessage(
            `Mise à jour de ${company?.socialReason}`,
          );
          this.buildDataCompany(company);
        },
        error: (err) => this.onError(err),
      });
    }

    this.formCompany
      .get('codePostal')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe((value) => {
        this.findCommune(value);
      });
  }

  loadCountries() {
    this.countryService.getCountries().subscribe((data) => {
      this.countries = data.filter(
        (r) => r.region === 'Europe' || r.region === 'Africa',
      );
      this.buildDataCompany(this.company);
    });
  }

  buildDataCompany(company: Company | null) {
    if (this.countries) {
      this.countries = this.countries.sort((a, b) => {
        const nameA = a!.translations?.fra?.common || a!.name.common;
        const nameB = b!.translations?.fra?.common || b!.name.common;
        return nameA.localeCompare(nameB, 'fr');
      });

      const found = this.countries.find(
        (item) =>
          item?.translations?.fra?.common.toLocaleUpperCase() ===
          company?.companyAdresse.pays.toUpperCase(),
      );

      this.selectedCountry = found?.translations?.fra?.common || '';
    }

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
        pays: this.selectedCountry,
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

  editCompany() {
    if (this.formCompany.valid) {
      let adresseCompany: Adresse = {
        id: this.adresseId,
        numero: this.formCompany.get('numero')?.value,
        rue: this.formCompany.get('rue')?.value,
        codePostal: this.formCompany.get('codePostal')?.value,
        localite: this.formCompany.get('localite')?.value,
        pays: this.formCompany.get('pays')?.value,
      };

      let isChecked = false;
      if (this.isEdit) {
        isChecked = this.company!.checked;
      }

      let company: Company = {
        id: this.companyId,
        checked: isChecked,
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
            this.alertService.show('UPDATE', 'SOCIETE', 'success');
          } else {
            this.alertService.show('ADD', 'SOCIETE', 'success');
          }
          this.router.navigate(['/companies/read']);
        },
        error: (err) => {
          this.onError(err);
        },
      });
    } else {
      for (const [, control] of Object.entries(this.formCompany.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  findCommune(code: string) {
    this.countryService.findByCodePotal(code).subscribe({
      next: (commune) => {
        if (commune[0]) {
          this.formCompany.patchValue({
            localite: commune[0].nom,
          });
        } else {
          this.formCompany.patchValue({
            localite: '',
          });
        }
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  cancel() {
    this.router.navigate(['/companies/read']);
  }

  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }
  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
