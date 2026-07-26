import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHealth() {
        return {
            status: 'UP',
            message: 'VidyGuideAI NestJS API Running ✅',
            version: '3.1.1',
            timestamp: new Date().toISOString(),
        };
    }
}
