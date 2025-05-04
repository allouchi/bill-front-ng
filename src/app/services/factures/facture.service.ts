import { Observable } from "rxjs";
import Facture from "../../models/Facture";
import { IFactureService } from "./facture.interface";
import { HttpClient } from "@angular/common/http";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";
import Exercise from '../../models/Exercise';

/**
 * Adapter for IFactureService
 *
 * @author M.ALIANNE
 * @since 01/05/2025
 */
@Injectable({ providedIn: 'root' })
export class FactureService implements IFactureService {
  private readonly apiURL = env.apiURL;
  private readonly FACTURES_PATH: string = `${this.apiURL}` + '/factures';
  private readonly EXERCISE_PATH: string =
    `${this.apiURL}` + '/tvas/exerciceRef';

  constructor(private readonly http: HttpClient) {}

  updateFacture(facture: Facture): Observable<Facture> {
    return this.http.put<Facture>(this.FACTURES_PATH, facture);
  }
  createFacture(
    facture: Facture,
    siret: string,
    prestationId: number
  ): Observable<Facture> {
    return this.http.post<Facture>(
      `${this.FACTURES_PATH}/${siret}/${prestationId}`,
      facture
    );
  }

  findFacturesBySiret(siret: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.FACTURES_PATH}/${siret}`);
  }
  deleteFactureById(factureId: number): Observable<string> {
    return this.http.delete<string>(`${this.FACTURES_PATH}/${factureId}`);
  }

  findExercisesRef(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.EXERCISE_PATH}`);
  }
}
