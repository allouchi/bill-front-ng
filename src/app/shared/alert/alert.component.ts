import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { CommonModule } from '@angular/common';
import { AlertService, ToastData } from '../../services/alert/alertService';


interface ToastInternal extends ToastData {
  id: number;
  visible: boolean;
}

@Component({
  selector: 'alert-message',
  templateUrl: './alert.component.html',
  imports: [CommonModule],
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  toasts: ToastInternal[] = [];
  private sub!: Subscription;
  private counter = 0;

  constructor(private readonly alertService: AlertService) { }

  ngOnInit() {
    this.sub = this.alertService.toast$.subscribe((data) => {
      this.addToast(data);
    });
  }

  addToast(data: ToastData) {
    const id = ++this.counter;
    const toast: ToastInternal = { ...data, id, visible: false };
    this.toasts.push(toast);


    // small delay to let Angular render then add 'show' class (animation fade-in)
    setTimeout(() => {
      const t = this.toasts.find(x => x.id === id);
      if (t) t.visible = true;
    }, 10);

    // auto hide after delay
    timer(data.delay ?? 3000).subscribe(() => this.hideToast(id));
  }


  hideToast(id: number) {
    const t = this.toasts.find(x => x.id === id);
    if (!t) return;
    t.visible = false;
    // remove after fade-out (match CSS transition duration)
    setTimeout(() => {
      this.toasts = this.toasts.filter(x => x.id !== id);
    }, 300);
  }

  getAlert(): number {
    if (this.toasts) {
      return this.toasts.length;
    }
    return 0;
  }

  // si l'utilisateur clique sur la croix
  closeClicked(id: number) {
    this.hideToast(id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
