import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user-service';
import { CommonModule } from '@angular/common';
import Company from '../../../models/Company';
import { CompanyService } from '../../../services/companies/company-service';
import RolesRef from '../../../models/RolesRef';

@Component({
  selector: 'bill-user-add',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
})
export class AddUserComponent implements OnInit {
  userForm!: FormGroup;
  companies: Company[] = [];
  roles: RolesRef[] = [];
  selectedRole: string = '';
  selectedCompany: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private readonly companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      siret: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
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
        console.log(this.selectedRole);
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }

  setRoleValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.userForm.patchValue({
      role: selectedValue,
    });
  }

  setCompanyValue(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.userForm.patchValue({
      siret: selectedValue,
    });
  }

  addUser(): void {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => alert('Utilisateur ajouté avec succès !'),
        error: () => alert("Erreur lors de l'ajout."),
      });
    } else {
      for (const [key, control] of Object.entries(this.userForm.controls)) {
        if (control.invalid) {
          control.markAsTouched();
        }
      }
    }
  }

  cancel() {}

  private onError(error: any) {
    const message: string = error.message;
  }
}
