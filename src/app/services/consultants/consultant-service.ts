import { HttpClient } from "@angular/common/http";
import Consultant from "../../models/Consultant";
import { Observable } from "rxjs";
import { IConsultantService } from "./consultant.interface";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";

/**
 * Adapter for IConsultantService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */

@Injectable({ providedIn: 'root' })
export class ConsultantService implements IConsultantService {

  private readonly apiURL = env.gateURL + '/consultant';
  private readonly CONSULTANT_PATH: string = `${this.apiURL}` + '/api/consultants';

  constructor(private readonly http: HttpClient) { }

  createOrUpdateConsultant(consultant: Consultant): Observable<Consultant> {
    const isNew: boolean = !consultant.id || consultant.id === 0;

    if (isNew) {
      return this.http.post<Consultant>(
        `${this.CONSULTANT_PATH}/add`,
        consultant,
      );
    } else {
      return this.http.put<Consultant>(
        `${this.CONSULTANT_PATH}/update`,
        consultant,
      );
    }
  }

  findConsultants(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(`${this.CONSULTANT_PATH}`);
  }

  deleteConsultantById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.CONSULTANT_PATH}/${id}`);
  }
}
