import { Injectable, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService implements OnInit, OnDestroy {
  private alertSubject = new Subject<{
    message: string;
    type: 'success' | 'error';
  }>();
  alerts$ = this.alertSubject.asObservable();
  message: string = '';

  ngOnInit(): void {}

  show(param: string, message: string, type: 'success' | 'error' = 'success') {
    if (message === 'error') {
      message = param;
      type = 'error';
      this.alertSubject.next({ message, type });
      return;
    }
    const p = param.split(',');
    let action = p[0];
    if (action == 'DELETE') {
      action = ' été supprimée avec succès !';
    }
    if (action == 'ADD') {
      action = ' été ajoutée avec succès !';
    }
    if (action == 'UPDATE') {
      action = ' été mise à jour avec succès !';
    }
     if (action == 'AUTHENT') {
       action = 'Vous êtes authentifié avec succès !!!';
       this.message = action;
     } else {
       this.message = "L'Entité " + `${p[1]}` + action;
     }
   
    message = this.message;
    this.alertSubject.next({ message, type: 'success' });
  }

  clear() {
    this.alertSubject.next({ message: '', type: 'success' });
  }

  ngOnDestroy(): void {
    if (this.alertSubject) {
      this.alertSubject.unsubscribe;
    }
  }
}
