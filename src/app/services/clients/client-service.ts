import { Observable } from "rxjs";
import Client from "../../models/Client";
import { IClientService } from "./client.interface";
import { env } from "../../../environments/env";
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

  private readonly apiURL = env.apiURL;
  private readonly CLIENT_PATH: string = `${this.apiURL}` + "/clients";

  constructor(private readonly http: HttpClient) { }


  createOrUpdateClient(client: Client, siret: string): Observable<Client> {
    const isNew: boolean = !client.id || client.id === 0;   
    if (isNew) {
      return this.http.post<Client>(
        `${this.CLIENT_PATH}/${siret}`,
        client
      );

    } else {
      return this.http.put<Client>(
        `${this.CLIENT_PATH}/${siret}`,
        client
      );
    }
  }

  findClientsBySiret(siret: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.CLIENT_PATH}/${siret}`);
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
