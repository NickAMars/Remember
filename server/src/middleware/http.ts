import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodError, type ZodTypeAny } from 'zod';
import { HttpError } from '../services/errors';

export const handle =
  (fn: (req: Request, res: Response) => Promise<unknown> | unknown): RequestHandler =>
  async (req, res, next) => {
    try {
      const out = await fn(req, res);
      if (!res.headersSent) out === undefined ? res.status(204).end() : res.json(out);
    } catch (error) {
      next(error);
    }
  };

export const parse = <Schema extends ZodTypeAny>(schema: Schema, data: unknown): z.infer<Schema> =>
  schema.parse(data);

export const idParam = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid id');
  return id;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidParam = (req: Request, key = 'uuid') => {
  const uuid = req.params[key];
  if (!uuid || !UUID_REGEX.test(uuid)) throw new HttpError(400, 'Invalid uuid');
  return uuid;
};

export const queryInt = (value: unknown, fallback: number, min = 0): number => {
  if (value === undefined || value === null) return Math.max(min, fallback);
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(min, parsed) : fallback;
};

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({
      error: first ? `${first.path.join('.') || 'input'}: ${first.message}` : 'Invalid input',
      issues: err.issues,
    });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err && typeof err === 'object' && 'type' in err && (err as { type: unknown }).type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side' });
}
