import { inject, injectable } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { MasterCard, SubCard, PoolCard, PoolSubCard, User } from '../entities';
import { DATABASE_INSERT_CHUNK_SIZE, MAX_PUBLIC_DECKS_PER_USER } from '../constants';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';
import { requireOwnedDeck, requireUserId } from './ownership';

/** A public deck as shown on the Browse page (no cards, just a count). */
export interface PublicDeckSummary {
  uuid: string;
  author: string;
  title: string;
  createdAt: Date;
  subCardCount: number;
}

/** Public decks ("pool cards"): share a deck, unshare it, browse and copy other people's decks. */
@injectable()
export class PoolCardService {
  private dataSource: DataSource;
  private poolCards: Repository<PoolCard>;
  private poolSubCards: Repository<PoolSubCard>;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.poolCards = dataSource.getRepository(PoolCard);
    this.poolSubCards = dataSource.getRepository(PoolSubCard);
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.users = dataSource.getRepository(User);
  }

  /** Every public deck, newest first. */
  async getAll(): Promise<PublicDeckSummary[]> {
    // perf Increase: count the cards in SQL. This used to send every card of every public deck.
    const decks = await this.poolCards
      .createQueryBuilder('publicDeck')
      .loadRelationCountAndMap('publicDeck.subCardCount', 'publicDeck.subCards')
      .orderBy('publicDeck.createdAt', 'DESC')
      .getMany();
    return decks.map((deck) => ({
      uuid: deck.uuid,
      author: deck.author,
      title: deck.title,
      createdAt: deck.createdAt,
      subCardCount: deck.subCardCount ?? 0,
    }));
  }

  /** One public deck's title and author (no cards). */
  async getSummary(publicDeckUuid: string): Promise<{ uuid: string; title: string; author: string }> {
    const deck = await this.poolCards.findOne({ where: { uuid: publicDeckUuid }, select: ['uuid', 'title', 'author'] });
    if (!deck) throw notFound('Pool card not found');
    return { uuid: deck.uuid, title: deck.title, author: deck.author };
  }

  /** Share one of the user's own decks. */
  async create(deckUuid: string, userUuid: string): Promise<PublicDeckSummary[]> {
    const userId = await requireUserId(this.users, userUuid);
    // Security fix: this used to accept any deck uuid, so anyone could publish someone else's deck.
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);

    if (deck.isDefault) throw badRequest('Cannot make the default tutorial card public');
    if (deck.isCopied) throw badRequest('Cannot share a copied card');

    const alreadyShared = await this.poolCards.findOneBy({ author: userUuid, title: deck.title });
    if (alreadyShared) throw badRequest('This deck is already public');

    const sharedCount = await this.poolCards.countBy({ author: userUuid });
    if (sharedCount >= MAX_PUBLIC_DECKS_PER_USER) {
      throw badRequest(`You can have at most ${MAX_PUBLIC_DECKS_PER_USER} public cards`);
    }

    const cards = await this.subCards.find({
      where: { masterCardId: deck.id },
      select: ['title', 'descriptions', 'link'],
    });
    if (cards.length === 0) throw badRequest('Cannot make a card public without any subcards');

    await this.dataSource.transaction(async (transaction) => {
      const publicDeckRepository = transaction.getRepository(PoolCard);
      const publicCardRepository = transaction.getRepository(PoolSubCard);
      const publicDeck = await publicDeckRepository.save(publicDeckRepository.create({ author: userUuid, title: deck.title }));
      await publicCardRepository.save(
        cards.map((card) => publicCardRepository.create({
          title: card.title, descriptions: card.descriptions, link: card.link || '', poolCardId: publicDeck.id,
        })),
        { chunk: DATABASE_INSERT_CHUNK_SIZE },
      );
    });

    return this.getAll();
  }

  /** Unshare a deck. Security fix: only the person who shared it can remove it. */
  async remove(publicDeckUuid: string, userUuid: string): Promise<PublicDeckSummary[]> {
    const publicDeck = await this.poolCards.findOneBy({ uuid: publicDeckUuid });
    if (!publicDeck || publicDeck.author !== userUuid) throw notFound('Pool card not found');
    await this.poolCards.remove(publicDeck);
    return this.getAll();
  }

  /** The cards of a public deck. */
  async getSubCards(publicDeckUuid: string): Promise<PoolSubCard[]> {
    const publicDeck = await this.poolCards.findOne({ where: { uuid: publicDeckUuid }, select: ['id'] });
    if (!publicDeck) throw notFound('Pool card not found');
    return this.poolSubCards.find({ where: { poolCardId: publicDeck.id }, order: { id: 'ASC' } });
  }

  /** Copy a public deck into the user's own decks. */
  async storeToMaster(publicDeckUuid: string, userUuid: string): Promise<MasterCard> {
    const userId = await requireUserId(this.users, userUuid);

    const publicDeck = await this.poolCards.findOne({ where: { uuid: publicDeckUuid }, relations: ['subCards'] });
    if (!publicDeck) throw notFound('Pool card not found');

    // Bug fix: copying a deck you already have used to create a second deck with the same title.
    const sameTitle = await this.masterCards.findOneBy({ title: publicDeck.title, userId });
    if (sameTitle) throw badRequest(`You already have a deck called "${publicDeck.title}"`);

    const copiedDeck = await this.dataSource.transaction(async (transaction) => {
      const deckRepository = transaction.getRepository(MasterCard);
      const cardRepository = transaction.getRepository(SubCard);
      const newDeck = await deckRepository.save(deckRepository.create({ title: publicDeck.title, userId, isCopied: true }));
      await cardRepository.save(
        publicDeck.subCards.map((card) => cardRepository.create({
          title: card.title, descriptions: card.descriptions, link: card.link || '', masterCardId: newDeck.id,
        })),
        { chunk: DATABASE_INSERT_CHUNK_SIZE },
      );
      return newDeck;
    });

    // perf Increase: return only the copied deck. This used to return all of the user's decks with all their cards.
    copiedDeck.subCardCount = publicDeck.subCards.length;
    return copiedDeck;
  }
}
