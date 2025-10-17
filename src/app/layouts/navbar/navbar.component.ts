import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SharedMessagesService } from '../../services/shared/messages.service';
import { Subscription } from 'rxjs';
import { LibelleCompanyService } from '../../services/shared/libelle-company-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service';
import { IsAuthService } from '../../services/shared/islogin-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmEditComponent } from '../../shared/modal/edit/confirm-update.component';
import { AlertService } from '../../services/alert/alertService';

@Component({
  selector: 'bill-navbar',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  selectedInfos: string = '';
  observableEvent$ = new Subscription();
  authenticated$ = new Subscription();
  isAuth = false;

  constructor(
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly isAuthService: IsAuthService,
    private readonly router: Router,
    public readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly modalService: NgbModal
  ) { }

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
          this.selectedInfos = message;
        } else {
          this.selectedInfos = '';
        }
      });
  }

  clicked(event: MouseEvent) {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (!this.isAuth) {
      this.sharedMessagesService.setMessage('');
      return;
    }

    if (link.textContent) {
      if (link.textContent == 'ADMINS') {
        this.sharedMessagesService.setMessage('LISTE DES UTILISATEURS');
      } else {
        this.sharedMessagesService.setMessage('LISTE DES ' + link.textContent);
      }
    }
  }

  logout() {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.sharedMessagesService.setMessage('');
    this.libelleCompanyService.setMessage('');
    this.router.navigate(['/dashboard']);
    this.alertService.show('LOGOUT', '', 'success');
  }

  userLogout(event: Event) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'Logout';

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.logout();
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  ngOnDestroy(): void {
    if (this.observableEvent$) {
      this.observableEvent$.unsubscribe();
    }
  }
}
