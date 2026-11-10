import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { MasterCard, SubCard, PoolCard, PoolSubCard, User } from '../entities';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';

@injectable()
export class PoolCardService {
  private poolCards: Repository<PoolCard>;
  private poolSubCards: Repository<PoolSubCard>;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.poolCards = dataSource.getRepository(PoolCard);
    this.poolSubCards = dataSource.getRepository(PoolSubCard);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.users = dataSource.getRepository(User);
  }

  async getAll(): Promise<PoolCard[]> {
    return this.poolCards.find({ relations: ['subCards'], order: { createdAt: 'DESC' } });
  }

  async create(masterCardUuid: string, userUuid: string): Promise<PoolCard[]> {
    const masterCard = await this.masterCards.findOne({
      where: { uuid: masterCardUuid },
      relations: ['subCards'],
    });
    if (!masterCard) throw notFound('Master card not found');

    // Don't allow default tutorial cards to be made public
    if (masterCard.isDefault) {
      throw badRequest('Cannot make the default tutorial card public');
    }

    // Don't allow copied cards to be re-shared
    if (masterCard.isCopied) {
      throw badRequest('Cannot share a copied card');
    }

    // Don't allow cards with no subcards to be made public
    if (!masterCard.subCards || masterCard.subCards.length === 0) {
      throw badRequest('Cannot make a card public without any subcards');
    }

    // Limit to 5 public cards per user
    const userPoolCount = await this.poolCards.countBy({ author: userUuid });
    if (userPoolCount >= 5) {
      throw badRequest('You can have at most 5 public cards');
    }

    const poolCard = this.poolCards.create({ author: userUuid, title: masterCard.title });
    await this.poolCards.save(poolCard);

    const poolSubCards = masterCard.subCards.map(sub =>
      this.poolSubCards.create({ title: sub.title, descriptions: sub.descriptions, link: sub.link || '', poolCardId: poolCard.id }),
    );
    await this.poolSubCards.save(poolSubCards);

    return this.getAll();
  }

  async remove(uuid: string): Promise<PoolCard[]> {
    const poolCard = await this.poolCards.findOneBy({ uuid });
    if (!poolCard) throw notFound('Pool card not found');
    await this.poolCards.remove(poolCard);
    return this.getAll();
  }

  async getSubCards(uuid: string): Promise<PoolSubCard[]> {
    const poolCard = await this.poolCards.findOneBy({ uuid });
    if (!poolCard) throw notFound('Pool card not found');
    return this.poolSubCards.find({ where: { poolCardId: poolCard.id } });
  }

  async storeToMaster(poolCardUuid: string, userUuid: string): Promise<MasterCard[]> {
    const user = await this.users.findOneBy({ uuid: userUuid });
    if (!user) throw notFound('User not found');

    const poolCard = await this.poolCards.findOne({
      where: { uuid: poolCardUuid },
      relations: ['subCards'],
    });
    if (!poolCard) throw notFound('Pool card not found');

    const masterCard = this.masterCards.create({ title: poolCard.title, userId: user.id, isCopied: true });
    await this.masterCards.save(masterCard);

    const subCards = poolCard.subCards.map(sub =>
      this.subCards.create({ title: sub.title, descriptions: sub.descriptions, link: sub.link || '', masterCardId: masterCard.id }),
    );
    await this.subCards.save(subCards);

    return this.masterCards.find({
      where: { userId: user.id },
      relations: ['subCards', 'progress'],
      order: { createdAt: 'DESC' },
    });
  }
}
