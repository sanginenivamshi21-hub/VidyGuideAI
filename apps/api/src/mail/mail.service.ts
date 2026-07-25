import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY || '';

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Skipping email send.');
      this.logger.log(`[MOCK EMAIL to ${to}] Subject: ${subject}`);
      return true;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
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

      this.logger.log(`Email successfully dispatched to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }
}
