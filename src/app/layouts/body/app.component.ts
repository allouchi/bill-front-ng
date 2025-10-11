

import { FooterComponent } from '../footer/footer.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bill-front-ng';
}

