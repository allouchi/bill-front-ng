import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService implements OnDestroy {
  private alertSubject = new Subject<{
    message: string;
    type: 'success' | 'error';
  }>();
  alerts$ = this.alertSubject.asObservable();

  show(message: string, type: 'success' | 'error' = 'success') {
    this.alertSubject.next({ message, type });
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
