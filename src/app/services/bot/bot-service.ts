import { Observable, of } from "rxjs";
import Tva from "../../models/Tva";

import { HttpClient, HttpParams } from '@angular/common/http';
import Exercise from '../../models/Exercise';
import TvaInfos from '../../models/TvaInfos';
import { env } from '../../../environments/env';
import { Injectable } from '@angular/core';
import { Page } from '../../models/Page';
import { IBotService } from "./bot.interface";
import { ChatResponse } from "../../models/ChatResponse";

/**
 * Adapter for ITvaService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */

export interface ChatMessage {
  role: string; // "user" | "assistant" | "system"
  text: string;
}

@Injectable({ providedIn: 'root' })
export class BotService implements IBotService {
  private readonly apiURL = env.apiURL;
  private readonly BOT_PATH: string = `${this.apiURL}` + '/chat';

  constructor(private readonly http: HttpClient) {}

  sendMessage(messages: ChatMessage[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.BOT_PATH}`, // adapte au mapping de ton controller
      messages,
    );
  }
}
