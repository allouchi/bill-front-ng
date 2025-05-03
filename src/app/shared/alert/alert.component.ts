import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert/alert.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'bill-alert',
  imports:[CommonModule],
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  message: string | null = null;
  type: 'success' | 'error' = 'success';

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.alerts$.subscribe(alert => {
      this.message = alert.message;
      this.type = alert.type;      
      setTimeout(() => this.message = null, 2000);
    });
  }
}
