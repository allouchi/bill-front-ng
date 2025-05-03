import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'bill-navbar',
  imports: [RouterLink, HeaderComponent, AlertComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  selectedCompany: string = 'SBATEC CONSULTING';

  constructor(private readonly sharedService: SharedService) {}

  ngOnInit(): void {}

  clicked(event: MouseEvent) {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (link.textContent) {
      this.sharedService.updateData('LISTE DES ' + link.textContent);
    }
  }
}
