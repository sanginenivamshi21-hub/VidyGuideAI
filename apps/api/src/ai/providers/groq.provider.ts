import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import type { AiProvider, AiProviderConfig, ChatMessage } from './ai-provider.interface';

@Injectable()
export class GroqProvider implements AiProvider {
  private readonly logger = new Logger(GroqProvider.name);
  readonly name = 'groq';
  readonly priority = 1;
  private client: Groq | null = null;
  readonly config: AiProviderConfig;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY || '';
    this.config = {
      name: 'groq',
      apiKey,
      models: {
        chat: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
        json: process.env.GROQ_JSON_MODEL || 'llama-3.1-8b-instant',
        streaming: process.env.GROQ_STREAM_MODEL || 'llama-3.3-70b-versatile',
      },
      priority: 1,
    };
    if (apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    if (!this.client) throw new Error('Groq not configured');
    const m = model || this.config.models.chat;
    const history = historyMessages.map((h) => ({
      role: h.role,
      content: h.content,
    })) as ChatCompletionMessageParam[];

    const response = await this.client.chat.completions.create({
      model: m,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content || '';
  }

  async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    model?: string,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    if (!this.client) throw new Error('Groq not configured');
    const m = model || this.config.models.streaming;
    const history = historyMessages.map((h) => ({
      role: h.role,
      content: h.content,
    })) as ChatCompletionMessageParam[];

    const response = await this.client.chat.completions.create({
      model: m,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) controller.enqueue(encoder.encode(content));
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
    if (!this.client) throw new Error('Groq not configured');
    const m = model || this.config.models.json;

    const response = await this.client.chat.completions.create({
      model: m,
      messages: [
        { role: 'system', content: systemPrompt + '\nEnsure output is strictly JSON.' },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    return JSON.parse(rawContent) as T;
  }
}
