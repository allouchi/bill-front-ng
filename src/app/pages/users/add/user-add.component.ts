import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user-service';
import { CommonModule } from '@angular/common';
import Company from '../../../models/Company';
import { CompanyService } from '../../../services/companies/company-service';
import User from '../../../models/User';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert-messages.service';
import GetMessagesEroor from '../../../shared/utils/messages-error';
import Role from '../../../models/Role';

@Component({
  selector: 'bill-user-add',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
})
export class AddUserComponent implements OnInit {
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
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      siret: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(3)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(3)]],
      role: [null, Validators.required],
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

   getByRole(role: string) : Role{    
     const selectedRole = this.roles.find(r => r.roleName == role);   
    return selectedRole!
  }


  addUser(): void {
    const selected: Role [] = [];
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
