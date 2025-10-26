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
import { I18nService } from '../../shared/translate/i18nService';
import { UserService } from '../../services/user/user-service';
import User from '../../models/User';
import { SharedDataService } from '../../services/shared/shared-data-service';
import { TranslateModule } from '@ngx-translate/core';
import Company from '../../models/Company';
import { CompanyService } from '../../services/companies/company-service';

@Component({
  selector: 'bill-navbar',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  selectedInfos: string = '';
  observableEvent$ = new Subscription();
  authenticated$ = new Subscription();
  isAuth = false;
  user: User | null = null;
  companies: Company[] | null = [];
  company: Company | null = null;
  selectedLang: string = 'fr';

  constructor(
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly isAuthService: IsAuthService,
    private readonly router: Router,
    public readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly modalService: NgbModal,
    private readonly translateService: I18nService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly sharedDataService: SharedDataService
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
        if (result.comment === 'confirm') {
          this.logout();
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  updateUserService(user: User) {
    this.userService.editUser(user).subscribe({
      next: () => {
        this.alertService.show('UPDATE', 'USER', 'success');
      },
      error: (err) => this.onError(err),
    });
  }

  reload() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/companies/read']);
    });
  }

  updateCompanyService(company: Company) {
    this.companyService.createOrUpdateCompany(company).subscribe({
      next: () => {
        this.alertService.show('UPDATE', 'COMPANY', 'success');
        this.reload();
      },
      error: (err) => this.onError(err),
    });
  }

  private onError(error: any) {
    this.alertService.showFunctionlError(error);
  }

  switchParametres(event: Event) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    this.user = this.sharedDataService.getSelectedUser();
    this.company = this.sharedDataService.getSelectedCompany();
    modal.componentInstance.item = 'SwitchParametres';
    modal.componentInstance.composant = this.user;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          const userLang = this.authService.getUserLang();
          if (userLang) {
            this.translateService.switchLang(userLang);
          }
          if (result.company) {
            this.sharedDataService.setSelectCompany(result.company);
            this.sharedDataService.setSiret(result.company!.siret);
            this.updateCompanyService(result.company);
          }

          if (this.user) {
            if (userLang) {
              this.user.language = userLang;
            }
            this.updateUserService(this.user);
            this.sharedDataService.setSelectedUser(this.user);
          }
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
