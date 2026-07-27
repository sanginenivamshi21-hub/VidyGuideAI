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

    // 1. Enable CORS first to handle OPTIONS preflight correctly before any other middleware
    app.enableCors({
        origin: [
            'https://vidyguideai-web.onrender.com',
            'http://localhost:3000',
            'http://localhost:3001',
            process.env.CLIENT_URL,
        ].filter(Boolean),
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, Cookie, X-Requested-With',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // 2. Cookie parser next
    app.use(cookieParser());

    // 3. Helmet security middleware
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
                        'https://vidyguideai-web.onrender.com',
                        process.env.CLIENT_URL || '',
                        'http://localhost:3000',
                        'http://localhost:3001',
                        "'self'",
                    ].filter(Boolean),
                    upgradeInsecureRequests: null,
                },
            },
            crossOriginOpenerPolicy: false,
            crossOriginResourcePolicy: false,
            xFrameOptions: false,
        }),
    );

    // 4. Global validation pipes
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const port = Number(process.env.PORT) || 8000;
    await app.listen(port, '0.0.0.0');
    logger.log(`VidyGuideAI API running on port ${port}`);
}
bootstrap();
