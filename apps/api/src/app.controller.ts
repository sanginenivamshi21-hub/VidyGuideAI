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
        const nodemailer = require('nodemailer');
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const smtpUser = process.env.SMTP_USER || '';
        const smtpPass = process.env.SMTP_PASS || '';

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: 'VidyGuideAI <noreply@vidyguide.ai>',
                to: body.to || smtpUser,
                subject: 'VidyGuideAI SMTP Diagnostics Test',
                html: '<p>This is a test email sent from VidyGuideAI production diagnostics.</p>',
            });
            return { success: true, info };
        } catch (error) {
            console.error('SMTP Diagnostic Failure:', error);
            return { 
                success: false, 
                message: (error as Error).message, 
                stack: (error as Error).stack,
                errorDetails: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            };
        }
    }
}
