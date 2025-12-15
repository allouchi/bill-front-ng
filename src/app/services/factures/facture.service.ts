import { Observable } from "rxjs";
import Facture from "../../models/Facture";
import { IFactureService } from "./facture.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";
import Exercise from '../../models/Exercise';
import Prestation from "../../models/Prestation";
import DataPDF from '../../models/DataPDF';
import { Page } from "../../models/Page";
import EmailClient from "../../models/EmailClient";

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
  constructor(private readonly http: HttpClient) { }


  updateFacture(facture: Facture): Observable<Facture> {
    return this.http.put<Facture>(this.FACTURES_PATH, facture);
  }

  findFacturesBySiret(
    siret: string,
    page: number,
    size: number
  ): Observable<Page<Facture>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Facture>>(`${this.FACTURES_PATH}/${siret}`, {
      params,
    });
  }

  findFacturesByExercice(
    siret: string,
    exercice: string,
    page: number,
    size: number
  ): Observable<Page<Facture>> {
    let params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<Page<Facture>>(
      `${this.FACTURES_PATH}/${siret}/${exercice}`,
      { params }
    );
  }

  findBySiretAndExercice(siret: string, exercice: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.FACTURES_PATH}/noPage/${siret}/${exercice}`
    );
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
  ): Observable<Facture> {
    const isNew: boolean = prestation.id === 0 || prestation.id === null;
    if (isNew) {
      return this.http.post<Facture>(
        `${this.FACTURES_PATH}/${siret}`,
        prestation
      );
    } else {
      return this.http.put<Facture>(
        `${this.FACTURES_PATH}/${siret}/${moisFacture}/${iTextGeneration}`,
        prestation
      );
    }
  }

  downloadPdfFacture(factureId: number): Observable<DataPDF> {
    return this.http.get<DataPDF>(`${this.EDITION_PATH}/${factureId}`);
  }

  getClientMails(factureId: number): Observable<[]> {
    return this.http.get<[]>(`${this.EDITION_PATH}/mail/${factureId}`);
  }

  envoyerFacture(factureId: number, mailsTo: EmailClient[]): Observable<string> {
    return this.http.post<string>(`${this.EDITION_PATH}/mail/${factureId}`, mailsTo);
  }
}
