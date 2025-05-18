import {  Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiretService {
  siret$ = new BehaviorSubject<string>('');

  getSiretObservable(): Observable<string> {
    return this.siret$.asObservable(); // expose la donnée en lecture seule
  }

  setSiret(data: string) {
    this.siret$.next(data);
  }
}
