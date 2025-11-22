import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
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
import GetMessagesError from '../../../shared/utils/messages-error';
import Role from '../../../models/Role';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import { SharedMessagesService } from '../../../services/shared/messages.service';
import { customEmailValidator } from '../../../shared/utils/numeric-fr.validator';
import { AlertService } from '../../../services/alert/alertService';

@Component({
  selector: 'bill-user-edit',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css',
})
export class EditUserComponent {
  userForm!: FormGroup;
  companies: Company[] = [];
  roles: Role[] = [];
  user!: User | null;
  selectedRole: string = '';
  selectedCompany: string = '';
  showPassword: boolean = false;
  message: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly alertService: AlertService,
    private readonly sharedDataService: SharedDataService,
    private readonly router: Router,
    private readonly sharedMessagesService: SharedMessagesService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.user = this.sharedDataService.getSelectedUser();
    this.userForm = this.fb.group({
      email: [
        { value: this.user?.email, disabled: true },
        [Validators.required, customEmailValidator],
      ],
      firstName: [
        { value: this.user?.firstName, disabled: true },
        Validators.required,
      ],
      lastName: [
        { value: this.user?.lastName, disabled: true },
        Validators.required,
      ],
      password: [''],
      passwordConfirm: [''],
      siret: [{ value: this.user?.siret }, Validators.required],
      roles: this.fb.array([]),
    });
    this.loadCompanies();
    this.initPassword();
  }

  initPassword() {
    if (this.showPassword) {
      this.message = 'Cacher les champs mot de passe ?'
    } else {
      this.message = 'Montrer les champs mot de passe ?'
    }
    this.userForm.get('password')?.reset(null);
    this.userForm.get('passwordConfirm')?.reset(null);
  }
  showPassord() {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.message = 'Cacher les champs mot de passe ?'
    } else {
      this.message = 'Montrer les champs mot de passe ?'
    }
  }

  private addCheckboxes() {
    const checkedRoles = this.user?.roles.map((r) => r.roleName);

    const rolesFormArray = this.userForm.get('roles') as FormArray;
    this.roles.forEach((role) => {
      const isSelected = checkedRoles!.includes(role.roleName);
      rolesFormArray.push(new FormControl(isSelected));
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
        this.addCheckboxes();
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  get rolesFormArray() {
    return this.userForm.get('roles') as FormArray;
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

  editUser(): void {
    this.sharedMessagesService.setMessage("Mise à jour d'un utilisateur");
    const rolesValue: boolean[] = this.userForm.value.roles;
    const selectedRoles = rolesValue
      .map((checked, i) => (checked ? this.roles[i] : null))
      .filter((role): role is Role => role !== null);
    const password = this.userForm.get('password')?.value;
    const passwordConfirm = this.userForm.get('passwordConfirm')?.value;
    if (
      (password != '' || passwordConfirm != '') &&
      password !== passwordConfirm
    ) {
      this.userForm.get('password')?.setErrors({ customError: true });
      this.userForm.get('passwordConfirm')?.setErrors({ customError: true });
      return;
    }
    this.userForm.get('password')?.setErrors(null);
    this.userForm.get('passwordConfirm')?.setErrors(null);

    if (this.userForm.valid) {
      const password = this.userForm.get('password')?.value;
      if (password) {
        this.user!.password = password;
      }
      let user: User = {
        id: this.user!.id,
        email: this.user!.email,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        siret: this.userForm.get('siret')?.value,
        password: this.user!.password,
        roles: selectedRoles,
        activated: true,
        language: 'fr'
      };

      this.userService.editUser(user).subscribe({
        next: () => {
          this.router.navigate(['users/read']);
          this.alertService.show('UPDATE', 'USER', 'success');
        },
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
    this.router.navigate(['users/read']);
  }

  private onError(error: any) {
    const message = GetMessagesError(error);
    this.alertService.show('', message, 'error');
  }
}
