import { inject, injectable } from 'inversify';
import { DataSource, In, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { CardReview, Folder, MasterCard, SubCard, User } from '../entities';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';
import { pickChoices, shuffle, type Quiz, type QuizCard } from './FolderService';

/* ── SM-2 algorithm ──────────────────────────────────────────────── */

export interface SM2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export function sm2(input: SM2Input, quality: number): SM2Result {
  let { easeFactor, interval, repetitions } = input;

  if (quality < 3) {
    // Wrong — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Correct
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    if (quality >= 4) {
      easeFactor += 0.1;
    }
  }

  easeFactor = Math.max(1.3, easeFactor);
  return { easeFactor, interval, repetitions };
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

@injectable()
export class ReviewService {
  private reviews: Repository<CardReview>;
  private subCards: Repository<SubCard>;
  private masterCards: Repository<MasterCard>;
  private folders: Repository<Folder>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.reviews = dataSource.getRepository(CardReview);
    this.subCards = dataSource.getRepository(SubCard);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.folders = dataSource.getRepository(Folder);
    this.users = dataSource.getRepository(User);
  }

  private async userId(userUuid: string): Promise<number> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');
    return user.id;
  }

  async submitResults(userUuid: string, results: ReviewResult[]): Promise<void> {
    if (results.length === 0) return;

    const userId = await this.userId(userUuid);

    // Resolve sub card UUIDs to IDs
    const uuids = [...new Set(results.map(r => r.subCardUuid))];
    const cards = await this.subCards.find({
      where: { uuid: In(uuids) },
      select: ['id', 'uuid'],
    });
    const uuidToId = new Map(cards.map(c => [c.uuid, c.id]));

    // Fetch existing reviews for these cards
    const subCardIds = [...uuidToId.values()];
    const existing = subCardIds.length
      ? await this.reviews.find({ where: { userId, subCardId: In(subCardIds) } })
      : [];
    const reviewMap = new Map(existing.map(r => [r.subCardId, r]));

    const now = new Date();
    const toSave: CardReview[] = [];

    for (const result of results) {
      const subCardId = uuidToId.get(result.subCardUuid);
      if (!subCardId) continue;

      const quality = !result.correct ? 0 : result.mode === 'flash' ? 4 : 3;

      let review = reviewMap.get(subCardId);
      if (!review) {
        review = this.reviews.create({
          userId,
          subCardId,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewAt: now,
          lastReviewedAt: now,
        });
        reviewMap.set(subCardId, review);
      }

      const updated = sm2(
        { easeFactor: review.easeFactor, interval: review.interval, repetitions: review.repetitions },
        quality,
      );

      review.easeFactor = updated.easeFactor;
      review.interval = updated.interval;
      review.repetitions = updated.repetitions;
      review.lastReviewedAt = now;
      review.nextReviewAt = new Date(now.getTime() + updated.interval * 86_400_000);

      toSave.push(review);
    }

    if (toSave.length > 0) {
      await this.reviews.save(toSave);
    }
  }

  async getDueCounts(userUuid: string): Promise<DueCounts> {
    const userId = await this.userId(userUuid);
    const now = new Date();

    // Get all user's sub cards with their master card IDs
    const userSubCards: { id: number; masterCardId: number }[] = await this.subCards
      .createQueryBuilder('sc')
      .innerJoin('sc.masterCard', 'mc')
      .select(['sc.id', 'sc.masterCardId'])
      .where('mc.userId = :userId', { userId })
      .getMany();

    if (userSubCards.length === 0) return { total: 0, byFolder: [] };

    // Get reviews that are due
    const dueReviews = await this.reviews.find({
      where: { userId, nextReviewAt: LessThanOrEqual(now) },
      select: ['subCardId'],
    });
    const reviewedDueIds = new Set(dueReviews.map(r => r.subCardId));

    // Get all reviewed card IDs (to find unreviewed = new cards)
    const allReviewed = await this.reviews.find({
      where: { userId },
      select: ['subCardId'],
    });
    const allReviewedIds = new Set(allReviewed.map(r => r.subCardId));

    // Due = reviewed and due + never reviewed (new)
    const dueSubCardIds = new Set<number>();
    const dueByMasterCard = new Map<number, number>();

    for (const sc of userSubCards) {
      if (reviewedDueIds.has(sc.id) || !allReviewedIds.has(sc.id)) {
        dueSubCardIds.add(sc.id);
        dueByMasterCard.set(sc.masterCardId, (dueByMasterCard.get(sc.masterCardId) || 0) + 1);
      }
    }

    // Group by folder
    const folders = await this.folders.find({
      where: { userId },
      relations: ['masterCards'],
      order: { name: 'ASC' },
    });

    const byFolder: DueCounts['byFolder'] = [];
    for (const folder of folders) {
      let count = 0;
      for (const mc of folder.masterCards || []) {
        count += dueByMasterCard.get(mc.id) || 0;
      }
      if (count > 0) {
        byFolder.push({ folderUuid: folder.uuid, folderName: folder.name, count });
      }
    }

    return { total: dueSubCardIds.size, byFolder };
  }

  async getDueCards(userUuid: string, folderUuid: string, count?: number): Promise<Quiz> {
    const userId = await this.userId(userUuid);
    const now = new Date();

    const folder = await this.folders.findOne({
      where: { uuid: folderUuid, userId },
      relations: ['masterCards'],
    });
    if (!folder) throw notFound('Folder not found');

    const decks = folder.masterCards || [];
    if (decks.length === 0) throw badRequest('This folder has no decks');

    const deckIds = decks.map(d => d.id);
    const titles = new Map(decks.map(d => [d.id, d.title]));

    // Get all sub cards for the folder's decks
    const allCards = await this.subCards.find({
      where: { masterCardId: In(deckIds) },
      select: ['id', 'uuid', 'title', 'descriptions', 'link', 'masterCardId'],
    });

    if (allCards.length === 0) throw badRequest('The decks in this folder have no cards yet');

    // Find which are due or new
    const cardIds = allCards.map(c => c.id);
    const reviews = await this.reviews.find({
      where: { userId, subCardId: In(cardIds) },
      select: ['subCardId', 'nextReviewAt'],
    });
    const reviewMap = new Map(reviews.map(r => [r.subCardId, r]));

    const dueCards = allCards.filter(c => {
      const review = reviewMap.get(c.id);
      return !review || review.nextReviewAt <= now;
    });

    if (dueCards.length === 0) throw badRequest('No cards are due for review in this folder');

    const pool = allCards.map(c => ({ answer: c.descriptions || '', deckId: c.masterCardId }));
    const picked = shuffle(dueCards).slice(0, count && count > 0 ? count : dueCards.length);

    return {
      folder: { uuid: folder.uuid, name: folder.name },
      available: dueCards.length,
      cards: picked.map(c => ({
        uuid: c.uuid,
        question: c.title,
        answer: c.descriptions || '',
        link: c.link || '',
        deck: titles.get(c.masterCardId) || '',
        choices: pickChoices({ answer: c.descriptions || '', deckId: c.masterCardId }, pool),
      })),
    };
  }
}
