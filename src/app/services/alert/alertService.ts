import { Injectable, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { I18nService } from '../../shared/translate/i18nService';

export interface ToastData {
  message: string;
  title?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
  delay?: number; // ms

}

@Injectable({ providedIn: 'root' })
export class AlertService implements OnInit {
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
  messageSendSuccess = 'La facture a été envoyée avec succès';
  messageImport = 'Le fichier a été importé avec succès';
  session_expired =
    'Votre session a expiré. Nous vous invitons à vous reconnecter pour continuer.';
  currentLang = 'fr';

  private readonly alertSubject = new Subject<ToastData>();
  toast$ = this.alertSubject.asObservable();

  constructor(private readonly translateService: I18nService) {}

  FUNCIONAL_ERROR = [
    'RESOURCE_NOT_FOUND',
    'DB_ERROR',
    'DUPLICATE_DATA',
    'SESSION_EXPIRED',
    'TOKEN_INVALID',
  ];

  ngOnInit(): void {}

  updateCurrentLang(selectedLanguage: string): void {
    this.currentLang = selectedLanguage;
  }

  show(
    action: string,
    composant: string,
    message: string,
    title?: string,
    type: ToastData['type'] = 'success',
    delay = 7000,
  ) {
    switch (composant) {
      case 'USER': {
        composant = "L'utilisateur ";
        this.female = false;
        break;
      }

      case 'MAIL': {
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
      case 'SEND': {
        message = this.messageSendSuccess;
        break;
      }

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

      case 'IMPORT': {
        message = this.messageImport;
        break;
      }
    }

    this.translateService
      .getTranslation('alert.deleteMessageF')
      .subscribe((msg) => {
        //console.log('Message traduit:', msg);
      });

    this.alertSubject.next({ message, title, type, delay });
  }

  showFunctionlError(
    error: any,
    title: string = 'Echec',
    type: ToastData['type'] = 'danger',
    delay = 7000,
  ) {
    let message: string;
    let err;

    if (error && error.error) {
      if (typeof error.error === 'string') {
        err = JSON.parse(error.error);
        message = err.message;
      } else {
        err = error.error;
        message = err.message;
      }
      this.alertSubject.next({ message, title, type, delay });
    }
  }

  clear() {
    //this.alertSubject.next({ message: '', type: 'success' });
  }
}
