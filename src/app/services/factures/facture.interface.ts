import { Observable } from "rxjs";
import Facture from "../../models/Facture";
import Exercise from '../../models/Exercise';
import Prestation from "../../models/Prestation";

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
    prestation: Partial<Prestation>,
    siret: string,   
    moisFactureId: number,
    iTextGeneration: boolean,
  ): Observable<Prestation>;

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
  deleteFactureById(factureId: number): Observable<string>;

  findExercisesRef(): Observable<Exercise[]>;

  downloadPdfFacture(id: number): Observable<Blob>;
}
