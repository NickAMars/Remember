import type { DataSource } from 'typeorm';
import { MasterCard, SubCard } from '../entities';
import { TUTORIAL_CARDS, TUTORIAL_DECK_TITLE } from '../constants/tutorial';

const signature = (cards: { title: string; descriptions: string }[]) =>
  cards.map(c => `${c.title}\u0000${c.descriptions}`).sort().join('\u0001');

// Bring every user's tutorial deck in line with TUTORIAL_CARDS. Decks that already match are left alone.
export async function syncTutorialDecks(ds: DataSource): Promise<number> {
  const masterRepo = ds.getRepository(MasterCard);
  const subRepo = ds.getRepository(SubCard);
  const wanted = signature(TUTORIAL_CARDS);
  const decks = await masterRepo.find({ where: { isDefault: true }, relations: ['subCards'] });
  let updated = 0;

  for (const deck of decks) {
    if (signature(deck.subCards || []) === wanted && deck.title === TUTORIAL_DECK_TITLE) continue;
    await ds.transaction(async (tx) => {
      await tx.getRepository(SubCard).delete({ masterCardId: deck.id });
      await tx.getRepository(SubCard).save(
        TUTORIAL_CARDS.map(c => subRepo.create({ title: c.title, descriptions: c.descriptions, masterCardId: deck.id })),
      );
      if (deck.title !== TUTORIAL_DECK_TITLE) {
        await tx.getRepository(MasterCard).update({ id: deck.id }, { title: TUTORIAL_DECK_TITLE });
      }
    });
    updated++;
  }
  return updated;
}
