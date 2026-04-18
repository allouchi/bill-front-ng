import { Observable } from "rxjs";
import Tva from "../../models/Tva";
import TvaInfos from "../../models/TvaInfos";
import Exercise from "../../models/Exercise";
import { Page } from '../../models/Page';
import { ChatMessage } from "./bot-service";
import { ChatResponse } from "../../models/ChatResponse";

/**
 * Tva fetcher port
 *
 */
export interface IBotService {
  sendMessage(messages: ChatMessage[]): Observable<ChatResponse>;
}
