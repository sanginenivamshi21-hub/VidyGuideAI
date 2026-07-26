import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHistory(@Req() req: any) {
    const userId = req.user.userId;
    return this.prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async saveHistory(@Req() req: any, @Body() body: any) {
    const userId = req.user.userId;
    const actionType = body.actionType || '';
    const title = body.title || '';
    const payload = body.payload || {};
    const result = body.result || '';

    const log = await this.prisma.history.create({
      data: {
        userId,
        actionType,
        title,
        payload,
        result,
      },
    });

    return { success: true, log };
  }

  @Delete(':id')
  async deleteHistoryItem(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const itemId = parseInt(id, 10);

    const log = await this.prisma.history.findUnique({ where: { id: itemId } });
    if (log && log.userId === userId) {
      await this.prisma.history.delete({ where: { id: itemId } });
      return { success: true };
    }
    return { success: false, message: 'Item not found or unauthorized.' };
  }

  @Delete()
  async clearAllHistory(@Req() req: any) {
    const userId = req.user.userId;
    await this.prisma.history.deleteMany({ where: { userId } });
    return { success: true };
  }
}
