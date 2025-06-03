import { Component, OnDestroy, OnInit } from '@angular/core';
import User from '../../../models/User';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { ConfirmEditComponent } from '../../../shared/modal/edit/confirm-update.component';
import { UserService } from '../../../services/user/user-service';
import { UserNamePipe } from '../../../shared/pipes/userName-pipe';
import { CompanyService } from '../../../services/companies/company-service';
import Company from '../../../models/Company';
import { RaisonSocialePipe } from '../../../shared/pipes/raison-sociale.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bill-User-read',
  standalone: true,
  imports: [WaitingComponent, UserNamePipe, RaisonSocialePipe, CommonModule],
  templateUrl: './user-read.component.html',
  styleUrl: './user-read.component.css',
})
export class UserReadComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filtredUsers: User[] = [];
  companies: Company[] = [];
  isLoaded = false;
  isAdmin = false;
  parent = 'read';

  constructor(
    private readonly modalService: NgbModal,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly authService: AuthService,
    private readonly companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadUsers();
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        setTimeout(() => {
          this.companies = companies;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  private loadUsers() {
    this.userService.findUsers().subscribe({
      next: (users) => {
        setTimeout(() => {
          this.users = users;
          this.filtredUsers = this.users;
          this.isLoaded = true;
        }, 500);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteUser(event: Event, user: User) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmDeleteComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modal.componentInstance.item = 'User';
    modal.componentInstance.composant = user;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.onSuccess('EDIT,USER');
          this.filtredUsers = this.users.filter((item) => item.id !== user.id);
          this.users = this.filtredUsers;
          this.router.navigate(['/users/read']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  editUser(event: Event, user: User) {
    event.preventDefault();
    const modal = this.modalService.open(ConfirmEditComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });

    modal.componentInstance.item = 'User';
    modal.componentInstance.composant = user;

    modal.result
      .then((result) => {
        if (result === 'confirm') {
          this.sharedDataService.setSelectedUser(user);
          this.router.navigate(['users/edit']);
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  addUser() {
    this.sharedMessagesService.setMessage("Ajout d'un User");   
    this.router.navigate(['users/add']);
  }

  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    this.isLoaded = true;
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
