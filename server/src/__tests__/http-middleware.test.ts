import { z, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { handle, parse, idParam, uuidParam, errorHandler } from '../middleware/http';
import { HttpError } from '../services/errors';

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, headers: {}, ...overrides } as unknown as Request;
}

function mockRes(): Response {
  const res: any = {
    headersSent: false,
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('handle()', () => {
  it('wraps async function and sends JSON', async () => {
    const fn = jest.fn().mockResolvedValue({ ok: true });
    const handler = handle(fn);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards errors to next', async () => {
    const err = new Error('boom');
    const fn = jest.fn().mockRejectedValue(err);
    const handler = handle(fn);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('sends 204 for undefined return', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const handler = handle(fn);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});

describe('parse()', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('validates with zod schema', () => {
    const result = parse(schema, { name: 'alice' });
    expect(result).toEqual({ name: 'alice' });
  });

  it('throws ZodError for invalid data', () => {
    expect(() => parse(schema, { name: '' })).toThrow(ZodError);
  });
});

describe('idParam()', () => {
  it('returns number for valid id', () => {
    const req = mockReq({ params: { id: '42' } } as any);
    expect(idParam(req)).toBe(42);
  });

  it('throws for invalid id', () => {
    const req = mockReq({ params: { id: 'abc' } } as any);
    expect(() => idParam(req)).toThrow('Invalid id');
  });
});

describe('uuidParam()', () => {
  it('returns uuid for valid format', () => {
    const req = mockReq({ params: { uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' } } as any);
    expect(uuidParam(req)).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('throws for invalid format', () => {
    const req = mockReq({ params: { uuid: 'not-a-uuid' } } as any);
    expect(() => uuidParam(req)).toThrow('Invalid uuid');
  });
});

describe('errorHandler()', () => {
  it('handles ZodError with 400', () => {
    const schema = z.object({ name: z.string() });
    let zodErr: ZodError;
    try {
      schema.parse({ name: 123 });
    } catch (e) {
      zodErr = e as ZodError;
    }

    const res = mockRes();
    const next = jest.fn();
    errorHandler(zodErr!, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ issues: expect.any(Array) }),
    );
  });

  it('handles HttpError with custom status', () => {
    const err = new HttpError(403, 'Forbidden');
    const res = mockRes();
    const next = jest.fn();
    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('handles unknown error with 500', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('unexpected');
    const res = mockRes();
    const next = jest.fn();
    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong on our side' });
    spy.mockRestore();
  });
});
