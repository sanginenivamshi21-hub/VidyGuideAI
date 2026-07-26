import { Controller, Get, Put, Body, UseGuards, Req, HttpStatus, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';

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
    const fullName = body.fullName;
    const password = body.password;

    const updateData: any = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }

    if (password) {
      if (password.length < 6) {
        throw new HttpException('Password must be at least 6 characters.', HttpStatus.BAD_REQUEST);
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updateData).length === 0) {
      throw new HttpException('No update fields provided.', HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
      },
    });

    return { success: true, user: updatedUser };
  }
}
