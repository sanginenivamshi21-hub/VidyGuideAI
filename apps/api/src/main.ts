import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { validateEnv } from './config/env.validation';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    logger.log('Validating environment variables...');
    validateEnv();

    const app = await NestFactory.create(AppModule);

    const localDevOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8501',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8501',
        'http://127.0.0.1:8000',
    ];

    const renderWebUrl = 'https://vidyguideai-web.onrender.com';
    const renderApiUrl = 'https://vidyguideai-api.onrender.com';

    const corsOrigins = [
        renderWebUrl,
        renderApiUrl,
        ...localDevOrigins,
        process.env.CLIENT_URL,
        process.env.APP_BASE_URL,
    ].filter((v): v is string => Boolean(v));

    app.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || corsOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked request from origin: ${origin}`);
                callback(null, false);
            }
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, Cookie, X-Requested-With',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

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
                        "'self'",
                        renderWebUrl,
                        ...localDevOrigins,
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

    try {
        const prisma = app.get(PrismaService);
        const deleteCount = await prisma.user.deleteMany({
            where: {
                email: {
                    endsWith: '@example.com',
                },
            },
        });
        if (deleteCount.count > 0) {
            logger.log(`[CLEANUP] Purged ${deleteCount.count} dummy user account(s) ending with @example.com`);
        }
    } catch (dbError) {
        logger.error(`[CLEANUP] Failed to clean up dummy users: ${(dbError as Error).message}`);
    }

    const port = Number(process.env.PORT) || 8000;
    await app.listen(port, '0.0.0.0');

    logger.log(`VidyGuideAI API running on port ${port}`);
    logger.log(`CORS origins: ${corsOrigins.join(', ')}`);
    logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    logger.log(`Email sender: ${process.env.BREVO_SENDER_EMAIL || 'not configured'}`);
}
bootstrap();
