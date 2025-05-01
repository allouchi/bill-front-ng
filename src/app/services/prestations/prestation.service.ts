import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IPrestationService } from './prestation.interface';
import Prestation from '../../models/Prestation';
import { env } from '../../../environments/env';

@Injectable({ providedIn: 'root' })
export class PrestationService implements IPrestationService {
  private readonly apiURL = env.apiURL;
  private readonly PRESTATION_PATH: string = `${this.apiURL}` + '/prestations';

  constructor(private readonly http: HttpClient) {}
  createPrestation(
    prestation: Partial<Prestation>,
    siret: string,
    templateChoice: boolean,
    moisFactureId: number
  ): Observable<Prestation> {
    throw new Error('Method not implemented.');
  }
  updatePrestation(
    prestation: Partial<Prestation>,
    siret: string
  ): Observable<Prestation> {
    throw new Error('Method not implemented.');
  }
  deletePrestationById(id: number): Observable<string> {
    throw new Error('Method not implemented.');
  }
  getPrestationsBySiret(siret: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.PRESTATION_PATH}/${siret}`);
  }
}
