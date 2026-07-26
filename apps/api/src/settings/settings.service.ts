import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) {}

    async getSettings(userId: number) {
        let settings = await this.prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            settings = await this.prisma.userSettings.create({
                data: { userId },
            });
        }
        return settings;
    }

    async updateSettings(
        userId: number,
        data: Partial<{
            theme: string;
            language: string;
            accentColor: string;
            speechRate: number;
            speechPitch: number;
            voiceName: string;
            model: string;
            temperature: number;
            maxTokens: number;
            autoSpeak: boolean;
            autoTranslate: boolean;
            notifications: boolean;
            animations: boolean;
            sidebarCollapsed: boolean;
            defaultResumeStyle: string;
            chatHistory: boolean;
        }>,
    ) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
    }

    async deleteSettings(userId: number) {
        return this.prisma.userSettings.deleteMany({ where: { userId } });
    }
}
