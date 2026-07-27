import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly resendApiKey = process.env.RESEND_API_KEY || '';
    private readonly resendFromEmail = process.env.RESEND_FROM_EMAIL || '';
    private readonly resendClient: Resend | null;

    constructor() {
        if (this.resendApiKey) {
            this.resendClient = new Resend(this.resendApiKey);
            this.logger.log('[EMAIL INST] Resend client initialized');
        } else {
            this.resendClient = null;
            this.logger.warn('[EMAIL INST] RESEND_API_KEY not configured. Emails will be skipped.');
        }
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
    ): Promise<boolean> {
        this.logger.log(`[EMAIL INST] Recipient: ${to}`);
        this.logger.log(`[EMAIL INST] Subject: "${subject}"`);

        if (!this.resendClient || !this.resendApiKey) {
            this.logger.warn('[EMAIL INST] Cannot send email: RESEND_API_KEY not configured. Returning false.');
            return false;
        }

        const from = this.resendFromEmail || 'noreply@vidyguide.ai';
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                this.logger.log(`[EMAIL INST] Sending via Resend (attempt ${attempt}/3) — from="${from}" to="${to}"`);

                const { data, error } = await this.resendClient.emails.send({
                    from: `VidyGuideAI <${from}>`,
                    to: [to],
                    subject,
                    html: htmlContent,
                });

                if (error) {
                    throw new Error(error.message);
                }

                this.logger.log(`[EMAIL INST] SUCCESS (attempt ${attempt}/3) — id=${data?.id} to="${to}"`);
                return true;
            } catch (error) {
                lastError = error as Error;
                this.logger.error(`[EMAIL INST] FAILED (attempt ${attempt}/3): ${lastError.message}`);

                if (attempt < 3) {
                    const delayMs = Math.pow(2, attempt) * 1000;
                    this.logger.log(`[EMAIL INST] Retrying in ${delayMs}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        }

        this.logger.error(`[EMAIL INST] All 3 attempts failed for to="${to}" subject="${subject}": ${lastError!.message}`);
        return false;
    }
}
