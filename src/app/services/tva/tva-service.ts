import { Observable, of } from "rxjs";
import Tva from "../../models/Tva";
import { ITvaService } from "./tva.interface";
import { HttpClient, HttpParams } from '@angular/common/http';
import Exercise from '../../models/Exercise';
import TvaInfos from '../../models/TvaInfos';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Page } from '../../models/Page';

/**
 * Adapter for ITvaService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */

@Injectable({ providedIn: 'root' })
export class TvaService implements ITvaService {

  private readonly TVA_PATH: string = environment.tvaURL;
  private readonly exerciseURL = environment.exerciseURL;
  private readonly EXERCISE_PATH: string = `${this.exerciseURL}` + '/exerciseRef';

  constructor(private readonly http: HttpClient) { }

  createOrUpdateTva(tva: Tva): Observable<Tva> {
    const isNew: boolean = !tva.id || tva.id === null;

    if (isNew) {
      return this.http.post<Tva>(this.TVA_PATH, tva);
    } else {
      return this.http.put<Tva>(this.TVA_PATH, tva);
    }
  }

  findTvaByExercise(
    siret: string,
    exercise: string,
    page: number,
    size: number,
  ): Observable<Page<Tva>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Tva>>(`${this.TVA_PATH}/${siret}/${exercise}`, {
      params,
    });
  }

  findTvaInfoByExercise(siret: string, exercise: string): Observable<TvaInfos> {
    // Correction ici : nettoyage des guillemets simples et des symboles "+" inutiles
    return this.http.get<TvaInfos>(
      `${this.TVA_PATH}/tvasInfo/${siret}/${exercise}`
    );
  }

  findExercisesRef(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.EXERCISE_PATH}`);
  }

  deleteTvaById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.TVA_PATH}/${id}`);
  }

  searchTvas(
    siret: string,
    pattern: string,
    page: number,
    size: number,
  ): Observable<Page<Tva>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const url = `${this.TVA_PATH}/search/${siret}`;
    // Envoi du pattern dans le body
    return this.http.post<Page<Tva>>(url, pattern, { params });
  }
}
