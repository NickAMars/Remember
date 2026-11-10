import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { MasterCard, SubCard, User } from '../entities';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';

@injectable()
export class SubCardService {
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.users = dataSource.getRepository(User);
  }

  async getForMasterCard(masterCardUuid: string, page?: number, pageSize?: number, search?: string): Promise<{ items: SubCard[]; total: number }> {
    const masterCard = await this.masterCards.findOneBy({ uuid: masterCardUuid });
    if (!masterCard) throw notFound('Master card not found');

    const qb = this.subCards.createQueryBuilder('sc')
      .where('sc.masterCardId = :id', { id: masterCard.id });

    if (search) {
      qb.andWhere('LOWER(sc.title) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }

    const total = await qb.getCount();

    qb.orderBy('sc.createdAt', 'ASC');

    if (page !== undefined && pageSize !== undefined) {
      qb.skip(page * pageSize).take(pageSize);
    }

    const items = await qb.getMany();
    return { items, total };
  }

  async getTopViewed(masterCardUuid: string, limit = 6): Promise<{ uuid: string; title: string; views: number }[]> {
    const masterCard = await this.masterCards.findOneBy({ uuid: masterCardUuid });
    if (!masterCard) throw notFound('Master card not found');

    const cards = await this.subCards.find({
      where: { masterCardId: masterCard.id },
      order: { views: 'DESC' },
      take: limit,
    });
    return cards.filter(c => c.views > 0).map(c => ({ uuid: c.uuid, title: c.title, views: c.views }));
  }

  async add(masterCardUuid: string, userUuid: string, title: string, descriptions: string): Promise<SubCard> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const masterCard = await this.masterCards.findOneBy({ uuid: masterCardUuid, userId: user.id });
    if (!masterCard) throw notFound('Master card not found');
    if (masterCard.isDefault) throw badRequest('Cannot add cards to the default tutorial deck');

    const subCard = this.subCards.create({ title, descriptions, masterCardId: masterCard.id });
    await this.subCards.save(subCard);
    return subCard;
  }

  async update(subCardUuid: string, userUuid: string, title: string, descriptions: string): Promise<SubCard> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const subCard = await this.subCards.findOne({
      where: { uuid: subCardUuid },
      relations: ['masterCard'],
    });
    if (!subCard) throw notFound('Sub card not found');
    if (subCard.masterCard.userId !== user.id) throw notFound('Sub card not found');
    if (subCard.masterCard.isDefault) throw badRequest('Cannot edit cards in the default tutorial deck');

    subCard.title = title;
    subCard.descriptions = descriptions;
    await this.subCards.save(subCard);
    return subCard;
  }

  async addBulk(masterCardUuid: string, userUuid: string, cards: { title: string; descriptions: string }[]): Promise<SubCard[]> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const masterCard = await this.masterCards.findOneBy({ uuid: masterCardUuid, userId: user.id });
    if (!masterCard) throw notFound('Master card not found');

    const subCards = cards.map(c =>
      this.subCards.create({ title: c.title, descriptions: c.descriptions, masterCardId: masterCard.id }),
    );
    await this.subCards.save(subCards);
    return subCards;
  }

  async incrementViews(subCardUuid: string): Promise<void> {
    await this.subCards.increment({ uuid: subCardUuid }, 'views', 1);
  }

  async getTopSubCards(userUuid: string, limit = 10): Promise<{ uuid: string; title: string; views: number; masterTitle: string }[]> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) return [];

    const subCards = await this.subCards
      .createQueryBuilder('sc')
      .innerJoin('sc.masterCard', 'mc')
      .select(['sc.uuid', 'sc.title', 'sc.views', 'mc.title'])
      .where('mc.userId = :userId', { userId: user.id })
      .andWhere('sc.views > 0')
      .orderBy('sc.views', 'DESC')
      .limit(limit)
      .getMany();

    // Need to get masterCard title via a slightly different approach since getMany won't include the join select
    const results = await this.subCards
      .createQueryBuilder('sc')
      .innerJoinAndSelect('sc.masterCard', 'mc')
      .where('mc.userId = :userId', { userId: user.id })
      .andWhere('sc.views > 0')
      .orderBy('sc.views', 'DESC')
      .take(limit)
      .getMany();

    return results.map(sc => ({
      uuid: sc.uuid,
      title: sc.title,
      views: sc.views,
      masterTitle: sc.masterCard.title,
    }));
  }

  async delete(subCardUuid: string, userUuid: string): Promise<void> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const subCard = await this.subCards.findOne({
      where: { uuid: subCardUuid },
      relations: ['masterCard'],
    });
    if (!subCard) throw notFound('Sub card not found');
    if (subCard.masterCard.userId !== user.id) throw notFound('Sub card not found');
    if (subCard.masterCard.isDefault) throw badRequest('Cannot delete cards from the default tutorial deck');

    await this.subCards.remove(subCard);
  }
}
