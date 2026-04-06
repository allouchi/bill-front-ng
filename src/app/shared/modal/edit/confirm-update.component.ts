import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import User from '../../../models/User';
import Company from '../../../models/Company';
import { AuthService } from '../../../services/auth/auth-service';
import EmailClient from '../../../models/EmailClient';

interface Result {
  userLang: string;
  siret: string;
  company: Company | undefined | null;
  comment: string;
  mails: EmailClient[];
}

@Component({
  selector: 'bill-confirm-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-update.component.html',
  styleUrl: './confirm-update.component.css',
})
export class ConfirmEditComponent implements OnInit {
  item: any;
  composant: any;
  state: boolean = false;
  user: User | null = null;
  selectedLanguage: string | null = '';
  selectedSiret: string | undefined;
  companies: Company[] | null = [];
  selectedEmails: EmailClient[] = [];
  emails: EmailClient[] = [];

  languages = [
    { id: 'fr', descr: 'Français' },
    { id: 'en', descr: 'Anglais' },
  ];

  result: Result = {
    userLang: '',
    siret: '',
    company: null,
    mails: [],
    comment: 'confirm',
  };

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly sharedDataService: SharedDataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getUserLang() != null) {
      this.selectedLanguage = this.authService.getUserLang();
    }

    this.companies = this.sharedDataService.getCompanies();

    if (this.companies) {
      this.selectedSiret = this.companies.find((c) => c.checked == true)?.siret;
    }
    this.emails = this.composant;
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirmEdit(): void {
    if (this.item == 'Company') {
    }
    if (this.item == 'Prestation') {
    }
    if (this.item == 'Facture') {
    }
    if (this.item == 'Consultant') {
    }
    if (this.item == 'Client') {
    }
    if (this.item == 'Tva') {
    }
    if (this.item == 'User') {
    }
    if (this.item == 'Logout') {
    }

    if (this.item == 'SwitchParametres') {
      this.selectedLanguage = this.composant.language;
    }

    this.activeModal.close(this.result);
  }

  setEmailValue(event: Event) {
    const select = event.target as HTMLSelectElement;

    // Récupère tous les IDs sélectionnés
    const selectedIds = Array.from(select.selectedOptions).map((option) =>
      Number(option.value)
    );

    // Récupère les objets Email correspondants
    const selectedEmails = this.emails.filter((mail) =>
      selectedIds.includes(mail.id!)
    );

    this.result = {
      ...this.result,
      mails: selectedEmails,
    };
  }

  setLaguageValue(event: any) {
    this.selectedLanguage = (event.target as HTMLSelectElement).value;
    this.authService.setUserLang(this.selectedLanguage);
    this.result = {
      ...this.result,
      userLang: this.selectedLanguage,
    };
  }

  setCompanyValue(event: any) {
    const siret = (event.target as HTMLSelectElement).value;
    if (this.companies) {
      const selectedCompany = this.companies.find((c) => c.siret === siret);
      if (selectedCompany != null) {
        this.companies.forEach((item) => {
          if (item.siret === selectedCompany.siret) {
            item.checked = true;
          } else {
            item.checked = false;
          }
        });

        // 2. mise à jour de company
        this.result = {
          ...this.result,
          company: selectedCompany,
        };
      }
    }
  }
}
