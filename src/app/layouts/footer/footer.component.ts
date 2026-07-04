import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { AuthService } from '../../services/auth/auth-service';
import { IsAuthService } from '../../services/shared/islogin-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bill-footer',
  imports: [ChatbotComponent],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  version?: string;
  copyright?: string;
  year!: number;
  isAuth = false;

  authenticated$ = new Subscription();

  private isAuthService = inject(IsAuthService);

  ngOnInit(): void {
    let date = new Date();
    this.year = date.getFullYear();
    this.authenticated$ = this.isAuthService
      .getAuthObservable()
      .subscribe((isAuth) => {
        this.isAuth = isAuth;
      });
  }

  ngOnDestroy(): void {
    if (this.authenticated$) {
      this.authenticated$.unsubscribe();
    }
  }
}
