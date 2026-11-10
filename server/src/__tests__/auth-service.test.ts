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
  BCRYPT_SALT_ROUNDS: 12,
}));

// Suppress TypeORM decorator errors
jest.mock('typeorm', () => {
  const noop = () => () => undefined;
  const noopClass = () => undefined;
  return {
    Entity: noop,
    Column: noop,
    PrimaryGeneratedColumn: noop,
    Generated: noop,
    CreateDateColumn: noop,
    UpdateDateColumn: noop,
    ManyToOne: noop,
    OneToMany: noop,
    DataSource: noopClass,
    Repository: noopClass,
  };
});

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

function buildService(): AuthService {
  const svc = Object.create(AuthService.prototype);
  (svc as any).users = mockRepo;
  return svc;
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
      expect(jwt.sign).toHaveBeenCalled();
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

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
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

    it('throws 401 for nonexistent user', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'gone', name: 'ghost', authType: 'local' });
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(svc.verify('token')).rejects.toThrow(
        expect.objectContaining({ status: 401, message: 'Please sign in again' }),
      );
    });
  });
});
