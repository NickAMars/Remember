import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { MasterCard, SubCard, Progress, User, PoolCard } from '../entities';
import { TYPES } from '../types';
import { badRequest } from './errors';
import { currentDate, previousEight, mixdate, calculateTimeSpent, type TopFiveEntry } from './helpers';
import { requireOwnedDeck, requireUserId } from './ownership';
import { DATABASE_INSERT_CHUNK_SIZE, MAX_PROGRESS_DAYS, MAX_STUDY_SESSION_MS } from '../constants';
import { cleanWrongAnswers, escapeLikePattern, type Pagination } from '../utils/validation';

export interface NewCard {
  title: string;
  description: string;
  link?: string;
  wrongAnswers?: string[];
}

export interface DeckPage {
  items: MasterCard[];
  total: number;
}

/** Decks ("master cards"): list, create, rename, delete and record study time. */
@injectable()
export class MasterCardService {
  private dataSource: DataSource;
  private masterCards: Repository<MasterCard>;
  private progressRepository: Repository<Progress>;
  private users: Repository<User>;
  private poolCards: Repository<PoolCard>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.masterCards = dataSource.getRepository(MasterCard);
    this.progressRepository = dataSource.getRepository(Progress);
    this.users = dataSource.getRepository(User);
    this.poolCards = dataSource.getRepository(PoolCard);
  }

  /** One deck's details (title, flags, counters). Counts as a view. */
  async getOne(deckUuid: string, userUuid: string): Promise<MasterCard> {
    const userId = await requireUserId(this.users, userUuid);
    // perf Increase: the deck page only needs the deck itself. Its cards come from the
    // paginated cards endpoint, so they are no longer loaded here.
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    await this.masterCards.increment({ id: deck.id }, 'views', 1);
    deck.views += 1;
    return deck;
  }

  /** The user's decks, newest first, each with a card count. Optional paging and title search. */
  async getAllForUser(userUuid: string, pagination: Pagination = {}): Promise<DeckPage> {
    const userId = await requireUserId(this.users, userUuid);

    // perf Increase: count cards in SQL instead of loading them, and skip the progress
    // rows, which the deck list never shows.
    const query = this.masterCards.createQueryBuilder('deck')
      .loadRelationCountAndMap('deck.subCardCount', 'deck.subCards')
      .where('deck.userId = :userId', { userId });

    if (pagination.search) {
      query.andWhere("LOWER(deck.title) LIKE :search ESCAPE '\\'", {
        search: `%${escapeLikePattern(pagination.search.toLowerCase())}%`,
      });
    }

    query.orderBy('deck.createdAt', 'DESC');
    if (pagination.page !== undefined && pagination.pageSize !== undefined) {
      query.skip(pagination.page * pagination.pageSize).take(pagination.pageSize);
    }

    // perf Increase: one round trip for the rows and the total.
    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }

  /** Create a deck with its cards in one transaction, so a failure never leaves half a deck. */
  async create(userUuid: string, title: string, cards: NewCard[]): Promise<MasterCard> {
    const userId = await requireUserId(this.users, userUuid);
    const trimmedTitle = title.trim();

    const existing = await this.masterCards.findOneBy({ title: trimmedTitle, userId });
    if (existing) throw badRequest(`You already have a deck called "${trimmedTitle}"`);

    const questions = cards.map((card) => card.title);
    if (new Set(questions).size !== questions.length) {
      throw badRequest('Duplicate questions found in the provided cards');
    }

    const deck = await this.dataSource.transaction(async (transaction) => {
      const deckRepository = transaction.getRepository(MasterCard);
      const cardRepository = transaction.getRepository(SubCard);
      const newDeck = await deckRepository.save(deckRepository.create({ title: trimmedTitle, userId }));
      const newCards = cards.map((card) =>
        cardRepository.create({
          title: card.title,
          descriptions: card.description,
          link: card.link || '',
          wrongAnswers: cleanWrongAnswers(card.wrongAnswers, card.description),
          masterCardId: newDeck.id,
        }),
      );
      await cardRepository.save(newCards, { chunk: DATABASE_INSERT_CHUNK_SIZE });
      return newDeck;
    });

    // perf Increase: return only the new deck. This used to return every deck the user owns.
    deck.subCardCount = cards.length;
    return deck;
  }

  async update(deckUuid: string, userUuid: string, title: string, date?: string): Promise<MasterCard> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    if (deck.isDefault) throw badRequest('Cannot edit the default tutorial card');

    const trimmedTitle = title.trim();
    if (trimmedTitle !== deck.title) {
      const duplicate = await this.masterCards.findOneBy({ title: trimmedTitle, userId });
      if (duplicate) throw badRequest(`You already have a deck called "${trimmedTitle}"`);
      // Keep the public copy's title in step, since sharing is matched by title.
      await this.poolCards.update({ author: userUuid, title: deck.title }, { title: trimmedTitle });
    }

    deck.title = trimmedTitle;
    if (date) {
      const parsedDate = new Date(date);
      // Bug fix: an invalid date used to be saved and crash with a database error.
      if (Number.isNaN(parsedDate.getTime())) throw badRequest('Invalid date');
      deck.createdAt = parsedDate;
    }
    await this.masterCards.save(deck);
    return deck;
  }

  async delete(deckUuid: string, userUuid: string): Promise<void> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    if (deck.isDefault) throw badRequest('Cannot delete the default tutorial card');

    // Also remove the public copy, if the deck was shared.
    await this.poolCards.delete({ author: userUuid, title: deck.title });
    await this.masterCards.remove(deck);
  }

  /**
   * Add `timeMs` of study time to today's entry for this deck and keep the last
   * MAX_PROGRESS_DAYS days. Returns the deck's new total.
   */
  async recordTime(deckUuid: string, userUuid: string, timeMs: number): Promise<{ uuid: string; timespent: number }> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    const sessionTime = Math.min(Math.max(0, Math.round(timeMs)), MAX_STUDY_SESSION_MS);

    const today = currentDate(new Date());
    // Bug fix: progress rows used to come back in no fixed order, so "the last entry"
    // could be any day. Sort them by day.
    const progressEntries = await this.progressRepository.find({
      where: { masterCardId: deck.id },
      order: { dayCreated: 'ASC' },
    });

    await this.dataSource.transaction(async (transaction) => {
      const progressRepository = transaction.getRepository(Progress);
      const lastEntry = progressEntries[progressEntries.length - 1];

      if (lastEntry && Number(currentDate(new Date(lastEntry.dayCreated))) === Number(today)) {
        await progressRepository.increment({ id: lastEntry.id }, 'time', sessionTime);
        return;
      }

      const previousDays = previousEight();
      const earlierDays = progressEntries.length === 0
        ? previousDays.map((day) => ({ time: 0, dayCreated: day }))
        : mixdate(previousDays, progressEntries.map((entry) => ({ time: entry.time, dayCreated: entry.dayCreated })));

      const newEntries = [...earlierDays, { time: sessionTime, dayCreated: today }]
        .slice(-MAX_PROGRESS_DAYS)
        .map((entry) => progressRepository.create({ time: entry.time, dayCreated: new Date(entry.dayCreated), masterCardId: deck.id }));

      await progressRepository.delete({ masterCardId: deck.id });
      await progressRepository.save(newEntries);
    });

    const savedEntries = await this.progressRepository.find({ where: { masterCardId: deck.id }, select: ['time', 'dayCreated'] });
    const timespent = calculateTimeSpent(savedEntries);
    await this.masterCards.update({ id: deck.id }, { timespent });
    // perf Increase: return the new total only. This used to return every deck the user owns.
    return { uuid: deck.uuid, timespent };
  }

  /** Every deck the user owns, most viewed first, in the shape the Home page list and chart use. */
  async getAllByViews(userUuid: string): Promise<TopFiveEntry[]> {
    const user = await this.users.findOne({ where: { uuid: userUuid }, select: ['id'] });
    if (!user) return [];

    // perf Increase: only the four columns the Home page shows.
    const decks = await this.masterCards.find({
      where: { userId: user.id },
      select: ['uuid', 'title', 'views', 'createdAt'],
      order: { views: 'DESC' },
    });

    return decks.map((deck) => ({
      maxTime: deck.views,
      referenceID: deck.uuid,
      title: deck.title,
      timestamp: deck.createdAt,
    }));
  }
}
