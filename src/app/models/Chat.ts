export type UiMessageType = 'user' | 'bot' | 'loading';

export interface UiMessage {
  content: string;
  type: UiMessageType;
}

export type LlmRole = 'user' | 'assistant';

export interface LlmMessage {
  role: LlmRole;
  content: string;
}
