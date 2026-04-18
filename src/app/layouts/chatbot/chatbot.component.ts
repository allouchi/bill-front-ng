import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { BotService } from '../../services/bot/bot-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alertService';
import { Subscription } from 'rxjs';
import { IsAuthService } from '../../services/shared/islogin-service';

@Component({
  selector: 'bill-chatbot',
  standalone: true, // 🔥 IMPORTANT
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit {
  userInput: string = '';
  messages: { content: string; type: string }[] = [];
  isAuth= false;
  authenticated$ = new Subscription();
  botService = inject(BotService);
  alertService = inject(AlertService);
  isAuthService = inject(IsAuthService);

  isOpen: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit(): void {
    this.authenticated$ = this.isAuthService
      .getAuthObservable()
      .subscribe((isAuth) => {
        this.isAuth = isAuth;
      });
  }

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;

    // 👤 message user
    this.messages.push({ content: input, type: 'user' });

    // 🤖 loader UI uniquement (NE PAS envoyer au backend)
    this.messages.push({ content: '...', type: 'bot' });

    const payload = this.messages
      .filter((m) => m.content !== '...') // 🔥 important
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        text: m.content,
      }));

    this.botService.sendMessage(payload).subscribe({
      next: (response) => {
        // remove loader
        this.messages.pop();

        // add bot response
        this.messages.push({
          content: response.content,
          type: 'bot',
        });

        this.scrollToBottom();
      },
      error: (error) => {
        this.messages.pop();

        this.messages.push({
          content: 'Erreur serveur 😢',
          type: 'bot',
        });
        this.onError(error);
      },
    });

    this.userInput = '';
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  private onError(error: any): void {
    this.alertService.showFunctionlError(error);
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (!this.scrollContainer) return;

      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }, 100);
  }
}
