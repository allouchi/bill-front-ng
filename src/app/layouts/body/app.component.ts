import { FooterComponent } from '../footer/footer.component';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth-service';
import { ThemeService } from '../../services/shared/theme.service';
import { routeFade } from '../../shared/animations/app.animations';

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
  animations: [routeFade],
})
export class AppComponent implements OnInit {
  title = 'bill-front-ng';

  private readonly themeService = inject(ThemeService);

  constructor(
    private translate: TranslateService,
    private readonly authService: AuthService,
  ) {
    translate.addLangs(['fr', 'en']);
    translate.setDefaultLang('fr');
    translate.use('fr'); // active la langue
  }

  ngOnInit(): void {
    this.themeService.init();
    this.authService.removeAll();
  }

  prepareRoute(outlet: RouterOutlet): string {
    return (
      outlet?.activatedRouteData?.['animation'] ??
      outlet?.activatedRoute?.snapshot?.url?.map((s) => s.path).join('/') ??
      ''
    );
  }
}
