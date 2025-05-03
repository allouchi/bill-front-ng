import { Component } from '@angular/core';
import Consultant from '../../../models/Consultant';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { env } from '../../../../environments/env';

@Component({
  selector: 'bill-consultant-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './consultant-read.component.html',
  styleUrl: './consultant-read.component.css',
})
export class ConsultantReadComponent {
  consultants: Consultant[] = [];
  isLoaded = false;

  constructor(
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsultants();
  }

  private loadConsultants() {
    this.consultantService.findConsultants().subscribe({
      next: (consultants) => {
        setTimeout(() => {
          this.consultants = consultants;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });
  }

  deleteConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${consultant.firstName}" ?`
    );
    if (ok) {
      this.consultantService
        .deleteConsultantById(consultant.id, env.siret)
        .subscribe({
          next: () => {
            this.onSuccess('deleted');
            this.consultants = this.consultants.filter(
              (item) => item.id !== consultant.id
            );
          },
          error: (err) => {
            this.onError(err);
          },
          complete: () => {
            console.log('Requête terminée.');
          },
        });
    }
  }

  updateConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${consultant.firstName}" ?`
    );
    if (ok) {
      this.consultantService
        .createOrUpdateConsultant(consultant, env.siret)
        .subscribe({
          next: () => {
            this.onSuccess('updated');
            this.loadConsultants();
          },
          error: (err) => {
            this.onError(err);
          },
          complete: () => {
            console.log('Requête terminée.');
          },
        });
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
