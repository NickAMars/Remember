import { inject, injectable } from 'inversify';
import { DataSource, In, Repository } from 'typeorm';
import { CardReview, Folder, SubCard, User } from '../entities';
import { MILLISECONDS_PER_DAY } from '../constants';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';
import { requireUserId } from './ownership';
import { buildQuizCards, type Quiz } from './quiz';

/* ── SM-2 algorithm ──────────────────────────────────────────────── */

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

/** Kept for older imports. */
export type SM2Input = SM2State;
export type SM2Result = SM2State;

export const MINIMUM_EASE_FACTOR = 1.3;
export const STARTING_EASE_FACTOR = 2.5;

/**
 * SuperMemo-2. `quality` is 0–5: under 3 means the answer was wrong.
 * Returns the new ease factor, interval in days and repetition count.
 */
export function sm2(state: SM2State, quality: number): SM2State {
  let { easeFactor, interval, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
    if (quality >= 4) easeFactor += 0.1;
  }

  easeFactor = Math.max(MINIMUM_EASE_FACTOR, easeFactor);
  return { easeFactor, interval, repetitions };
}

/** Quality score for a quiz answer: a correct flash card is "easy", a correct multiple choice is "ok". */
export function qualityFor(result: { correct: boolean; mode: 'choice' | 'flash' }): number {
  if (!result.correct) return 0;
  return result.mode === 'flash' ? 4 : 3;
}

/* ── Service ─────────────────────────────────────────────────────── */

export interface ReviewResult {
  subCardUuid: string;
  correct: boolean;
  mode: 'choice' | 'flash';
}

export interface DueCounts {
  total: number;
  byFolder: { folderUuid: string; folderName: string; count: number }[];
}

/** A card is due when the user never reviewed it, or its next review time has passed. */
const DUE_CONDITION = '(review.id IS NULL OR review.nextReviewAt <= :now)';
const REVIEW_JOIN = 'review.subCardId = card.id AND review.userId = :userId';

@injectable()
export class ReviewService {
  private reviews: Repository<CardReview>;
  private subCards: Repository<SubCard>;
  private folders: Repository<Folder>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.reviews = dataSource.getRepository(CardReview);
    this.subCards = dataSource.getRepository(SubCard);
    this.folders = dataSource.getRepository(Folder);
    this.users = dataSource.getRepository(User);
  }

  /** Save quiz answers and move each card's next review date with SM-2. */
  async submitResults(userUuid: string, results: ReviewResult[]): Promise<void> {
    if (results.length === 0) return;

    const userId = await requireUserId(this.users, userUuid);

    // Security: only cards in the user's own decks. Before this, anyone could create
    // review rows for another user's cards by sending their uuids.
    const cardUuids = [...new Set(results.map((result) => result.subCardUuid))];
    const ownedCards = await this.subCards.createQueryBuilder('card')
      .innerJoin('card.masterCard', 'deck')
      .select(['card.id', 'card.uuid'])
      .where('card.uuid IN (:...cardUuids)', { cardUuids })
      .andWhere('deck.userId = :userId', { userId })
      .getMany();
    if (ownedCards.length === 0) return;
    const cardIdByUuid = new Map(ownedCards.map((card) => [card.uuid, card.id]));

    const existingReviews = await this.reviews.find({
      where: { userId, subCardId: In([...cardIdByUuid.values()]) },
    });
    const reviewByCardId = new Map(existingReviews.map((review) => [review.subCardId, review]));

    const now = new Date();
    const reviewsToSave = new Set<CardReview>();

    for (const result of results) {
      const subCardId = cardIdByUuid.get(result.subCardUuid);
      if (!subCardId) continue;

      let review = reviewByCardId.get(subCardId);
      if (!review) {
        review = this.reviews.create({
          userId,
          subCardId,
          easeFactor: STARTING_EASE_FACTOR,
          interval: 0,
          repetitions: 0,
          nextReviewAt: now,
          lastReviewedAt: now,
        });
        reviewByCardId.set(subCardId, review);
      }

      const nextState = sm2(
        { easeFactor: review.easeFactor, interval: review.interval, repetitions: review.repetitions },
        qualityFor(result),
      );

      review.easeFactor = nextState.easeFactor;
      review.interval = nextState.interval;
      review.repetitions = nextState.repetitions;
      review.lastReviewedAt = now;
      review.nextReviewAt = new Date(now.getTime() + nextState.interval * MILLISECONDS_PER_DAY);
      // Bug fix: the same card answered twice in one quiz used to be saved twice.
      reviewsToSave.add(review);
    }

    if (reviewsToSave.size > 0) await this.reviews.save([...reviewsToSave]);
  }

  /**
   * How many cards are due, in total and per folder.
   * perf Increase: counted in SQL. This used to load every card and every review the
   * user has into memory on each Home page load.
   */
  async getDueCounts(userUuid: string): Promise<DueCounts> {
    const userId = await requireUserId(this.users, userUuid);
    const now = new Date();

    const total = await this.subCards.createQueryBuilder('card')
      .innerJoin('card.masterCard', 'deck')
      .leftJoin(CardReview, 'review', REVIEW_JOIN, { userId })
      .where('deck.userId = :userId', { userId })
      .andWhere(DUE_CONDITION, { now })
      .getCount();

    if (total === 0) return { total: 0, byFolder: [] };

    const folderRows: { folderUuid: string; folderName: string; count: string }[] = await this.folders
      .createQueryBuilder('folder')
      .innerJoin('folder.masterCards', 'deck')
      .innerJoin(SubCard, 'card', 'card.masterCardId = deck.id')
      .leftJoin(CardReview, 'review', REVIEW_JOIN, { userId })
      .select('folder.uuid', 'folderUuid')
      .addSelect('folder.name', 'folderName')
      .addSelect('COUNT(DISTINCT card.id)', 'count')
      .where('folder.userId = :userId', { userId })
      .andWhere(DUE_CONDITION, { now })
      .groupBy('folder.id')
      .addGroupBy('folder.uuid')
      .addGroupBy('folder.name')
      .orderBy('folder.name', 'ASC')
      .getRawMany();

    return {
      total,
      byFolder: folderRows
        .map((row) => ({ folderUuid: row.folderUuid, folderName: row.folderName, count: Number(row.count) }))
        .filter((row) => row.count > 0),
    };
  }

  /** A quiz made of the cards in a folder that are due (or new) for this user. */
  async getDueCards(userUuid: string, folderUuid: string, count?: number): Promise<Quiz> {
    const userId = await requireUserId(this.users, userUuid);

    const folder = await this.folders.findOne({
      where: { uuid: folderUuid, userId },
      relations: ['masterCards'],
    });
    if (!folder) throw notFound('Folder not found');

    const decks = folder.masterCards || [];
    if (decks.length === 0) throw badRequest('This folder has no decks');

    const quiz = await buildQuizCards(this.subCards, decks, { count, dueForUserId: userId });
    if (quiz.available === 0) throw badRequest('No cards are due for review in this folder');

    return { folder: { uuid: folder.uuid, name: folder.name }, ...quiz };
  }
}
