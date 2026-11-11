import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';

loadDotenv({ path: resolve(__dirname, '../../.env') });

const readEnvironment = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`Missing environment variable ${key}`);
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(readEnvironment('PORT', '5001')),
  databaseUrl: readEnvironment('DATABASE_URL', 'postgres://remember:password@localhost:5556/remember'),
  jwtSecret: readEnvironment('JWT_SECRET', isProduction ? undefined : 'dev-only-secret'),
  jwtTtl: readEnvironment('JWT_TTL', '30d'),
  clientOrigin: readEnvironment('CLIENT_ORIGIN', 'http://localhost:3000'),
  production: isProduction,
  /**
   * How many proxies (load balancer, Heroku router, nginx) sit in front of the app.
   * Needed so rate limits see each visitor's real IP instead of the proxy's. 0 = none.
   */
  trustProxyHops: Number(readEnvironment('TRUST_PROXY_HOPS', '0')),

  // Google and Facebook sign-in are turned off. To bring them back, uncomment these
  // and the matching code in AuthService and the SignIn form.
  // googleClientId: readEnvironment('GOOGLE_CLIENT_ID', ''),
  // googleClientSecret: readEnvironment('GOOGLE_CLIENT_SECRET', ''),
  // facebookClientId: readEnvironment('FB_CLIENT_ID', ''),
  // facebookClientSecret: readEnvironment('FB_CLIENT_SECRET', ''),
};

const WEAK_SECRETS = new Set(['change-me', 'dev-only-secret', 'secret', 'password', '']);
const MINIMUM_SECRET_LENGTH = 32;

/** Refuse to start in production with unsafe settings. */
export function validateConfig() {
  if (!config.production) return;

  if (WEAK_SECRETS.has(config.jwtSecret) || config.jwtSecret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MINIMUM_SECRET_LENGTH} characters and not a well-known default. `
      + 'Generate one with: openssl rand -hex 32',
    );
  }

  if (!process.env.DATABASE_URL) throw new Error('Missing required environment variable: DATABASE_URL');
}
