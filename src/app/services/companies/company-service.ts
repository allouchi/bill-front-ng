import { map, Observable } from 'rxjs';
import Company from '../../models/Company';
import { ICompanyService } from './company.interface';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../environments/env';
import { Injectable } from '@angular/core';

/**
 * Adapter for ICompanyService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */
@Injectable({ providedIn: 'root' })
export class CompanyService implements ICompanyService {
  private readonly apiURL = env.gateURL + '/company';
  private readonly COMPNAY_PATH: string = `${this.apiURL}` + '/api/companies';

  constructor(private readonly http: HttpClient) { }

  createOrUpdateCompany(company: Company): Observable<Company> {
    const isNew: boolean = !company.id || company.id === null;
    if (isNew) {
      return this.http.post<Company>(this.COMPNAY_PATH, company);
    } else {
      return this.http.put<Company>(this.COMPNAY_PATH, company);
    }
  }

  findCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.COMPNAY_PATH}`);
  }

  findCompanieBySiret(siret: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.COMPNAY_PATH}/${siret}`);
  }

  findByUserName(userName: string): Observable<Company[]> {
    const userPath = 'user';
    return this.http.get<Company[]>(
      `${this.COMPNAY_PATH}/${userPath}/${userName}`,
    );
  }
  deleteCompanyById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.COMPNAY_PATH}/${id}`);
  }

  switchCompany(company: Company): Observable<void> {
    return this.http.put<void>(`${this.COMPNAY_PATH}/switch`, company);
  }
}
