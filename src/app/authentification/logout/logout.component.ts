import { Component, OnDestroy, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { isAuthService } from '../../services/shared/islogin-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bill-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent implements OnInit, OnDestroy {
  authenticated$ = new Subscription();
  isAuth = false;
  constructor(private readonly isAuthService: isAuthService
    
  ) {}

  ngOnInit(): void {
    this.isAuthService.setIsAuth(false);
  }
  ngOnDestroy(): void {}
}
