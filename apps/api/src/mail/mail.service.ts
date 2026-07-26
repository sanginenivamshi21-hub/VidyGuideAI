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
        this.logger.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
        this.logger.log(
            `[EMAIL LOG] Body: ${htmlContent
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()}`,
        );

        if (this.resendApiKey) {
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

                if (!response.ok) {
                    const errText = await response.text();
                    this.logger.error(`Resend API returned error: ${errText}`);
                    return false;
                }

                this.logger.log(
                    `Email successfully dispatched to ${to} via Resend`,
                );
                return true;
            } catch (error) {
                this.logger.error(
                    `Resend failed for ${to}: ${(error as Error).message}`,
                );
                return this.sendViaSmtpFallback(to, subject, htmlContent);
            }
        }

        return this.sendViaSmtpFallback(to, subject, htmlContent);
    }

    private async sendViaSmtpFallback(
        to: string,
        subject: string,
        htmlContent: string,
    ): Promise<boolean> {
        const transporter = this.getTransporter();
        if (!transporter) {
            this.logger.warn(
                'No email service configured (RESEND_API_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping email send.',
            );
            this.logger.log(`[MOCK EMAIL to ${to}] Subject: ${subject}`);
            return true;
        }

        try {
            await transporter.sendMail({
                from: 'VidyGuideAI <noreply@vidyguide.ai>',
                to,
                subject,
                html: htmlContent,
            });
            this.logger.log(`Email successfully dispatched to ${to} via SMTP`);
            return true;
        } catch (error) {
            this.logger.error(
                `SMTP email failed for ${to}: ${(error as Error).message}`,
            );
            this.logger.log(`[MOCK EMAIL to ${to}] Subject: ${subject}`);
            return true;
        }
    }
}
