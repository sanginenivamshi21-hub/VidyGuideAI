import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [DatabaseModule, AuthModule, MailModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
