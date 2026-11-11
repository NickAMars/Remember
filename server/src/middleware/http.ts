import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { z, ZodError, type ZodTypeAny } from 'zod';
import { HttpError } from '../services/errors';
import { UUID_REGEX } from '../utils/validation';

/**
 * Wrap an async route. Whatever the function returns is sent as JSON;
 * returning `undefined` sends 204 No Content; thrown errors go to `errorHandler`.
 */
export const handle =
  (routeHandler: (request: Request, response: Response) => Promise<unknown> | unknown): RequestHandler =>
  async (request, response, next) => {
    try {
      const result = await routeHandler(request, response);
      if (response.headersSent) return;
      if (result === undefined) response.status(204).end();
      else response.json(result);
    } catch (error) {
      next(error);
    }
  };

export const parse = <Schema extends ZodTypeAny>(schema: Schema, data: unknown): z.infer<Schema> =>
  schema.parse(data);

export const idParam = (request: Request) => {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid id');
  return id;
};

/** Read a uuid route parameter and reject anything that is not a uuid (keeps bad input away from Postgres). */
export const uuidParam = (request: Request, key = 'uuid') => {
  const uuid = request.params[key];
  if (!uuid || !UUID_REGEX.test(uuid)) throw new HttpError(400, 'Invalid uuid');
  return uuid.toLowerCase();
};

interface StatusError {
  status?: number;
  statusCode?: number;
  type?: string;
  expose?: boolean;
  message?: string;
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return response.status(400).json({
      error: firstIssue ? `${firstIssue.path.join('.') || 'input'}: ${firstIssue.message}` : 'Invalid input',
      issues: error.issues,
    });
  }
  if (error instanceof HttpError) return response.status(error.status).json({ error: error.message });

  if (error instanceof MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large (5 MB max)' : 'File upload failed';
    return response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: message });
  }

  // Errors from express.json(): bad JSON (400) or body too large (413).
  const statusError = (error && typeof error === 'object' ? error : {}) as StatusError;
  if (statusError.type === 'entity.parse.failed') return response.status(400).json({ error: 'Invalid JSON' });
  if (statusError.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request is too large. Try importing fewer cards at once.' });
  }
  const status = statusError.status ?? statusError.statusCode;
  if (status && status >= 400 && status < 500 && statusError.expose) {
    return response.status(status).json({ error: statusError.message || 'Bad request' });
  }

  // Security: never send stack traces or database errors to the browser.
  console.error(error);
  response.status(500).json({ error: 'Something went wrong on our side' });
}
