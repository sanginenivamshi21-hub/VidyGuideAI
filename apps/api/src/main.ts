import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  // Validate required variables before launching
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Parse HTTP cookies for JWT extraction
  app.use(cookieParser());

  // Request validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Enable CORS configuration for frontend
  app.enableCors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`VidyGuideAI NestJS API running on: http://localhost:${port}`);
}
bootstrap();
