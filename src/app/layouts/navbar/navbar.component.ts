import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { ThemeService } from '../../services/shared/theme.service';
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
    RouterLinkActive,
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
  mobileOpen = false;

  readonly themeService = inject(ThemeService);

  /** Primary navigation entries (icon + i18n key + label + route). */
  readonly navItems = [
    { route: '/companies/read', icon: 'bi-building', key: 'menu.companys', label: 'SOCIETES' },
    { route: '/prestations/read', icon: 'bi-briefcase', key: 'menu.prestations', label: 'PRESTATIONS' },
    { route: '/factures/read', icon: 'bi-receipt', key: 'menu.factures', label: 'FACTURES' },
    { route: '/clients/read', icon: 'bi-people', key: 'menu.clients', label: 'CLIENTS' },
    { route: '/consultants/read', icon: 'bi-person-badge', key: 'menu.consultants', label: 'CONSULTANTS' },
    { route: '/operations/read', icon: 'bi-arrow-left-right', key: 'menu.operations', label: 'OPERATIONS' },
    { route: '/compte/read', icon: 'bi-wallet2', key: 'menu.compte', label: 'COMPTE' },
    { route: '/tvas/read', icon: 'bi-percent', key: 'menu.tva', label: 'TVAS' },
    { route: '/users/read', icon: 'bi-shield-lock', key: 'menu.admins', label: 'ADMINS' },
  ];

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
      } else if (link.textContent == 'COMPTE') {
        this.sharedMessagesService.setMessage(
          'LISTE DES ' + link.textContent + 'S',
        );
      } else {
        this.sharedMessagesService.setMessage('LISTE DES ' + link.textContent);
      }
    }
  }

  /** Navigation click from the redesigned menu (uses the item label, not DOM text). */
  onNavClick(label: string) {
    this.mobileOpen = false;
    if (!this.isAuth) {
      this.sharedMessagesService.setMessage('');
      return;
    }
    if (label === 'ADMINS') {
      this.sharedMessagesService.setMessage('LISTE DES UTILISATEURS');
    } else if (label === 'COMPTE') {
      this.sharedMessagesService.setMessage('LISTE DES ' + label + 'S');
    } else {
      this.sharedMessagesService.setMessage('LISTE DES ' + label);
    }
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  setLang(lang: string) {
    this.selectedLang = lang;
    this.translateService.switchLang(lang);
    this.authService.setUserLang(lang);
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  logout() {
    this.isAuthService.setIsAuth(false);
    this.authService.logout();
    this.sharedMessagesService.setMessage('');
    this.libelleCompanyService.setMessage('');
    this.alertService.show('LOGOUT', '', 'success');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  userLogout(event: Event) {
    event.preventDefault();
    this.logout();
  }

  updateUserService(user: User) {
    this.userService.editUser(user).subscribe({
      next: () => { },
      error: (err) => this.onError(err),
    });
  }

  reload() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/companies/read']);
    });
  }

  switchCompanyService(company: Company) {
    this.companyService.switchCompany(company).subscribe({
      next: () => {
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
    modal.componentInstance.item = 'SwitchParametres';
    modal.componentInstance.composant = this.user;

    modal.result
      .then((result) => {
        if (result.comment === 'confirm') {
          if (result.userLang) {
            this.user!.language = result.userLang;
            this.translateService.switchLang(result.userLang);
            this.updateUserService(this.user!);
          }
          if (result.company) {
            this.switchCompanyService(result.company);           
            this.sharedDataService.setSiret(result.company.siret);
            this.sharedDataService.setSelectCompany(result.company);
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
