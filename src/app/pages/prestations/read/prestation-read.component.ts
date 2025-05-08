import {
  AfterViewInit,
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
import { env } from '../../../../environments/env';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import JoursOuvres from '../../../shared/utils/time-calcul';
import { SharedService } from '../../../services/shared/shared.service';
import GetMonthsOfYear from '../../../shared/utils/month-year';

declare var window: any;

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
  implements OnInit, OnDestroy, AfterViewInit
{
  prestations!: Prestation[];
  isLoaded = false;
  siret: string = '';
  selectedPrestation!: Prestation;
  selectedMonth: number = 0;
  selectedDate: Date = new Date();

  formFacture!: FormGroup;
  formPresta!: FormGroup;
  monthsYear: any;

  private readonly router = inject(Router);
  constructor(
    private readonly prestationService: PrestationService,
    private readonly alertService: AlertService,
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService
  ) {
    this.siret = env.siret;
  }
  ngAfterViewInit(): void {
    // Initialisation du modal après le rendu de la vue
    const modal = new window.bootstrap.Modal(
      document.getElementById('factureModal')
    );
  }

  ngOnInit(): void {
    this.monthsYear = GetMonthsOfYear();
    this.formFacture = this.fb.group({
      month: ['', Validators.required],
      numeroCommande: ['', Validators.required],
      quantite: ['', Validators.required],
      clientPrestation: ['', Validators.required],
    });

    this.formPresta = this.fb.group({
      prestaDateFin: ['', Validators.required],
    });
    this.loadPrestations();
  }

  loadPrestations() {
    this.prestationService.getPrestationsBySiret(env.siret).subscribe({
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
      this.prestationService.deletePrestationById(prestation.id).subscribe({
        next: () => {
          this.onSuccess('deleted');
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

  setMonthValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const nbJoursOuvres = JoursOuvres(selectedValue);
    this.selectedMonth = +selectedValue;
    this.formFacture.patchValue({
      quantite: nbJoursOuvres,
    });
  }

  closeFactureModal() {
    const modalElement = document.getElementById('factureModal');
    const modalBootstrap = window.bootstrap.Modal.getInstance(modalElement!);
    modalBootstrap?.hide();
  }

  closePrestaModal() {
    const modalElement = document.getElementById('PrestaModal');
    const modalBootstrap = window.bootstrap.Modal.getInstance(modalElement!);
    modalBootstrap?.hide();
  }

  openModalFacture(prestation: Prestation) {
    this.selectedPrestation = prestation;
    setTimeout(() => {
      const modalElement = document.getElementById('factureModal');
      if (modalElement) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
        this.formFacture.patchValue({
          numeroCommande: prestation.numeroCommande,
          clientPrestation: prestation.clientPrestation,
        });
      } else {
        console.error('Modal non trouvé');
      }
    }, 100); // Attends 100ms pour que le DOM soit bien chargé
  }

  openModalPrestation(prestation: Prestation) {
    this.selectedPrestation = prestation;
    setTimeout(() => {
      const modalElement = document.getElementById('PrestaModal');
      if (modalElement) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Modal non trouvé');
      }
    }, 100); // Attends 100ms pour que le DOM soit bien chargé
  }

  private updatePrestation(prestation: Prestation) {
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
            this.closeFactureModal();
            this.router.navigate(['/factures/read']);
            this.onSuccess('updated');
            this.sharedService.updateData('Liste des Factures');
          },
          error: (err) => {
            this.onError(err);
            this.closeFactureModal();
          },
          complete: () => {
            console.log('Requête terminée.');
          },
        });
    }
  }

  updatePrestaDateFin() {
    const dateFin = this.formPresta.get('prestaDateFin')?.value;
    this.selectedPrestation.dateFin = dateFin;
    this.prestationService
      .updateDatePrestation(this.selectedPrestation, env.siret)
      .subscribe({
        next: () => {
          this.closePrestaModal();
          this.onSuccess('updated');
          this.sharedService.updateData('Liste des Prestations');
        },
        error: (err) => {
          this.onError(err);
          this.closePrestaModal();
        },
        complete: () => {
          console.log('Requête terminée.');
        },
      });
  }
  addFacture() {
    if (this.formFacture.valid) {
      this.selectedPrestation.quantite =
        this.formFacture.get('quantite')?.value;
      this.selectedPrestation.numeroCommande =
        this.formFacture.get('numeroCommande')?.value;
      this.selectedPrestation.clientPrestation =
        this.formFacture.get('clientPrestation')?.value;
      this.updatePrestation(this.selectedPrestation);
    } else {
      console.log('Formulaire non valade');
      for (const [key, control] of Object.entries(this.formFacture.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show('Opération réussie !', 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.show('Une erreur est survenue.', 'error');
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
