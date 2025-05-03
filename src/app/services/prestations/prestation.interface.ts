import { Observable } from "rxjs";
import Prestation from "../../models/Prestation";

/**
 * Prestation fetcher port
 *
 */
export interface IPrestationService {
  /**
   * Create new facture for the current project or update it if already exists
   *
   * @param prestation prestation to create or to update
   * @returns Promise<Prestation>
   */
  createOrUpdatePrestation(
    prestation: Partial<Prestation>,
    siret: string,
    templateChoice: boolean,
    moisFactureId: number
  ): Observable<Prestation>;

  updateDatePrestation(
    prestation: Prestation,
    siret: string
  ): Observable<Prestation>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deletePrestationById(id: number): Observable<string>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Promise<Company>
   */
  getPrestationsBySiret(siret: string): Observable<Prestation[]>;
}
