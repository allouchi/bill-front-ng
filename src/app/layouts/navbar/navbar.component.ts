import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { SharedMessagesService } from '../../services/shared/messages.service';
import { SharedDataService } from '../../services/shared/shared-service';

@Component({
  selector: 'bill-navbar',
  imports: [RouterLink, HeaderComponent, AlertComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  selectedSocialReason: string = 'SBATEC CONSULTING';

  constructor(private readonly sharedMessagesService: SharedMessagesService,
    private readonly sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    const mapData = this.sharedDataService.getData();
    if (mapData) {
      this.selectedSocialReason = mapData.get("company").socialReason;
    }
  }

  clicked(event: MouseEvent) {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (link.textContent) {      
      this.sharedMessagesService.setMessage('LISTE DES ' + link.textContent);
    }
  }
}
