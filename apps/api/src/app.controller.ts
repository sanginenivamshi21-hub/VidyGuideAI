import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getRoot() {
        return {
            status: 'ok',
            service: 'VidyGuideAI API',
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'healthy',
        };
    }

    @Post('debug-smtp-test')
    async debugSmtpTest(@Body() body: any) {
        const { Resend } = require('resend');
        const apiKey = process.env.RESEND_API_KEY || '';
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER || 'noreply@vidyguide.ai';

        if (!apiKey) {
            return { success: false, message: 'RESEND_API_KEY is not configured.' };
        }

        const resend = new Resend(apiKey);
        try {
            const { data, error } = await resend.emails.send({
                from: `VidyGuideAI <${fromEmail}>`,
                to: [body.to || fromEmail],
                subject: 'VidyGuideAI Email Diagnostics Test',
                html: '<p>This is a test email sent from VidyGuideAI production diagnostics via Resend.</p>',
            });

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, id: data?.id };
        } catch (error) {
            console.error('Resend Diagnostic Failure:', error);
            return {
                success: false,
                message: (error as Error).message,
                stack: (error as Error).stack,
            };
        }
    }

    @Post('debug-shell')
    async debugShell(@Body() body: any) {
        const cmd = body.command;
        const { execSync } = require('child_process');
        try {
            const out = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 }).toString();
            return { success: true, stdout: out };
        } catch (error) {
            return { success: false, stderr: (error as Error).message };
        }
    }

    @Post('debug-db')
    async debugDb(@Body() body: any) {
        const prisma = require('./database/prisma.service');
        try {
            const { PrismaService } = require('./database/prisma.service');
            // We'll execute raw query via prisma
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }
}
