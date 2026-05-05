import { inject, Injectable } from '@angular/core';
import { env } from '../../../environments/env';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly BOT_PATH = `${env.botURL}/bot/message`;
  private http = inject(HttpClient);

  sendMessage(message: string) {
    return this.http.post(
      `${this.BOT_PATH}`,
      message,
      { responseType: 'text' }
    );
  }
}
