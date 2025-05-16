

import { FooterComponent } from '../footer/footer.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AppInitService } from '../../services/shared/app-init-service';

@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bill-front-ng';

  constructor(private readonly initService: AppInitService) {}

  ngOnInit() {
    this.initService.initAppWithSubscribe();
  }
}

