import { Observable } from "rxjs";
import Consultant from "../../models/Consultant";




/**
 * Consultant fetcher port
 *
 */
export interface IConsultantService {
  /**
   * Create new Consultant for the current project or update it if already exists
   *
   * @param consultant Consultant to create or to update
   * @returns Observable<Consultant>
   */
  createOrUpdateConsultant(consultant: Consultant, siret: string): Observable<Consultant>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteConsultantById(id: number): Observable<string>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param consultant consultant name
   * @returns Observable<Consultant>
   */
  findConsultantsSiret(siret: string): Observable<Consultant[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param consultant consultant name
   * @returns Observable<Consultant>
   */
  findConsultants(): Observable<Consultant[]>;
}
