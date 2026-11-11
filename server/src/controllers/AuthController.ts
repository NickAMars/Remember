import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { LOGIN_RATE_LIMIT_WINDOW_MS, MAX_LOGIN_ATTEMPTS, MAX_SIGNUPS_PER_WINDOW } from '../constants';
import { handle, parse } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

/** Letters, numbers, dot, dash and underscore. Stops look-alike and blank-looking names. */
export const usernameField = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(32, 'Username must be at most 32 characters')
  .regex(/^[A-Za-z0-9_.-]+$/, 'Username can only use letters, numbers, ".", "-" and "_"');

/** The client sends a SHA-256 hex digest of the password; the server bcrypts that digest. */
const passwordDigestField = z.string().length(64).regex(/^[a-f0-9]+$/);

const credentialsBody = z.object({ username: usernameField, passwordDigest: passwordDigestField });
// Sign in accepts any existing name (older accounts may not match the new username rules).
const loginBody = z.object({ username: z.string().trim().min(1).max(120), passwordDigest: passwordDigestField });

@injectable()
export class AuthController implements Controller {
  basePath = '/auth';

  constructor(@inject(TYPES.AuthService) private auth: AuthService) {}

  router() {
    const router = Router();

    const loginLimit = rateLimit({
      windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
      limit: MAX_LOGIN_ATTEMPTS,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' },
    });

    // Security: sign-up had no limit, so a script could create unlimited accounts.
    const signupLimit = rateLimit({
      windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
      limit: MAX_SIGNUPS_PER_WINDOW,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many new accounts from this address. Try again later.' },
    });

    router.post('/signup', signupLimit, handle(async (request) => {
      const { username, passwordDigest } = parse(credentialsBody, request.body);
      return this.auth.signup(username, passwordDigest);
    }));

    router.post('/login', loginLimit, handle(async (request) => {
      const { username, passwordDigest } = parse(loginBody, request.body);
      return this.auth.login(username, passwordDigest);
    }));

    // Google and Facebook sign-in are switched off. The server never had /auth/google or
    // /auth/facebook routes (the client buttons pointed at nothing). The OAuth helper is kept,
    // commented out, in AuthService.findOrCreateOAuth and config.ts.

    // Tokens are stateless, so signing out is done by the client dropping its token.
    router.get('/logout', handle(() => ({ ok: true })));

    return router;
  }
}
