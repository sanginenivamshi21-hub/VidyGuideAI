import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';

@Module({
  controllers: [OcrController],
})
export class OcrModule {}
