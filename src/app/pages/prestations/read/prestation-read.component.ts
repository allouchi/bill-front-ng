import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import Prestation from '../../../models/Prestation';
import { ConsultantNamePipe } from '../../../shared/pipes/consultantName-pipe';
import { ClientNamePipe } from '../../../shared/pipes/clientName-pipe';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { SiretService } from '../../../services/shared/siret-service';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';


@Component({
  selector: 'bill-prestation-read',
  standalone: true,
  imports: [
    CommonModule,
    ConsultantNamePipe,
    ClientNamePipe,
    WaitingComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './prestation-read.component.html',
  styleUrl: './prestation-read.component.css',
})
export class PrestationReadComponent
  implements OnInit, OnDestroy {
  prestations!: Prestation[];
  isLoaded = true;
  siret: string = '';
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  selectedDate: Date = new Date();  
  formPresta!: FormGroup;
  monthsYear: any;

  private readonly router = inject(Router);
  constructor(
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder,
    private readonly sharedDataService: SharedDataService,   
    private readonly siretService: SiretService,
    private readonly sharedMessagesService: SharedMessagesService
  ) { }


  ngOnInit(): void {    
    this.formPresta = this.fb.group({
      prestaDateFin: ['', Validators.required],
    });

    this.siret = this.siretService.getSiret();
    console.log('PrestationReadComponent : ', this.siret);
    this.loadPrestations();
  }

  loadPrestations() {   
    this.prestationService.getPrestationsBySiret(this.siret).subscribe({
      next: (prestations) => {
        setTimeout(() => {
          this.prestations = prestations;         
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deletePrestation(prestation: Prestation) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${prestation.numeroCommande}" ?`
    );
    if (ok) {
      this.prestationService.deletePrestationById(prestation.id!).subscribe({
        next: () => {
          this.onSuccess("DELETE,PRESTATION");
          this.prestations = this.prestations.filter(
            (item) => item.id !== prestation.id
          );
        },
        error: (err) => {
          this.onError(err);
        },
      });
    }
  }  

  updatePrestaDateFin() {
    const dateFin = this.formPresta.get('prestaDateFin')?.value;
    this.selectedPrestation.dateFin = dateFin;
    this.prestationService
      .updateDatePrestation(this.selectedPrestation, this.siret)
      .subscribe({
        next: () => {          
          this.onSuccess('UPDATE,PRESTATION');          
        },
        error: (err) => {
          this.onError(err);          
        },
      });
  }

  addPrestation() {
    this.sharedMessagesService.setMessage("Ajout d'une Prestation");
    this.router.navigate(['/prestations/add']);
  }

  addNewFacture(prestation: Prestation) {
    const data: Map<string, any> = new Map();
    data.set('prestation', prestation);
    this.sharedDataService.setData(data);
    this.router.navigate(['/factures/add']);
  }

  openModalPrestation(prestation: Prestation) {

  }

  openModalFacture(prestation: Prestation) {

  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
