import type { Repository } from 'typeorm';
import type { MasterCard, User } from '../entities';
import { notFound } from './errors';

/** Look up the signed-in user's numeric id, or 404 when the account is gone. */
export async function requireUserId(users: Repository<User>, userUuid: string): Promise<number> {
  // perf Increase: only read the id column.
  const user = await users.findOne({ where: { uuid: userUuid }, select: ['id'] });
  if (!user) throw notFound('User not found');
  return user.id;
}

/**
 * Load a deck that belongs to this user, or 404.
 * Security: a deck owned by someone else gives the same 404 as one that doesn't exist,
 * so uuids of other people's decks can't be confirmed.
 */
export async function requireOwnedDeck(
  masterCards: Repository<MasterCard>,
  deckUuid: string,
  userId: number,
): Promise<MasterCard> {
  const deck = await masterCards.findOneBy({ uuid: deckUuid, userId });
  if (!deck) throw notFound('Master card not found');
  return deck;
}
