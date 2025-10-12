import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
  message: string;
  title?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
  delay?: number; // ms

}

@Injectable({ providedIn: 'root' })
export class AlertService {
  deleteMessage = ' été supprimée avec succès !';
  addMessage = ' été ajoutée avec succès !';
  updateMessage = ' été mise à jour avec succès !';
  logoutMessage = 'A bientôt !';
  private alertSubject = new Subject<ToastData>();
  toast$ = this.alertSubject.asObservable();

  show(
    action: string,
    composant: string,
    message: string,
    title?: string,
    type: ToastData['type'] = 'success',
    delay = 7000
  ) {
    composant =
      'Le composant ' +
      composant.charAt(0).toUpperCase() +
      composant.slice(1).toLowerCase();

    switch (action) {
      case 'DELETE': {
        message = composant + this.deleteMessage;
        break;
      }

      case 'ADD': {
        message = composant + this.addMessage;
        break;
      }

      case 'UPDATE': {
        message = composant + this.updateMessage;
        break;
      }

      case 'LOGOUT': {
        message = composant + this.logoutMessage;
        break;
      }
    }

    this.alertSubject.next({ message, title, type, delay });
  }

  clear() {
    this.alertSubject.next({ message: '', type: 'success' });
  }

  ngOnDestroy(): void {
    if (this.alertSubject) {
      this.alertSubject.unsubscribe();
    }
  }
}
