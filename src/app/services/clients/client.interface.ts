import { Observable } from 'rxjs';
import Client from '../../models/Client';


/**
 * Client fetcher port
 *
 */
export interface IClientService {
  /**
   * Create new Client for the current project or update it if already exists
   *
   * @param client facture to create or to update
   * @returns Observable<Facture>
   */
  createOrUpdateClient(client: Client, siret: string): Observable<Client>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param client client name
   * @returns Observable<Client[]>
   */
  findClientsBySiret(siret: string): Observable<Client[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param client client name
   * @returns Observable<Client[]>
   */
  findClients(): Observable<Client[]>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteClientById(id: number): Observable<string>;
}
