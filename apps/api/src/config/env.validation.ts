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
    GROQ_API_KEY: z.string().optional(),
    CLOUDINARY_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
});

export function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Invalid environment variables:', result.error.format());
        process.exit(1);
    }
}
export type EnvConfig = z.infer<typeof envSchema>;
