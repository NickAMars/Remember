import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { config } from '../config';
import { BCRYPT_SALT_ROUNDS, DATABASE_INSERT_CHUNK_SIZE, JWT_ALGORITHM } from '../constants';
import { TUTORIAL_CARDS, TUTORIAL_DECK_TITLE } from '../constants/tutorial';
import type { UserClaims } from '../interfaces/auth';
import { User, MasterCard, SubCard, PoolCard } from '../entities';
import { TYPES } from '../types';
import { HttpError, badRequest } from './errors';

export type { UserClaims } from '../interfaces/auth';

export interface AuthResult {
  token: string;
  user: { uuid: string; name: string; authType: string };
}

/**
 * Sign-up, sign-in and token checks.
 * The browser sends a SHA-256 digest of the password (never the password itself),
 * and the server stores a bcrypt hash of that digest.
 */
@injectable()
export class AuthService {
  private users: Repository<User>;
  private poolCards: Repository<PoolCard>;
  private dataSource: DataSource;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.users = dataSource.getRepository(User);
    this.poolCards = dataSource.getRepository(PoolCard);
  }

  private signToken(user: User): AuthResult {
    const claims: UserClaims = { sub: user.uuid, name: user.name, authType: 'local' };
    const token = jwt.sign(claims, config.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: config.jwtTtl as jwt.SignOptions['expiresIn'],
    });
    return { token, user: { uuid: user.uuid, name: user.name, authType: user.authType } };
  }

  async signup(username: string, passwordDigest: string): Promise<AuthResult> {
    const existing = await this.users.findOneBy({ name: username });
    if (existing) throw badRequest('Username already taken');

    const passwordHash = await bcrypt.hash(passwordDigest, BCRYPT_SALT_ROUNDS);

    // The user and their tutorial deck are created together or not at all.
    const user = await this.dataSource.transaction(async (transaction) => {
      const userRepository = transaction.getRepository(User);
      const newUser = await userRepository.save(userRepository.create({ name: username, passwordHash, authType: 'local' }));
      await this.createWelcomeDeck(transaction.getRepository(MasterCard), transaction.getRepository(SubCard), newUser.id);
      return newUser;
    });

    return this.signToken(user);
  }

  async login(username: string, passwordDigest: string): Promise<AuthResult> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.name = :name', { name: username })
      .getOne();

    // Security: same message whether the user exists or not, so names can't be probed.
    if (!user || !user.passwordHash || !(await bcrypt.compare(passwordDigest, user.passwordHash))) {
      throw new HttpError(401, 'Username or password is incorrect');
    }
    return this.signToken(user);
  }

  async verify(token: string): Promise<UserClaims> {
    let claims: UserClaims;
    try {
      // Security: pin the algorithm so a token signed with "none" or another algorithm is rejected.
      claims = jwt.verify(token, config.jwtSecret, { algorithms: [JWT_ALGORITHM] }) as unknown as UserClaims;
    } catch {
      throw new HttpError(401, 'Please sign in again');
    }
    if (!claims || typeof claims.sub !== 'string') throw new HttpError(401, 'Please sign in again');
    // The user must still exist, so a deactivated account's old token stops working.
    const user = await this.users.findOneBy({ uuid: claims.sub });
    if (!user) throw new HttpError(401, 'Please sign in again');
    return { sub: user.uuid, name: user.name, authType: 'local' };
  }

  // Google and Facebook sign-in are turned off. Kept here, commented out, in case they come back.
  // async findOrCreateOAuth(code: string, name: string, authType: 'google' | 'facebook') {
  //   let user = await this.users.findOneBy({ oauthCode: code, authType });
  //   if (!user) {
  //     user = this.users.create({ oauthCode: code, name, authType });
  //     await this.users.save(user);
  //   }
  //   return this.signToken(user);
  // }

  async getUserByUuid(uuid: string): Promise<User | null> {
    return this.users.findOneBy({ uuid });
  }

  async deactivateAccount(userUuid: string): Promise<void> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw new HttpError(404, 'User not found');

    // Public decks point at the user by uuid (not a foreign key), so remove them first.
    await this.poolCards.delete({ author: userUuid });
    // Removing the user cascades to decks, cards, progress, folders and reviews.
    await this.users.remove(user);
  }

  private async createWelcomeDeck(
    masterCardRepository: Repository<MasterCard>,
    subCardRepository: Repository<SubCard>,
    userId: number,
  ): Promise<void> {
    const deck = await masterCardRepository.save(
      masterCardRepository.create({ title: TUTORIAL_DECK_TITLE, userId, isDefault: true }),
    );
    const cards = TUTORIAL_CARDS.map((tutorialCard) =>
      subCardRepository.create({ title: tutorialCard.title, descriptions: tutorialCard.descriptions, masterCardId: deck.id }),
    );
    await subCardRepository.save(cards, { chunk: DATABASE_INSERT_CHUNK_SIZE });
  }
}
