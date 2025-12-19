import { Component } from '@angular/core';
import Consultant from '../../../models/Consultant';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { Router } from '@angular/router';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { AuthService } from '../../../services/auth/auth-service';
import { AlertService } from '../../../services/alert/alertService';
import Prestation from '../../../models/Prestation';
import { PrestationService } from '../../../services/prestations/prestation.service';

@Component({
  selector: 'bill-consultant-read',
  standalone: true,
  imports: [WaitingComponent],
  templateUrl: './consultant-read.component.html',
  styleUrl: './consultant-read.component.css',
})
export class ConsultantReadComponent {
  consultants: Consultant[] = [];
  prestations!: Prestation[];
  isLoaded = false;
siret: string | null = '';
  observableEvent$ = new Subscription();
  isAdmin = false;

  constructor(
    private readonly modalService: NgbModal,
    private readonly consultantService: ConsultantService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly prestationService: PrestationService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadPrestations();
  }

  private disableConsultantDelete() {
    if (this.prestations) {
      const clientIdsAvecPrestation = new Set(this.prestations
        .filter(prestations => prestations.consultant)
        .map(prestation => prestation.consultant!.id)
      );

      this.consultants = this.consultants.map(consultant => ({
        ...consultant,
        hasPrestation: clientIdsAvecPrestation.has(consultant.id)
      }));
    }
  }

  private loadConsultants() {
    this.consultantService.findConsultants().subscribe({
      next: (consultants) => {
        this.consultants = consultants;
        this.isLoaded = true;
        this.disableConsultantDelete();
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }


  loadPrestations() {
    this.prestationService.getPrestationsBySiret(this.siret!).subscribe({
      next: (prestations) => {
        this.prestations = prestations;
        this.loadConsultants();
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteConsultantService(id: number) {
    this.consultantService.deleteConsultantById(id).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'CONSULTANT', 'success')
        this.consultants = this.consultants.filter(
          (item) => item.id !== id
        );
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteConsultant(event: Event, consultant: Consultant) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Consultant';
    modal.componentInstance.composant = consultant;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          if (consultant && consultant.id) {
            this.deleteConsultantService(consultant.id);
            this.disableConsultantDelete();
          }
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  AddConsultant() {
    this.sharedMessagesService.setMessage("Ajout d'un Consultant");
    this.router.navigate(['/consultants/add']);
  }

  updateConsultant(consultant: Consultant) {
    this.sharedMessagesService.setMessage("Mise à jour d'un Consultant");
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${consultant.firstName} ${consultant.lastName}" ?`
    );
    if (ok) {
      this.sharedDataService.setSelectedConsultant(consultant);
      this.router.navigate(['consultants/edit']);
    }
  }

  editConsultant(event: Event, consultant: Consultant) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Consultant';
    modal.componentInstance.composant = consultant;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          this.sharedDataService.setSelectedConsultant(consultant);
          this.sharedMessagesService.setMessage("Mise à jour d'un Consultant");
          this.router.navigate(['consultants/edit']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }
  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
