import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ResumeController],
})
export class ResumeModule {}
