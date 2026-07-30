import { z } from 'zod';

export const envSchema = z.object({
    PORT: z
        .string()
        .transform((val) => parseInt(val, 10))
        .default('8000'),
    DATABASE_URL: z
        .string()
        .url('DATABASE_URL must be a valid PostgreSQL connection string.'),
    JWT_SECRET: z
        .string()
        .min(
            16,
            'JWT_SECRET must be at least 16 characters long for security.',
        ),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email').optional(),
    GROQ_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    REDIS_URL: z.string().optional(),
});

export function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Invalid environment variables:', result.error.format());
        process.exit(1);
    }

    if (result.data.RESEND_FROM_EMAIL === 'onboarding@resend.dev') {
        console.warn('WARNING: RESEND_FROM_EMAIL is onboarding@resend.dev - emails will ONLY reach the Resend account owner. Configure a verified custom domain for production delivery to all users.');
    }
}
export type EnvConfig = z.infer<typeof envSchema>;
