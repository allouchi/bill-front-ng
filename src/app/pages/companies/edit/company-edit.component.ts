import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CompanyService } from '../../../services/company/company-service';
import { AlertService } from '../../../services/alert/alert.service';
import { Router } from '@angular/router';
import Adresse from '../../../models/Adresse';
import Company from '../../../models/Company';
import { env } from '../../../../environments/env';


@Component({
  selector: 'company-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,  NgbModule, NgScrollbarModule, NgbCollapseModule],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss']
})
export default class CompanyEditComponent implements OnInit, OnDestroy {

  formCompany!: FormGroup;

  constructor(private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {

  }



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

  }

  addCompany() {
    if (this.formCompany.valid) {
      let adresseCompany: Adresse = {
        id: 0,
        numero: this.formCompany.get('numero')?.value,
        rue: this.formCompany.get('rue')?.value,
        codePostal: this.formCompany.get('codePostal')?.value,
        localite: this.formCompany.get('localite')?.value,
        pays: this.formCompany.get('pays')?.value,
      }

      let company: Company = {
        id: 0,
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
        next: (company) => {
          this.onSuccess("La Société " + company.socialReason + " a été ajouté avec succès !")
          this.router.navigate(['/companies/read'])
        },
        error: (err) => {
          this.onError(err);
        }
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
    this.router.navigate(['/companies/read'])
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
