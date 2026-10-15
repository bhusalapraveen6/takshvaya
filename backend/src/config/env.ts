import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().default('takshvaya-super-secret-access-token-key-2026-min-64-characters-very-secure'),
  JWT_REFRESH_SECRET: z.string().default('takshvaya-super-secret-refresh-token-key-2026-min-64-characters-very-secure'),
  JWT_ADMIN_SECRET: z.string().default('takshvaya-super-secret-admin-token-key-2026-min-64-characters-very-secure'),
  
  // Mandatory Google OAuth Settings
  GOOGLE_CLIENT_ID: z.string().default('mock-google-client-id.apps.googleusercontent.com'),
  GOOGLE_CLIENT_SECRET: z.string().default('mock-google-client-secret'),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),
  
  // Admin Allowlist (Strict environment-only configuration)
  ADMIN_EMAIL: z.string().email().default(process.env.ADMIN_EMAIL || 'admin@takshvaya.org'),
  ADMIN_PHONE: z.string().default(process.env.ADMIN_PHONE || '9876543210'),
  
  // Database & Storage
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // Anti-Fraud / CAPTCHA
  TURNSTILE_SECRET_KEY: z.string().default('mock-turnstile-secret-key'),
});

export const ENV = envSchema.parse(process.env);
