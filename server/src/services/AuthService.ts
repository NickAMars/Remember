import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { config } from '../config';
import { BCRYPT_SALT_ROUNDS } from '../constants';
import type { UserClaims } from '../interfaces/auth';
import { User, MasterCard, SubCard } from '../entities';
import { TYPES } from '../types';
import { HttpError, badRequest } from './errors';

export type { UserClaims } from '../interfaces/auth';

@injectable()
export class AuthService {
  private users: Repository<User>;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.users = dataSource.getRepository(User);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
  }

  async signup(username: string, passwordDigest: string) {
    const existing = await this.users.findOneBy({ name: username });
    if (existing) throw badRequest('Username already taken');

    const passwordHash = await bcrypt.hash(passwordDigest, BCRYPT_SALT_ROUNDS);
    const user = this.users.create({ name: username, passwordHash, authType: 'local' });
    await this.users.save(user);

    await this.createWelcomeCards(user.id);

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

  private async createWelcomeCards(userId: number): Promise<void> {
    const welcomeData = [
      {
        title: 'Getting Started',
        subCards: [
          {
            title: 'Welcome to Remember',
            descriptions: 'Remember is a flashcard app designed to help you memorize anything. Create cards, study them, and track your progress over time.',
          },
          {
            title: 'How Cards Work',
            descriptions: 'Each master card is a topic or subject. Inside each master card you can create sub cards which are individual flashcards with a front and back side.',
          },
        ],
      },
      {
        title: 'Creating Cards',
        subCards: [
          {
            title: 'Create a Master Card',
            descriptions: "Go to the Main page and use the 'Create Master Card' section at the bottom. Give your topic a name and click create.",
          },
          {
            title: 'Add Sub Cards',
            descriptions: 'Once inside a master card, use the + button to add flashcards. Enter a title for the front and a description for the back.',
          },
        ],
      },
      {
        title: 'Studying',
        subCards: [
          {
            title: 'Flip to Reveal',
            descriptions: 'Hover over any flashcard to flip it and reveal the answer on the back side. Test yourself before flipping!',
          },
          {
            title: 'Track Your Time',
            descriptions: 'The app tracks how long you spend studying each card set. Your top 5 most studied topics appear on the main dashboard.',
          },
        ],
      },
      {
        title: 'Your Collection',
        subCards: [
          {
            title: 'Mine Page',
            descriptions: 'The Mine page shows all your master cards. Click any card to view and edit its flashcards.',
          },
          {
            title: 'Edit and Delete',
            descriptions: 'Use the pencil icon to rename a master card and the X icon to delete it. You can also delete individual sub cards.',
          },
        ],
      },
      {
        title: 'Pool Cards',
        subCards: [
          {
            title: 'Share with Others',
            descriptions: 'Use the checkbox on any of your cards in the Mine page to share it to the public pool for other users to find.',
          },
          {
            title: 'Browse the Pool',
            descriptions: 'Visit the More page to browse cards shared by other users. You can copy any pool card to your own collection.',
          },
        ],
      },
    ];

    for (const data of welcomeData) {
      const masterCard = this.masterCards.create({ title: data.title, userId });
      await this.masterCards.save(masterCard);

      const subCards = data.subCards.map(sc =>
        this.subCards.create({ title: sc.title, descriptions: sc.descriptions, masterCardId: masterCard.id }),
      );
      await this.subCards.save(subCards);
    }
  }
}
