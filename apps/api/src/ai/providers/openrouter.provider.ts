import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, AiProviderConfig, ChatMessage } from './ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  readonly name = 'openrouter';
  readonly priority = 3;
  private apiKey = '';
  readonly config: AiProviderConfig;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.config = {
      name: 'openrouter',
      apiKey: this.apiKey,
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      priority: 3,
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://vidyguideai.com',
        'X-Title': 'VidyGuideAI',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${err}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://vidyguideai.com',
        'X-Title': 'VidyGuideAI',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter stream error: ${response.status} ${err}`);
    }

    const encoder = new TextEncoder();
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    return new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const payload = line.slice(6).trim();
                if (payload === '[DONE]') continue;
                try {
                  const json = JSON.parse(payload);
                  const content = json.choices?.[0]?.delta?.content || '';
                  if (content) controller.enqueue(encoder.encode(content));
                } catch { /* skip */ }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });
  }

  async generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
  ): Promise<T> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://vidyguideai.com',
        'X-Title': 'VidyGuideAI',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt + '\nEnsure output is strictly JSON.' },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter JSON error: ${response.status} ${err}`);
    }

    const data: any = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(raw) as T;
  }
}
