import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, ChatMessage } from './ai-provider.interface';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';

const COOLDOWN_MS = 15 * 60 * 1000;
const MAX_RETRIES_PER_PROVIDER = 2;

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private providers: AiProvider[] = [];
  private providerMap: Map<string, AiProvider> = new Map();
  private cooldowns: Map<string, { until: number }> = new Map();

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

  private isOnCooldown(name: string): boolean {
    const entry = this.cooldowns.get(name);
    if (!entry) return false;
    if (Date.now() >= entry.until) {
      this.cooldowns.delete(name);
      return false;
    }
    this.logger.warn(`[${name}] on cooldown for ${Math.round((entry.until - Date.now()) / 1000)}s more`);
    return true;
  }

  private setCooldown(name: string): void {
    const until = Date.now() + COOLDOWN_MS;
    this.cooldowns.set(name, { until });
    this.logger.warn(`[${name}] rate-limited; cooling down until ${new Date(until).toISOString()}`);
  }

  private extractStatusCode(err: Error): number | null {
    const match = err.message.match(/\b(\d{3})\b/);
    return match ? parseInt(match[1], 10) : null;
  }

  private logCall(name: string, model: string, latencyMs: number, status: 'ok' | 'fail' | 'cooldown', detail?: string): void {
    this.logger.log(`[${name}] model=${model} latency=${latencyMs}ms status=${status}${detail ? ` detail="${detail}"` : ''}`);
  }

  private annotateError(err: Error, code: string): Error {
    (err as any).code = code;
    return err;
  }

  private async tryProvider<T>(
    provider: AiProvider,
    methodName: keyof AiProvider,
    args: any[],
  ): Promise<T> {
    if (this.isOnCooldown(provider.name)) {
      const err = new Error(`Provider ${provider.name} on cooldown`);
      (err as any).code = 'COOLDOWN';
      throw err;
    }

    const start = Date.now();
    try {
      const result = await (provider[methodName] as any)(...args);
      this.logCall(provider.name, provider.config.model, Date.now() - start, 'ok');
      return result;
    } catch (err: any) {
      const latency = Date.now() - start;
      const statusCode = this.extractStatusCode(err);

      if (statusCode === 429) {
        this.setCooldown(provider.name);
        this.logCall(provider.name, provider.config.model, latency, 'cooldown', err.message);
        throw this.annotateError(err, 'RATE_LIMITED');
      }

      if (statusCode !== null && statusCode >= 400 && statusCode < 500) {
        this.logCall(provider.name, provider.config.model, latency, 'fail', `non-retryable ${statusCode}`);
        throw this.annotateError(err, 'CLIENT_ERROR');
      }

      this.logCall(provider.name, provider.config.model, latency, 'fail', err.message);
      throw this.annotateError(err, 'RETRYABLE');
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
        if (err.code === 'RATE_LIMITED' || err.code === 'CLIENT_ERROR' || err.code === 'COOLDOWN') {
          break;
        }
        if (attempt < MAX_RETRIES_PER_PROVIDER) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          this.logger.log(`[${provider.name}] retry ${attempt}/${MAX_RETRIES_PER_PROVIDER} in ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastErr;
  }

  private buildCallOrder(preferredProvider?: string): AiProvider[] {
    if (!preferredProvider || !this.providerMap.has(preferredProvider)) {
      return this.providers;
    }

    const preferred = this.providerMap.get(preferredProvider)!;
    const others = this.providers.filter((p) => p.name !== preferredProvider);

    return [preferred, ...others];
  }

  private async withFallback<T>(
    methodName: keyof AiProvider,
    argsBuilder: (provider: AiProvider) => any[],
    preferredProvider?: string,
  ): Promise<T> {
    const errors: { name: string; msg: string }[] = [];
    const ordered = this.buildCallOrder(preferredProvider);

    for (let i = 0; i < ordered.length; i++) {
      const provider = ordered[i];
      try {
        return await this.tryProviderWithRetries<T>(provider, methodName, argsBuilder(provider));
      } catch (err: any) {
        const msg = `${provider.name}: ${err.message}`;
        errors.push({ name: provider.name, msg });
        if (i < ordered.length - 1) {
          this.logger.warn(`[ProviderFactory] falling back from ${provider.name} to ${ordered[i + 1].name} — ${err.message}`);
        }
      }
    }

    this.logger.error(`[ProviderFactory] all providers failed: ${errors.map((e) => e.msg).join('; ')}`);
    throw new Error(`AI service unavailable. All providers failed: ${errors.map((e) => e.msg).join('; ')}`);
  }

  async generateTextWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<string> {
    return this.withFallback<string>(
      'generateText' as keyof AiProvider,
      (provider: AiProvider) => [systemPrompt, userPrompt, temperature, historyMessages, maxTokens],
      preferredProvider,
    );
  }

  async generateTextStreamWithFallback(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
    preferredProvider?: string,
  ): Promise<ReadableStream> {
    return this.withFallback<ReadableStream>(
      'generateTextStream' as keyof AiProvider,
      (provider: AiProvider) => [systemPrompt, userPrompt, temperature, historyMessages, maxTokens],
      preferredProvider,
    );
  }

  async generateStructuredJsonWithFallback<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
    preferredProvider?: string,
  ): Promise<T> {
    return this.withFallback<T>(
      'generateStructuredJson' as keyof AiProvider,
      (provider: AiProvider) => [systemPrompt, userPrompt, temperature, maxTokens],
      preferredProvider,
    );
  }
}
