import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alert-messages.service';
import { IsAuthService } from '../../services/shared/islogin-service';
import { AuthResponse } from '../../models/AuthResponse';

@Component({
  selector: 'bill-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin!: FormGroup;
  isSubmit: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly alertService: AlertService,
    private readonly isAuthService: IsAuthService
  ) {}

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  authenticate() {
    this.isSubmit = true;   
    const username = this.formLogin.get('username')?.value;
    const password = this.formLogin.get('password')?.value;

    this.authService
      .login({ username: username, password: password })
      .subscribe({
        next: (response) => {
          this.onSuccess(response);        
        },
        error: (err) => this.onError(err),
      });
  }

  private onSuccess(authResponse: AuthResponse) {
    this.isAuthService.setIsAuth(true);   
    this.authService.saveToken(authResponse.token);
    this.authService.setUser(authResponse);
    this.alertService.show('AUTHENT', 'success');
    this.router.navigate(['bill-dashboard']);
  }

  private onError(error: any) {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.formLogin.patchValue({
      username: '',
      password: '',
    });

    this.alertService.show(error.error.message, 'error');
  }

  ngOnDestroy(): void {
    console.log('');
  }
}
