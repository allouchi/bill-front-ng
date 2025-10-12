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
  delete = ' été supprimée avec succès !';
  add = ' été ajoutée avec succès !';
  update = ' été mise à jour avec succès !';
  logout = 'A bientôt !'
  private alertSubject = new Subject<ToastData>();
  toast$ = this.alertSubject.asObservable();

  show(action: string, composant: string, message: string, title?: string, type: ToastData['type'] = 'success', delay = 3000) {
    switch (action) {
      case 'DELETE': {
        break;
      }

      case 'ADD': {
        break;
      }

      case 'UPDATE': {
        break;
      }

      case 'LOGOUT': {
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
