import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPrestationService } from './prestation.interface';
import Prestation from '../../models/Prestation';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrestationService implements IPrestationService {

  private readonly apiURL = environment.prestationURL;
  private readonly PRESTATION_PATH: string = `${this.apiURL}`;


  constructor(private readonly http: HttpClient) { }
  createOrUpdatePrestation(
    prestation: Prestation,
    siret: string
  ): Observable<Prestation> {
    const isNew: boolean = prestation.id === 0 || prestation.id === null;

    if (isNew) {
      return this.http.post<Prestation>(
        `${this.PRESTATION_PATH}/${siret}`,
        prestation,
      );
    } else {
      return this.http.put<Prestation>(
        `${this.PRESTATION_PATH}/${siret}`,
        prestation,
      );
    }
  }

  updateDatePrestation(prestation: Prestation): Observable<Prestation> {
    return this.http.put<Prestation>(`${this.PRESTATION_PATH}`, prestation);
  }

  deletePrestationById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.PRESTATION_PATH}/${id}`);
  }
  getPrestationsBySiret(siret: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.PRESTATION_PATH}/${siret}`);
  }
}
