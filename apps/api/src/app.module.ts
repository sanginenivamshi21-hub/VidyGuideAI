import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './ai/ai.module';
import { CareerModule } from './career/career.module';
import { ResumeModule } from './resume/resume.module';
import { OcrModule } from './ocr/ocr.module';
import { MentorModule } from './mentor/mentor.module';
import { TranslatorModule } from './translator/translator.module';
import { HistoryModule } from './history/history.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { ConversationsModule } from './conversations/conversations.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
        DatabaseModule,
        AuthModule,
        MailModule,
        AiModule,
        CareerModule,
        ResumeModule,
        OcrModule,
        MentorModule,
        TranslatorModule,
        HistoryModule,
        UsersModule,
        SettingsModule,
        ConversationsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
