import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

interface ProviderConfig {
  key: string;
  modelEnv: string;
  name: string;
  defaultModel: string;
  docs: string;
}

const PROVIDERS: ProviderConfig[] = [
  { key: 'GROQ_API_KEY', modelEnv: 'GROQ_MODEL', name: 'Groq', defaultModel: 'llama-3.3-70b-versatile', docs: 'https://console.groq.com/keys' },
  { key: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', name: 'Gemini', defaultModel: 'gemini-2.5-flash', docs: 'https://aistudio.google.com/apikey' },
  { key: 'OPENROUTER_API_KEY', modelEnv: 'OPENROUTER_MODEL', name: 'OpenRouter', defaultModel: 'openai/gpt-4o-mini', docs: 'https://openrouter.ai/keys' },
];

@Injectable()
export class ConfigValidator implements OnModuleInit {
  private readonly logger = new Logger(ConfigValidator.name);

  onModuleInit() {
    const anyConfigured = PROVIDERS.some((p) => !!process.env[p.key]);

    if (!anyConfigured) {
      this.logger.error('No AI providers configured. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env');
      return;
    }

    for (const p of PROVIDERS) {
      const hasKey = !!process.env[p.key];
      const model = process.env[p.modelEnv] || p.defaultModel;

      if (!hasKey) {
        this.logger.warn(`⚠ ${p.name} disabled — no API key (${p.docs})`);
        continue;
      }

      if (!process.env[p.modelEnv]) {
        this.logger.log(`✓ ${p.name} Ready (model=${model}, default)`);
      } else {
        this.logger.log(`✓ ${p.name} Ready (model=${model})`);
      }
    }
  }
}
