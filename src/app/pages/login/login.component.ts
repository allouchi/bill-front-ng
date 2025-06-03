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
    this.authService.saveToken(authResponse.jwt);
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

    const code: string = error.code;
    switch (code) {
      case 'ERR_SERVER_DOWN': {
        this.alertService.show('Problème de connextion au serveur', 'error');
        break;
      }
      case 'RESOURCE_NOT_FOUND': {
        this.alertService.show(
          "Vos identifiants sont incorrects ou votre compte n'est plus valide",
          'error'
        );
        break;
      }
      case 'ACCESS_DENIED': {
        this.alertService.show(
          "Vous n'êtes pas autorisé à accéder à cette ressource",
          'error'
        );
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  ngOnDestroy(): void {
    console.log('');
  }
}
