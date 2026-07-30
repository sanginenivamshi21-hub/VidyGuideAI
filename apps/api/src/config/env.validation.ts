import { z } from 'zod';

const WEAK_JWT_PATTERNS = ['fallback', 'development', 'test', 'password', 'changeme'];

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

    const { JWT_SECRET, RESEND_FROM_EMAIL, NODE_ENV } = result.data;

    if (NODE_ENV === 'production') {
        const lowerSecret = JWT_SECRET.toLowerCase();
        const isWeak = WEAK_JWT_PATTERNS.some(pattern => lowerSecret.includes(pattern));
        if (isWeak) {
            console.warn('WARNING: JWT_SECRET contains a common development pattern. Generate a strong random secret for production security. Use: openssl rand -hex 32');
        }

        if (RESEND_FROM_EMAIL === 'onboarding@resend.dev') {
            console.warn('WARNING: RESEND_FROM_EMAIL is onboarding@resend.dev. This sender can ONLY deliver to the Resend account owner\'s email. For production delivery to all users, verify a custom domain in https://resend.com/domains');
        }

        if (!process.env.RESEND_API_KEY) {
            console.warn('WARNING: RESEND_API_KEY is not set. Email sending will be disabled.');
        }
    }
}
export type EnvConfig = z.infer<typeof envSchema>;
