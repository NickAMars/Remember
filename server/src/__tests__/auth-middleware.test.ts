import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../services/errors';

function mockReq(authHeader?: string): Request {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
    params: {},
  } as unknown as Request;
}

function mockRes(): Response {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('requireAuth', () => {
  const mockClaims = { sub: 'u-1', name: 'alice', authType: 'local' as const };

  it('calls next() with valid token', async () => {
    const auth = {
      verify: jest.fn().mockResolvedValue(mockClaims),
    } as any;

    const middleware = requireAuth(auth);
    const req = mockReq('Bearer valid-token');
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(auth.verify).toHaveBeenCalledWith('valid-token');
    expect(req.currentUser).toEqual(mockClaims);
    expect(next).toHaveBeenCalledWith();
  });

  it('sends 401 for missing token', async () => {
    const auth = { verify: jest.fn() } as any;

    const middleware = requireAuth(auth);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    // The error is passed to next, not sent directly
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
    expect(error.message).toBe('Please sign in');
  });

  it('sends 401 for invalid token', async () => {
    const auth = {
      verify: jest.fn().mockRejectedValue(new HttpError(401, 'Please sign in again')),
    } as any;

    const middleware = requireAuth(auth);
    const req = mockReq('Bearer bad-token');
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
  });
});
