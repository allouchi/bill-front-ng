import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { SharedMessagesService } from '../../services/shared/messages.service';
import { SharedDataService } from '../../services/shared/shared-service';
import { Subscription } from 'rxjs';
import { LibelleCompanyService } from '../../services/shared/libelle-company-service';

@Component({
  selector: 'bill-navbar',
  imports: [RouterLink, HeaderComponent, AlertComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  selectedSocialReason: string = 'SBATEC CONSULTING';
  observableEvent$ = new Subscription();

  constructor(
    private readonly sharedMessagesService: SharedMessagesService,
    private readonly sharedDataService: SharedDataService,
    private readonly libelleCompanyService: LibelleCompanyService
  ) {}

  ngOnInit(): void {
    this.observableEvent$ = this.libelleCompanyService
      .getLibelleObservable()
      .subscribe((message) => {
        this.selectedSocialReason = message;
      });

    const mapData = this.sharedDataService.getData();
    if (mapData && mapData.get('company')) {
      this.selectedSocialReason = mapData.get('company').socialReason;
    }
  }

  clicked(event: MouseEvent) {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (link.textContent) {
      this.sharedMessagesService.setMessage('LISTE DES ' + link.textContent);
    }
  }

  ngOnDestroy(): void {
    if (this.observableEvent$) {
      this.observableEvent$.unsubscribe();
    }
  }
}
