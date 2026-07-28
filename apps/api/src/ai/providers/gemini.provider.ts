import { Injectable, Logger } from '@nestjs/common';
import type { AiProvider, AiProviderConfig, ChatMessage } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  readonly name = 'gemini';
  readonly priority = 2;
  private apiKey = '';
  readonly config: AiProviderConfig;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.config = {
      name: 'gemini',
      apiKey: this.apiKey,
      models: {
        chat: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
        json: process.env.GEMINI_JSON_MODEL || 'gemini-1.5-flash',
        streaming: process.env.GEMINI_STREAM_MODEL || 'gemini-1.5-flash',
      },
      priority: 2,
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private buildUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
  }

  private buildStreamUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
  }

  private buildContents(systemPrompt: string, userPrompt: string, historyMessages: ChatMessage[] = []) {
    const contents: any[] = historyMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
    });
    return contents;
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    const m = model || this.config.models.chat;
    const url = this.buildUrl(m);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: this.buildContents(systemPrompt, userPrompt, historyMessages),
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${err}`);
    }

    const data: any = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    const m = model || this.config.models.streaming;
    const url = this.buildStreamUrl(m);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: this.buildContents(systemPrompt, userPrompt, historyMessages),
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini stream error: ${response.status} ${err}`);
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
                try {
                  const json = JSON.parse(line.slice(6));
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (text) controller.enqueue(encoder.encode(text));
                } catch { /* skip malformed */ }
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
    model?: string,
    maxTokens = 4096,
  ): Promise<T> {
    const m = model || this.config.models.json;
    const url = this.buildUrl(m);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: this.buildContents(systemPrompt, userPrompt),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini JSON error: ${response.status} ${err}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = text.replace(/```json\s*|\s*```/g, '');
    return JSON.parse(cleaned) as T;
  }
}
