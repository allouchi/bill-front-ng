

import { FooterComponent } from '../footer/footer.component';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AlertComponent } from '../../shared/alert/alert.component';
import { TranslateModule } from '@ngx-translate/core';




@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet, AlertComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

  title = 'bill-front-ng';

  constructor() {
  }
  ngOnInit(): void {

  }

}

