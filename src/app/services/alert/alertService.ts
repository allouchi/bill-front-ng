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
  deleteMessage = ' été supprimé avec succès !';
  addMessageM = ' été ajouté avec succès !';
  addMessageF = ' été ajoutée avec succès !';
  updateMessage = ' été mis à jour avec succès !';
  logoutMessage = 'A bientôt !';
  loginMessage = 'Bienvenue, vous êtes connecté !';
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
    switch (composant) {
      case 'CONSULTANT':
      case 'USER':
      case 'CLIENT': {
        composant = 'Le ' + composant;
        break;
      }

      case 'COMPANY':
      case 'FACTURE':
      case 'TVA':
      case 'PRESTATION': {
        composant = 'La ' + composant;
        break;
      }
    }

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
      case 'AUTHENT': {
        message = this.loginMessage;
        break;
      }
      case 'LOGOUT': {
        message = this.logoutMessage;
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
