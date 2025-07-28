import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { env } from "../../../environments/env";
import { Injectable } from "@angular/core";
import Operation from "../../models/Operation";

/**
 *
 * @author M.ALIANNE
 * @since 18/107/2025
 */

@Injectable({ providedIn: 'root' })
export class OperationService {
  private readonly apiURL = env.apiURL;
  private readonly OPERATION_PATH: string = `${this.apiURL}` + '/operations';

  constructor(private readonly http: HttpClient) {}

  createOrUpdateOperation(operation: Operation): Observable<Operation> {
    const isNew: boolean = !operation.id || operation.id === 0;
    if (isNew) {
      return this.http.post<Operation>(`${this.OPERATION_PATH}/add`, operation);
    } else {
      return this.http.put<Operation>(`${this.OPERATION_PATH}/edit`, operation);
    }
  }

  getOperations(siret: string): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.OPERATION_PATH}/${siret}`);
  }

  deletedOperationById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.OPERATION_PATH}/${id}`);
  }
}
