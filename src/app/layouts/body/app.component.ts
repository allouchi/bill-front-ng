

import { FooterComponent } from '../footer/footer.component';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'bill-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'bill-front-ng';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/companies').subscribe({
      next: (res) => console.log('Réponse API', res),
      error: (err) => console.error('Erreur API', err),
    });
  }
}

