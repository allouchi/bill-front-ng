import {
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AlertService } from '../../services/alert/alertService';
import { BotService } from '../../services/bot/bot-service';

@Component({
  selector: 'bill-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent {

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  isOpen = false;
  isLoading = false;
  userInput = '';

  messages: { role: 'user' | 'bot', text: string }[] = [];

  private alertService = inject(AlertService);
  private botService = inject(BotService);

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

  private cleanSSE(chunk: string): string {
    return chunk
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.replace('data: ', '').trim())
      .join('');
  }

  async sendMessage() {

    if (!this.userInput.trim() || this.isLoading) return;

    const input = this.userInput.trim();

    this.messages.push({ role: 'user', text: input });
    this.userInput = '';

    this.isLoading = true;

    // bot placeholder
    this.messages.push({ role: 'bot', text: '' });

    let botMessage = '';

    try {

      const response = await this.botService.sendMessageStream(input);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming non supporté par le navigateur');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {

        const { value, done } = await reader.read();

        if (done) break;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });

        // 🔥 FIX IMPORTANT : SSE peut envoyer des lignes vides / "data:"
        const cleanedChunk = this.cleanSSE(chunk);

        if (cleanedChunk) {
          botMessage += cleanedChunk;

          this.messages[this.messages.length - 1].text = botMessage;
          this.autoScroll();
        }
      }

    } catch (err) {

      console.error(err);

      this.alertService.showFunctionlError(err);

      this.messages[this.messages.length - 1].text =
        "Erreur lors de la génération de la réponse.";

    } finally {
      this.isLoading = false;
    }
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
      const el = this.scrollContainer?.nativeElement;
      if (!el) return;

      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }, 0);
  }

  isUserNearBottom(): boolean {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return true;

    const threshold = 100;
    return el.scrollTop + el.clientHeight > el.scrollHeight - threshold;
  }
}