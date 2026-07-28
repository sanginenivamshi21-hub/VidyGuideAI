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
        const industry = body.industry || '';
        const experienceLevel = body.experience_level || '';
        const country = body.country || '';
        const phone = body.phone || '';
        const email = body.email || '';
        const location = body.location || '';
        const linkedin = body.linkedin || '';
        const github = body.github || '';
        const portfolio = body.portfolio || '';
        const summary = body.summary || '';
        const skills = body.skills || '';
        const programmingLanguages = body.programming_languages || '';
        const frameworks = body.frameworks || '';
        const databases = body.databases || '';
        const cloud = body.cloud || '';
        const devops = body.devops || '';
        const aiMl = body.ai_ml || '';
        const softSkills = body.soft_skills || '';
        const languages = body.languages || '';
        const achievements = body.achievements || '';
        const interests = body.interests || '';
        const education = body.education || '';
        const experience = body.experience || '';
        const projects = body.projects || '';
        const certifications = body.certifications || '';

        const roleSkillMap: Record<string, string> = {
            'frontend developer': 'React, TypeScript, Tailwind CSS, JavaScript, HTML/CSS, Next.js, Vue.js, Responsive Design, Web Performance, Browser APIs',
            'backend developer': 'Node.js, NestJS, Express, PostgreSQL, REST APIs, GraphQL, Microservices, Redis, Message Queues, Authentication',
            'full stack developer': 'React, TypeScript, Node.js, PostgreSQL, REST APIs, Next.js, Tailwind CSS, Docker, Git, CI/CD',
            'data analyst': 'SQL, Excel, Python, Power BI, Tableau, Data Visualization, Statistical Analysis, Data Cleaning, Pandas, NumPy',
            'data scientist': 'Python, Machine Learning, Deep Learning, TensorFlow, PyTorch, SQL, Statistics, NLP, Computer Vision, A/B Testing',
            'ml engineer': 'Python, TensorFlow, PyTorch, ML Pipelines, Docker, Kubernetes, MLOps, Feature Engineering, Model Deployment, A/B Testing',
            'ai engineer': 'Python, LLMs, NLP, Computer Vision, TensorFlow, PyTorch, RAG, Vector Databases, Prompt Engineering, Model Optimization',
            'cloud engineer': 'AWS, Docker, CI/CD, Terraform, Kubernetes, Linux, Networking, Security, Monitoring, Infrastructure as Code',
            'cybersecurity analyst': 'Network Security, Penetration Testing, SIEM, Firewalls, Python, Risk Assessment, Compliance, Incident Response',
            'devops engineer': 'Docker, Kubernetes, CI/CD, Terraform, AWS, Linux, Ansible, Jenkins, Git, Monitoring',
            'software engineer': 'Data Structures, Algorithms, System Design, Python, Java, SQL, Git, REST APIs, Testing, Debugging',
            'mobile developer': 'React Native, Flutter, Swift, Kotlin, Mobile UI, REST APIs, App Store Deployment, Performance Optimization',
            'product manager': 'Product Strategy, User Research, A/B Testing, Agile, SQL, Data Analysis, Roadmapping, Stakeholder Management',
        };

        const relevantSkills = Object.entries(roleSkillMap).find(([key]) =>
            targetRole.toLowerCase().includes(key)
        )?.[1] || skills || '';

        const systemPrompt = [
            'You are an elite resume writer specializing in ATS-optimized resumes for the Indian job market.',
            'You write resumes that pass both automated ATS filters and recruiter reviews.',
        ].join('\n');

        const userPrompt = [
            `Generate a professional, ATS-optimized resume for ${name}.`,
            '',
            '--- CANDIDATE DATA ---',
            `Name: ${name}`,
            `Target Role: ${targetRole}`,
            `Industry: ${industry}`,
            `Experience Level: ${experienceLevel}`,
            `Target Country: ${country}`,
            `Contact: ${phone} | ${email} | ${location}`,
            `LinkedIn: ${linkedin}`,
            `GitHub: ${github}`,
            `Portfolio: ${portfolio}`,
            `Professional Summary: ${summary}`,
            `Education: ${education}`,
            `Work Experience: ${experience}`,
            `Projects: ${projects}`,
            `Certifications: ${certifications}`,
            `Achievements: ${achievements}`,
            `Interests: ${interests}`,
            `Languages: ${languages}`,
            `Programming Languages: ${programmingLanguages}`,
            `Frameworks: ${frameworks}`,
            `Databases: ${databases}`,
            `Cloud: ${cloud}`,
            `DevOps: ${devops}`,
            `AI/ML: ${aiMl}`,
            `Soft Skills: ${softSkills}`,
            `Key Skills Listed: ${skills}`,
            `Relevant Skills for Role: ${relevantSkills}`,
            '',
            '--- FORMATTING RULES ---',
            '1. Use plain text with section headers in ALL CAPS followed by a line of dashes.',
            '2. Do NOT use markdown asterisks, bold, or italics.',
            '3. Keep to 1 page for freshers, 1-2 pages for experienced.',
            '4. Use strong action verbs: "Developed", "Architected", "Optimized", "Led", "Delivered", "Reduced", "Improved", "Built".',
            '5. Include quantified metrics wherever possible (%, $, time saved, scale).',
            '6. Tailor the ENTIRE resume specifically for the ${targetRole} role.',
            '7. If skills are provided, organize them into categories relevant to the target role.',
            '8. Write a powerful professional summary that aligns with the target role.',
            '9. Do NOT invent fake data — use only what is provided above.',
            '10. Format contact info as: Phone | Email | Location on one line.',
            '',
            '--- SECTION ORDER ---',
            'PROFESSIONAL SUMMARY',
            '---',
            'TECHNICAL SKILLS',
            '---',
            'WORK EXPERIENCE',
            '---',
            'EDUCATION',
            '---',
            'PROJECTS',
            '---',
            'CERTIFICATIONS',
            '---',
            'ACHIEVEMENTS',
            '---',
            'LANGUAGES',
            '---',
            'INTERESTS',
            '',
            'Output the complete resume in plain text format, ready to copy and use.',
        ].join('\n');

        const result = await this.aiService.generateText(
            systemPrompt,
            userPrompt,
            0.4,
            'llama-3.3-70b-versatile',
            [],
            3,
            4096,
        );
        return { resume: result };
    }

    @Post('validate-role')
    async validateRole(@Body() body: any) {
        const role = (body.role || '').trim().toLowerCase();

        const knownRoles = [
            'software engineer', 'frontend developer', 'backend developer', 'full stack developer',
            'data analyst', 'data scientist', 'ml engineer', 'ai engineer',
            'cloud engineer', 'cybersecurity analyst', 'devops engineer',
            'mobile developer', 'product manager', 'qa engineer', 'sre engineer',
            'systems engineer', 'network engineer', 'database administrator',
            'business analyst', 'project manager', 'scrum master',
            'ux designer', 'ui designer', 'product designer',
            'technical writer', 'data engineer', 'machine learning engineer',
            'research scientist', 'solutions architect', 'technical lead',
            'engineering manager', 'site reliability engineer', 'security engineer',
            'embedded engineer', 'firmware engineer', 'hardware engineer',
            'web developer', 'wordpress developer', 'shopify developer',
            'salesforce developer', 'sap consultant', 'erp consultant',
            'blockchain developer', 'game developer', 'ar/vr developer',
            'it support specialist', 'help desk technician', 'system administrator',
            'network administrator', 'devsecops engineer', 'platform engineer',
            'data architect', 'infrastructure engineer', 'release manager',
            'test automation engineer', 'manual tester', 'penetration tester',
        ];

        const aliasMap: Record<string, string[]> = {
            'software engineer': ['swe', 'sde', 'software developer', 'programmer', 'coder'],
            'frontend developer': ['front end', 'front-end', 'ui developer', 'web developer'],
            'backend developer': ['back end', 'back-end', 'server side developer', 'api developer'],
            'full stack developer': ['fullstack', 'full-stack', 'mean stack', 'mern stack'],
            'data analyst': ['data analyst', 'business analyst', 'analytics engineer'],
            'data scientist': ['data scientist', 'ml scientist', 'ai scientist'],
            'devops engineer': ['devops', 'dev ops', 'cloud engineer'],
        };

        if (!role) {
            return { valid: false, suggestions: [] };
        }

        const exactMatch = knownRoles.find((r) => r === role);
        if (exactMatch) {
            return { valid: true, role: exactMatch, suggestions: [] };
        }

        for (const [canonical, aliases] of Object.entries(aliasMap)) {
            if (aliases.some((a) => role === a || role.includes(a) || a.includes(role))) {
                return { valid: true, role: canonical, suggestions: [] };
            }
        }

        const roleWords = role.split(/\s+/);
        const matchedRoles = knownRoles
            .map((r) => {
                const rWords = r.split(/\s+/);
                const sharedWords = roleWords.filter((w: string) => rWords.includes(w)).length;
                const maxLen = Math.max(roleWords.length, rWords.length);
                return { role: r, score: maxLen > 0 ? sharedWords / maxLen : 0, sharedWords };
            })
            .filter((m) => m.score >= 0.5 && m.sharedWords >= Math.min(2, roleWords.length, m.role.split(/\s+/).length))
            .sort((a, b) => b.score - a.score || b.sharedWords - a.sharedWords)
            .slice(0, 5);

        if (matchedRoles.length > 0) {
            return { valid: true, role: matchedRoles[0].role, suggestions: matchedRoles.slice(1).map((m) => m.role) };
        }

        return { valid: false, suggestions: knownRoles.slice(0, 6) };
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

    @Post('analyze')
    async analyzeResume(@Body() body: any) {
        const resumeText = body.resume || '';

        const systemPrompt = [
            'You are an expert ATS resume analyst for Indian job seekers.',
            'Analyze the resume and return a strictly structured JSON object.',
        ].join('\n');

        const userPrompt = [
            'Analyze this resume and return a JSON object with exactly these fields:',
            '',
            '1. "atsScore" — number 0-100.',
            '2. "summary" — one-line recruiter summary.',
            '3. "keywords" — object with "present" (string[] of matched keywords), "missing" (string[] of missing keywords), "density" (string describing keyword density).',
            '4. "formattingIssues" — string[] of formatting problems found.',
            '5. "grammarSuggestions" — string[] of grammar/punctuation issues.',
            '6. "missingSkills" — string[] of skills missing for Indian job market.',
            '7. "strengths" — string[] of resume strengths.',
            '8. "improvements" — string[] of actionable improvement tips.',
            '9. "enhancedResume" — full ATS-optimized plain text resume.',
            '',
            'Resume text:',
            resumeText,
        ].join('\n');

        const result = await this.aiService.generateStructuredJson<{
            atsScore: number;
            summary: string;
            keywords: { present: string[]; missing: string[]; density: string };
            formattingIssues: string[];
            grammarSuggestions: string[];
            missingSkills: string[];
            strengths: string[];
            improvements: string[];
            enhancedResume: string;
        }>(systemPrompt, userPrompt, 0.1);

        return result;
    }

    @Post('pdf')
    async generatePdf(@Body() body: any, @Res() res: express.Response) {
        const projectRoot = resolve(process.cwd(), '..', '..');
        const venvPython = resolve(projectRoot, '.venv', 'bin', 'python');
        const scriptPath = resolve(projectRoot, 'python', 'resume_pdf.py');

        const pythonPath = existsSync(venvPython) ? venvPython : 'python3';
        const script = existsSync(scriptPath)
            ? scriptPath
            : resolve(process.cwd(), 'python', 'resume_pdf.py');

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

        pyProcess.on('error', (err) => {
            this.logger.error('Failed to start PDF generation process:', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'PDF generation tool is unavailable',
            });
        });

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
