import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getRoot() {
        return {
            status: 'ok',
            service: 'VidyGuideAI API',
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'healthy',
        };
    }
}
