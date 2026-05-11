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
  private readonly BATCH_PATH: string = `${this.apiURL}` + '/batchs';

  constructor(private readonly http: HttpClient) { }



  findFacturesBySiret(
    siret: string,
    page: number,
    size: number,
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
    size: number,
  ): Observable<Page<Facture>> {
    let params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<Page<Facture>>(
      `${this.FACTURES_PATH}/${siret}/${exercice}`,
      { params },
    );
  }

  findBySiretAndExercice(
    siret: string,
    exercice: string,
  ): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.FACTURES_PATH}/noPage/${siret}/${exercice}`,
    );
  }

  deleteFactureById(factureId: number): Observable<string> {
    return this.http.delete<string>(`${this.FACTURES_PATH}/${factureId}`);
  }

  findExercisesRef(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.EXERCISE_PATH}`);
  }

  createFacture(
    facture: Facture,
  ): Observable<Facture> {
    return this.http.post<Facture>(
      `${this.FACTURES_PATH}/create`,
      facture,
    );
  }

  updateFacture(facture: Facture): Observable<Facture> {
    return this.http.put<Facture>(`${this.FACTURES_PATH}/update`, facture);
  }

  downloadPdfFacture(factureId: number): Observable<DataPDF> {
    return this.http.get<DataPDF>(`${this.EDITION_PATH}/download/${factureId}`);
  }

  getClientMails(factureId: number): Observable<[]> {
    return this.http.get<[]>(`${this.EDITION_PATH}/mail/${factureId}`);
  }

  envoyerFacture(
    factureId: number,
    mailsTo: EmailClient[],
  ): Observable<string> {
    return this.http.post<string>(
      `${this.EDITION_PATH}/sendMail/${factureId}`,
      mailsTo,
    );
  }

  getWorkingDays(year: number, month: number): Observable<number> {
    return this.http.get<number>(
      `${this.EDITION_PATH}/workingDays/${year}/${month}`,
    );
  }

  runBatch(siret: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.BATCH_PATH}/${siret}`);
  }

  searchFactures(
    siret: string,
    pattern: string,
    page: number,
    size: number,
  ): Observable<Page<Facture>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const url = `${this.FACTURES_PATH}/search/${siret}`;
    // Envoi du pattern dans le body
    return this.http.post<Page<Facture>>(url, pattern, { params });
  }
}
