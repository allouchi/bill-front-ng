import { Observable } from "rxjs";
import Facture from "../../models/Facture";
import Exercise from '../../models/Exercise';

/**
 * Facture fetcher port
 *
 */
export interface IFactureService {
  /**
   * Create new facture for the current project or update it if already exists
   *
   * @param facture facture to create or to update
   * @returns Observable<Facture>
   */
  createFacture(
    facture: Facture,
    siret: string,
    prestationId: number
  ): Observable<Facture>;

  /**
   * Update facture for the current project or update it if already exists
   *
   * @param facture facture to create or to update
   * @returns Observable<Facture>
   */
  updateFacture(facture: Facture): Observable<Facture>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Observable<Facture[]>
   */
  findFacturesBySiret(siret: string): Observable<Facture[]>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteFactureById(factureId: number): Observable<String>;

  findExercisesRef(): Observable<Exercise[]>;
}
