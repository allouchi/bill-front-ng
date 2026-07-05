import { Observable } from "rxjs";
import Client from "../../models/Client";
import { IClientService } from "./client.interface";
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


/**
 * Adapter for ICompanyService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */

@Injectable({ providedIn: 'root' })
export class ClientService implements IClientService {

  private readonly apiURL = environment.clientURL;
  private readonly CLIENT_PATH: string = `${this.apiURL}`;


  constructor(private readonly http: HttpClient) { }

  createOrUpdateClient(client: Client, siret: string): Observable<Client> {
    const isNew: boolean = !client.id || client.id === 0;
    if (isNew) {
      return this.http.post<Client>(`${this.CLIENT_PATH}/add`, client);
    } else {
      return this.http.put<Client>(`${this.CLIENT_PATH}/update`, client);
    }
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.CLIENT_PATH}/${id}`);
  }

  findClients(): Observable<Client[]> {
    return this.http.get<Client[]>(
      `${this.CLIENT_PATH}`
    );
  }

  deleteClientById(id: number): Observable<string> {
    return this.http.delete<string>(
      `${this.CLIENT_PATH}/${id}`
    );
  }

}
