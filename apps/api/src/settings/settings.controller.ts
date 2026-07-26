import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    async getSettings(@Req() req: any) {
        return this.settingsService.getSettings(req.user.userId);
    }

    @Put()
    async updateSettings(@Req() req: any, @Body() body: any) {
        return this.settingsService.updateSettings(req.user.userId, body);
    }
}
