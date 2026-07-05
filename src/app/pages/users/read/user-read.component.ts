import { Component, OnDestroy, OnInit } from '@angular/core';
import User from '../../../models/User';
import { Router } from '@angular/router';
import { WaitingComponent } from '../../../shared/waiting/waiting.component';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from '../../../shared/modal/delete/confirm-delete.component';
import { AuthService } from '../../../services/auth/auth-service';
import { UserService } from '../../../services/user/user-service';
import { UserNamePipe } from '../../../shared/pipes/userName-pipe';
import { CompanyService } from '../../../services/companies/company-service';
import Company from '../../../models/Company';
import { RaisonSocialePipe } from '../../../shared/pipes/raison-sociale.pipe';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert/alertService';
import { EntityCardComponent } from '../../../shared/entity-card/entity-card.component';
import { DetailModalComponent, DetailField } from '../../../shared/detail-modal/detail-modal.component';

@Component({
  selector: 'bill-User-read',
  standalone: true,
  imports: [WaitingComponent, UserNamePipe, RaisonSocialePipe, CommonModule, EntityCardComponent, DetailModalComponent],
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
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  selectedUser: User | null = null;
  detailOpen = false;

  openDetail(user: User): void {
    this.selectedUser = user;
    this.detailOpen = true;
  }
  closeDetail(): void {
    this.detailOpen = false;
  }
  onEditDetail(): void {
    if (this.selectedUser) {
      this.editUser(new Event('click'), this.selectedUser);
    }
    this.closeDetail();
  }
  onDeleteDetail(): void {
    if (this.selectedUser) {
      this.deleteUser(new Event('click'), this.selectedUser);
    }
    this.closeDetail();
  }
  fullName(u: User): string {
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  }
  rolesLabel(u: User): string {
    return (u.roles || []).map((r) => r.description).join(', ');
  }
  societyName(u: User): string {
    const match = this.companies.find((c) => c.siret === u.siret);
    return match ? match.socialReason : (u.siret || '');
  }
  get detailFields(): DetailField[] {
    const u = this.selectedUser;
    if (!u) return [];
    return [
      { label: 'Prénom', value: u.firstName, section: 'Identité' },
      { label: 'Nom', value: u.lastName },
      { label: 'Adresse email', value: u.email, wide: true },
      { label: 'Société', value: this.societyName(u), section: 'Accès' },
      { label: 'Langue', value: u.language },
      { label: 'Rôles', value: this.rolesLabel(u), wide: true },
      {
        label: 'Statut',
        value: u.activated ? 'Actif' : 'Inactif',
        tone: u.activated ? 'success' : 'default',
      },
    ];
  }

  get activeCount(): number {
    return this.filtredUsers.filter((u) => u.activated).length;
  }
  get inactiveCount(): number {
    return this.filtredUsers.filter((u) => !u.activated).length;
  }
  get displayedUsers(): User[] {
    if (this.statusFilter === 'active') {
      return this.filtredUsers.filter((u) => u.activated);
    }
    if (this.statusFilter === 'inactive') {
      return this.filtredUsers.filter((u) => !u.activated);
    }
    return this.filtredUsers;
  }

  constructor(
    private readonly modalService: NgbModal,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly sharedDataService: SharedDataService,
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly authService: AuthService,
    private readonly companyService: CompanyService
  ) { }

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
        this.users = users;
        this.filtredUsers = this.users;
        this.isLoaded = true;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  deleteUserService(id: number) {
    this.userService.deleteUser(id!).subscribe({
      next: () => {
        this.alertService.show('DELETE', 'USER', 'success');
        this.filtredUsers = this.users.filter((item) => item.id !== id);
        this.users = this.filtredUsers;
        this.router.navigate(['/users/read']);
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
          if (user && user.id) {
            this.deleteUserService(user.id);
          }
        }
      })
      .catch(() => {
        console.log('Annulé');
      });
  }

  editUser(event: Event, user: User) {
    event.preventDefault();
    this.sharedDataService.setSelectedUser(user);
    this.router.navigate(['users/edit', user.email]);
  }

  addUser() {
    this.sharedMessagesService.setMessage("Ajout d'un utilisateur");
    this.router.navigate(['users/add']);
  }

  private onError(error: any) {
    this.isLoaded = true;
    this.alertService.showFunctionlError(error);
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
