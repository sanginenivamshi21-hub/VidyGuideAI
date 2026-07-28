import { Injectable, Logger } from '@nestjs/common';
import { ProviderFactory, AllProvidersFailedError } from './providers/provider-factory';
import type { ChatMessage } from './providers/ai-provider.interface';

const MAX_HISTORY_MESSAGES = 10;
const SUMMARIZE_AFTER = 10;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly providerFactory: ProviderFactory) {}

  private trimHistory(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length <= MAX_HISTORY_MESSAGES) return messages;
    return messages.slice(messages.length - MAX_HISTORY_MESSAGES);
  }

  private async generateText(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<string> {
    const history = this.trimHistory(historyMessages);
    return this.providerFactory.generateTextWithFallback(
      systemPrompt,
      userPrompt,
      temperature,
      history,
      maxTokens,
    );
  }

  private async generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    const history = this.trimHistory(historyMessages);
    return this.providerFactory.generateTextStreamWithFallback(
      systemPrompt,
      userPrompt,
      temperature,
      history,
      maxTokens,
    );
  }

  private async generateStructuredJson<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
  ): Promise<T> {
    return this.providerFactory.generateStructuredJsonWithFallback<T>(
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
    );
  }

  async askMentor(
    question: string,
    replyLang: string,
    temperature = 0.7,
  ): Promise<string> {
    try {
      return await this.generateText(
        this.buildMentorPrompt(replyLang),
        question,
        temperature,
        [],
        2048,
      );
    } catch (err) {
      if (err instanceof AllProvidersFailedError) {
        return 'All AI providers are temporarily unavailable. Please try again shortly.';
      }
      return 'Primary AI is busy. Switching to another AI model...';
    }
  }

  async askMentorStream(
    question: string,
    replyLang: string,
    temperature = 0.7,
    historyMessages: ChatMessage[] = [],
    maxTokens = 2048,
  ): Promise<ReadableStream> {
    return this.generateTextStream(
      this.buildMentorPrompt(replyLang),
      question,
      temperature,
      historyMessages,
      maxTokens,
    );
  }

  async generateInterviewQuestions(
    role: string,
    company: string,
    experienceLevel: string,
    skills: string,
    difficulty: string,
    temperature = 0.8,
  ): Promise<string[]> {
    const systemPrompt = `You are an expert corporate recruiter and interviewer for Indian companies. Generate exactly 5 highly relevant, realistic, and challenging interview questions for the following candidate profile:
- Role: ${role}
- Company: ${company}
- Experience Level: ${experienceLevel}
- Key Skills: ${skills}
- Difficulty Level: ${difficulty}

Format each question with Markdown. Use emojis naturally. Return exactly 5 questions numbered 1 to 5.`;

    try {
      const responseText = await this.generateText(
        systemPrompt,
        'Generate the questions.',
        temperature,
        [],
        2048,
      );

      return responseText
        .split(/(?:\r?\n|^)\d+\.\s+/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
        .slice(0, 5);
    } catch {
      return [];
    }
  }

  async generateInterviewFeedback(
    items: { question: string; answer: string }[],
    temperature = 0.6,
  ): Promise<string> {
    let promptContent =
      'Provide comprehensive feedback, score (out of 10), strengths, weaknesses, and the ideal model response for the following answers:\n\n';
    items.forEach((item, idx) => {
      promptContent += `Q${idx + 1}: ${item.question}\nAnswer: ${item.answer}\n\n`;
    });

    const systemPrompt = `You are an elite corporate interviewer. Evaluate the candidate's interview responses.
Provide feedback in a premium, beautifully formatted conversational markdown layout:
- Use ## headers, bullet points, bold key terms, and emojis where appropriate.
- Score each question out of 10 (format as "**Score:** X/10").
- List distinct strengths and weaknesses.
- Provide a concise, professional model answer that the candidate should use as a reference.
- End with a brief, encouraging tip.
- Include a final summary section with an overall score, hiring chance percentage, and radar chart data (strength, weakness categories).`;

    try {
      return await this.generateText(systemPrompt, promptContent, temperature, [], 2048);
    } catch {
      return 'Unable to generate feedback at this time. Please try again.';
    }
  }

  async generateCareerGuidance(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
  ): Promise<string> {
    try {
      return await this.generateText(systemPrompt, userPrompt, temperature, [], 4096);
    } catch {
      return 'Unable to generate career guidance at this time. Please try again.';
    }
  }

  async generateResumeContent(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.4,
  ): Promise<string> {
    try {
      return await this.generateText(systemPrompt, userPrompt, temperature, [], 2048);
    } catch {
      return 'Unable to generate resume content at this time. Please try again.';
    }
  }

  async generateStructuredData<T>(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.1,
    maxTokens = 4096,
  ): Promise<T> {
    try {
      return await this.generateStructuredJson<T>(systemPrompt, userPrompt, temperature, maxTokens);
    } catch {
      return { error: 'Unable to generate structured data at this time.' } as unknown as T;
    }
  }

  private buildMentorPrompt(replyLang: string): string {
    const langInstructions: Record<string, string> = {
      en: 'Reply in English.',
      te: 'IMPORTANT: Reply ONLY in Telugu (తెలుగు). Do not use English at all.',
      hi: 'IMPORTANT: Reply ONLY in Hindi (हिन्दी). Do not use English at all.',
      ta: 'IMPORTANT: Reply ONLY in Tamil (தமிழ்). Do not use English at all.',
      kn: 'IMPORTANT: Reply ONLY in Kannada (ಕನ್ನಡ). Do not use English at all.',
      ml: 'IMPORTANT: Reply ONLY in Malayalam (മലയാളം). Do not use English at all.',
      mr: 'IMPORTANT: Reply ONLY in Marathi (मराठी). Do not use English at all.',
    };
    const lang = langInstructions[replyLang] || langInstructions.en;
    return `You are VidyGuide AI Mentor — a warm, experienced career counselor for Indian students and young professionals. Give clear, practical, actionable career advice. Be encouraging but honest. End with one concrete next step. Use Markdown with headers, lists, and emojis naturally. ${lang}`;
  }
}
