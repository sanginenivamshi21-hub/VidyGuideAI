export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  priority: number;
}

export interface AiProvider {
  readonly name: string;
  readonly priority: number;
  readonly config: AiProviderConfig;
  isAvailable(): boolean;
  generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    historyMessages?: ChatMessage[],
    maxTokens?: number,
  ): Promise<string>;
  generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    historyMessages?: ChatMessage[],
    maxTokens?: number,
  ): Promise<ReadableStream>;
  generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<T>;
}
