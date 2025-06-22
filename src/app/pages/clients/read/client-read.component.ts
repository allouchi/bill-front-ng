import { Component, OnDestroy, OnInit } from '@angular/core';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { Router } from '@angular/router';
import { AdresseClientPipe } from '../../../shared/pipes/clientAdresse-pipe';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';

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
  isLoaded = false;
  isAdmin = false;
  parent = 'read';

  constructor(
    private readonly modalService: NgbModal,
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadClients();
  }

  private loadClients() {
    this.clientService.findClients().subscribe({
      next: (clients) => {
        setTimeout(() => {
          this.clients = clients;
          this.filtredClients = this.clients;
          this.isLoaded = true;
        }, 500);
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
          this.onSuccess('DELETE,CLIENT');
          this.filtredClients = this.clients.filter(
            (item) => item.id !== client.id
          );
          this.clients = this.filtredClients;
          console.log(this.filtredClients);
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
        if (result === 'confirm') {
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
    console.log('');
  }
}
