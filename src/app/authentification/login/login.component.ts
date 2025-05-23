import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alert-messages.service';
import { IsAuthService } from '../../services/shared/islogin-service';

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
    private readonly isAuthService: IsAuthService
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
        next: (jwt) => {
          this.onSuccess(jwt);
          this.isAuthService.setIsAuth(true);
        },
        error: (err) => this.onError(err.error),
      });
  }

  private onSuccess(jwt: any) {
    //this.alertService.show(respSuccess, 'success');
    this.authService.saveToken(jwt);
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
        this.alertService.show('UserName/Mot de passe incorrect', 'error');
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
