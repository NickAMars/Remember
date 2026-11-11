// Mock inversify decorators before any import
jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$12$hashed'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
}));

jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret', jwtTtl: '1h' },
}));

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  BCRYPT_SALT_ROUNDS: 12,
}));

// Suppress TypeORM decorator errors
jest.mock('typeorm', () => require('./support/typeormMock'));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';
import { HttpError } from '../services/errors';

const mockQueryBuilder = {
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockRepo = {
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data: any) => ({ ...data, uuid: 'test-uuid', id: 1 })),
  save: jest.fn((entity: any) => Promise.resolve(entity)),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockDeckRepo = { create: jest.fn((data: any) => ({ ...data, id: 1 })), save: jest.fn((entity: any) => Promise.resolve(entity)) };
const mockCardRepo = { create: jest.fn((data: any) => data), save: jest.fn((entity: any) => Promise.resolve(entity)) };

// The transaction hands back the same mock repositories, keyed by entity class name.
const mockTransaction = {
  getRepository: jest.fn((entity: { name: string }) =>
    ({ User: mockRepo, MasterCard: mockDeckRepo, SubCard: mockCardRepo } as Record<string, unknown>)[entity.name]),
};
const mockDataSource = { transaction: jest.fn((work: (manager: unknown) => unknown) => work(mockTransaction)) };

function buildService(): AuthService {
  const service = Object.create(AuthService.prototype);
  (service as any).users = mockRepo;
  (service as any).poolCards = { delete: jest.fn() };
  (service as any).dataSource = mockDataSource;
  return service;
}

beforeEach(() => jest.clearAllMocks());

describe('AuthService', () => {
  const svc = buildService();

  describe('signup', () => {
    it('creates user and returns token + user info', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await svc.signup('alice', 'password123');

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ name: 'alice' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'alice',
        passwordHash: '$2a$12$hashed',
        authType: 'local',
      });
      expect(mockRepo.save).toHaveBeenCalled();
      // The welcome deck is made in the same transaction as the user.
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockDeckRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isDefault: true, userId: 1 }));
      expect(mockCardRepo.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(expect.anything(), 'test-secret', expect.objectContaining({ algorithm: 'HS256' }));
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: { uuid: 'test-uuid', name: 'alice', authType: 'local' },
      });
    });

    it('throws on duplicate username', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, name: 'alice' });

      await expect(svc.signup('alice', 'password123')).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    it('returns token for correct credentials', async () => {
      const user = { uuid: 'u-1', name: 'alice', passwordHash: '$2a$12$hashed', authType: 'local' };
      mockQueryBuilder.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await svc.login('alice', 'password123');

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual({ uuid: 'u-1', name: 'alice', authType: 'local' });
    });

    it('throws 401 for wrong password', async () => {
      const user = { uuid: 'u-1', name: 'alice', passwordHash: '$2a$12$hashed', authType: 'local' };
      mockQueryBuilder.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(svc.login('alice', 'wrong')).rejects.toThrow(
        expect.objectContaining({ status: 401 }),
      );
    });

    it('throws 401 for unknown user', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(svc.login('nobody', 'pass')).rejects.toThrow(
        expect.objectContaining({ status: 401 }),
      );
    });
  });

  describe('verify', () => {
    it('returns claims for valid token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u-1', name: 'alice', authType: 'local' });
      mockRepo.findOneBy.mockResolvedValue({ uuid: 'u-1', name: 'alice', authType: 'local' });

      const claims = await svc.verify('valid-token');

      // Security: the algorithm is pinned, so a token signed with "none" or RS256 is refused.
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret', { algorithms: ['HS256'] });
      expect(claims).toEqual({ sub: 'u-1', name: 'alice', authType: 'local' });
    });

    it('throws 401 for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(svc.verify('bad-token')).rejects.toThrow(
        expect.objectContaining({ status: 401, message: 'Please sign in again' }),
      );
    });

    it('throws 401 when the token has no subject', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ name: 'alice' });

      await expect(svc.verify('token')).rejects.toThrow(expect.objectContaining({ status: 401 }));
    });

    it('throws 401 for nonexistent user', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'gone', name: 'ghost', authType: 'local' });
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(svc.verify('token')).rejects.toThrow(
        expect.objectContaining({ status: 401, message: 'Please sign in again' }),
      );
    });
  });
});
