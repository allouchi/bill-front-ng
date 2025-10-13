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
  deleteMessageM = ' été supprimé avec succès !';
  deleteMessageF = ' été supprimée avec succès !';
  addMessageM = ' été ajouté avec succès !';
  addMessageF = ' été ajoutée avec succès !';
  updateMessageM = ' été mis à jour avec succès !';
  updateMessageF = ' été mise à jour avec succès !';
  logoutMessage = 'A bientôt !';
  loginMessage = 'Bienvenue, vous êtes connecté !';
  errorServerMessage = "Erreur s'est produite lors d'appel Serveur";
  female: boolean = true;

  private readonly alertSubject = new Subject<ToastData>();
  toast$ = this.alertSubject.asObservable();

  constructor() {
  }

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
        this.female = false;
        break;
      }

      case 'SOCIETE':
      case 'FACTURE':
      case 'TVA':
      case 'PRESTATION': {
        composant = 'La ' + composant;
        this.female = true;
        break;
      }
      case 'OPERATION': {
        composant = "L' " + composant;
        this.female = true;
        break;
      }
    }

    switch (action) {
      case 'DELETE': {
        if (this.female) {
          message = composant + this.deleteMessageF;
        } else {
          message = composant + this.deleteMessageM;
        }
        break;
      }

      case 'ADD': {
        if (this.female) {
          message = composant + this.addMessageF;
        } else {
          message = composant + this.addMessageM;
        }
        break;
      }

      case 'UPDATE': {
        if (this.female) {
          message = composant + this.updateMessageF;
        } else {
          message = composant + this.updateMessageM;
        }
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

      case 'SERVER_ERROR': {
        message = this.errorServerMessage;
        break;
      }

    }
    console.log("message : ", message)
    console.log("title : ", title)
    console.log("type : ", type)

    this.alertSubject.next({ message, title, type, delay });
  }

  clear() {
    this.alertSubject.next({ message: '', type: 'success' });
  }

}
