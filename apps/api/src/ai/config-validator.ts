import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ConfigValidator implements OnModuleInit {
  private readonly logger = new Logger(ConfigValidator.name);

  onModuleInit() {
    const errors: string[] = [];

    const configs = [
      { key: 'GROQ_API_KEY', model: 'GROQ_MODEL', name: 'Groq' },
      { key: 'GEMINI_API_KEY', model: 'GEMINI_MODEL', name: 'Gemini' },
      { key: 'OPENROUTER_API_KEY', model: 'OPENROUTER_MODEL', name: 'OpenRouter' },
    ];

    for (const c of configs) {
      if (process.env[c.key]) {
        if (!process.env[c.model]) {
          this.logger.warn(`[${c.name}] API key set but ${c.model} not specified. Using default model.`);
        } else {
          this.logger.log(`[${c.name}] configured with model=${process.env[c.model]}`);
        }
      }
    }

    const anyKeySet = configs.some((c) => !!process.env[c.key]);
    if (!anyKeySet) {
      errors.push('No AI provider API keys set (GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY)');
    }

    if (errors.length > 0) {
      for (const err of errors) {
        this.logger.error(err);
      }
    }
  }
}
