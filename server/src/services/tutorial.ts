import type { DataSource } from 'typeorm';
import { MasterCard, SubCard } from '../entities';
import { TUTORIAL_CARDS, TUTORIAL_DECK_TITLE } from '../constants/tutorial';

/** How many tutorial decks to check per query on start-up. */
const TUTORIAL_SYNC_BATCH_SIZE = 200;

/** A text fingerprint of a set of cards, so two decks can be compared in one string check. */
export const cardsSignature = (cards: { title: string; descriptions: string }[]) =>
  cards.map((card) => `${card.title}\u0000${card.descriptions}`).sort().join('\u0001');

/**
 * Bring every user's tutorial deck in line with TUTORIAL_CARDS. Decks that already match are left alone.
 * perf Increase: decks are read in batches with only the card columns compared, instead of
 * loading every tutorial deck and every full card at once.
 */
export async function syncTutorialDecks(dataSource: DataSource): Promise<number> {
  const deckRepository = dataSource.getRepository(MasterCard);
  const wantedSignature = cardsSignature(TUTORIAL_CARDS);
  let updatedCount = 0;
  let lastDeckId = 0;

  for (;;) {
    const decks = await deckRepository.createQueryBuilder('deck')
      .leftJoin('deck.subCards', 'card')
      .select(['deck.id', 'deck.title', 'card.id', 'card.title', 'card.descriptions'])
      .where('deck.isDefault = true AND deck.id > :lastDeckId', { lastDeckId })
      .orderBy('deck.id', 'ASC')
      .take(TUTORIAL_SYNC_BATCH_SIZE)
      .getMany();
    if (decks.length === 0) break;

    for (const deck of decks) {
      const matches = cardsSignature(deck.subCards || []) === wantedSignature && deck.title === TUTORIAL_DECK_TITLE;
      if (matches) continue;
      await dataSource.transaction(async (transaction) => {
        const cardRepository = transaction.getRepository(SubCard);
        await cardRepository.delete({ masterCardId: deck.id });
        await cardRepository.save(
          TUTORIAL_CARDS.map((card) =>
            cardRepository.create({ title: card.title, descriptions: card.descriptions, masterCardId: deck.id }),
          ),
        );
        if (deck.title !== TUTORIAL_DECK_TITLE) {
          await transaction.getRepository(MasterCard).update({ id: deck.id }, { title: TUTORIAL_DECK_TITLE });
        }
      });
      updatedCount++;
    }
    lastDeckId = decks[decks.length - 1].id;
  }
  return updatedCount;
}
