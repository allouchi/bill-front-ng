import { Observable } from 'rxjs';
import Consultant from '../domains/Consultant';



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
  createOrUpdate(consultant: Consultant, siret: string): Observable<Consultant>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteById(id: number, siret: string): Observable<String>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param consultant consultant name
   * @returns Observable<Consultant>
   */
  findAllBySiret(siret: string): Observable<Consultant[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param consultant consultant name
   * @returns Observable<Consultant>
   */
  findAll(): Observable<Consultant[]>;
}
