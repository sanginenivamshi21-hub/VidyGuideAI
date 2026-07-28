import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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
