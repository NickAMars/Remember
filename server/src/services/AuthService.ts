import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { config } from '../config';
import { BCRYPT_SALT_ROUNDS } from '../constants';
import type { UserClaims } from '../interfaces/auth';
import { User, MasterCard, SubCard, PoolCard } from '../entities';
import { TYPES } from '../types';
import { HttpError, badRequest } from './errors';

export type { UserClaims } from '../interfaces/auth';

@injectable()
export class AuthService {
  private users: Repository<User>;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private poolCards: Repository<PoolCard>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.users = dataSource.getRepository(User);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.poolCards = dataSource.getRepository(PoolCard);
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

  async deactivateAccount(userUuid: string): Promise<void> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw new HttpError(404, 'User not found');

    // Remove all pool cards authored by this user
    const poolCards = await this.poolCards.findBy({ author: userUuid });
    if (poolCards.length > 0) {
      await this.poolCards.remove(poolCards);
    }

    // Removing the user cascades to master cards, subcards, progress
    await this.users.remove(user);
  }

  private async createWelcomeCards(userId: number): Promise<void> {
    const masterCard = this.masterCards.create({ title: 'How to Use Remember', userId, isDefault: true });
    await this.masterCards.save(masterCard);

    const tutorialCards = [
      {
        title: 'Welcome to Remember',
        descriptions: 'Remember is a flashcard app that helps you memorize anything. Create decks, add cards, study them, and track your progress over time.',
      },
      {
        title: 'Creating a Deck',
        descriptions: 'Go to the Main page and scroll to the bottom. Enter a deck name in the "Create Master Card" section and click Create. This is your new topic.',
      },
      {
        title: 'Adding Flashcards',
        descriptions: 'Open a deck and click the + Add Cards button. You can add cards one at a time or upload an Excel/CSV file with columns for title and description.',
      },
      {
        title: 'Studying Your Cards',
        descriptions: 'Click any flashcard to flip it and reveal the answer. Try to recall the answer before flipping. Each flip is tracked as a view.',
      },
      {
        title: 'Editing & Deleting',
        descriptions: 'Hover over a card to see the edit (pencil) and delete (X) icons. Edit opens a modal to update the title and description. Delete asks for confirmation.',
      },
      {
        title: 'Card Size Control',
        descriptions: 'Use the slider above your cards to change how many cards show per row. Choose between 4, 3, 2, or 1 cards per row to fit your preference.',
      },
      {
        title: 'Tracking Progress',
        descriptions: 'The Main page shows a histogram of your top 5 most-viewed decks. Inside each deck, a pie chart shows which cards you view the most.',
      },
      {
        title: 'Sharing Cards Publicly',
        descriptions: 'On the My Cards page, check the "Public" checkbox on any deck to share it with other users. You can share up to 5 decks at a time.',
      },
      {
        title: 'Browsing Public Cards',
        descriptions: 'Visit the Browse page to see decks shared by other users. Click any deck to study it. Your views are tracked separately from the owner.',
      },
      {
        title: 'Navigation',
        descriptions: 'Use the menu icon in the top-right to navigate between pages. The breadcrumb trail at the top of each page lets you go back to previous pages.',
      },
    ];

    const subCards = tutorialCards.map(sc =>
      this.subCards.create({ title: sc.title, descriptions: sc.descriptions, masterCardId: masterCard.id }),
    );
    await this.subCards.save(subCards);
  }
}
