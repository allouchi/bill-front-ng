import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import JoursOuvres from '../../../shared/utils/time-calcul';
import Prestation from '../../../models/Prestation';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import GetMonthsOfYear from '../../../shared/utils/month-year';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SiretService } from '../../../services/shared/siret-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-facture-add',
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule],
  templateUrl: './facture-add.component.html',
  styleUrl: './facture-add.component.css'
})
export class FactureAddComponent implements OnInit {

  formFacture!: FormGroup;
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  monthsYear: any;
  siret: string = '';

  constructor(private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly prestationService: PrestationService,
    private readonly siretService: SiretService, 
    private readonly sharedDataService: SharedDataService,
    private readonly alertService: AlertService) {
  }

  ngOnInit(): void {
    this.formFacture = this.fb.group({
      month: ['', Validators.required],
      numeroCommande: ['', Validators.required],
      quantite: ['', Validators.required],
      clientPrestation: ['', Validators.required],
    });

    this.siret = this.siretService.getSiret();
    const mapData = this.sharedDataService.getData();
    this.selectedPrestation = mapData.get("prestation");
    this.monthsYear = GetMonthsOfYear();
  }


  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const nbJoursOuvres = JoursOuvres(selectedValue);
    this.selectedMonth = +selectedValue;
    this.formFacture.patchValue({
      quantite: nbJoursOuvres,
    });
  }


  private addNewFacture(prestation: Prestation) {
    const ok = confirm(`Voulez-vous éditer la facture ?`);
    if (ok) {
      this.prestationService
        .createOrUpdatePrestation(
          prestation,
          this.siret,
          false,
          this.selectedMonth
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/factures/read']);
            this.onSuccess('ADD,FACTURE');           
          },
          error: (err) => {
            this.onError(err);
          },
        });
    }
  }


  addFacture() : void{
    if (this.formFacture.valid) {
      this.selectedPrestation.quantite =
        this.formFacture.get('quantite')?.value;
      this.selectedPrestation.numeroCommande =
        this.formFacture.get('numeroCommande')?.value;
      this.selectedPrestation.clientPrestation =
        this.formFacture.get('clientPrestation')?.value;
      this.addNewFacture(this.selectedPrestation);

    } else {
      for (const [key, control] of Object.entries(this.formFacture.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
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

  cancel() {
    
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

}
