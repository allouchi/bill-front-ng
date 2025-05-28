import { Component } from '@angular/core';
import Consultant from '../../../models/Consultant';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { ConfirmModalComponent } from '../../../shared/modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth/auth-service';

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
  isAdmin = false;

  constructor(
    private readonly modalService: NgbModal,
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly router: Router,
    private readonly authService: AuthService
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
    });
  }

  deleteConsultant(event: Event, consultant: Consultant) {

    event.preventDefault();
    const modal = this.modalService.open(ConfirmModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });

    modal.componentInstance.item = "Consultant";
    modal.componentInstance.composant = consultant;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.onSuccess('DELETE,CONSULTANT');
          this.consultants = this.consultants.filter(
            (item) => item.id !== consultant.id
          );
        }
      })
      .catch(() => {
        console.log("Annulé")
      });
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
      this.sharedDataService.setSelectedConsultant(consultant);
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
