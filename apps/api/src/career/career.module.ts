import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [CareerController],
})
export class CareerModule {}
