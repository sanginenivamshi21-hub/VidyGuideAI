import {
    Controller,
    Post,
    Body,
    Res,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import type { Response } from 'express';

@Controller('mentor')
export class MentorController {
    constructor(private readonly aiService: AiService) {}

    private langInstructions: Record<string, string> = {
        en: 'Reply in English.',
        te: 'IMPORTANT: Reply ONLY in Telugu (తెలుగు). Do not use English at all.',
        hi: 'IMPORTANT: Reply ONLY in Hindi (हिन्दी). Do not use English at all.',
        ta: 'IMPORTANT: Reply ONLY in Tamil (தமிழ்). Do not use English at all.',
        kn: 'IMPORTANT: Reply ONLY in Kannada (ಕನ್ನಡ). Do not use English at all.',
        ml: 'IMPORTANT: Reply ONLY in Malayalam (മലയാളം). Do not use English at all.',
        mr: 'IMPORTANT: Reply ONLY in Marathi (मराठी). Do not use English at all.',
    };

    private buildMentorPrompt(replyLang: string): string {
        const lang = this.langInstructions[replyLang] || this.langInstructions.en;
        return `You are VidyGuide AI Mentor — a warm, experienced career counselor for Indian students and young professionals. Give clear, practical, actionable career advice. Be encouraging but honest. End with one concrete next step. Use Markdown with headers, lists, and emojis naturally. ${lang}`;
    }

    @Post()
    async askMentor(@Body() body: any) {
        const question = body.question || '';
        const replyLang = body.reply_language || 'en';
        const model = body.model || 'llama-3.3-70b-versatile';
        const temperature = body.temperature ?? 0.7;

        const responseText = await this.aiService.generateText(
            this.buildMentorPrompt(replyLang),
            question,
            temperature,
            model,
        );
        return { response: responseText };
    }

    @Post('stream')
    async askMentorStream(@Body() body: any, @Res() res: Response) {
        const question = body.question || '';
        const replyLang = body.reply_language || 'en';
        const model = body.model || 'llama-3.3-70b-versatile';
        const temperature = body.temperature ?? 0.7;
        const maxTokens = body.maxTokens ?? 2048;
        const messages = body.messages || [];

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            const historyMessages = (messages || []).map((m: any) => ({
                role: m.role,
                content: m.content,
            }));

            const stream = await this.aiService.generateTextStream(
                this.buildMentorPrompt(replyLang),
                question,
                temperature,
                model,
                historyMessages,
                maxTokens,
            );

            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value);
                res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
            }
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        } catch (err) {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
        }
    }

    @Post('interview')
    async askInterview(@Body() body: any) {
        const role = body.role || 'Software Developer';
        const company = body.company || 'General MNC';
        const experienceLevel = body.experience_level || 'Entry Level';
        const skills = body.skills || 'General technical skills';
        const difficulty = body.difficulty || 'Medium';
        const model = body.model || 'llama-3.3-70b-versatile';
        const temperature = body.temperature ?? 0.8;

        const systemPrompt = `You are an expert corporate recruiter and interviewer for Indian companies. Generate exactly 5 highly relevant, realistic, and challenging interview questions for the following candidate profile:
- Role: ${role}
- Company: ${company}
- Experience Level: ${experienceLevel}
- Key Skills: ${skills}
- Difficulty Level: ${difficulty}

Format each question with Markdown. Use emojis naturally. Return exactly 5 questions numbered 1 to 5.`;

        const responseText = await this.aiService.generateText(
            systemPrompt,
            'Generate the questions.',
            temperature,
            model,
        );

        const questions = responseText
            .split(/(?:\r?\n|^)\d+\.\s+/)
            .map((q) => q.trim())
            .filter((q) => q.length > 0);

        return { questions: questions.slice(0, 5) };
    }

    @Post('interview/feedback')
    async getInterviewFeedback(@Body() body: any) {
        const items = body.items || [];
        const model = body.model || 'llama-3.3-70b-versatile';
        const temperature = body.temperature ?? 0.6;

        let promptContent =
            'Provide comprehensive feedback, score (out of 10), strengths, weaknesses, and the ideal model response for the following answers:\n\n';
        items.forEach((item: any, idx: number) => {
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

        const responseText = await this.aiService.generateText(
            systemPrompt,
            promptContent,
            temperature,
            model,
        );
        return { feedback: responseText };
    }
}
