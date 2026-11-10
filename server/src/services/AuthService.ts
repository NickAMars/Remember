import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { config } from '../config';
import { BCRYPT_SALT_ROUNDS } from '../constants';
import type { UserClaims } from '../interfaces/auth';
import { User } from '../entities';
import { TYPES } from '../types';
import { HttpError, badRequest } from './errors';

export type { UserClaims } from '../interfaces/auth';

@injectable()
export class AuthService {
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.users = dataSource.getRepository(User);
  }

  async signup(username: string, passwordDigest: string) {
    const existing = await this.users.findOneBy({ name: username });
    if (existing) throw badRequest('Username already taken');

    const passwordHash = await bcrypt.hash(passwordDigest, BCRYPT_SALT_ROUNDS);
    const user = this.users.create({ name: username, passwordHash, authType: 'local' });
    await this.users.save(user);

    const claims: UserClaims = { sub: user.uuid, name: user.name, authType: 'local' };
    const token = jwt.sign(claims, config.jwtSecret, { expiresIn: config.jwtTtl as jwt.SignOptions['expiresIn'] });
    return { token, user: { uuid: user.uuid, name: user.name, authType: user.authType } };
  }

  async login(username: string, passwordDigest: string) {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.name = :name', { name: username })
      .getOne();

    if (!user || !user.passwordHash || !(await bcrypt.compare(passwordDigest, user.passwordHash))) {
      throw new HttpError(401, 'Username or password is incorrect');
    }

    const claims: UserClaims = { sub: user.uuid, name: user.name, authType: user.authType as UserClaims['authType'] };
    const token = jwt.sign(claims, config.jwtSecret, { expiresIn: config.jwtTtl as jwt.SignOptions['expiresIn'] });
    return { token, user: { uuid: user.uuid, name: user.name, authType: user.authType } };
  }

  async verify(token: string): Promise<UserClaims> {
    let claims: UserClaims;
    try {
      claims = jwt.verify(token, config.jwtSecret) as unknown as UserClaims;
    } catch {
      throw new HttpError(401, 'Please sign in again');
    }
    const user = await this.users.findOneBy({ uuid: String(claims.sub) });
    if (!user) throw new HttpError(401, 'Please sign in again');
    return { sub: user.uuid, name: user.name, authType: user.authType as UserClaims['authType'] };
  }

  async findOrCreateOAuth(code: string, name: string, authType: 'google' | 'facebook') {
    let user = await this.users.findOneBy({ oauthCode: code, authType });
    if (!user) {
      user = this.users.create({ oauthCode: code, name, authType });
      await this.users.save(user);
    }
    const claims: UserClaims = { sub: user.uuid, name: user.name, authType };
    const token = jwt.sign(claims, config.jwtSecret, { expiresIn: config.jwtTtl as jwt.SignOptions['expiresIn'] });
    return { token, user: { uuid: user.uuid, name: user.name, authType: user.authType } };
  }

  async getUserByUuid(uuid: string): Promise<User | null> {
    return this.users.findOneBy({ uuid });
  }

  static hash(passwordDigest: string) {
    return bcrypt.hash(passwordDigest, BCRYPT_SALT_ROUNDS);
  }

  static async sha256(plaintext: string): Promise<string> {
    const { createHash } = await import('node:crypto');
    return createHash('sha256').update(plaintext).digest('hex');
  }
}
