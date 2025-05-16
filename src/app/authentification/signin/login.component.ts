import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'bill-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  formLogin!: FormGroup;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly alertService: AlertService) { }

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  valider() {
    const userName = this.formLogin.get('username')?.value;

    const password = this.formLogin.get('password')?.value;
    this.auth.login({ username: userName, password: password }).subscribe({
      next: response => {
        this.onSuccess(response)
      },
      error: err => this.onError(err)
    });
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
    localStorage.setItem('token', respSuccess.token);
    this.router.navigate(['bill-dashboard']);
  }

  private onError(error: any) {
    const message: string = error.message;

    if (message.includes('Http failure')) {
      this.alertService.show('Problème serveur', 'error');
    } else {
      this.alertService.show(message, 'error');
    }
  }

  ngOnDestroy(): void {
    console.log('');
  }

}
