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

    setTimeout(() => {
      this.scrollToBottomSmooth();
    }, 100);
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const input = this.userInput.trim();

    // Message utilisateur
    this.messages.push({
      role: 'user',
      text: input
    });

    this.userInput = '';
    this.isLoading = true;

    // Message bot vide (sera rempli progressivement)
    const botIndex = this.messages.length;
    this.messages.push({
      role: 'bot',
      text: ''
    });

    let botMessage = '';

    try {
      const response = await this.botService.sendMessageStream(input);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming non supporté par le navigateur');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      /*
        Buffer nécessaire car un chunk réseau
        peut couper une ligne SSE au milieu
      */
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        // On ajoute le nouveau morceau au buffer existant
        buffer += decoder.decode(value, { stream: true });

        // On découpe les lignes SSE standardisées (\n)
        const lines = buffer.split('\n');

        /*
          La dernière ligne peut être incomplète
          dong on la garde en attente dans le buffer
        */
        buffer = lines.pop() || '';

        for (const line of lines) {
          // On ignore les lignes vides ou de commentaire SSE
          if (!line.trim() || line.startsWith(':')) {
            continue;
          }

          if (!line.startsWith('data:')) {
            continue;
          }

          // 1. On retire UNIQUEMENT "data:" (les 5 premiers caractères)
          // On NE SUPPRIME PAS l'espace qui suit, il est précieux !
          let data = line.slice(5);

          console.log("DATA SÉLECTIONNÉE :", data);

          // Fin du flux SSE
          if (data.trim() === '[DONE]') {
            break;
          }

          /*
            Reconstruction du message en préservant 
            TOUS les espaces natifs du flux !
          */
          botMessage += data;

          /*
            Mise à jour immédiate de l'affichage
          */
          this.messages[botIndex].text = botMessage;
          this.autoScroll();
        }

      }

    } catch (err) {
      console.error('Erreur chatbot :', err);
      this.alertService.showFunctionlError(err);
      this.messages[botIndex].text = "Erreur lors de la génération de la réponse.";
    } finally {
      this.isLoading = false;
    }
  }

  /* =========================
      SCROLL
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
    return (el.scrollTop + el.clientHeight > el.scrollHeight - threshold);
  }
}