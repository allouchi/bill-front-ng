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

import { IsAuthService } from '../../services/shared/islogin-service';
import { AuthResponse } from '../../models/AuthResponse';
import { AuthResquest } from '../../models/AuthRequest';
import { customEmailValidator } from '../../shared/utils/numeric-fr.validator';
import { AlertService } from '../../services/alert/alertService';


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
  ) { }

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      username: ['', [Validators.required, customEmailValidator]],
      password: ['', Validators.required],
      rememberMe: [''],
    });
  }

  authenticate() {
    this.isSubmit = true;
    const username = this.formLogin.get('username')?.value;
    const password = this.formLogin.get('password')?.value;
    const rememberMe = this.formLogin.get('rememberMe')?.value;

    let authRequest = new AuthResquest();
    authRequest.username = username;
    authRequest.password = password;
    authRequest.rememberMe = rememberMe;


    this.authService.login(authRequest).subscribe({
      next: (response) => {
        this.onResponseSuccess(response);
      },
      error: (err) => this.onResponseError(err),
    });
  }

  private onResponseSuccess(authResponse: AuthResponse) {
    this.isAuthService.setIsAuth(true);
    this.authService.setUser(authResponse);
    this.alertService.show('AUTHENT', '', 'success');
    this.router.navigate(['dashboard']);
  }

  private onResponseError(error: any) {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.formLogin.patchValue({
      password: '',
    });

    this.showMessage(error);
  }

  private showMessage(error: any) {
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    console.log('');
  }
}
