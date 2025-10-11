import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
  message: string;
  title?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
  delay?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastData>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, title?: string, type: ToastData['type'] = 'success', delay = 3000) {
    this.toastSubject.next({ message, title, type, delay });
  }
}
