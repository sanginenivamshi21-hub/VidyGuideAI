export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProviderConfig {
  name: string;
  apiKey: string;
  models: {
    chat: string;
    json: string;
    streaming: string;
  };
  priority: number;
}

export interface AiProvider {
  readonly name: string;
  readonly priority: number;
  isAvailable(): boolean;
  generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    model?: string,
    historyMessages?: ChatMessage[],
    maxTokens?: number,
  ): Promise<string>;
  generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    model?: string,
    historyMessages?: ChatMessage[],
    maxTokens?: number,
  ): Promise<ReadableStream>;
  generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    model?: string,
    maxTokens?: number,
  ): Promise<T>;
}
