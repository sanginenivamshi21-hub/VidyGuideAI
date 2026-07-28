import { Injectable, Logger } from '@nestjs/common';
import { ProviderFactory } from './providers/provider-factory';
import type { ChatMessage } from './providers/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: ProviderFactory) {}

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    model = 'llama-3.3-70b-versatile',
    historyMessages: ChatMessage[] = [],
    maxRetries = 3,
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<string> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      this.logger.warn('No AI providers configured. Returning mock text.');
      return 'Mock text completion for VidyGuideAI V3 foundation verification.';
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.providerFactory.generateTextWithFallback(
          systemPrompt,
          userPrompt,
          temperature,
          model,
          historyMessages,
          maxTokens,
          preferredProvider,
        );
      } catch (err: any) {
        lastError = err;
        this.logger.error(`AI call failed (attempt ${attempt}/${maxRetries}): ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastError || new Error('AI service failed after all retries and provider fallbacks');
  }

  async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    model = 'llama-3.3-70b-versatile',
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<ReadableStream> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      throw new Error('AI service not configured.');
    }

    return this.providerFactory.generateTextStreamWithFallback(
      systemPrompt,
      userPrompt,
      temperature,
      model,
      historyMessages,
      maxTokens,
      preferredProvider,
    );
  }

  async generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    model = 'llama-3.1-8b-instant',
    maxRetries = 3,
    maxTokens = 4096,
    preferredProvider?: string,
  ): Promise<T> {
    const primary = this.providerFactory.getPrimaryProvider();
    if (!primary) {
      this.logger.warn('No AI providers configured. Returning mock JSON object.');
      return { mock: true } as unknown as T;
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.providerFactory.generateStructuredJsonWithFallback<T>(
          systemPrompt,
          userPrompt,
          temperature,
          model,
          maxTokens,
          preferredProvider,
        );
      } catch (err: any) {
        lastError = err;
        this.logger.error(`AI JSON call failed (attempt ${attempt}/${maxRetries}): ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastError || new Error('AI JSON service failed after all retries and provider fallbacks');
  }
}
