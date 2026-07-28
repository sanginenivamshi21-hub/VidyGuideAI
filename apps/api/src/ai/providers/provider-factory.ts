import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, ChatMessage } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private providers: AiProvider[] = [];
  private providerMap: Map<string, AiProvider> = new Map();

  constructor(
    groq: GroqProvider,
    gemini: GeminiProvider,
    openrouter: OpenRouterProvider,
  ) {
    this.providers = [groq, gemini, openrouter]
      .filter((p) => p.isAvailable())
      .sort((a, b) => a.priority - b.priority);

    for (const p of this.providers) {
      this.providerMap.set(p.name, p);
    }

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

  getProviderByName(name: string): AiProvider | undefined {
    return this.providerMap.get(name);
  }

  getRoutingTarget(route: string): string {
    const routing: Record<string, string> = {
      mentor: 'groq',
      'resume/builder': 'gemini',
      'resume/review': 'gemini',
      career: 'groq',
    };
    return routing[route] || this.providers[0]?.name || '';
  }

  private shouldLogProviderCall(provider: AiProvider): boolean {
    return this.providers.length > 1;
  }

  private async tryProvider<T>(
    provider: AiProvider,
    method: keyof AiProvider,
    args: any[],
    isFallback: boolean,
  ): Promise<T> {
    if (isFallback) {
      this.logger.log(`Falling back to ${provider.name}`);
    } else if (this.shouldLogProviderCall(provider)) {
      this.logger.log(`Routing to ${provider.name}`);
    }

    const providerArgs = isFallback
      ? this.stripModel(args)
      : args;

    return await (provider[method] as any)(...providerArgs);
  }

  private stripModel(args: any[]): any[] {
    const stripped = [...args];
    stripped[3] = undefined;
    return stripped;
  }

  async generateTextWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<string> {
    const errors: string[] = [];
    const ordered = this.buildCallOrder(preferredProvider);

    for (let i = 0; i < ordered.length; i++) {
      const provider = ordered[i];
      try {
        return await this.tryProvider<string>(
          provider, 'generateText',
          [systemPrompt, userPrompt, temperature, model, historyMessages, maxTokens],
          i > 0,
        );
      } catch (err: any) {
        const msg = `${provider.name}: ${err.message}`;
        this.logger.warn(`${provider.name} failed: ${err.message}`);
        errors.push(msg);
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
    preferredProvider?: string,
  ): Promise<ReadableStream> {
    const errors: string[] = [];
    const ordered = this.buildCallOrder(preferredProvider);

    for (let i = 0; i < ordered.length; i++) {
      const provider = ordered[i];
      try {
        return await this.tryProvider<ReadableStream>(
          provider, 'generateTextStream',
          [systemPrompt, userPrompt, temperature, model, historyMessages, maxTokens],
          i > 0,
        );
      } catch (err: any) {
        const msg = `${provider.name}: ${err.message}`;
        this.logger.warn(`${provider.name} streaming failed: ${err.message}`);
        errors.push(msg);
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
    preferredProvider?: string,
  ): Promise<T> {
    const errors: string[] = [];
    const ordered = this.buildCallOrder(preferredProvider);

    for (let i = 0; i < ordered.length; i++) {
      const provider = ordered[i];
      try {
        return await this.tryProvider<T>(
          provider, 'generateStructuredJson',
          [systemPrompt, userPrompt, temperature, model, maxTokens],
          i > 0,
        );
      } catch (err: any) {
        const msg = `${provider.name}: ${err.message}`;
        this.logger.warn(`${provider.name} JSON failed: ${err.message}`);
        errors.push(msg);
      }
    }

    this.logger.error('All AI providers failed for JSON', errors.join('; '));
    throw new Error(`AI structured JSON unavailable. All providers failed: ${errors.join('; ')}`);
  }

  private buildCallOrder(preferredProvider?: string): AiProvider[] {
    if (!preferredProvider || !this.providerMap.has(preferredProvider)) {
      return this.providers;
    }

    const preferred = this.providerMap.get(preferredProvider)!;
    const others = this.providers.filter((p) => p.name !== preferredProvider);

    return [preferred, ...others];
  }
}
