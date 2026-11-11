import { inject, injectable } from 'inversify';
import { DataSource, In, Repository } from 'typeorm';
import { Folder, MasterCard, SubCard, User } from '../entities';
import { TYPES } from '../types';
import { badRequest, notFound } from './errors';
import { requireUserId } from './ownership';
import { buildQuizCards, type Quiz } from './quiz';

export interface DeckSummary {
  uuid: string;
  title: string;
  cardCount: number;
}

export interface FolderSummary {
  uuid: string;
  name: string;
  createdAt: Date;
  decks: DeckSummary[];
  cardCount: number;
}

// The quiz helpers moved to ./quiz. Re-exported so older imports keep working.
export { pickChoices, shuffle, QUIZ_CHOICES } from './quiz';
export type { Quiz, QuizCard } from './quiz';

@injectable()
export class FolderService {
  private folders: Repository<Folder>;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.folders = dataSource.getRepository(Folder);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.users = dataSource.getRepository(User);
  }

  private userId(userUuid: string): Promise<number> {
    return requireUserId(this.users, userUuid);
  }

  private async ownedFolder(uuid: string, userId: number): Promise<Folder> {
    // perf Increase: only the deck columns a folder needs (not the deck's counters or flags).
    const folder = await this.folders.createQueryBuilder('folder')
      .leftJoin('folder.masterCards', 'deck')
      .addSelect(['deck.id', 'deck.uuid', 'deck.title'])
      .where('folder.uuid = :uuid AND folder.userId = :userId', { uuid, userId })
      .getOne();
    if (!folder) throw notFound('Folder not found');
    return folder;
  }

  private async cardCounts(deckIds: number[]): Promise<Map<number, number>> {
    if (deckIds.length === 0) return new Map();
    const rows: { masterCardId: number; count: string }[] = await this.subCards
      .createQueryBuilder('card')
      .select('card.masterCardId', 'masterCardId')
      .addSelect('COUNT(*)', 'count')
      .where('card.masterCardId IN (:...deckIds)', { deckIds })
      .groupBy('card.masterCardId')
      .getRawMany();
    return new Map(rows.map((row) => [Number(row.masterCardId), Number(row.count)]));
  }

  private summarize(folder: Folder, counts: Map<number, number>): FolderSummary {
    const decks = [...(folder.masterCards || [])]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((deck) => ({ uuid: deck.uuid, title: deck.title, cardCount: counts.get(deck.id) || 0 }));
    return {
      uuid: folder.uuid,
      name: folder.name,
      createdAt: folder.createdAt,
      decks,
      cardCount: decks.reduce((sum, deck) => sum + deck.cardCount, 0),
    };
  }

  async list(userUuid: string): Promise<FolderSummary[]> {
    const userId = await this.userId(userUuid);
    // perf Increase: only the deck columns a folder needs.
    const folders = await this.folders.createQueryBuilder('folder')
      .leftJoin('folder.masterCards', 'deck')
      .addSelect(['deck.id', 'deck.uuid', 'deck.title'])
      .where('folder.userId = :userId', { userId })
      .orderBy('folder.name', 'ASC')
      .getMany();
    const deckIds = [...new Set(folders.flatMap((folder) => (folder.masterCards || []).map((deck) => deck.id)))];
    const counts = await this.cardCounts(deckIds);
    return folders.map((folder) => this.summarize(folder, counts));
  }

  async get(uuid: string, userUuid: string): Promise<FolderSummary> {
    const folder = await this.ownedFolder(uuid, await this.userId(userUuid));
    const counts = await this.cardCounts((folder.masterCards || []).map((deck) => deck.id));
    return this.summarize(folder, counts);
  }

  // All of the user's decks, light (no cards), for the "pick decks" list.
  async decks(userUuid: string): Promise<DeckSummary[]> {
    const userId = await this.userId(userUuid);
    const decks = await this.masterCards.createQueryBuilder('deck')
      .select(['deck.id', 'deck.uuid', 'deck.title'])
      .where('deck.userId = :userId', { userId })
      .orderBy('deck.title', 'ASC')
      .getMany();
    const counts = await this.cardCounts(decks.map((deck) => deck.id));
    return decks.map((deck) => ({ uuid: deck.uuid, title: deck.title, cardCount: counts.get(deck.id) || 0 }));
  }

  async create(userUuid: string, name: string): Promise<FolderSummary> {
    const userId = await this.userId(userUuid);
    const trimmed = name.trim();
    if (!trimmed) throw badRequest('Folder name is required');
    const existing = await this.folders.findOneBy({ userId, name: trimmed });
    if (existing) throw badRequest('You already have a folder with this name');
    const folder = await this.folders.save(this.folders.create({ name: trimmed, userId, masterCards: [] }));
    return this.summarize(folder, new Map());
  }

  async rename(uuid: string, userUuid: string, name: string): Promise<FolderSummary> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    const trimmed = name.trim();
    if (!trimmed) throw badRequest('Folder name is required');
    if (trimmed !== folder.name) {
      const existing = await this.folders.findOneBy({ userId, name: trimmed });
      if (existing) throw badRequest('You already have a folder with this name');
    }
    folder.name = trimmed;
    await this.folders.save(folder);
    return this.get(uuid, userUuid);
  }

  async delete(uuid: string, userUuid: string): Promise<void> {
    const folder = await this.ownedFolder(uuid, await this.userId(userUuid));
    // Removes the folder and its links only. The decks stay.
    await this.folders.remove(folder);
  }

  // Replace the folder's decks with exactly this list.
  async setDecks(uuid: string, userUuid: string, deckUuids: string[]): Promise<FolderSummary> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    const uniqueDeckUuids = [...new Set(deckUuids.map((deckUuid) => deckUuid.toLowerCase()))];
    // Security: only the user's own decks can go in a folder.
    const decks = uniqueDeckUuids.length
      ? await this.masterCards.find({ where: { uuid: In(uniqueDeckUuids), userId }, select: ['id', 'uuid', 'title'] })
      : [];
    if (decks.length !== uniqueDeckUuids.length) throw notFound('One or more decks were not found');
    folder.masterCards = decks;
    await this.folders.save(folder);
    return this.get(uuid, userUuid);
  }

  async removeDeck(uuid: string, userUuid: string, deckUuid: string): Promise<FolderSummary> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    const deckToRemove = (folder.masterCards || []).find((deck) => deck.uuid === deckUuid.toLowerCase());
    if (!deckToRemove) throw notFound('That deck is not in this folder');
    // perf Increase: delete one link row instead of re-saving the whole folder.
    await this.folders.createQueryBuilder().relation(Folder, 'masterCards').of(folder.id).remove(deckToRemove.id);
    return this.get(uuid, userUuid);
  }

  async quiz(uuid: string, userUuid: string, count?: number, deckUuids?: string[]): Promise<Quiz> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    let decks = folder.masterCards || [];
    if (deckUuids && deckUuids.length) {
      const wantedDeckUuids = new Set(deckUuids.map((deckUuid) => deckUuid.toLowerCase()));
      decks = decks.filter((deck) => wantedDeckUuids.has(deck.uuid));
    }
    if (decks.length === 0) throw badRequest('Add at least one deck to this folder before starting a quiz');

    const quiz = await buildQuizCards(this.subCards, decks, { count });
    if (quiz.available === 0) throw badRequest('The decks in this folder have no cards yet');
    return { folder: { uuid: folder.uuid, name: folder.name }, ...quiz };
  }
}
