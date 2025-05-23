import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { SharedMessagesService } from '../../services/shared/messages.service';
import { SharedDataService } from '../../services/shared/shared-data-service';
import { Subscription } from 'rxjs';
import { LibelleCompanyService } from '../../services/shared/libelle-company-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth/auth-service';
import { UserService } from '../../services/user/user-service';
import { IsAuthService } from '../../services/shared/islogin-service';

@Component({
  selector: 'bill-navbar',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    AlertComponent,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  selectedSocialReason: string = 'SBATEC CONSULTING';
  observableEvent$ = new Subscription();
  authenticated$ = new Subscription();
  isAuth = false;

  constructor(
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly sharedDataService: SharedDataService,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly isAuthService: IsAuthService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.authenticated$ = this.isAuthService
      .getAuthObservable()
      .subscribe((isAuth) => {
        this.isAuth = isAuth;
      });

    this.observableEvent$ = this.libelleCompanyService
      .getLibelleObservable()
      .subscribe((message) => {
        if (this.isAuth) {
          this.selectedSocialReason = message;
        } else {
          this.selectedSocialReason = '';
        }
      });

    const mapData = this.sharedDataService.getData();
    if (mapData && mapData.get('company')) {
      this.selectedSocialReason = mapData.get('company').socialReason;
    }
  }

  clicked(event: MouseEvent) {
    if (!this.isAuth) {
      this.sharedMessagesService.setMessage('');
      return;
    }
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (link.textContent) {
      this.sharedMessagesService.setMessage('LISTE DES ' + link.textContent);
    }
  }

  logout() {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.sharedMessagesService.setMessage('');
    this.userService.logout().subscribe((response) => {});
    this.router.navigate(['/logout']);
  }

  ngOnDestroy(): void {
    if (this.observableEvent$) {
      this.observableEvent$.unsubscribe();
    }
  }
}
