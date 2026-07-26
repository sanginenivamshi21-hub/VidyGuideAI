import {
    Controller,
    Post,
    Body,
    Res,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';

@Controller('resume')
export class ResumeController {
    private readonly logger = new Logger(ResumeController.name);

    constructor(private readonly aiService: AiService) {}

    @Post()
    async generateResume(@Body() body: any) {
        const name = body.name || '';
        const targetRole = body.target_role || '';
        const targetCompany = body.target_company || '';
        const educationLevel = body.education_level || '';
        const phone = body.phone || '';
        const email = body.email || '';
        const location = body.location || '';
        const linkedin = body.linkedin || '';
        const skills = body.skills || '';
        const languages = body.languages || '';
        const achievements = body.achievements || '';
        const hobbies = body.hobbies || '';
        const education = body.education || '';
        const projects = body.projects || '';

        const systemPrompt =
            'You are an expert resume writer for Indian students and professionals.';
        const userPrompt = [
            'Write a professional, ATS-friendly resume for:',
            `- Name: ${name}`,
            `- Target Role: ${targetRole}`,
            `- Target Company: ${targetCompany}`,
            `- Education Level: ${educationLevel}`,
            `- Contact: ${phone} | ${email} | ${location}`,
            `- LinkedIn/GitHub: ${linkedin}`,
            `- Education: ${education}`,
            `- Skills: ${skills}`,
            `- Languages: ${languages}`,
            `- Achievements: ${achievements}`,
            `- Hobbies: ${hobbies}`,
            `- Projects/Internships: ${projects}`,
            '',
            'INSTRUCTIONS:',
            '1. Write a resume SPECIFICALLY tailored for the target role and company',
            '2. Use plain text format with clear section headers (no markdown asterisks)',
            '3. Write a strong objective mentioning the target role and company',
            '4. Use powerful action verbs',
            '5. Keep it concise: 1 page for 10th/12th students, 1-2 pages for graduates',
            '6. Do NOT invent fake data — use only what is provided above',
            '7. Format section headers in ALL CAPS followed by a line of dashes',
            '',
            'Output the complete resume in plain text format, ready to use.',
        ].join('\n');

        const result = await this.aiService.generateText(
            systemPrompt,
            userPrompt,
            0.6,
        );
        return { resume: result };
    }

    @Post('feedback')
    async getFeedback(@Body() body: any) {
        const resumeText = body.resume || '';
        const replyLang = body.reply_language || 'en';

        const langInstructions: Record<string, string> = {
            en: '',
            te: '\nIMPORTANT: Write your ENTIRE response in Telugu only. Do not use English.',
            hi: '\nIMPORTANT: Write your ENTIRE response in Hindi only. Do not use English.',
            ta: '\nIMPORTANT: Write your ENTIRE response in Tamil only. Do not use English.',
            kn: '\nIMPORTANT: Write your ENTIRE response in Kannada only. Do not use English.',
            ml: '\nIMPORTANT: Write your ENTIRE response in Malayalam only. Do not use English.',
            mr: '\nIMPORTANT: Write your ENTIRE response in Marathi only. Do not use English.',
            bn: '\nIMPORTANT: Write your ENTIRE response in Bengali only. Do not use English.',
            gu: '\nIMPORTANT: Write your ENTIRE response in Gujarati only. Do not use English.',
        };

        const langInstr = langInstructions[replyLang] || '';

        const systemPrompt = [
            'You are an expert resume reviewer for Indian job seekers.',
            'Provide structured feedback using rich Markdown:',
            '- Format sections with beautiful headings.',
            '- Use clear bullet points and bold key terms.',
            '- Use emojis to call attention to strengths, weaknesses, and priorities.',
            '- Format the ATS Score inside a highlight/callout box.',
            '- Keep the language conversational, encouraging, and easy to read for beginners.',
        ].join('\n');

        const userPrompt = [
            'Analyze this resume and provide detailed, actionable feedback:',
            '',
            `Resume:`,
            resumeText,
            '',
            'Provide structured feedback covering exactly these sections:',
            '1. **ATS Score** — First impression score (format strictly as "**ATS Score:** X/100" in a callout box).',
            '2. **Recruiter Review** — One-line professional recruiter summary.',
            '3. **Grammar & Formatting Critique** — Point out grammar, structural, or layout errors.',
            '4. **Keyword & Keyword Density Analysis** — Check keyword density and keywords missing.',
            '5. **Missing Skills & Keywords** — List missing skills or topics to be added.',
            '6. **Improved Objective Statement** — Rewrite their objective for their target role.',
            '7. **Full Improved Resume (Plain Text Layout)** — Provide a complete, polished, ATS-optimized plain text version of their resume. Use section headers in ALL CAPS followed by a line of dashes so it is ready for ReportLab PDF compilation. Do not include markdown asterisks inside this resume block. Wrap the complete Improved Resume strictly inside a code block with language resume.',
            langInstr,
        ].join('\n');

        const result = await this.aiService.generateText(
            systemPrompt,
            userPrompt,
            0.6,
        );
        return { feedback: result };
    }

    @Post('pdf')
    async generatePdf(@Body() body: any, @Res() res: express.Response) {
        const projectRoot = resolve(process.cwd(), '..', '..');
        const venvPython = resolve(projectRoot, '.venv', 'bin', 'python');
        const scriptPath = resolve(projectRoot, 'resume_pdf.py');

        const pythonPath = existsSync(venvPython) ? venvPython : 'python3';
        const script = existsSync(scriptPath)
            ? scriptPath
            : resolve(process.cwd(), 'resume_pdf.py');

        const payload = JSON.stringify({
            resume_text: body.resume_text || '',
            name: body.name || '',
            phone: body.phone || '',
            email: body.email || '',
            location: body.location || '',
            linkedin: body.linkedin || '',
        });

        const pyProcess = spawn(pythonPath, [script]);
        const chunks: Buffer[] = [];
        let errText = '';

        pyProcess.stdout.on('data', (chunk) => {
            chunks.push(chunk);
        });

        pyProcess.stderr.on('data', (chunk) => {
            errText += chunk.toString();
        });

        pyProcess.on('close', (code) => {
            if (code !== 0) {
                this.logger.error('Python PDF generation failed:', errText);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'PDF generation failed',
                });
                return;
            }

            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=resume.pdf',
            );
            res.send(pdfBuffer);
        });

        pyProcess.stdin.write(payload);
        pyProcess.stdin.end();
    }
}
