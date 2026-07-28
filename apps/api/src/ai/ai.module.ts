import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GroqProvider } from './providers/groq.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ProviderFactory } from './providers/provider-factory';

@Module({
  providers: [
    AiService,
    GroqProvider,
    GeminiProvider,
    OpenRouterProvider,
    ProviderFactory,
  ],
  exports: [AiService],
})
export class AiModule {}
