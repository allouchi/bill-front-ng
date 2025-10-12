import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user-service';
import { CommonModule } from '@angular/common';
import Company from '../../../models/Company';
import { CompanyService } from '../../../services/companies/company-service';
import User from '../../../models/User';
import { Router } from '@angular/router';

import Role from '../../../models/Role';
import { customEmailValidator } from '../../../shared/utils/numeric-fr.validator';
import { AlertService } from '../../../services/alert/alertService';

@Component({
  selector: 'bill-user-add',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
})
export class AddUserComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  companies: Company[] = [];
  roles: Role[] = [];
  selectedRole: string = '';
  selectedCompany: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) { }


  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      siret: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(3)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(3)]],
      role: [null, Validators.required],
    });

    this.initFields();
    this.loadCompanies();
    this.loadRoles();

  }

  initFields() {
    this.userForm.get('email')?.reset('');
    this.userForm.get('password')?.reset('');
    this.userForm.get('passwordConfirm')?.reset('');

    this.userForm.patchValue({
      email: ''
    });

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
        this.selectedRole = roles.find((r) => r.id == 1)?.roleName!;
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
    const selectedRole = this.roles.find(r => r.roleName == role);
    return selectedRole!
  }


  addUser(): void {
    const selected: Role[] = [];
    let role = this.getByRole(this.selectedRole);
    selected.push(role);

    const password = this.userForm.get('password')?.value;
    const passwordConfirm = this.userForm.get('passwordConfirm')?.value;
    if ((password == '' || passwordConfirm == '') || (password !== passwordConfirm)) {
      this.userForm.get('password')?.setErrors({ customError: true });
      this.userForm.get('passwordConfirm')?.setErrors({ customError: true });
      return;
    }
    this.userForm.get('password')?.setErrors(null);
    this.userForm.get('passwordConfirm')?.setErrors(null);

    if (this.userForm.valid) {
      let user: User = {
        id: null,
        email: this.userForm.get('email')?.value,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        siret: this.userForm.get('siret')?.value,
        password: this.userForm.get('password')?.value,
        roles: selected,
        activated: true,
      };

      this.userService.createUser(user).subscribe({
        next: () => {
          this.router.navigate(['users/read']);
          this.alertService.show('ADD', 'USER', 'success');
        },
        error: (err) => this.onError(err),
      });
    } else {
      for (const [, control] of Object.entries(this.userForm.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {
    this.router.navigate(['dashboard']);
  }

  private onError(error: any) {
    this.alertService.show('', error.error.message, 'error');
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }
}
