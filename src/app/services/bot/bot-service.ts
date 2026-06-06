import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly BOT_PATH = `${environment.botURL}/bot/message`;
  private http = inject(HttpClient);

  sendMessage(message: string) {
    return this.http.post(
      `${this.BOT_PATH}`,
      message,
      { responseType: 'text' }
    );
  }
}
