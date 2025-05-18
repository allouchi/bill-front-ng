import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class isAuthService {
  isAuthSource$ = new BehaviorSubject<boolean>(false);  
 
  getAuthObservable(): Observable<boolean> {
    return this.isAuthSource$.asObservable(); 
  }


  setIsAuth(newValue: boolean) {    
    this.isAuthSource$.next(newValue);
  }
}
