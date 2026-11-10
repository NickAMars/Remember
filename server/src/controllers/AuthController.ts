import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { LOGIN_RATE_LIMIT_WINDOW_MS, MAX_LOGIN_ATTEMPTS } from '../constants';
import { handle, parse } from '../middleware/http';
import { AuthService } from '../services/AuthService';
import { TYPES } from '../types';
import type { Controller } from '../interfaces/controller';

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

    router.post('/signup', handle(async (req) => {
      const { username, passwordDigest } = parse(z.object({
        username: z.string().min(1).max(120),
        passwordDigest: z.string().length(64).regex(/^[a-f0-9]+$/),
      }), req.body);
      return this.auth.signup(username, passwordDigest);
    }));

    router.post('/login', loginLimit, handle(async (req) => {
      const { username, passwordDigest } = parse(z.object({
        username: z.string().min(1).max(120),
        passwordDigest: z.string().length(64).regex(/^[a-f0-9]+$/),
      }), req.body);
      return this.auth.login(username, passwordDigest);
    }));

    router.get('/logout', handle(() => ({ ok: true })));

    return router;
  }
}
