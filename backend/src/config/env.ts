import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DB_HOST: z.string().min(1, 'DB_HOST is required'),
    DB_PORT: z.coerce.number().default(3306),
    DB_USER: z.string().min(1, 'DB_USER is required'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
    DB_NAME: z.string().min(1, 'DB_NAME is required'),

    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),

    FEATURE_RSVP: z
        .string()
        .default('false')
        .transform((val) => val === 'true'),
    FEATURE_2FA: z
        .string()
        .default('false')
        .transform((val) => val === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error(`Environment validation failed:\n${JSON.stringify(formatted, null, 2)}`);
}

export const env = parsed.data;
