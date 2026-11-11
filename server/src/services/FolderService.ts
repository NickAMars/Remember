import { inject, injectable } from 'inversify';
import { DataSource, In, Repository } from 'typeorm';
import { Folder, MasterCard, SubCard, User } from '../entities';
import { TYPES } from '../types';
import { badRequest, notFound } from './errors';

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

export interface QuizCard {
  uuid: string;
  question: string;
  answer: string;
  link: string;
  deck: string;
  // Shuffled answer options (includes the right one). Empty when there aren't enough
  // other answers to build a multiple choice question.
  choices: string[];
}

export interface Quiz {
  folder: { uuid: string; name: string };
  available: number;
  cards: QuizCard[];
}

export const QUIZ_CHOICES = 4;

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Pick wrong answers for a card. Answers from the same deck come first because they
// look more alike, then answers from the rest of the folder fill any gap.
export function pickChoices(
  card: { answer: string; deckId: number },
  pool: { answer: string; deckId: number }[],
  size = QUIZ_CHOICES,
  random: () => number = Math.random,
): string[] {
  const right = card.answer.trim();
  if (!right) return [];
  const seen = new Set([right.toLowerCase()]);
  const wrong: string[] = [];
  const take = (candidates: { answer: string }[]) => {
    for (const c of shuffle(candidates, random)) {
      if (wrong.length >= size - 1) return;
      const text = c.answer.trim();
      if (!text || seen.has(text.toLowerCase())) continue;
      seen.add(text.toLowerCase());
      wrong.push(text);
    }
  };
  take(pool.filter(p => p.deckId === card.deckId));
  take(pool.filter(p => p.deckId !== card.deckId));
  if (wrong.length < size - 1) return [];
  return shuffle([right, ...wrong], random);
}

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

  private async userId(userUuid: string): Promise<number> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');
    return user.id;
  }

  private async ownedFolder(uuid: string, userId: number): Promise<Folder> {
    const folder = await this.folders.findOne({ where: { uuid, userId }, relations: ['masterCards'] });
    if (!folder) throw notFound('Folder not found');
    return folder;
  }

  private async cardCounts(deckIds: number[]): Promise<Map<number, number>> {
    if (deckIds.length === 0) return new Map();
    const rows: { masterCardId: number; count: string }[] = await this.subCards
      .createQueryBuilder('sc')
      .select('sc.masterCardId', 'masterCardId')
      .addSelect('COUNT(*)', 'count')
      .where('sc.masterCardId IN (:...deckIds)', { deckIds })
      .groupBy('sc.masterCardId')
      .getRawMany();
    return new Map(rows.map(r => [Number(r.masterCardId), Number(r.count)]));
  }

  private summarize(folder: Folder, counts: Map<number, number>): FolderSummary {
    const decks = [...(folder.masterCards || [])]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(mc => ({ uuid: mc.uuid, title: mc.title, cardCount: counts.get(mc.id) || 0 }));
    return {
      uuid: folder.uuid,
      name: folder.name,
      createdAt: folder.createdAt,
      decks,
      cardCount: decks.reduce((sum, d) => sum + d.cardCount, 0),
    };
  }

  async list(userUuid: string): Promise<FolderSummary[]> {
    const userId = await this.userId(userUuid);
    const folders = await this.folders.find({ where: { userId }, relations: ['masterCards'], order: { name: 'ASC' } });
    const deckIds = [...new Set(folders.flatMap(f => (f.masterCards || []).map(mc => mc.id)))];
    const counts = await this.cardCounts(deckIds);
    return folders.map(f => this.summarize(f, counts));
  }

  async get(uuid: string, userUuid: string): Promise<FolderSummary> {
    const folder = await this.ownedFolder(uuid, await this.userId(userUuid));
    const counts = await this.cardCounts((folder.masterCards || []).map(mc => mc.id));
    return this.summarize(folder, counts);
  }

  // All of the user's decks, light (no cards), for the "pick decks" list.
  async decks(userUuid: string): Promise<DeckSummary[]> {
    const userId = await this.userId(userUuid);
    const decks = await this.masterCards.createQueryBuilder('mc')
      .select(['mc.id', 'mc.uuid', 'mc.title'])
      .where('mc.userId = :userId', { userId })
      .orderBy('mc.title', 'ASC')
      .getMany();
    const counts = await this.cardCounts(decks.map(d => d.id));
    return decks.map(d => ({ uuid: d.uuid, title: d.title, cardCount: counts.get(d.id) || 0 }));
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
    const unique = [...new Set(deckUuids)];
    const decks = unique.length
      ? await this.masterCards.find({ where: { uuid: In(unique), userId }, select: ['id', 'uuid', 'title'], loadEagerRelations: false })
      : [];
    if (decks.length !== unique.length) throw notFound('One or more decks were not found');
    folder.masterCards = decks;
    await this.folders.save(folder);
    return this.get(uuid, userUuid);
  }

  async removeDeck(uuid: string, userUuid: string, deckUuid: string): Promise<FolderSummary> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    folder.masterCards = (folder.masterCards || []).filter(mc => mc.uuid !== deckUuid);
    await this.folders.save(folder);
    return this.get(uuid, userUuid);
  }

  async quiz(uuid: string, userUuid: string, count?: number, deckUuids?: string[]): Promise<Quiz> {
    const userId = await this.userId(userUuid);
    const folder = await this.ownedFolder(uuid, userId);
    let decks = folder.masterCards || [];
    if (deckUuids && deckUuids.length) {
      const wanted = new Set(deckUuids);
      decks = decks.filter(d => wanted.has(d.uuid));
    }
    if (decks.length === 0) throw badRequest('Add at least one deck to this folder before starting a quiz');

    const titles = new Map(decks.map(d => [d.id, d.title]));
    const cards = await this.subCards.find({
      where: { masterCardId: In(decks.map(d => d.id)) },
      select: ['id', 'uuid', 'title', 'descriptions', 'link', 'masterCardId'],
    });
    if (cards.length === 0) throw badRequest('The decks in this folder have no cards yet');

    const pool = cards.map(c => ({ answer: c.descriptions || '', deckId: c.masterCardId }));
    const picked = shuffle(cards).slice(0, count && count > 0 ? count : cards.length);

    return {
      folder: { uuid: folder.uuid, name: folder.name },
      available: cards.length,
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
