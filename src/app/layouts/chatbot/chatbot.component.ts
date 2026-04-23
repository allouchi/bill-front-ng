import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { BotService } from '../../services/bot/bot-service';
import { AlertService } from '../../services/alert/alertService';
import { IsAuthService } from '../../services/shared/islogin-service';
import { LlmMessage, UiMessage } from '../../models/Chat';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'bill-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userInput = '';
  messages: LlmMessage[] = [];

  isAuth = false;
  isOpen = false;
  isLoading = false;

  botService = inject(BotService);
  alertService = inject(AlertService);
  isAuthService = inject(IsAuthService);
  authService = inject(AuthService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit(): void {
    this.isAuthService
      .getAuthObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuth) => (this.isAuth = isAuth));
  }

  // ✅ SEND MESSAGE SIMPLE (sans streaming)
  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMsg: LlmMessage = {
      role: 'user',
      content: this.userInput,
    };

    this.messages.push(userMsg);

    const currentInput = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    this.botService.sendMessage(currentInput).subscribe({
      next: (res) => {
        const botMsg: LlmMessage = {
          role: 'assistant',
          content: res,
        };

        this.messages.push(botMsg);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        //this.alertService.error('Erreur lors de la réponse du bot');
        this.isLoading = false;
      },
    });

    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (!this.scrollContainer) return;

      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    });
  }
}
