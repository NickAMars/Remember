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
        title: 'What is Remember?',
        descriptions: 'Remember is a flashcard app that helps you study and memorize anything. Create decks, add question & answer cards, study them, and track your progress over time.',
      },
      {
        title: 'How do I create a deck?',
        descriptions: 'Go to the Home page and scroll to the bottom. Enter a deck name and click Create Master Card. This creates a new topic deck you can fill with question & answer cards.',
      },
      {
        title: 'How do I add flashcards?',
        descriptions: 'Open a deck and click the + Add Cards button. Add cards one at a time with a question and answer (up to 5000 characters), or upload an Excel/CSV file with Column A for questions and Column B for answers.',
      },
      {
        title: 'How do I study my cards?',
        descriptions: 'Click any card to flip it and reveal the answer. Try to recall the answer before flipping. Each flip is tracked as a view and updates the pie chart in real time.',
      },
      {
        title: 'How do I edit or delete cards?',
        descriptions: 'Hover over a card to see the edit (pencil) and delete (X) icons. Edit opens a dialog to update the question and answer. Delete asks for confirmation. Note: you cannot edit or delete cards that are currently shared publicly.',
      },
      {
        title: 'How do I change card size?',
        descriptions: 'Use the size controls above your cards to change how many cards show per row. Choose between 4, 3, 2, or 1 cards per row to fit your preference.',
      },
      {
        title: 'How do I track my progress?',
        descriptions: 'The Home page shows a histogram of your top 5 most-viewed decks. Inside each deck, a pie chart shows which cards you view the most. Both update in real time as you study.',
      },
      {
        title: 'How do I share cards publicly?',
        descriptions: 'On the Study page, click the share icon on any deck to make it public. You can share up to 5 decks. On your 5th share you will see a warning that it is your last. Unshare a deck by clicking the share icon again. Copied decks cannot be re-shared.',
      },
      {
        title: 'How do I browse public cards?',
        descriptions: 'Visit the Browse page to see decks shared by other users. Click any deck to study it. Your views are tracked separately. Use the copy button to add a public deck to your own Study collection.',
      },
      {
        title: 'How do I navigate the app?',
        descriptions: 'Use the bookmark icon in the top-right to open the side menu. Navigate between Home, Study, and Browse. Click System for Logout or Deactivate Account options. The breadcrumb trail in the header helps you navigate back.',
      },
    ];

    const subCards = tutorialCards.map(sc =>
      this.subCards.create({ title: sc.title, descriptions: sc.descriptions, masterCardId: masterCard.id }),
    );
    await this.subCards.save(subCards);
  }
}
