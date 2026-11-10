import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '../../.env') });

const env = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`Missing environment variable ${key}`);
  return value;
};

export const config = {
  port: Number(env('PORT', '5001')),
  databaseUrl: env('DATABASE_URL', 'postgres://remember:password@localhost:5556/remember'),
  jwtSecret: env('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-only-secret'),
  jwtTtl: env('JWT_TTL', '30d'),
  dbSync: env('DB_SYNC', 'false') === 'true',
  clientOrigin: env('CLIENT_ORIGIN', 'http://localhost:3000'),
  hashKey: env('HASH_KEY', 'dev-hash-key'),
  googleClientId: env('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: env('GOOGLE_CLIENT_SECRET', ''),
  fbClientId: env('FB_CLIENT_ID', ''),
  fbClientSecret: env('FB_CLIENT_SECRET', ''),
  production: process.env.NODE_ENV === 'production',
};

const WEAK_SECRETS = new Set(['change-me', 'dev-only-secret', 'secret', 'password', '']);

export function validateConfig() {
  if (!config.production) return;

  if (WEAK_SECRETS.has(config.jwtSecret)) {
    throw new Error(
      'JWT_SECRET is not set or is a well-known default. '
      + 'Generate a strong secret with: openssl rand -hex 32',
    );
  }

  if (config.dbSync) {
    throw new Error(
      'DB_SYNC must not be true in production. '
      + 'Use migrations instead: npm run migration:run',
    );
  }

  const required = ['DATABASE_URL'] as const;
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
}
