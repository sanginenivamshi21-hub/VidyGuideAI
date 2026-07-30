import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async register(dto: RegisterDto) {
        const email = dto.email.trim().toLowerCase();
        this.logger.log(`[REGISTER] Attempting registration for email: ${email}`);

        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: dto.username }, { email }],
            },
        });

        if (existing) {
            this.logger.warn(`[REGISTER] FAILED: Username or email already exists: ${dto.username} / ${email}`);
            throw new ConflictException('Username or email already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email,
                passwordHash,
                fullName: dto.fullName,
            },
        });
        this.logger.log(`[REGISTER] User created: id=${user.id}, email=${email}`);

        const otp = this._generateOtp();
        const otpHash = await bcrypt.hash(otp, 6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.oTP.create({
            data: {
                email,
                code: otpHash,
                purpose: 'register',
                expiresAt,
            },
        });
        this.logger.log(`[REGISTER] OTP stored (hashed) for email: ${email}`);

        const emailSent = await this.mailService.sendOtp(
            email,
            otp,
        );

        if (!emailSent) {
            this.logger.error(`[REGISTER] FAILED to send OTP email to: ${email}`);
            await this.prisma.user.delete({ where: { id: user.id } }).catch(() => {});
            throw new BadRequestException('Unable to send verification email. Email service is unavailable. Please try again later.');
        }

        this.logger.log(`[REGISTER] OTP email sent successfully to: ${email}`);
        return {
            message: 'Registration successful. OTP sent to email.',
            userId: user.id,
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
        };
    }

    async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();
        this.logger.log(`[LOGIN] Attempting login for email: ${email}`);

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            this.logger.warn(`[LOGIN] FAILED: User not found for email: ${email}`);
            throw new UnauthorizedException('Invalid credentials.');
        }

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        } catch (error) {
            this.logger.error(`[LOGIN] bcrypt.compare threw error: ${(error as Error).message}`);
            throw new UnauthorizedException('Invalid credentials.');
        }

        if (!isMatch) {
            this.logger.warn(`[LOGIN] FAILED: Password does not match for email: ${email}`);
            throw new UnauthorizedException('Invalid credentials.');
        }

        this.logger.log(`[LOGIN] Password validated for email: ${email}`);

        if (!user.isVerified) {
            const otp = this._generateOtp();
            const otpHash = await bcrypt.hash(otp, 6);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await this.prisma.oTP.create({
                data: {
                    email,
                    code: otpHash,
                    purpose: 'login',
                    expiresAt,
                },
            });
            this.logger.log(`[LOGIN] OTP stored (hashed) for unverified user: ${email}`);

            const emailSent = await this.mailService.sendOtp(
                email,
                otp,
            );

            if (!emailSent) {
                this.logger.error(`[LOGIN] FAILED to send OTP email to: ${email}`);
                return {
                    message: 'Unable to send verification email. Email service is unavailable. Please try again later.',
                };
            }

            return {
                message:
                    'Account not verified. OTP sent to your email for verification.',
                requiresOtp: true,
                purpose: 'login',
                ...(process.env.NODE_ENV !== 'production'
                    ? { devOtp: otp }
                    : {}),
            };
        }

        this.logger.log(`[LOGIN] User verified, issuing tokens for: ${email}`);
        return { tokens: this._issueTokens(user) };
    }

    async resendOtp(email: string, purpose: string, password?: string) {
        const emailLower = email.trim().toLowerCase();
        this.logger.log(`[RESEND_OTP] Resending OTP for email: ${emailLower}, purpose: ${purpose}`);

        const user = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });

        if (!user) {
            this.logger.log(`[RESEND_OTP] No user found for: ${emailLower} (returning success for security)`);
            return { message: 'If the account exists, a new verification code has been sent to your email.' };
        }

        if (user.isVerified && purpose !== 'reset_password') {
            this.logger.warn(`[RESEND_OTP] User already verified: ${emailLower}`);
            return { message: 'If the account exists, a new verification code has been sent to your email.' };
        }

        if (purpose === 'register' && user.isVerified) {
            return { message: 'If the account exists, a new verification code has been sent to your email.' };
        }

        if (purpose === 'login' && password) {
            let isMatch = false;
            try {
                isMatch = await bcrypt.compare(password, user.passwordHash);
            } catch {
                throw new UnauthorizedException('Invalid credentials.');
            }
            if (!isMatch) {
                this.logger.warn(`[RESEND_OTP] Password mismatch for: ${emailLower}`);
                throw new UnauthorizedException('Invalid credentials.');
            }
        }

        await this.prisma.oTP.updateMany({
            where: { email: emailLower, purpose, isUsed: false },
            data: { isUsed: true },
        });

        const otp = this._generateOtp();
        const otpHash = await bcrypt.hash(otp, 6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.oTP.create({
            data: {
                email: emailLower,
                code: otpHash,
                purpose,
                expiresAt,
            },
        });
        this.logger.log(`[RESEND_OTP] New OTP stored (hashed) for email: ${emailLower}`);

        const emailSent = purpose === 'reset_password'
            ? await this.mailService.sendPasswordReset(emailLower, otp)
            : await this.mailService.sendOtp(emailLower, otp);

        if (!emailSent) {
            this.logger.error(`[RESEND_OTP] FAILED to send OTP email to: ${emailLower}`);
            throw new BadRequestException('Unable to send verification email. Email service is unavailable. Please try again later.');
        }

        this.logger.log(`[RESEND_OTP] OTP resent successfully to: ${emailLower}`);
        return {
            message: 'A new verification code has been sent to your email.',
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
        };
    }

    async verifyOtp(
        email: string,
        code: string,
        purpose: string,
    ): Promise<{
        success: boolean;
        tokens?: {
            accessToken: string;
            refreshToken: string;
            user: { id: number; username: string; email: string };
        };
        message: string;
    }> {
        const emailLower = email.trim().toLowerCase();
        this.logger.log(`[VERIFY_OTP] Verifying OTP for email: ${emailLower}, purpose: ${purpose}`);

        const otpRecords = await this.prisma.oTP.findMany({
            where: {
                email: emailLower,
                purpose,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecords.length) {
            this.logger.warn(`[VERIFY_OTP] FAILED: No valid OTP found for email: ${emailLower}`);
            throw new BadRequestException('Verification code expired. Please request another verification code.');
        }

        let matchedRecord: typeof otpRecords[0] | null = null;
        for (const record of otpRecords) {
            let isValid = false;
            try {
                isValid = await bcrypt.compare(code, record.code);
            } catch {
                isValid = code === record.code;
            }
            if (isValid) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            this.logger.warn(`[VERIFY_OTP] FAILED: Invalid OTP code for email: ${emailLower}`);
            throw new BadRequestException('Invalid OTP. Please check the code and try again.');
        }

        await this.prisma.oTP.update({
            where: { id: matchedRecord.id },
            data: { isUsed: true },
        });
        this.logger.log(`[VERIFY_OTP] OTP marked as used for email: ${emailLower}`);

        if (purpose === 'register' || purpose === 'login') {
            await this.prisma.user.update({
                where: { email: emailLower },
                data: { isVerified: true },
            });
            this.logger.log(`[VERIFY_OTP] User verified for email: ${emailLower}`);

            const user = await this.prisma.user.findUnique({
                where: { email: emailLower },
            });
            if (user) {
                const tokens = this._issueTokens(user);
                const msg = purpose === 'register'
                    ? 'Registration verified. You are now logged in.'
                    : 'Login verified. You are now logged in.';
                return {
                    success: true,
                    tokens,
                    message: msg,
                };
            }
        }

        if (purpose === 'reset_password') {
            return { success: true, message: 'OTP verified successfully. You can now reset your password.' };
        }

        return { success: true, message: 'OTP verified successfully.' };
    }

    async refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: { id: number; username: string; email: string };
    }> {
        this.logger.log('[REFRESH] Attempting token refresh');

        let payload: any;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_SECRET || 'fallback-secret-key-development',
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token. Please log in again.');
        }

        const session = await this.prisma.session.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!session || session.expiresAt < new Date()) {
            this.logger.warn('[REFRESH] Session not found or expired');
            if (session) {
                await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
            }
            throw new UnauthorizedException('Session expired. Please log in again.');
        }

        const user = session.user;

        await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});

        const newTokens = this._issueTokens(user);
        this.logger.log(`[REFRESH] Tokens refreshed for user: ${user.email}`);

        return newTokens;
    }

    async invalidateSession(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_SECRET || 'fallback-secret-key-development',
            });
            await this.prisma.session.deleteMany({
                where: { token: refreshToken, userId: payload.sub },
            });
            this.logger.log(`[LOGOUT] Session invalidated for user: ${payload.sub}`);
        } catch {
            await this.prisma.session.deleteMany({
                where: { token: refreshToken },
            }).catch(() => {});
        }
    }

    async forgotPassword(
        email: string,
    ): Promise<{ success: boolean; devOtp?: string }> {
        const emailLower = email.trim().toLowerCase();
        this.logger.log(`[FORGOT_PASSWORD] Processing request for email: ${emailLower}`);

        const user = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });

        if (!user) {
            this.logger.log(`[FORGOT_PASSWORD] No account found for: ${emailLower} (returning success for security)`);
            return { success: true };
        }

        const otp = this._generateOtp();
        const otpHash = await bcrypt.hash(otp, 6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.oTP.create({
            data: {
                email: emailLower,
                code: otpHash,
                purpose: 'reset_password',
                expiresAt,
            },
        });
        this.logger.log(`[FORGOT_PASSWORD] OTP stored (hashed) for email: ${emailLower}`);

        const emailSent = await this.mailService.sendPasswordReset(
            emailLower,
            otp,
        );

        if (!emailSent) {
            this.logger.error(`[FORGOT_PASSWORD] FAILED to send OTP email to: ${emailLower}`);
        }

        return {
            success: true,
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
        };
    }

    async resetPassword(
        email: string,
        code: string,
        passwordPlain: string,
    ): Promise<{ message: string }> {
        const emailLower = email.trim().toLowerCase();
        this.logger.log(`[RESET_PASSWORD] Attempting password reset for email: ${emailLower}`);

        const otpRecords = await this.prisma.oTP.findMany({
            where: {
                email: emailLower,
                purpose: 'reset_password',
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecords.length) {
            this.logger.warn(`[RESET_PASSWORD] FAILED: No valid OTP found for email: ${emailLower}`);
            throw new BadRequestException('Verification code expired. Please request another verification code.');
        }

        let matchedRecord: typeof otpRecords[0] | null = null;
        for (const record of otpRecords) {
            let isValid = false;
            try {
                isValid = await bcrypt.compare(code, record.code);
            } catch {
                isValid = code === record.code;
            }
            if (isValid) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            this.logger.warn(`[RESET_PASSWORD] FAILED: Invalid OTP code for email: ${emailLower}`);
            throw new BadRequestException('Invalid OTP. Please check the code and try again.');
        }

        await this.prisma.oTP.update({
            where: { id: matchedRecord.id },
            data: { isUsed: true },
        });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordPlain, salt);

        await this.prisma.user.update({
            where: { email: emailLower },
            data: { passwordHash },
        });

        await this.prisma.session.deleteMany({ where: { user: { email: emailLower } } }).catch(() => {});

        this.logger.log(`[RESET_PASSWORD] Password reset successful for email: ${emailLower}`);
        return { message: 'Password reset successful. You can now log in with your new password.' };
    }

    private _generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private _issueTokens(user: {
        id: number;
        username: string;
        email: string;
    }) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        this.prisma.session
            .create({
                data: {
                    userId: user.id,
                    token: refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            })
            .catch((err) =>
                this.logger.error(`[SESSION] Failed to create session: ${(err as Error).message}`),
            );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }
}
