import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { LlmMessage } from '../../models/Chat';
import { env } from '../../../environments/env';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly BOT_PATH = `${env.apiURL}/chat`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  sendMessage(message: string) {
    return this.http.post(
      this.BOT_PATH,
      {
        messages: [{ role: 'user', content: message }],
      },
      { responseType: 'text' },
    );
  }
}
