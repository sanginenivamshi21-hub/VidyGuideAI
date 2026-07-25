import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groqClient: Groq | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groqClient = new Groq({ apiKey });
    } else {
      this.logger.warn('GROQ_API_KEY is not defined. AI calls will fall back to mock payloads.');
    }
  }

  async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    maxRetries = 3
  ): Promise<string> {
    if (!this.groqClient) {
      this.logger.warn('Groq Client not configured. Returning mock text.');
      return 'Mock text completion for VidyGuideAI V3 foundation verification.';
    }

    let delay = 1000; // start with 1 second delay
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.groqClient.chat.completions.create({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
        });

        return response.choices[0]?.message?.content || '';
      } catch (error) {
        this.logger.error(`Groq API failure (attempt ${attempt}/${maxRetries}): ${error.message}`);
        if (attempt === maxRetries) {
          throw new HttpException(
            `AI service failed after ${maxRetries} retries.`,
            HttpStatus.BAD_GATEWAY
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // double the delay for backoff
      }
    }
    return '';
  }

  async generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxRetries = 3
  ): Promise<T> {
    if (!this.groqClient) {
      this.logger.warn('Groq Client not configured. Returning mock JSON object.');
      return { mock: true } as unknown as T;
    }

    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.groqClient.chat.completions.create({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt + '\nEnsure output is strictly JSON.' },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          response_format: { type: 'json_object' },
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        return JSON.parse(rawContent) as T;
      } catch (error) {
        this.logger.error(`Groq JSON API failure (attempt ${attempt}/${maxRetries}): ${error.message}`);
        if (attempt === maxRetries) {
          throw new HttpException(
            `AI Structured JSON service failed after ${maxRetries} retries.`,
            HttpStatus.BAD_GATEWAY
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    return {} as T;
  }
}
