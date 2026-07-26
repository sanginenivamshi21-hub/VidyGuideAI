import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private groqClient: Groq | null = null;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (apiKey) {
            this.groqClient = new Groq({ apiKey });
        } else {
            this.logger.warn(
                'GROQ_API_KEY is not defined. AI calls will fall back to mock payloads.',
            );
        }
    }

    async generateText(
        systemPrompt: string,
        userPrompt: string,
        temperature = 0.4,
        model = 'llama-3.3-70b-versatile',
        historyMessages: ChatCompletionMessageParam[] = [],
        maxRetries = 3,
        maxTokens = 2048,
    ): Promise<string> {
        if (!this.groqClient) {
            this.logger.warn(
                'Groq Client not configured. Returning mock text.',
            );
            return 'Mock text completion for VidyGuideAI V3 foundation verification.';
        }

        let delay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.groqClient.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...historyMessages,
                        { role: 'user', content: userPrompt },
                    ],
                    temperature,
                    max_tokens: maxTokens,
                });
                return response.choices[0]?.message?.content || '';
            } catch (error: any) {
                this.logger.error(
                    `Groq API failure (attempt ${attempt}/${maxRetries}): ${error.message}`,
                );
                if (attempt === maxRetries) {
                    throw new HttpException(
                        `AI service failed after ${maxRetries} retries.`,
                        HttpStatus.BAD_GATEWAY,
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
        return '';
    }

    async generateTextStream(
        systemPrompt: string,
        userPrompt: string,
        temperature = 0.7,
        model = 'llama-3.3-70b-versatile',
        historyMessages: ChatCompletionMessageParam[] = [],
        maxTokens = 2048,
    ): Promise<ReadableStream> {
        if (!this.groqClient) {
            throw new HttpException(
                'AI service not configured.',
                HttpStatus.BAD_GATEWAY,
            );
        }

        const response = await this.groqClient.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...historyMessages,
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
                        if (content) {
                            controller.enqueue(encoder.encode(content));
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
        model = 'llama-3.1-8b-instant',
        maxRetries = 3,
        maxTokens = 1024,
    ): Promise<T> {
        if (!this.groqClient) {
            this.logger.warn(
                'Groq Client not configured. Returning mock JSON object.',
            );
            return { mock: true } as unknown as T;
        }

        let delay = 1000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.groqClient.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content:
                                systemPrompt +
                                '\nEnsure output is strictly JSON.',
                        },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature,
                    max_tokens: maxTokens,
                    response_format: { type: 'json_object' },
                });

                const rawContent =
                    response.choices[0]?.message?.content || '{}';
                return JSON.parse(rawContent) as T;
            } catch (error: any) {
                this.logger.error(
                    `Groq JSON API failure (attempt ${attempt}/${maxRetries}): ${error.message}`,
                );
                if (attempt === maxRetries) {
                    throw new HttpException(
                        `AI Structured JSON service failed after ${maxRetries} retries.`,
                        HttpStatus.BAD_GATEWAY,
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
        return {} as T;
    }
}
