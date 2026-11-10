import type { Request, RequestHandler } from 'express';
import type { UserClaims } from '../interfaces/auth';
import type { AuthService } from '../services/AuthService';
import { HttpError } from '../services/errors';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserClaims;
    }
  }
}

export const requireAuth =
  (auth: AuthService): RequestHandler =>
  async (req, _res, next) => {
    try {
      const header = req.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
      if (!token) throw new HttpError(401, 'Please sign in');
      req.currentUser = await auth.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };

export const userId = (req: Request): number => {
  if (!req.currentUser) throw new HttpError(401, 'Please sign in');
  return (req as any)._userId;
};

export const userUuid = (req: Request): string => {
  if (!req.currentUser) throw new HttpError(401, 'Please sign in');
  return req.currentUser.sub;
};
