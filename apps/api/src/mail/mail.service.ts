import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly resendApiKey = process.env.RESEND_API_KEY || '';
    private readonly smtpHost = process.env.SMTP_HOST || '';
    private readonly smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    private readonly smtpUser = process.env.SMTP_USER || '';
    private readonly smtpPass = process.env.SMTP_PASS || '';
    private nodemailerTransporter: nodemailer.Transporter | undefined;

    private getTransporter(): nodemailer.Transporter | undefined {
        if (this.nodemailerTransporter) {
            return this.nodemailerTransporter;
        }
        if (this.smtpHost && this.smtpUser && this.smtpPass) {
            this.nodemailerTransporter = nodemailer.createTransport({
                host: this.smtpHost,
                port: this.smtpPort,
                secure: this.smtpPort === 465,
                auth: {
                    user: this.smtpUser,
                    pass: this.smtpPass,
                },
            });
            return this.nodemailerTransporter;
        }
        return undefined;
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
    ): Promise<boolean> {
        this.logger.log(`[EMAIL INST] Recipient: ${to}`);
        this.logger.log(`[EMAIL INST] Resend Key configured: ${!!this.resendApiKey}`);
        this.logger.log(`[EMAIL INST] SMTP Host: ${this.smtpHost}, Port: ${this.smtpPort}, User: ${this.smtpUser}`);

        if (this.resendApiKey) {
            this.logger.log(`[EMAIL INST] Provider: Resend API`);
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: 'VidyGuideAI <noreply@vidyguide.ai>',
                        to: [to],
                        subject,
                        html: htmlContent,
                    }),
                });

                const responseText = await response.text();
                this.logger.log(`[EMAIL INST] Resend API Response Status: ${response.status}`);
                this.logger.log(`[EMAIL INST] Resend API Full Response: ${responseText}`);

                if (!response.ok) {
                    this.logger.error(`[EMAIL INST] Resend API failed: ${responseText}`);
                    throw new Error(`Resend API failed: ${responseText}`);
                }

                this.logger.log(`[EMAIL INST] SUCCESS: Email dispatched via Resend`);
                return true;
            } catch (error) {
                this.logger.error(`[EMAIL INST] Resend transport error: ${(error as Error).message}`, (error as Error).stack);
                throw error;
            }
        }

        this.logger.log(`[EMAIL INST] Provider: SMTP Fallback`);
        const transporter = this.getTransporter();
        if (!transporter) {
            this.logger.error('[EMAIL INST] FAILED: SMTP transporter not configured.');
            throw new Error('SMTP transporter not configured.');
        }

        try {
            this.logger.log(`[EMAIL INST] Sending mail via SMTP to: ${to}`);
            const info = await transporter.sendMail({
                from: 'VidyGuideAI <noreply@vidyguide.ai>',
                to,
                subject,
                html: htmlContent,
            });
            this.logger.log(`[EMAIL INST] SMTP Success Response: ${JSON.stringify(info)}`);
            return true;
        } catch (error) {
            this.logger.error(`[EMAIL INST] SMTP Transport Error: ${(error as Error).message}`, (error as Error).stack);
            throw error;
        }
    }
}
