import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';

@Controller('resume')
export class ResumeController {
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

    const systemPrompt = `You are an expert resume writer for Indian students and professionals.`;
    const userPrompt = `Write a professional, ATS-friendly resume for:
- Name: ${name}
- Target Role: ${targetRole}
- Target Company: ${targetCompany}
- Education Level: ${educationLevel}
- Contact: ${phone} | ${email} | ${location}
- LinkedIn/GitHub: ${linkedin}
- Education: ${education}
- Skills: ${skills}
- Languages: ${languages}
- Achievements: ${achievements}
- Hobbies: ${hobbies}
- Projects/Internships: ${projects}

INSTRUCTIONS:
1. Write a resume SPECIFICALLY tailored for "${targetRole}" at "${targetCompany}"
2. Use plain text format with clear section headers (no markdown asterisks)
3. Write a strong objective mentioning the target role and company
4. Use powerful action verbs
5. Keep it concise: 1 page for 10th/12th students, 1-2 pages for graduates
6. Do NOT invent fake data — use only what is provided above
7. Format section headers in ALL CAPS followed by a line of dashes

Output the complete resume in plain text format, ready to use.`;

    const result = await this.aiService.generateText(systemPrompt, userPrompt, 0.6);
    return { resume: result };
  }

  @Post('feedback')
  async getFeedback(@Body() body: any) {
    const resumeText = body.resume || '';
    const replyLang = body.reply_language || 'en';

    const langInstructions: Record<string, string> = {
      en: '',
      te: '\nIMPORTANT: Write your ENTIRE response in Telugu (తెలుగు) only. Do not use English.',
      hi: '\nIMPORTANT: Write your ENTIRE response in Hindi (हिन्दी) only. Do not use English.',
      ta: '\nIMPORTANT: Write your ENTIRE response in Tamil (தமிழ்) only. Do not use English.',
      kn: '\nIMPORTANT: Write your ENTIRE response in Kannada (ಕನ್ನಡ) only. Do not use English.',
      ml: '\nIMPORTANT: Write your ENTIRE response in Malayalam (മലയാളം) only. Do not use English.',
      mr: '\nIMPORTANT: Write your ENTIRE response in Marathi (मராठी) only. Do not use English.',
      bn: '\nIMPORTANT: Write your ENTIRE response in Bengali (বাংলা) only. Do not use English.',
      gu: '\nIMPORTANT: Write your ENTIRE response in Gujarati (ગુજરાતી) only. Do not use English.',
    };

    const langInstr = langInstructions[replyLang] || '';

    const systemPrompt = `You are an expert resume reviewer for Indian job seekers.`;
    const userPrompt = `Analyze this resume and provide detailed, actionable feedback:

Resume:
${resumeText}

Provide structured feedback covering:
1. **Overall Impression** — First impression score (X/10) and one-line summary
2. **Strengths** — What's working well (3-5 points)
3. **Weaknesses** — What needs improvement (3-5 points)  
4. **ATS Optimization** — Keywords missing, formatting issues
5. **Section-by-Section Review** — Objective, Education, Skills, Projects, Experience
6. **Missing Elements** — What should be added
7. **Top 3 Priority Fixes** — The most impactful changes to make right now
8. **Improved Objective Statement** — Rewrite their objective for their target role${langInstr}`;

    const result = await this.aiService.generateText(systemPrompt, userPrompt, 0.6);
    return { feedback: result };
  }

  @Post('pdf')
  async generatePdf(@Body() body: any, @Res() res: express.Response) {
    let pythonPath = join(process.cwd(), '.venv/bin/python');
    let scriptPath = join(process.cwd(), 'resume_pdf.py');
    if (!existsSync(pythonPath)) {
      pythonPath = join(process.cwd(), '../../.venv/bin/python');
      scriptPath = join(process.cwd(), '../../resume_pdf.py');
    }

    const payload = JSON.stringify({
      resume_text: body.resume_text || '',
      name: body.name || '',
      phone: body.phone || '',
      email: body.email || '',
      location: body.location || '',
      linkedin: body.linkedin || '',
    });

    const pyProcess = spawn(pythonPath, [scriptPath]);
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
        console.error('Python PDF generation failed:', errText);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'PDF generation failed: ' + errText });
        return;
      }

      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
      res.send(pdfBuffer);
    });

    pyProcess.stdin.write(payload);
    pyProcess.stdin.end();
  }
}
