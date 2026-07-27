import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: dto.username }, { email: dto.email }],
            },
        });

        if (existing) {
            throw new ConflictException('Username or email already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
            },
        });

        const otp = this._generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.oTP.create({
            data: {
                email: dto.email,
                code: otp,
                purpose: 'register',
                expiresAt,
            },
        });

        const emailSent = await this.mailService.sendEmail(
            dto.email,
            'VidyGuideAI - Registration OTP',
            `<p>Your registration OTP is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        );

        return {
            message: 'Registration successful. OTP sent to email.',
            userId: user.id,
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
        };
    }

    async login(dto: LoginDto) {
        console.log(`[LOGIN INST] Checking login for email: ${dto.email}`);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            console.log(`[LOGIN INST] FAILED: User not found for email: ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials.');
        }
        console.log(`[LOGIN INST] SUCCESS: User found. Stored email: ${user.email}, passwordHash exists: ${!!user.passwordHash}`);

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(dto.password, user.passwordHash);
            console.log(`[LOGIN INST] bcrypt.compare result: ${isMatch}`);
        } catch (error) {
            console.log(`[LOGIN INST] FAILED: bcrypt.compare threw error: ${(error as Error).message}`);
            throw new UnauthorizedException('Invalid credentials.');
        }
        if (!isMatch) {
            console.log(`[LOGIN INST] FAILED: Password does not match hash.`);
            throw new UnauthorizedException('Invalid credentials.');
        }

        console.log(`[LOGIN INST] SUCCESS: Authentication check passed.`);

        if (!user.isVerified) {
            const otp = this._generateOtp();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await this.prisma.oTP.create({
                data: {
                    email: dto.email,
                    code: otp,
                    purpose: 'login',
                    expiresAt,
                },
            });

            await this.mailService.sendEmail(
                dto.email,
                'VidyGuideAI - Login Verification OTP',
                `<p>Your login verification OTP is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
            );

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

        return { tokens: this._issueTokens(user) };
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
        const otpRecord = await this.prisma.oTP.findFirst({
            where: {
                email,
                code,
                purpose,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid or expired OTP code.');
        }

        await this.prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });

        if (purpose === 'register') {
            await this.prisma.user.update({
                where: { email },
                data: { isVerified: true },
            });

            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                const tokens = this._issueTokens(user);
                return {
                    success: true,
                    tokens,
                    message: 'Registration verified. You are now logged in.',
                };
            }
        }

        if (purpose === 'login') {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user && user.isVerified) {
                const tokens = this._issueTokens(user);
                return {
                    success: true,
                    tokens,
                    message: 'Login verified. You are now logged in.',
                };
            }
        }

        return { success: true, message: 'OTP verified successfully.' };
    }

    async forgotPassword(
        email: string,
    ): Promise<{ success: boolean; devOtp?: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: true };
        }

        const otp = this._generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.oTP.create({
            data: {
                email,
                code: otp,
                purpose: 'reset_password',
                expiresAt,
            },
        });

        await this.mailService.sendEmail(
            email,
            'VidyGuideAI - Password Reset OTP',
            `<p>You requested a password reset. Your OTP is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        );

        return {
            success: true,
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
        };
    }

    async resetPassword(
        email: string,
        code: string,
        passwordPlain: string,
    ): Promise<boolean> {
        const otpRecord = await this.prisma.oTP.findFirst({
            where: {
                email,
                code,
                purpose: 'reset_password',
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid or expired OTP code.');
        }

        await this.prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordPlain, salt);

        await this.prisma.user.update({
            where: { email },
            data: { passwordHash },
        });

        await this.prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });

        return true;
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
            .catch(() => {});

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
