import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPrestationService } from './prestation.interface';
import Prestation from '../../models/Prestation';
import { env } from '../../../environments/env';

@Injectable({ providedIn: 'root' })
export class PrestationService implements IPrestationService {
  private readonly apiURL = env.apiURL;
  private readonly PRESTATION_PATH: string = `${this.apiURL}` + '/prestations';

  //private readonly http = inject(HttpClient);

  constructor(private readonly http: HttpClient) {}
  createOrUpdatePrestation(
    prestation: Partial<Prestation>,
    siret: string,
    templateChoice: boolean,
    moisFactureId: number | null
  ): Observable<Prestation> {
    const isNew: boolean = !prestation.id || prestation.id === 0;

    if (isNew) {
      return this.http.post<Prestation>(
        `${this.PRESTATION_PATH}/${siret}`,
        prestation
      );
    } else {
      return this.http.put<Prestation>(
        `${this.PRESTATION_PATH}/${siret}/${templateChoice}/${moisFactureId}`,
        prestation
      );
    }
  }

  updateDatePrestation(
    prestation: Prestation,
    siret: string
  ): Observable<Prestation> {
    return this.http.put<Prestation>(
      `${this.PRESTATION_PATH}/${siret}`,
      prestation
    );
  }

  deletePrestationById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.PRESTATION_PATH}/${id}`);
  }
  getPrestationsBySiret(siret: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.PRESTATION_PATH}/${siret}`);
  }
}
