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
            this.logger.log(`[EMAIL] Resend client initialized. From: "${this.resendFromEmail}"`);
            if (this.resendFromEmail === 'onboarding@resend.dev') {
                this.logger.warn('[EMAIL] Using onboarding@resend.dev — emails will ONLY be delivered to the Resend account owner\'s email. Configure a verified custom domain for production delivery.');
            }
        } else {
            this.resendClient = null;
            this.logger.warn('[EMAIL] RESEND_API_KEY not configured. All email sending will be skipped.');
        }
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
    ): Promise<boolean> {
        const start = Date.now();
        this.logger.log(`[EMAIL] Sending to="${to}" subject="${subject}"`);

        if (!this.resendClient || !this.resendApiKey) {
            this.logger.warn('[EMAIL] Cannot send: RESEND_API_KEY not configured. Returning false.');
            return false;
        }

        const from = this.resendFromEmail || 'noreply@vidyguide.ai';
        let lastError: Error | null = null;
        let messageId: string | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                this.logger.log(`[EMAIL] Attempt ${attempt}/3 — from="${from}" to="${to}"`);

                const { data, error } = await this.resendClient.emails.send({
                    from: `VidyGuideAI <${from}>`,
                    to: [to],
                    subject,
                    html: htmlContent,
                });

                if (error) {
                    throw new Error(error.message);
                }

                messageId = data?.id || null;
                this.logger.log(`[EMAIL] SUCCESS attempt ${attempt}/3 — id=${messageId} to="${to}" duration=${Date.now() - start}ms`);
                return true;
            } catch (error) {
                lastError = error as Error;
                const errMsg = lastError.message;
                this.logger.error(`[EMAIL] FAILED attempt ${attempt}/3 — to="${to}" error="${errMsg}"`);

                if (errMsg.includes('not verified') || errMsg.includes('sender')) {
                    this.logger.error(`[EMAIL] Sender "${from}" is not verified with Resend. Verify a domain or use a verified sender.`);
                    break;
                }

                if (errMsg.includes('rate')) {
                    this.logger.warn('[EMAIL] Rate limited, waiting before retry...');
                }

                if (attempt < 3) {
                    const delayMs = Math.pow(2, attempt) * 1000;
                    this.logger.log(`[EMAIL] Retrying in ${delayMs}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        }

        this.logger.error(`[EMAIL] All attempts failed — to="${to}" subject="${subject}" error="${lastError!.message}"`);
        return false;
    }
}
