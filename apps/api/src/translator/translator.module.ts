import { Module } from '@nestjs/common';
import { TranslatorController } from './translator.controller';

@Module({
    controllers: [TranslatorController],
})
export class TranslatorModule {}
