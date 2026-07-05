import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { AlertService } from '../../../services/alert/alertService';
import Prestation from '../../../models/Prestation';
import { listStagger } from '../../../shared/animations/app.animations';
import { EntityCardComponent } from '../../../shared/entity-card/entity-card.component';
import { DetailModalComponent, DetailField } from '../../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'bill-client-read',
  standalone: true,
  imports: [AdresseClientPipe, WaitingComponent, EntityCardComponent, DetailModalComponent],
  templateUrl: './client-read.component.html',
  styleUrl: './client-read.component.css',
  animations: [listStagger],
})
export class ClientReadComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  prestations!: Prestation[];
  isLoaded = false;
  isAdmin = false;
  parent = 'read';
  siret: string | null = '';

  selectedClient: Client | null = null;
  detailOpen = false;

  openDetail(client: Client): void {
    this.selectedClient = client;
    this.detailOpen = true;
  }
  closeDetail(): void {
    this.detailOpen = false;
  }
  onEditDetail(): void {
    if (this.selectedClient) {
      this.editClient(new Event('click'), this.selectedClient);
    }
    this.closeDetail();
  }
  onDeleteDetail(): void {
    if (this.selectedClient) {
      this.deleteClient(new Event('click'), this.selectedClient);
    }
    this.closeDetail();
  }
  clientEmails(client: Client): string {
    return (client.emails || []).map((e) => e.email).join(', ');
  }
  firstEmail(client: Client): string {
    return client.emails && client.emails.length ? client.emails[0].email : '';
  }
  clientAddress(client: Client): string {
    const a = client.adresseClient;
    if (!a) return '';
    return `${a.numero ?? ''}, ${a.rue ?? ''} ${a.codePostal ?? ''} ${a.localite ?? ''}`.trim();
  }
  get detailFields(): DetailField[] {
    const c = this.selectedClient;
    if (!c) return [];
    return [
      { label: 'Raison sociale', value: c.socialReason, wide: true, section: 'Client' },
      { label: 'Adresses email', value: this.clientEmails(c) || '—', wide: true },
      { label: 'Adresse', value: this.clientAddress(c), wide: true, section: 'Coordonnées' },
      {
        label: 'Facturation',
        value: c.hasPrestation ? 'Avec prestation' : 'Aucune prestation',
        tone: c.hasPrestation ? 'brand' : 'default',
      },
    ];
  }

  get totalEmails(): number {
    return this.clients.reduce((sum, c) => sum + (c.emails?.length || 0), 0);
  }
  get billableCount(): number {
    return this.clients.filter((c) => c.hasPrestation).length;
  }

  private readonly modalService = inject(NgbModal);
  private readonly clientService = inject(ClientService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly sharedDataService = inject(SharedDataService);
  private readonly sharedMessagesService = inject(SharedMessagesService);
  private readonly authService = inject(AuthService);

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

      this.clients = this.clients.map(client => ({
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
          this.isLoaded = true;
          this.disableClientDelete();
        }, 100);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteClientService(id: number) {
    this.clientService.deleteClientById(id).subscribe({
      next: () => {
        this.loadClients()
        //this.disableClientDelete();
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
    this.sharedDataService.setSelectedClient(client);
    this.sharedMessagesService.setMessage("Mise à jour d'un Client");
    this.router.navigate(['clients/edit', client.id]);
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
