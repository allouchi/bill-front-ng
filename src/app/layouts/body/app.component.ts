

import { FooterComponent } from '../footer/footer.component';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    AlertComponent,
    TranslateModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'bill-front-ng';

  constructor(
    private translate: TranslateService,
    private readonly authService: AuthService,
  ) {
    translate.addLangs(['fr', 'en']);
    translate.setDefaultLang('fr');
    translate.use('fr'); // active la langue
  }
  ngOnInit(): void {
    this.authService.removeAll();
  }
}

