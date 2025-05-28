import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert/alert-messages.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit, OnDestroy {
  message: string | null = null;
  type: 'success' | 'error' = 'success';

  constructor(private readonly alertService: AlertService) { }

  ngOnInit() {
    this.alertService.alerts$.subscribe((alert) => {
      this.message = alert.message;
      this.type = alert.type;

      if (this.type === 'success') {
        setTimeout(() => (this.message = null), 5000);
      } else if (this.type === 'error') {
        console.log('error');
      }
    });
  }

  ngOnDestroy(): void {
    this.message = null;
  }
}
