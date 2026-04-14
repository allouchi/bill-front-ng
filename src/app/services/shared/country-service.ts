import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Commune } from './commune-interface';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly INSEE_API: string = `https://geo.api.gouv.fr/communes?codePostal=`;
  private apiUrl =
    'https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,translations';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  findByCodePotal(code: string): Observable<Commune[]> {
    return this.http.get<Commune[]>(`${this.INSEE_API}${code}&fields=nom`);
  }
}
