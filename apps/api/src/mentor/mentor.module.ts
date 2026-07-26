import { Module } from '@nestjs/common';
import { MentorController } from './mentor.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [MentorController],
})
export class MentorModule {}
