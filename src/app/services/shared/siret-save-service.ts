import {  Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SiretDataService {
  siret: string = '';
  setSiret(siret: string) {
    this.siret = siret;
  }
  getSiret() {
    return this.siret;
  }

  clearSiret() {
    this.siret = '';
  }
}
