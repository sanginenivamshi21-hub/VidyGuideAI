import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, ChatMessage } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';
import { ProviderHealth } from './provider-health';

const MAX_RETRIES_PER_PROVIDER = 2;
const RETRY_DELAYS_MS = [1000, 2000];

export class AllProvidersFailedError extends Error {
  constructor() {
    super('All AI providers are temporarily unavailable. Please try again shortly.');
    this.name = 'AllProvidersFailedError';
  }
}

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private providers: AiProvider[] = [];

  constructor(
    private readonly health: ProviderHealth,
    groq: GroqProvider,
    gemini: GeminiProvider,
    openrouter: OpenRouterProvider,
  ) {
    const all = [groq, gemini, openrouter].filter((p) => p.isAvailable());
    for (const p of all) {
      this.health.register(p.name);
    }
    this.providers = all.sort((a, b) => a.priority - b.priority);

    if (this.providers.length === 0) {
      this.logger.warn('No AI providers configured. AI features will return mock data.');
    } else {
      this.logger.log(
        `AI providers registered: ${this.providers.map((p) => `${p.name} (priority ${p.priority}, model=${p.config.model})`).join(', ')}`,
      );
    }
  }

  getPrimaryProvider(): AiProvider | null {
    return this.providers[0] || null;
  }

  getAllProviders(): AiProvider[] {
    return this.providers;
  }

  getHealthSummary() {
    return this.health.getSummary();
  }

  private codeFromStatus(status: number): string {
    if (status === 429) return 'RATE_LIMITED';
    if (status === 400) return 'CONFIG_ERROR';
    if (status === 401) return 'INVALID_KEY';
    if (status === 404) return 'MODEL_NOT_FOUND';
    if (status >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN';
  }

  private codeFromError(err: Error): string {
    const match = err.message.match(/\b(\d{3})\b/);
    if (match) return this.codeFromStatus(parseInt(match[1], 10));
    if (err.message.includes('timed out') || err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) return 'TIMEOUT';
    if (err.message.includes('network') || err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED') || err.message.includes('fetch failed')) return 'NETWORK';
    if (err.message.includes('Invalid API key') || err.message.includes('unauthorized') || err.message.includes('API_KEY_INVALID')) return 'INVALID_KEY';
    if (err.message.includes('not found') || err.message.includes('Model not found') || err.message.includes('model not found')) return 'MODEL_NOT_FOUND';
    return 'UNKNOWN';
  }

  private async tryProvider<T>(
    provider: AiProvider,
    methodName: keyof AiProvider,
    args: any[],
  ): Promise<T> {
    if (!this.health.isHealthy(provider.name)) {
      const reason = this.health.getCooldownReason(provider.name);
      const err = new Error(reason ? `${provider.name} on cooldown: ${reason}` : `${provider.name} unhealthy`);
      (err as any).code = 'HEALTH_CHECK';
      throw err;
    }

    const start = Date.now();
    try {
      const result = await (provider[methodName] as any)(...args);
      const latency = Date.now() - start;
      this.health.recordSuccess(provider.name, latency);
      this.logCall(provider.name, provider.config.model, latency, 'ok');
      return result;
    } catch (err: any) {
      const latency = Date.now() - start;
      const code = this.codeFromError(err);
      this.health.recordFailure(provider.name, code, err.message, latency);
      this.logCall(provider.name, provider.config.model, latency, code.toLowerCase(), err.message);
      (err as any).code = code;
      throw err;
    }
  }

  private async tryProviderWithRetries<T>(
    provider: AiProvider,
    methodName: keyof AiProvider,
    args: any[],
  ): Promise<T> {
    let lastErr: any;
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_PROVIDER; attempt++) {
      try {
        return await this.tryProvider<T>(provider, methodName, args);
      } catch (err: any) {
        lastErr = err;
        const terminal = ['RATE_LIMITED', 'CONFIG_ERROR', 'INVALID_KEY', 'MODEL_NOT_FOUND', 'HEALTH_CHECK'];
        if (terminal.includes(err.code)) break;
        if (attempt < MAX_RETRIES_PER_PROVIDER) {
          const delay = RETRY_DELAYS_MS[attempt - 1];
          this.logger.log(`[${provider.name}] retry ${attempt}/${MAX_RETRIES_PER_PROVIDER} in ${delay}ms (${err.code})`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastErr;
  }

  private buildCallOrder(): AiProvider[] {
    const healthy = this.providers.filter((p) => this.health.isHealthy(p.name));
    return healthy;
  }

  private async withFallback<T>(
    methodName: keyof AiProvider,
    argsBuilder: (provider: AiProvider) => any[],
  ): Promise<T> {
    const ordered = this.buildCallOrder();
    if (ordered.length === 0) {
      throw new AllProvidersFailedError();
    }

    const errors: { name: string; msg: string }[] = [];

    for (let i = 0; i < ordered.length; i++) {
      const provider = ordered[i];
      try {
        return await this.tryProviderWithRetries<T>(provider, methodName, argsBuilder(provider));
      } catch (err: any) {
        const msg = `${err.code}: ${err.message}`;
        errors.push({ name: provider.name, msg });
        if (i < ordered.length - 1) {
          this.logger.warn(`[ProviderFactory] ${provider.name} → ${ordered[i + 1].name} (${err.code})`);
        }
      }
    }

    this.logger.error(`[ProviderFactory] all providers failed: ${errors.map((e) => `${e.name}[${e.msg}]`).join('; ')}`);
    throw new AllProvidersFailedError();
  }

  private logCall(name: string, model: string, latencyMs: number, status: string, detail?: string): void {
    const msg = `[${name}] model=${model} latency=${latencyMs}ms status=${status}${detail ? ` detail="${detail}"` : ''}`;
    if (status === 'ok') {
      this.logger.log(msg);
    } else {
      this.logger.warn(msg);
    }
  }

  async generateTextWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    return this.withFallback<string>(
      'generateText' as keyof AiProvider,
      () => [systemPrompt, userPrompt, temperature, historyMessages, maxTokens],
    );
  }

  async generateTextStreamWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    return this.withFallback<ReadableStream>(
      'generateTextStream' as keyof AiProvider,
      () => [systemPrompt, userPrompt, temperature, historyMessages, maxTokens],
    );
  }

  async generateStructuredJsonWithFallback<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
  ): Promise<T> {
    return this.withFallback<T>(
      'generateStructuredJson' as keyof AiProvider,
      () => [systemPrompt, userPrompt, temperature, maxTokens],
    );
  }
}
