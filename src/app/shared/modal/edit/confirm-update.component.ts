import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedDataService } from '../../../services/shared/shared-data-service';
import User from '../../../models/User';
import Company from '../../../models/Company';



interface Result {
  userLang: string;
  siret: string;
  company: Company | null;
  comment: string;
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
  selectedLanguage = 'fr';
  selectedSiret: string | undefined;
  companies: Company[] | null = [];

  languages = [
    { id: 'fr', descr: 'Français' },
    { id: 'en', descr: 'Anglais' }
  ];

  result: Result = {
    userLang: 'fr',
    siret: '',
    company: null,
    comment: "confirm"
  };

  constructor(private readonly activeModal: NgbActiveModal, private readonly sharedDataService: SharedDataService) { }


  ngOnInit(): void {

    this.user = this.sharedDataService.getSelectedUser();
    if (this.user) {
      this.selectedLanguage = this.user?.language;
    }
    this.companies = this.sharedDataService.getCompanies();
    if (this.companies) {
      this.selectedSiret = this.companies.find(c => c.checked == true)?.siret;
    }
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


  setLaguageValue(event: any) {
    this.selectedLanguage = (event.target as HTMLSelectElement).value;
    this.result = {
      ...this.result, userLang: this.selectedLanguage
    };
  }

  setCompanyValue(event: any) {
    const siret = (event.target as HTMLSelectElement).value;
    if (this.companies) {
      const selectedCompany = this.companies.find(c => c.siret === siret);
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
          company: selectedCompany
        };
      }
    }
  }
}
