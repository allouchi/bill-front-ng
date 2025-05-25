import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alert-messages.service';
import { IsAuthService } from '../../services/shared/islogin-service';
import { AuthResponse } from '../../models/AuthResponse';
import { SharedDataService } from '../../services/shared/shared-data-service';

@Component({
  selector: 'bill-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin!: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly alertService: AlertService,
    private readonly isAuthService: IsAuthService,
    private readonly sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  authenticate() {
    const username = this.formLogin.get('username')?.value;
    const password = this.formLogin.get('password')?.value;

    this.authService
      .login({ username: username, password: password })
      .subscribe({
        next: (response) => {
          this.onSuccess(response);
          this.isAuthService.setIsAuth(true);
        },
        error: (err) => this.onError(err.error),
      });
  }

  private onSuccess(authResponse: AuthResponse) {
    //this.alertService.show(respSuccess, 'success');
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

    const message: string = error.error;
    switch (message) {
      case 'Http failure': {
        this.alertService.show('Problème de connextion au serveur', 'error');
        break;
      }
      case 'Forbidden': {
        this.alertService.show(
          "Vos identifiants de connexion sont incorrects ou votre compte n'est plus valide",
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
