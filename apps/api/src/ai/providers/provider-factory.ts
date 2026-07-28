import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, ChatMessage } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private providers: AiProvider[] = [];

  constructor(
    groq: GroqProvider,
    gemini: GeminiProvider,
    openrouter: OpenRouterProvider,
  ) {
    this.providers = [groq, gemini, openrouter]
      .filter((p) => p.isAvailable())
      .sort((a, b) => a.priority - b.priority);

    if (this.providers.length === 0) {
      this.logger.warn('No AI providers configured. AI features will return mock data.');
    } else {
      this.logger.log(
        `AI providers registered: ${this.providers.map((p) => `${p.name} (priority ${p.priority})`).join(', ')}`,
      );
    }
  }

  getPrimaryProvider(): AiProvider | null {
    return this.providers[0] || null;
  }

  getAllProviders(): AiProvider[] {
    return this.providers;
  }

  async generateTextWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      try {
        this.logger.debug(`Attempting ${provider.name} for generateText`);
        return await provider.generateText(systemPrompt, userPrompt, temperature, model, historyMessages, maxTokens);
      } catch (err: any) {
        this.logger.warn(`${provider.name} failed: ${err.message}`);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }
    this.logger.error('All AI providers failed', errors.join('; '));
    throw new Error(`AI service unavailable. All providers failed: ${errors.join('; ')}`);
  }

  async generateTextStreamWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      try {
        this.logger.debug(`Attempting ${provider.name} for streaming`);
        return await provider.generateTextStream(systemPrompt, userPrompt, temperature, model, historyMessages, maxTokens);
      } catch (err: any) {
        this.logger.warn(`${provider.name} streaming failed: ${err.message}`);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }
    this.logger.error('All AI providers failed for streaming', errors.join('; '));
    throw new Error(`AI streaming unavailable. All providers failed: ${errors.join('; ')}`);
  }

  async generateStructuredJsonWithFallback<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    model?: string,
    maxTokens = 4096,
  ): Promise<T> {
    const errors: string[] = [];
    for (const provider of this.providers) {
      try {
        this.logger.debug(`Attempting ${provider.name} for structured JSON`);
        return await provider.generateStructuredJson<T>(systemPrompt, userPrompt, temperature, model, maxTokens);
      } catch (err: any) {
        this.logger.warn(`${provider.name} JSON failed: ${err.message}`);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }
    this.logger.error('All AI providers failed for JSON', errors.join('; '));
    throw new Error(`AI structured JSON unavailable. All providers failed: ${errors.join('; ')}`);
  }
}
