import { Component, OnDestroy, OnInit } from '@angular/core';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { Router } from '@angular/router';
import { AdresseClientPipe } from '../../../shared/pipes/clientAdresse-pipe';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { AlertService } from '../../../services/alert/alertService';
import { PrestationService } from '../../../services/prestations/prestation.service';
import Prestation from '../../../models/Prestation';

@Component({
  selector: 'bill-client-read',
  standalone: true,
  imports: [AdresseClientPipe, WaitingComponent],
  templateUrl: './client-read.component.html',
  styleUrl: './client-read.component.css',
})
export class ClientReadComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filtredClients: Client[] = [];
  prestations!: Prestation[];
  isLoaded = false;
  isAdmin = false;
  parent = 'read';
  siret: string | null = '';

  constructor(
    private readonly modalService: NgbModal,
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly authService: AuthService,
    private readonly prestationService: PrestationService,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.siret = this.sharedDataService.getSiret();
    this.loadClients();
  }
  

  private disableClientDelete() {
    if (this.prestations) {
      const clientIdsAvecPrestation = new Set(this.prestations
        .filter(prestations => prestations.client)
        .map(prestation => prestation.client!.id)
      );

      this.filtredClients = this.clients.map(client => ({
        ...client,
        hasPrestation: clientIdsAvecPrestation.has(client.id)
      }));

    }
  }

  private loadClients() {
    this.clientService.findClients().subscribe({
      next: (clients) => {
        setTimeout(() => {
          this.clients = clients;
          this.filtredClients = this.clients;
          this.isLoaded = true;
          this.disableClientDelete();
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteClientService(id: number) {
    this.clientService.deleteClientById(id).subscribe({
      next: () => {
        this.filtredClients = this.clients.filter(
          (item) => item.id !== id
        );
        this.clients = this.filtredClients;
        this.disableClientDelete();
        this.alertService.show('DELETE', 'CLIENT', 'success');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteClient(event: Event, client: Client) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.item = 'Client';
    modal.componentInstance.composant = client;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          if (client.id) {
            this.deleteClientService(client.id);
          }
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  editClient(event: Event, client: Client) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Client';
    modal.componentInstance.composant = client;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          this.sharedDataService.setSelectedClient(client);
          this.sharedMessagesService.setMessage("Mise à jour d'un Client");
          this.router.navigate(['clients/edit']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  addClient() {
    this.sharedMessagesService.setMessage("Ajout d'un Client");
    this.router.navigate(['clients/add']);
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
