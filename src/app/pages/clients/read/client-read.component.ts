import { Component, OnDestroy, OnInit } from '@angular/core';
import Client from '../../../models/Client';
import { ClientService } from '../../../services/clients/client-service';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-client-read',
  standalone: true,
  imports: [],
  templateUrl: './client-read.component.html',
  styleUrl: './client-read.component.css'
})
export class ClientReadComponent implements OnInit, OnDestroy {

  clients: Client[] = [];

  constructor(
    private readonly clientService: ClientService,
    private readonly router: Router
  ) { }



  ngOnInit(): void {

    this.clientService.findClients().subscribe({
      next: (clients) => {
        this.onResponseSuccess(clients);
      },
      error: (err) => {
        this.onResponseError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });

  }


  private onResponseSuccess(clients: Client[]) {
    this.clients = clients;
  }


  private onResponseError(error: any) {
    console.log('error :', error);
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

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }


}
