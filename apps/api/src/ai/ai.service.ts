import { Injectable, Logger } from '@nestjs/common';
import { ProviderFactory } from './providers/provider-factory';
import type { ChatMessage } from './providers/ai-provider.interface';

const MAX_HISTORY_MESSAGES = 10;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: ProviderFactory) {}

  private trimHistory(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length <= MAX_HISTORY_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_HISTORY_MESSAGES);
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<string> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      this.logger.warn('No AI providers configured. Returning mock text.');
      return 'Mock text completion for VidyGuideAI V3 foundation verification.';
    }

    const history = this.trimHistory(historyMessages);
    return this.providerFactory.generateTextWithFallback(
      systemPrompt,
      userPrompt,
      temperature,
      history,
      maxTokens,
      preferredProvider,
    );
  }

  async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<ReadableStream> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      throw new Error('AI service not configured.');
    }

    const history = this.trimHistory(historyMessages);
    return this.providerFactory.generateTextStreamWithFallback(
      systemPrompt,
      userPrompt,
      temperature,
      history,
      maxTokens,
      preferredProvider,
    );
  }

  async generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
    preferredProvider?: string,
  ): Promise<T> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      this.logger.warn('No AI providers configured. Returning mock JSON object.');
      return { mock: true } as unknown as T;
    }

    return this.providerFactory.generateStructuredJsonWithFallback<T>(
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      preferredProvider,
    );
  }
}
