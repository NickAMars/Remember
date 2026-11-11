import { inject, injectable } from 'inversify';
import { DataSource, In, Repository } from 'typeorm';
import { MasterCard, SubCard, User } from '../entities';
import { DATABASE_INSERT_CHUNK_SIZE } from '../constants';
import { TYPES } from '../types';
import { notFound, badRequest } from './errors';
import { requireOwnedDeck, requireUserId } from './ownership';
import { dedupeByQuestion } from '../utils/spreadsheet';
import { cleanWrongAnswers, escapeLikePattern, type Pagination } from '../utils/validation';

export interface CardInput {
  title: string;
  descriptions: string;
  link?: string;
  /** Similar but incorrect answers for Quiz mode. */
  wrongAnswers?: string[];
}

/** Cards ("sub cards") inside a deck. Every method checks that the deck belongs to the user. */
@injectable()
export class SubCardService {
  private dataSource: DataSource;
  private masterCards: Repository<MasterCard>;
  private subCards: Repository<SubCard>;
  private users: Repository<User>;

  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.masterCards = dataSource.getRepository(MasterCard);
    this.subCards = dataSource.getRepository(SubCard);
    this.users = dataSource.getRepository(User);
  }

  /** Load a card together with its deck, and 404 unless the deck belongs to the user. */
  private async requireOwnedCard(cardUuid: string, userUuid: string): Promise<SubCard> {
    const userId = await requireUserId(this.users, userUuid);
    const card = await this.subCards.findOne({ where: { uuid: cardUuid }, relations: ['masterCard'] });
    if (!card || card.masterCard.userId !== userId) throw notFound('Sub card not found');
    return card;
  }

  async getForMasterCard(
    deckUuid: string,
    userUuid: string,
    pagination: Pagination = {},
    shuffle = false,
  ): Promise<{ items: SubCard[]; total: number }> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);

    const query = this.subCards.createQueryBuilder('card').where('card.masterCardId = :deckId', { deckId: deck.id });
    if (pagination.search) {
      query.andWhere("LOWER(card.title) LIKE :search ESCAPE '\\'", {
        search: `%${escapeLikePattern(pagination.search.toLowerCase())}%`,
      });
    }

    // perf Increase: the index on (master_card_id, created_at) serves this order directly.
    if (shuffle) query.orderBy('RANDOM()');
    else query.orderBy('card.createdAt', 'ASC').addOrderBy('card.id', 'ASC');

    if (pagination.page !== undefined && pagination.pageSize !== undefined) {
      query.skip(pagination.page * pagination.pageSize).take(pagination.pageSize);
    }

    // perf Increase: rows and total in one call.
    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }

  /** The deck's most viewed cards, for the pie chart. */
  async getTopViewed(deckUuid: string, userUuid: string, limit = 6): Promise<{ uuid: string; title: string; views: number }[]> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);

    const cards = await this.subCards
      .createQueryBuilder('card')
      .select(['card.uuid', 'card.title', 'card.views'])
      .where('card.masterCardId = :deckId', { deckId: deck.id })
      .andWhere('card.views > 0')
      .orderBy('card.views', 'DESC')
      .limit(limit)
      .getMany();
    return cards.map((card) => ({ uuid: card.uuid, title: card.title, views: card.views }));
  }

  async add(
    deckUuid: string,
    userUuid: string,
    title: string,
    descriptions: string,
    link = '',
    wrongAnswers: string[] = [],
  ): Promise<SubCard> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    if (deck.isDefault) throw badRequest('Cannot add cards to the default tutorial deck');

    const existing = await this.subCards.findOneBy({ title, masterCardId: deck.id });
    if (existing) throw badRequest('A card with this question already exists in this deck');

    return this.subCards.save(this.subCards.create({
      title, descriptions, link, wrongAnswers: cleanWrongAnswers(wrongAnswers, descriptions), masterCardId: deck.id,
    }));
  }

  async update(
    cardUuid: string,
    userUuid: string,
    title: string,
    descriptions: string,
    link = '',
    wrongAnswers: string[] = [],
  ): Promise<SubCard> {
    const card = await this.requireOwnedCard(cardUuid, userUuid);
    if (card.masterCard.isDefault) throw badRequest('Cannot edit cards in the default tutorial deck');

    if (title !== card.title) {
      const duplicate = await this.subCards.findOneBy({ title, masterCardId: card.masterCard.id });
      if (duplicate) throw badRequest('A card with this question already exists in this deck');
    }

    card.title = title;
    card.descriptions = descriptions;
    card.link = link;
    card.wrongAnswers = cleanWrongAnswers(wrongAnswers, descriptions);
    await this.subCards.save(card);
    const { masterCard: _deck, ...cardWithoutDeck } = card;
    return cardWithoutDeck as SubCard;
  }

  /**
   * Add many cards at once. A question that is already in the deck has its answer
   * and link updated instead of being added twice. Its saved wrong answers are only
   * replaced when the upload gives new ones, so a file without them never wipes them.
   */
  async addBulk(deckUuid: string, userUuid: string, inputCards: CardInput[]): Promise<{ added: number; updated: number }> {
    const userId = await requireUserId(this.users, userUuid);
    const deck = await requireOwnedDeck(this.masterCards, deckUuid, userId);
    // Bug fix: the tutorial deck could be changed through the upload route.
    if (deck.isDefault) throw badRequest('Cannot add cards to the default tutorial deck');

    const cards = dedupeByQuestion(inputCards);
    // perf Increase: only look up the questions in this upload, not every card in the deck.
    const existingCards = cards.length
      ? await this.subCards.find({ where: { masterCardId: deck.id, title: In(cards.map((card) => card.title)) } })
      : [];
    const existingByQuestion = new Map(existingCards.map((card) => [card.title, card]));

    const cardsToCreate: SubCard[] = [];
    const cardsToUpdate: SubCard[] = [];
    for (const card of cards) {
      const existing = existingByQuestion.get(card.title);
      if (existing) {
        existing.descriptions = card.descriptions;
        existing.link = card.link || '';
        const uploadedWrongAnswers = cleanWrongAnswers(card.wrongAnswers, card.descriptions);
        existing.wrongAnswers = uploadedWrongAnswers.length
          ? uploadedWrongAnswers
          : cleanWrongAnswers(existing.wrongAnswers, card.descriptions);
        cardsToUpdate.push(existing);
      } else {
        cardsToCreate.push(this.subCards.create({
          title: card.title,
          descriptions: card.descriptions,
          link: card.link || '',
          wrongAnswers: cleanWrongAnswers(card.wrongAnswers, card.descriptions),
          masterCardId: deck.id,
        }));
      }
    }

    await this.dataSource.transaction(async (transaction) => {
      const cardRepository = transaction.getRepository(SubCard);
      if (cardsToUpdate.length) await cardRepository.save(cardsToUpdate, { chunk: DATABASE_INSERT_CHUNK_SIZE });
      if (cardsToCreate.length) await cardRepository.save(cardsToCreate, { chunk: DATABASE_INSERT_CHUNK_SIZE });
    });

    return { added: cardsToCreate.length, updated: cardsToUpdate.length };
  }

  /** Count one flip of a card. Security: only the deck's owner can change its counters. */
  async incrementViews(cardUuid: string, userUuid: string): Promise<void> {
    const userId = await requireUserId(this.users, userUuid);
    // perf Increase: one UPDATE that checks ownership itself, instead of loading the card first.
    await this.subCards
      .createQueryBuilder()
      .update(SubCard)
      .set({ views: () => 'views + 1' })
      .where('uuid = :cardUuid', { cardUuid })
      .andWhere('master_card_id IN (SELECT id FROM master_cards WHERE user_id = :userId)', { userId })
      .execute();
  }

  /** The user's most viewed cards across all decks. */
  async getTopSubCards(userUuid: string, limit = 10): Promise<{ uuid: string; title: string; views: number; masterTitle: string }[]> {
    const user = await this.users.findOne({ where: { uuid: userUuid }, select: ['id'] });
    if (!user) return [];

    // perf Increase: one query. There used to be a second, identical query whose result was thrown away.
    const cards = await this.subCards
      .createQueryBuilder('card')
      .innerJoin('card.masterCard', 'deck')
      .select(['card.uuid', 'card.title', 'card.views', 'deck.id', 'deck.title'])
      .where('deck.userId = :userId', { userId: user.id })
      .andWhere('card.views > 0')
      .orderBy('card.views', 'DESC')
      .limit(limit) // safe with a many-to-one join, and avoids TypeORM's extra paging query
      .getMany();

    return cards.map((card) => ({ uuid: card.uuid, title: card.title, views: card.views, masterTitle: card.masterCard.title }));
  }

  async delete(cardUuid: string, userUuid: string): Promise<void> {
    const card = await this.requireOwnedCard(cardUuid, userUuid);
    if (card.masterCard.isDefault) throw badRequest('Cannot delete cards from the default tutorial deck');
    await this.subCards.remove(card);
  }
}
