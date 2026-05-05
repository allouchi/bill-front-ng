import { Observable } from "rxjs";



/**
 * Tva fetcher port
 *
 */
export interface IBotService {
  sendMessage(messages: string): Observable<string>;
}
