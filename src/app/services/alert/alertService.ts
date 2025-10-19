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
  female: boolean = true;
  serverError = 'Le serveur est inaccessible !';
  downloadFileError = "Le fichier inexistant ou endommagé"

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
      case 'USER':
        {
          composant = "L'utilisateur ";
          this.female = false;
          break;
        }
      case 'CONSULTANT':
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

    }

    this.alertSubject.next({ message, title, type, delay });
  }

  showFunctionlError(
    error: any,
    title: string = 'Echec',
    type: ToastData['type'] = 'danger',
    delay = 7000
  ) {

    let message: string;

    if (error.error.code === 'PDF_ERROR') {
      message = this.downloadFileError;
    } else if (error.message && error.message.includes('Http failure')) {
      message = message = this.serverError;
    } else {
      message = error.error.message;
    }

    this.alertSubject.next({ message, title, type, delay });
  }

  clear() {
    //this.alertSubject.next({ message: '', type: 'success' });
  }

}
