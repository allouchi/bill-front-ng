import { Component, OnDestroy, OnInit } from '@angular/core';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { Router } from '@angular/router';
import { AdresseClientPipe } from '../../../shared/pipes/clientAdresse-pipe';
import { AlertService } from '../../../services/alert/alert.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';

@Component({
  selector: 'bill-client-read',
  standalone: true,
  imports: [AdresseClientPipe, WaitingComponent],
  templateUrl: './client-read.component.html',
  styleUrl: './client-read.component.css',
})
export class ClientReadComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  isLoaded = false;

  constructor(
    private readonly clientService: ClientService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients() {
    this.clientService.findClients().subscribe({
      next: (clients) => {
        setTimeout(() => {
          this.clients = clients;
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

  deleteClient(client: Client) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${client.socialReason}" ?`
    );
    if (ok) {
      console.log(client.socialReason);
    }
  }

  updateClient(client: Client) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${client.socialReason}" ?`
    );
    if (ok) {
      console.log(client.socialReason);
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
    console.log('Method not implemented.');
  }
}
