import {
    Controller,
    Post,
    Body,
    Res,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import type { Response } from 'express';

@Controller('mentor')
export class MentorController {
    constructor(private readonly aiService: AiService) {}

    @Post()
    async askMentor(@Body() body: any) {
        const question = body.question || '';
        const replyLang = body.reply_language || 'en';
        const temperature = body.temperature ?? 0.7;

        const responseText = await this.aiService.askMentor(question, replyLang, temperature);
        return { response: responseText };
    }

    @Post('stream')
    async askMentorStream(@Body() body: any, @Res() res: Response) {
        const question = body.question || '';
        const replyLang = body.reply_language || 'en';
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

            const stream = await this.aiService.askMentorStream(
                question,
                replyLang,
                temperature,
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
            const message = 'AI service temporarily unavailable. Please try again shortly.';
            res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
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
        const temperature = body.temperature ?? 0.8;

        const questions = await this.aiService.generateInterviewQuestions(
            role, company, experienceLevel, skills, difficulty, temperature,
        );

        return { questions };
    }

    @Post('interview/feedback')
    async getInterviewFeedback(@Body() body: any) {
        const items = body.items || [];
        const temperature = body.temperature ?? 0.6;

        const feedback = await this.aiService.generateInterviewFeedback(items, temperature);
        return { feedback };
    }
}
