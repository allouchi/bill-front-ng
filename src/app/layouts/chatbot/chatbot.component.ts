import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  inject,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BotService } from '../../services/bot/bot-service';
import { AlertService } from '../../services/alert/alertService';
import { ClientService } from '../../services/clients/client-service';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  userInput = '';
  messages: { role: 'user' | 'bot', text: string }[] = [];

  private botService = inject(BotService);
  private alertService = inject(AlertService);
  private clientService = inject(ClientService);

  constructor(private router: Router) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
    setTimeout(() => this.scrollToBottomSmooth(), 100);
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  reload() {
    this.router.navigate(['/clients/read']);
  }

  sendMessage() {

    if (!this.userInput.trim()) return;

    const input = this.userInput;

    // message user
    this.messages.push({ role: 'user', text: input });
    this.userInput = '';

    this.autoScroll();

    this.isLoading = true;

    this.botService.sendMessage(input).subscribe({
      next: (res: string) => {
        // 🤖 réponse bot
        this.messages.push({ role: 'bot', text: res });
        this.isLoading = false;
        this.autoScroll(); // 🔥 scroll intelligent
        this.clientService.findClients().subscribe({
          next: () => {
            this.reload();
          }
        })
      },

      error: (err) => {
        this.alertService.showFunctionlError(err);
        this.autoScroll(); // 🔥 utile si message erreur affiché plus tard
        this.isLoading = false;
      }
    });
  }

  /* =========================
     SCROLL INTELLIGENT
  ========================== */

  autoScroll() {
    if (this.isUserNearBottom()) {
      this.scrollToBottomSmooth();
    }
  }

  scrollToBottomSmooth(): void {
    setTimeout(() => {
      if (!this.scrollContainer) return;

      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  }

  isUserNearBottom(): boolean {
    const threshold = 100;

    const el = this.scrollContainer?.nativeElement;
    if (!el) return true;

    const position = el.scrollTop + el.clientHeight;
    const height = el.scrollHeight;

    return position > height - threshold;
  }
}