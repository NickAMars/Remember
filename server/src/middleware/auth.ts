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

/** Reject the request with 401 unless it carries a valid `Authorization: Bearer <token>` header. */
export const requireAuth =
  (authService: AuthService): RequestHandler =>
  async (request, _response, next) => {
    try {
      const header = request.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
      if (!token) throw new HttpError(401, 'Please sign in');
      request.currentUser = await authService.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };

/** The signed-in user's uuid. Only call this on routes behind `requireAuth`. */
export const userUuid = (request: Request): string => {
  if (!request.currentUser) throw new HttpError(401, 'Please sign in');
  return request.currentUser.sub;
};
