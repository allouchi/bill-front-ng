import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'bill-navbar',
  imports: [RouterLink, HeaderComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  selectedRoute: string = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    console.log('------------------', this.router.url);

    console.log('------------------', this.route.snapshot.paramMap);
  }

  clicked(event: MouseEvent) {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    if (link.textContent) {
      this.selectedRoute = link.textContent;
    }
  }
}
