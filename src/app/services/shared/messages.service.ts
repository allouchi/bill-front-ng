import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedMessagesService {
  messageSource$ = new BehaviorSubject<string>('');  
 
  getMessageObservable(): Observable<string> {
    return this.messageSource$.asObservable(); // expose la donnée en lecture seule
  }


  setMessage(newValue: string) {    
    this.messageSource$.next(newValue);
  }
}
