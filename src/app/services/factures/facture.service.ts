import { Observable } from "rxjs";
import Facture from "../../models/Facture";
import { IFactureService } from "./facture.interface";
import { HttpClient } from "@angular/common/http";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";
import Exercise from '../../models/Exercise';
import Prestation from "../../models/Prestation";
import DataPDF from '../../models/DataPDF';

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
  private readonly EDITION_PATH: string = `${this.apiURL}` + '/editions';
  constructor(private readonly http: HttpClient) {}

  updateFacture(facture: Facture): Observable<Facture> {
    return this.http.put<Facture>(this.FACTURES_PATH, facture);
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

  createFacture(
    prestation: Prestation,
    siret: string,
    moisFacture: number | null,
    iTextGeneration: boolean
  ): Observable<Prestation> {
    const isNew: boolean = prestation.id === 0 || prestation.id === null;
    if (isNew) {
      return this.http.post<Prestation>(
        `${this.FACTURES_PATH}/${siret}`,
        prestation
      );
    } else {
      return this.http.put<Prestation>(
        `${this.FACTURES_PATH}/${siret}/${moisFacture}/${iTextGeneration}`,
        prestation
      );
    }
  }

  downloadPdfFacture(factureId: number): Observable<DataPDF> {
    return this.http.get<DataPDF>(`${this.EDITION_PATH}/${factureId}`);
  }
}
