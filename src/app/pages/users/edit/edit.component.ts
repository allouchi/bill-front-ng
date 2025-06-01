import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user/user-service';
import { CommonModule } from '@angular/common';
import Company from '../../../models/Company';
import { CompanyService } from '../../../services/companies/company-service';
import User from '../../../models/User';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import GetMessagesEroor from '../../../shared/utils/messages-error';
import Role from '../../../models/Role';
import { SharedDataService } from '../../../services/shared/shared-data-service';
@Component({
  selector: 'bill-user-edit',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditUserComponent {
  userForm!: FormGroup;
  companies: Company[] = [];
  roles: Role[] = [];
  user!: User | null;
  selectedRole: string = '';
  selectedCompany: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.sharedDataService.getSelectedUser();
    this.userForm = this.fb.group({
      email: [
        { value: this.user?.email, disabled: true },
        [Validators.required, Validators.email],
      ],
      firstName: [
        { value: this.user?.firstName, disabled: true },
        Validators.required,
      ],
      lastName: [
        { value: this.user?.lastName, disabled: true },
        Validators.required,
      ],
      siret: [{ value: this.user?.siret, disabled: true }, Validators.required],
      password: [
        { value: this.user?.password, disabled: true },
        [Validators.required, Validators.minLength(3)],
      ],
      role: [{ value: this.user?.roles }, Validators.required],
    });

    this.loadCompanies();
    this.loadRoles();
  }

  loadCompanies() {
    this.companyService.findCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.selectedCompany = companies.find((c) => c.id == 1)?.siret!;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.selectedRole = roles.find((r) => r.id == 1)?.role!;
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setCompanyValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.userForm.patchValue({
      siret: selectedValue,
    });
  }

  setRoleValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.userForm.patchValue({
      role: selectedValue,
    });
  }

  getByRole(role: string): Role {
    const selectedRole = this.roles.find((r) => r.role == role);
    return selectedRole!;
  }

  editUser(): void {
    const selected: Role[] = [];
    let role = this.getByRole(this.selectedRole);
    selected.push(role!);

    if (this.userForm.valid) {
      let user: User = {
        id: this.user!.id,
        email: this.userForm.get('email')?.value,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        siret: this.userForm.get('siret')?.value,
        password: this.userForm.get('password')?.value,
        roles: selected,
        activated: true,
      };

      this.userService.editUser(user).subscribe({
        next: () => this.onSuccess('ADD,USER'),
        error: (err) => this.onError(err),
      });
    } else {
      for (const [key, control] of Object.entries(this.userForm.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['bill-dashboard']);
  }

  private onSuccess(respSuccess: any) {
    this.router.navigate(['users/read']);
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) {
    const message = GetMessagesEroor(error);
    this.alertService.show(message, 'error');
  }
}
