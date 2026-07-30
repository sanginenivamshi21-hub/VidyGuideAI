import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

const OTP_TEMPLATE = (otp: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">VidyGuideAI</h1>
              <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px">Your verification code</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;text-align:center">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Use this code to complete your action</p>
              <div style="margin:24px 0;padding:16px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb">
                <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:800;color:#059669;letter-spacing:8px">${otp}</span>
              </div>
              <p style="margin:0;color:#9ca3af;font-size:12px">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
              <p style="margin:0;color:#9ca3af;font-size:11px">&copy; 2026 VidyGuideAI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const PASSWORD_RESET_TEMPLATE = (otp: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">VidyGuideAI</h1>
              <p style="margin:8px 0 0;#fde68a;font-size:14px">Password reset request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;text-align:center">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Use this code to reset your password</p>
              <div style="margin:24px 0;padding:16px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb">
                <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:800;color:#d97706;letter-spacing:8px">${otp}</span>
              </div>
              <p style="margin:0;color:#9ca3af;font-size:12px">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
              <p style="margin:0;color:#9ca3af;font-size:11px">&copy; 2026 VidyGuideAI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly brevoClient: BrevoClient | null;
    private readonly senderEmail: string;
    private readonly senderName: string;

    constructor() {
        const apiKey = process.env.BREVO_API_KEY || '';
        this.senderEmail = process.env.BREVO_SENDER_EMAIL || '';
        this.senderName = process.env.BREVO_SENDER_NAME || 'VidyGuideAI';

        if (apiKey && this.senderEmail) {
            this.brevoClient = new BrevoClient({ apiKey });
            this.logger.log(`[EMAIL] Brevo client initialized. From: "${this.senderName} <${this.senderEmail}>"`);
        } else {
            this.brevoClient = null;
            const missing = [];
            if (!apiKey) missing.push('BREVO_API_KEY');
            if (!this.senderEmail) missing.push('BREVO_SENDER_EMAIL');
            this.logger.warn(`[EMAIL] ${missing.join(', ')} not configured. All email sending will be skipped.`);
        }
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
    ): Promise<boolean> {
        const start = Date.now();
        this.logger.log(`[EMAIL] Sending to="${to}" subject="${subject}"`);

        if (!this.brevoClient || !this.senderEmail) {
            this.logger.warn('[EMAIL] Cannot send: BREVO_API_KEY or BREVO_SENDER_EMAIL not configured. Returning false.');
            return false;
        }

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                this.logger.log(`[EMAIL] Attempt ${attempt}/3 — from="${this.senderName} <${this.senderEmail}>" to="${to}"`);

                const result = await this.brevoClient.transactionalEmails.sendTransacEmail({
                    subject,
                    htmlContent,
                    sender: { name: this.senderName, email: this.senderEmail },
                    to: [{ email: to }],
                });

                const messageId = result.messageId || (result.messageIds && result.messageIds[0]) || null;
                this.logger.log(`[EMAIL] SUCCESS attempt ${attempt}/3 — id=${messageId} to="${to}" duration=${Date.now() - start}ms`);
                return true;
            } catch (error) {
                lastError = error as Error;
                const errMsg = lastError.message || String(error);
                this.logger.error(`[EMAIL] FAILED attempt ${attempt}/3 — to="${to}" error="${errMsg}"`);

                if (errMsg.includes('unauthorized') || errMsg.includes('Invalid API key') || errMsg.includes('sender') || errMsg.includes('domain')) {
                    this.logger.error(`[EMAIL] Configuration error. Check BREVO_API_KEY and BREVO_SENDER_EMAIL.`);
                    break;
                }

                if (errMsg.includes('rate') || errMsg.toLowerCase().includes('limit')) {
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

    async sendOtp(to: string, otp: string): Promise<boolean> {
        return this.sendEmail(to, 'Your VidyGuideAI verification code', OTP_TEMPLATE(otp));
    }

    async sendPasswordReset(to: string, otp: string): Promise<boolean> {
        return this.sendEmail(to, 'Reset your VidyGuideAI password', PASSWORD_RESET_TEMPLATE(otp));
    }
}