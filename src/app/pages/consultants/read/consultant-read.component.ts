import { Component } from '@angular/core';
import Consultant from '../../../models/Consultant';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SiretService } from '../../../services/shared/siret-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';

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
  siret: string = '';
  observableEvent$ = new Subscription();

  constructor(
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly siretService: SiretService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.observableEvent$ = this.siretService
      .getSiretObservable()
      .subscribe((siret) => {
        this.siret = siret;
      });
    console.log('ConsultantEditComponent : ', this.siret);
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
    });
  }

  deleteConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${consultant.firstName}" ?`
    );
    if (ok) {
      this.consultantService
        .deleteConsultantById(consultant.id!, this.siret)
        .subscribe({
          next: () => {
            this.onSuccess('DELETE,CONSULTANT');
            this.consultants = this.consultants.filter(
              (item) => item.id !== consultant.id
            );
          },
          error: (err) => {
            this.onError(err);
          },
        });
    }
  }

  AddConsultant() {
    this.sharedMessagesService.setMessage("Ajout d'un Consultant");
    this.router.navigate(['/consultants/add']);
  }

  updateConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${consultant.firstName} ${consultant.lastName}" ?`
    );
    if (ok) {
      const data: Map<string, any> = new Map();
      data.set('consultant', consultant);
      this.sharedDataService.setData(data);
      this.router.navigate(['consultants/edit']);
    }
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
