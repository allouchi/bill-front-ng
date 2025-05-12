import { Component, OnDestroy, OnInit } from '@angular/core';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { Router } from '@angular/router';
import { AdresseClientPipe } from '../../../shared/pipes/clientAdresse-pipe';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';

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
  isLoaded = true;

  constructor(
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService
  ) {}

  ngOnInit(): void {
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

  deleteClient(client: Client) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${client.socialReason}" ?`
    );
    if (ok) {
      this.clientService.deleteClientById(client.id!).subscribe({
        next: () => {
          this.filtredClients = this.clients.filter(
            (item) => item.id !== client.id
          );
          this.onSuccess('DELETE,CLIENT');
        },
        error: (err) => {
          this.onError(err);
        },
      });
    }
  }

  updateClient(client: Client) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${client.socialReason}" ?`
    );
    if (ok) {
      const data: Map<string, any> = new Map();
      data.set('client', client);
      this.sharedDataService.setData(data);
      this.router.navigate(['clients/edit']);
    }
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
