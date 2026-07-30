import { Controller, Post, Get, Body, Res, Req, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as express from 'express';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
};

const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async register(@Body() dto: RegisterDto) {
        const start = Date.now();
        try {
            const result = await this.authService.register(dto);
            this.logger.log(`[REGISTER] Duration: ${Date.now() - start}ms, email: ${dto.email}`);
            return result;
        } catch (error) {
            this.logger.error(`[REGISTER] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('login')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const start = Date.now();
        try {
            const result = await this.authService.login(dto);

            if (result.tokens) {
                this._setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
                this.logger.log(`[LOGIN] Success, Duration: ${Date.now() - start}ms, email: ${dto.email}`);
                return {
                    message: 'Login successful',
                    user: result.tokens.user,
                    accessToken: result.tokens.accessToken,
                };
            }

            this.logger.log(`[LOGIN] Requires OTP, Duration: ${Date.now() - start}ms, email: ${dto.email}`);
            return result;
        } catch (error) {
            this.logger.error(`[LOGIN] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('verify-otp')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async verifyOtp(
        @Body() dto: VerifyOtpDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const start = Date.now();
        try {
            const result = await this.authService.verifyOtp(
                dto.email,
                dto.code,
                dto.purpose,
            );

            if (result.tokens) {
                this._setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
                this.logger.log(`[VERIFY_OTP] Success, Duration: ${Date.now() - start}ms, email: ${dto.email}`);
                return {
                    message: result.message,
                    success: true,
                    user: result.tokens.user,
                    accessToken: result.tokens.accessToken,
                };
            }

            return {
                message: result.message,
                success: result.success,
            };
        } catch (error) {
            this.logger.error(`[VERIFY_OTP] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('resend-otp')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async resendOtp(@Body() dto: ResendOtpDto) {
        const start = Date.now();
        try {
            const result = await this.authService.resendOtp(dto.email, dto.purpose, dto.password);
            this.logger.log(`[RESEND_OTP] Duration: ${Date.now() - start}ms, email: ${dto.email}, purpose: ${dto.purpose}`);
            return result;
        } catch (error) {
            this.logger.error(`[RESEND_OTP] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('refresh')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const start = Date.now();
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            this.logger.warn('[REFRESH] No refresh token provided');
            return { message: 'Refresh token is required.', authenticated: false };
        }

        try {
            const tokens = await this.authService.refreshToken(refreshToken);
            this._setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
            this.logger.log(`[REFRESH] Success, Duration: ${Date.now() - start}ms`);
            return {
                message: 'Token refreshed successfully',
                user: tokens.user,
                accessToken: tokens.accessToken,
            };
        } catch (error) {
            this.logger.error(`[REFRESH] Error: ${(error as Error).message}`);
            res.clearCookie('accessToken', COOKIE_OPTIONS);
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            return { message: (error as Error).message, authenticated: false };
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() req: any) {
        const user = req.user;
        return {
            authenticated: true,
            user: {
                id: user.userId,
                username: user.username,
                email: user.email,
            },
        };
    }

    @Post('forgot-password')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        const start = Date.now();
        try {
            await this.authService.forgotPassword(dto.email);
            this.logger.log(`[FORGOT_PASSWORD] Duration: ${Date.now() - start}ms, email: ${dto.email}`);
            return { message: 'Password reset OTP sent to your email.' };
        } catch (error) {
            this.logger.error(`[FORGOT_PASSWORD] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('reset-password')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        const start = Date.now();
        try {
            const result = await this.authService.resetPassword(dto.email, dto.code, dto.password);
            this.logger.log(`[RESET_PASSWORD] Success, Duration: ${Date.now() - start}ms, email: ${dto.email}`);
            return result;
        } catch (error) {
            this.logger.error(`[RESET_PASSWORD] Error: ${(error as Error).message}, email: ${dto.email}`);
            throw error;
        }
    }

    @Post('logout')
    async logout(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                await this.authService.invalidateSession(refreshToken);
            } catch {
                // Session cleanup is best-effort
            }
        }
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        this.logger.log('[LOGOUT] User logged out, cookies cleared, session invalidated');
        return { message: 'Logged out successfully.' };
    }

    private _setAuthCookies(
        res: express.Response,
        accessToken: string,
        refreshToken: string,
    ) {
        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: ACCESS_TOKEN_MAX_AGE,
        });
        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });
    }
}
