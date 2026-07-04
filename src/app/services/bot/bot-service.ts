import { inject, Injectable, Injector } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth-service';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly BOT_PATH = `${environment.botURL}/bot/message`;
  private http = inject(HttpClient);

  constructor(private readonly injector: Injector) { }


  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  // Getters privés pour récupérer tes services "à la demande" sans bloquer l'initialisation d'Angular

  sendMessage(message: string) {
    return this.http.get(`${this.BOT_PATH}`, {
      params: new HttpParams().set('request', message),
      responseType: 'text'
    });
  }

  sendMessageStream(message: string): Promise<Response> {
    const token = this.authService.getAccessToken();

    return fetch(this.BOT_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ request: message })
    });
  }
}
