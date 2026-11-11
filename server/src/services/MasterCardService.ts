import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { MasterCard, SubCard, Progress, User, PoolCard } from '../entities';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';
import { currentDate, previousEight, mixdate, calculateTimeSpent, topFiveCards, type TopFiveEntry } from './helpers';
import { MAX_PROGRESS_DAYS } from '../constants';

@injectable()
export class MasterCardService {
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private progressRepo: Repository<Progress>;
  private users: Repository<User>;
  private poolCards: Repository<PoolCard>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.progressRepo = dataSource.getRepository(Progress);
    this.users = dataSource.getRepository(User);
    this.poolCards = dataSource.getRepository(PoolCard);
  }

  async getOne(uuid: string): Promise<MasterCard> {
    const card = await this.masterCards.findOne({
      where: { uuid },
      relations: ['subCards', 'progress'],
    });
    if (!card) throw notFound('Master card not found');
    await this.masterCards.increment({ uuid }, 'views', 1);
    card.views += 1;
    return card;
  }

  async getAllForUser(userUuid: string, page?: number, pageSize?: number, search?: string): Promise<{ items: MasterCard[]; total: number }> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const qb = this.masterCards.createQueryBuilder('mc')
      .loadRelationCountAndMap('mc.subCardCount', 'mc.subCards')
      .leftJoinAndSelect('mc.progress', 'p')
      .where('mc.userId = :userId', { userId: user.id });

    if (search) {
      qb.andWhere('LOWER(mc.title) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }

    const total = await qb.getCount();

    qb.orderBy('mc.createdAt', 'DESC');

    if (page !== undefined && pageSize !== undefined) {
      qb.skip(page * pageSize).take(pageSize);
    }

    const items = await qb.getMany();
    return { items, total };
  }

  async create(userUuid: string, title: string, cards: { title: string; description: string; link?: string }[]): Promise<{ items: MasterCard[]; total: number }> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const existing = await this.masterCards.findOneBy({ title, userId: user.id });
    if (existing) throw badRequest('You already have a deck with this title');

    // Check for duplicate questions within the provided cards
    const titles = cards.map(c => c.title);
    const uniqueTitles = new Set(titles);
    if (uniqueTitles.size !== titles.length) throw badRequest('Duplicate questions found in the provided cards');

    const masterCard = this.masterCards.create({ title, userId: user.id });
    await this.masterCards.save(masterCard);

    const subCards = cards.map(card =>
      this.subCards.create({ title: card.title, descriptions: card.description, link: card.link || '', masterCardId: masterCard.id }),
    );
    await this.subCards.save(subCards);

    return this.getAllForUser(userUuid);
  }

  async update(uuid: string, userUuid: string, title: string, date?: string): Promise<MasterCard> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const card = await this.masterCards.findOneBy({ uuid, userId: user.id });
    if (!card) throw notFound('Master card not found');
    if (card.isDefault) throw badRequest('Cannot edit the default tutorial card');

    if (title !== card.title) {
      const duplicate = await this.masterCards.findOneBy({ title, userId: user.id });
      if (duplicate) throw badRequest('You already have a deck with this title');
    }

    card.title = title;
    if (date) card.createdAt = new Date(date);
    await this.masterCards.save(card);
    return card;
  }

  async delete(uuid: string, userUuid: string): Promise<void> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const card = await this.masterCards.findOneBy({ uuid, userId: user.id });
    if (!card) throw notFound('Master card not found');
    if (card.isDefault) throw badRequest('Cannot delete the default tutorial card');

    // Also remove any associated pool card (public copy)
    const poolCard = await this.poolCards.findOneBy({ author: userUuid, title: card.title });
    if (poolCard) {
      await this.poolCards.remove(poolCard);
    }

    await this.masterCards.remove(card);
  }

  async recordTime(uuid: string, userUuid: string, time: number): Promise<{ items: MasterCard[]; total: number }> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const card = await this.masterCards.findOne({
      where: { uuid, userId: user.id },
      relations: ['progress'],
    });
    if (!card) throw notFound('Master card not found');

    const today = currentDate(new Date());
    const progressEntries = card.progress || [];

    if (progressEntries.length === 0) {
      const prevDays = previousEight();
      const newEntries = prevDays.map(day =>
        this.progressRepo.create({ time: 0, dayCreated: new Date(day), masterCardId: card.id }),
      );
      newEntries.push(this.progressRepo.create({ time, dayCreated: today, masterCardId: card.id }));
      await this.progressRepo.save(newEntries);
    } else {
      const lastEntry = progressEntries[progressEntries.length - 1];
      const lastDate = currentDate(new Date(lastEntry.dayCreated));

      if (Number(lastDate) === Number(today)) {
        lastEntry.time += time;
        await this.progressRepo.save(lastEntry);
      } else {
        const prevDays = previousEight();
        const mixed = mixdate(prevDays, progressEntries.map(e => ({ time: e.time, dayCreated: e.dayCreated })));

        await this.progressRepo.delete({ masterCardId: card.id });

        const newEntries = mixed.map(entry =>
          this.progressRepo.create({ time: entry.time, dayCreated: new Date(entry.dayCreated), masterCardId: card.id }),
        );
        newEntries.push(this.progressRepo.create({ time, dayCreated: today, masterCardId: card.id }));

        if (newEntries.length > MAX_PROGRESS_DAYS) {
          newEntries.splice(0, newEntries.length - MAX_PROGRESS_DAYS);
        }

        await this.progressRepo.save(newEntries);
      }
    }

    const updatedCard = await this.masterCards.findOne({ where: { id: card.id }, relations: ['progress'] });
    if (updatedCard) {
      updatedCard.timespent = calculateTimeSpent(updatedCard.progress.map(p => ({ time: p.time, dayCreated: p.dayCreated })));
      await this.masterCards.save(updatedCard);
    }

    return this.getAllForUser(userUuid);
  }

  async getTopFive(userUuid: string): Promise<TopFiveEntry[]> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) return [];

    const cards = await this.masterCards.find({
      where: { userId: user.id },
      order: { views: 'DESC' },
      take: 5,
    });

    return topFiveCards(cards);
  }

  async getAllByViews(userUuid: string): Promise<TopFiveEntry[]> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) return [];

    const cards = await this.masterCards.find({
      where: { userId: user.id },
      order: { views: 'DESC' },
    });

    return cards.map(card => ({
      maxTime: card.views,
      referenceID: card.uuid,
      title: card.title,
      timestamp: card.createdAt,
    }));
  }
}
