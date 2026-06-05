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
import { I18nService } from '../../shared/translate/i18nService';
import User from '../../models/User';
import { CompanyService } from '../../services/companies/company-service';
import Company from '../../models/Company';
import { SharedDataService } from '../../services/shared/shared-data-service';


@Component({
  selector: 'bill-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin!: FormGroup;
  isSubmit: boolean = false;
  currentLang = 'fr';
  companies: Company[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly alertService: AlertService,
    private readonly isAuthService: IsAuthService,
    private readonly i18nService: I18nService,
    private readonly companyService: CompanyService,
    private readonly sharedDataService: SharedDataService

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
      error: (err) => {
        this.onResponseError(err)
      },
    });
  }

  private onResponseSuccess(authResponse: AuthResponse) {
    this.updateCurrentLang(authResponse.user);
    this.isAuthService.setIsAuth(true);
    this.authService.setUserLang(authResponse.user.language);
    this.authService.setUser(authResponse);
    this.authService.setUser(authResponse);
    this.sharedDataService.setSiret(authResponse.user.siret);
    this.alertService.show('AUTHENT', '', 'success');
    this.loadCompanies();
    this.router.navigate(['dashboard']);
  }

  private onResponseError(error: any) {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.formLogin.patchValue({
      password: '',
    });
  }

  updateCurrentLang(user: User): void {
    this.currentLang = user.language;
    this.i18nService.switchLang(this.currentLang);
  }


  loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        // Réorganiser : les éléments "checked" d'abord
        this.companies.sort((a, b) => {
          if (a.checked === b.checked) return 0;
          return a.checked ? -1 : 1;
        });
        this.sharedDataService.setCompanies(this.companies);
      },
      error: (err) => {
        this.onResponseError(err);
      }
    });
  }

  ngOnDestroy(): void {
    console.log('');
  }
}
