import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ConversationsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(userId: number) {
        return this.prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { messages: true } } },
        });
    }

    async findOne(id: number, userId: number) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id, userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!conversation)
            throw new NotFoundException('Conversation not found');
        return conversation;
    }

    async create(userId: number, title: string) {
        return this.prisma.conversation.create({
            data: { userId, title },
        });
    }

    async update(
        id: number,
        userId: number,
        data: { title?: string; pinned?: boolean },
    ) {
        const existing = await this.prisma.conversation.findFirst({
            where: { id, userId },
        });
        if (!existing) throw new NotFoundException('Conversation not found');
        return this.prisma.conversation.update({ where: { id }, data });
    }

    async remove(id: number, userId: number) {
        const existing = await this.prisma.conversation.findFirst({
            where: { id, userId },
        });
        if (!existing) throw new NotFoundException('Conversation not found');
        return this.prisma.conversation.delete({ where: { id } });
    }

    async addMessage(
        conversationId: number,
        userId: number,
        role: string,
        content: string,
    ) {
        const existing = await this.prisma.conversation.findFirst({
            where: { id: conversationId, userId },
        });
        if (!existing) throw new NotFoundException('Conversation not found');
        return this.prisma.message.create({
            data: { conversationId, role, content },
        });
    }
}
