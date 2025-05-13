import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LibelleCompanyService {
  libelleSource$ = new BehaviorSubject<string>('');  
 
  getLibelleObservable(): Observable<string> {
    return this.libelleSource$.asObservable(); // expose la donnée en lecture seule
  }


  setMessage(newValue: string) {    
    this.libelleSource$.next(newValue);
  }
}
