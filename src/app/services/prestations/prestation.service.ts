import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IPrestationService } from './prestation.interface';
import Prestation from '../../models/Prestation';

@Injectable({ providedIn: 'root' })
export class PrestationService implements IPrestationService {
 
  private readonly PRESTATION_PATH: string = "api/prestations";

  
  prestations: Prestation [] =  [
    { id: 1, siret: '85292702900011', quantite: 28},
    { id: 2, siret: '85292702900011', quantite: 35 },
    { id: 3, siret: '85292702900011', quantite: 42 }
  ];

  constructor(private readonly http: HttpClient) {}
  createOrUpdatePrestation(prestation: Partial<Prestation>, siret: string, templateChoice: boolean, moisFactureId: number): Observable<Prestation> {
    throw new Error('Method not implemented.');
  }
  modifyPrestation(prestation: Partial<Prestation>, siret: string): Observable<Prestation> {
    throw new Error('Method not implemented.');
  }
  deletePrestationById(id: number): Observable<string> {
    throw new Error('Method not implemented.');
  }
  getPrestationsBySiret(siret: string): Observable<Prestation[]> {
    //return this.http.get<Prestation[]>(`${this.PRESTATION_PATH}`);
    return of(this.prestations);
  } 

}
