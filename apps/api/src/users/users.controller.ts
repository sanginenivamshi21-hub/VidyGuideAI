import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Body,
    UseGuards,
    Req,
    HttpStatus,
    HttpException,
    UseInterceptors,
    UploadedFile,
    Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import type { Response } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('profile')
    async getProfile(@Req() req: any) {
        const userId = req.user.userId;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                profilePicture: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }

        const careerCount = await this.prisma.history.count({
            where: { userId, actionType: 'career' },
        });

        const resumeCount = await this.prisma.history.count({
            where: { userId, actionType: 'resume' },
        });

        const mentorCount = await this.prisma.history.count({
            where: { userId, actionType: 'mentor' },
        });

        return {
            user,
            stats: {
                career_count: careerCount,
                resume_count: resumeCount,
                mentor_count: mentorCount,
            },
        };
    }

    @Put('profile')
    async updateProfile(@Req() req: any, @Body() body: any) {
        const userId = req.user.userId;
        const { fullName, password } = body;

        const updateData: Record<string, any> = {};

        if (fullName !== undefined) {
            updateData.fullName = fullName.trim();
        }

        if (password) {
            if (password.length < 6) {
                throw new HttpException(
                    'Password must be at least 6 characters.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);

            await this.prisma.session.deleteMany({ where: { userId } });
        }

        if (Object.keys(updateData).length === 0) {
            throw new HttpException(
                'No update fields provided.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                profilePicture: true,
            },
        });

        return { success: true, user: updatedUser };
    }

    @Post('profile/picture')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfilePicture(@Req() req: any, @UploadedFile() file: any) {
        if (!file) {
            throw new HttpException(
                'No file uploaded.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new HttpException(
                'Only JPEG, PNG, WebP, and GIF images are allowed.',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new HttpException(
                'File size must be under 5MB.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const base64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        const updated = await this.prisma.user.update({
            where: { id: req.user.userId },
            data: { profilePicture: dataUri },
            select: { profilePicture: true },
        });

        return { success: true, profilePicture: updated.profilePicture };
    }

    @Delete('profile/picture')
    async deleteProfilePicture(@Req() req: any) {
        await this.prisma.user.update({
            where: { id: req.user.userId },
            data: { profilePicture: '' },
        });
        return { success: true };
    }

    @Delete('account')
    async deleteAccount(@Req() req: any) {
        const userId = req.user.userId;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }

        await this.prisma.session.deleteMany({ where: { userId } });
        await this.prisma.history.deleteMany({ where: { userId } });
        await this.prisma.careerHistory.deleteMany({ where: { userId } });
        await this.prisma.resumeHistory.deleteMany({ where: { userId } });
        await this.prisma.conversation.deleteMany({ where: { userId } });
        await this.prisma.notification.deleteMany({ where: { userId } });
        await this.prisma.userSettings.deleteMany({ where: { userId } });
        await this.prisma.user.delete({ where: { id: userId } });

        return { success: true };
    }

    @Get('export')
    async exportData(@Req() req: any, @Res() res: Response) {
        const userId = req.user.userId;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                profilePicture: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        const settings = await this.prisma.userSettings.findUnique({
            where: { userId },
        });
        const history = await this.prisma.history.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const conversations = await this.prisma.conversation.findMany({
            where: { userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { updatedAt: 'desc' },
        });
        type ConversationWithMessages = (typeof conversations)[number];
        type MessageFromConversation =
            ConversationWithMessages['messages'][number];

        const careerHistories = await this.prisma.careerHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const resumeHistories = await this.prisma.resumeHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const exportData = {
            exportedAt: new Date().toISOString(),
            version: '3.2.0',
            user,
            settings,
            stats: {
                conversations: conversations.length,
                messages: conversations.reduce(
                    (sum: number, c: ConversationWithMessages) =>
                        sum + c.messages.length,
                    0,
                ),
                historyEntries: history.length,
                careerHistories: careerHistories.length,
                resumeHistories: resumeHistories.length,
            },
            history,
            conversations: conversations.map((c: ConversationWithMessages) => ({
                id: c.id,
                title: c.title,
                pinned: c.pinned,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                messages: c.messages.map((m: MessageFromConversation) => ({
                    role: m.role,
                    content: m.content,
                    createdAt: m.createdAt,
                })),
            })),
            careerHistories,
            resumeHistories,
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=vidyguide-export.json',
        );
        res.json(exportData);
    }
}
