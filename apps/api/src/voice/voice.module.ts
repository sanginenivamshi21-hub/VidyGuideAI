import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';

@Module({
  controllers: [VoiceController],
})
export class VoiceModule {}
