import { Observable } from "rxjs";
import Tva from "../../models/Tva";
import TvaInfos from "../../models/TvaInfos";
import Exercise from "../../models/Exercise";



/**
 * Tva fetcher port
 *
 */
export interface ITvaService {
  /**
   * Create new facture for the current project or update it if already exists
   *
   * @param Tva Tva to create or to update
   * @returns Observable<Tva>
   */
  createOrUpdateTva(Tva: Tva): Observable<Tva>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param Tva Tva name
   * @returns Observable<Tva>
   */
  findTvaByExercise(siret: string, exercise: string): Observable<Tva[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param Tva Tva name
   * @returns Observable<Tva>
   */
  findTvaInfoByExercise(siret: string, exercise: string): Observable<TvaInfos>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param Exercise Exercise name
   * @returns Observable<Exercise>
   */
  findExercisesRef(): Observable<Exercise[]>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteTvaById(id: number): Observable<string>;
}
