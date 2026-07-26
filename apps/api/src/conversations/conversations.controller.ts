import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
    constructor(private readonly service: ConversationsService) {}

    @Get()
    async findAll(@Req() req: any) {
        return this.service.findAll(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.service.findOne(Number(id), req.user.userId);
    }

    @Post()
    async create(@Req() req: any, @Body('title') title: string) {
        return this.service.create(req.user.userId, title || 'New Chat');
    }

    @Put(':id')
    async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
        return this.service.update(Number(id), req.user.userId, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        return this.service.remove(Number(id), req.user.userId);
    }

    @Post(':id/messages')
    async addMessage(
        @Param('id') id: string,
        @Req() req: any,
        @Body('role') role: string,
        @Body('content') content: string,
    ) {
        return this.service.addMessage(
            Number(id),
            req.user.userId,
            role,
            content,
        );
    }
}
