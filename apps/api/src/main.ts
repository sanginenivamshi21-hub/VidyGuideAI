import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
    validateEnv();

    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    app.use(cookieParser());
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    connectSrc: [
                        "'self'",
                        'https://www.google.com',
                        'https://www.googleapis.com',
                    ],
                    mediaSrc: ["'self'", 'blob:', 'https:'],
                    frameAncestors: [
                        process.env.CLIENT_URL || 'http://localhost:3000',
                        "'self'",
                    ],
                    upgradeInsecureRequests: null,
                },
            },
            crossOriginOpenerPolicy: false,
            crossOriginResourcePolicy: false,
            xFrameOptions: false,
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.enableCors({
        origin: [
            process.env.CLIENT_URL || 'http://localhost:3000',
            'http://localhost:3001',
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        ].filter(Boolean),
        credentials: true,
    });

    const port = Number(process.env.PORT) || 8000;
    await app.listen(port, '0.0.0.0');
    logger.log(`VidyGuideAI API running on port ${port}`);
}
bootstrap();
