import { Observable } from "rxjs";
import Tva from "../../models/Tva";
import { ITvaService } from "./tva.interface";
import { HttpClient } from "@angular/common/http";
import Exercise from "../../models/Exercise";
import TvaInfos from "../../models/TvaInfos";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";


/**
 * Adapter for ITvaService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */

@Injectable({ providedIn: 'root' })
export class TvaService implements ITvaService {
  private readonly apiURL = env.apiURL;
  private readonly TVA_PATH: string = `${this.apiURL}` + '/tvas';
  private readonly TVA_INFO_PATH: string = `${this.apiURL}` + '/tvas/tvasInfo';
  private readonly EXERCISE_PATH: string =
    `${this.apiURL}` + '/tvas/exerciceRef';

  constructor(private readonly http: HttpClient) {}

  createOrUpdateTva(tva: Tva): Observable<Tva> {
    const isNew: boolean = !tva.id || tva.id === null;   

    if (isNew) {
      return this.http.post<Tva>(this.TVA_PATH, tva);
    } else {
      return this.http.put<Tva>(this.TVA_PATH, tva);
    }
  }

  findTvaByExercise(siret: string, exercise: string): Observable<Tva[]> {
    return this.http.get<Tva[]>(`${this.TVA_PATH}/${siret}/${exercise}`);
  }

  findTvaInfoByExercise(siret: string, exercise: string): Observable<TvaInfos> {
    return this.http.get<TvaInfos>(
      `${this.TVA_INFO_PATH}/${siret}/${exercise}`
    );
  }

  findExercisesRef(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.EXERCISE_PATH}`);
  }

  deleteTvaById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.TVA_PATH}/${id}`);
  }
}
