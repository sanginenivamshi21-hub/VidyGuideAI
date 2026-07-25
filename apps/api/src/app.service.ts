import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'UP',
      message: 'VidyGuideAI NestJS API Running ✅',
      version: '3.0.0-foundation',
      timestamp: new Date().toISOString(),
    };
  }
}
