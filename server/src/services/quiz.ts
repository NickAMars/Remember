import type { Repository } from 'typeorm';
import { SubCard } from '../entities';
import { MAX_QUIZ_QUESTIONS, QUIZ_ANSWER_POOL_SIZE, QUIZ_CHOICES } from '../constants';

export { QUIZ_CHOICES };

export interface QuizCard {
  uuid: string;
  question: string;
  answer: string;
  link: string;
  deck: string;
  /** Shuffled answer options (includes the right one). Empty when there aren't enough other answers. */
  choices: string[];
}

export interface Quiz {
  folder: { uuid: string; name: string };
  available: number;
  cards: QuizCard[];
}

export interface AnswerOption {
  answer: string;
  deckId: number;
}

/** The card a question is built from. Its own saved wrong answers are used first. */
export interface QuestionSource extends AnswerOption {
  wrongAnswers?: string[];
}

/** Fisher–Yates shuffle. Returns a new array and leaves the input alone. */
export function shuffle<Item>(items: Item[], random: () => number = Math.random): Item[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

/**
 * Build the answer choices for a card: the right answer plus `size - 1` wrong ones.
 * The card's own saved wrong answers come first (a random few when it has more than
 * needed). Any gap is filled with answers from the same deck, which look more alike,
 * then from the rest of the folder.
 */
export function pickChoices(
  card: QuestionSource,
  answerPool: AnswerOption[],
  size = QUIZ_CHOICES,
  random: () => number = Math.random,
): string[] {
  const rightAnswer = card.answer.trim();
  if (!rightAnswer) return [];
  const seenAnswers = new Set([rightAnswer.toLowerCase()]);
  const wrongAnswers: string[] = [];
  const takeFrom = (candidates: string[]) => {
    for (const candidate of shuffle(candidates, random)) {
      if (wrongAnswers.length >= size - 1) return;
      const answerText = (candidate || '').trim();
      if (!answerText || seenAnswers.has(answerText.toLowerCase())) continue;
      seenAnswers.add(answerText.toLowerCase());
      wrongAnswers.push(answerText);
    }
  };
  takeFrom(card.wrongAnswers || []);
  if (wrongAnswers.length < size - 1) {
    takeFrom(answerPool.filter((option) => option.deckId === card.deckId).map((option) => option.answer));
    takeFrom(answerPool.filter((option) => option.deckId !== card.deckId).map((option) => option.answer));
  }
  if (wrongAnswers.length < size - 1) return [];
  return shuffle([rightAnswer, ...wrongAnswers], random);
}

export interface QuizCardOptions {
  /** How many questions to return. 0 or missing means all (up to MAX_QUIZ_QUESTIONS). */
  count?: number;
  /** When set, only cards marked for review are included. */
  dueForUserId?: number;
}

/**
 * Pick random quiz questions from a set of decks and build their answer choices.
 * perf Increase: the database counts, filters and picks the random cards, so a folder
 * with thousands of cards no longer loads every card into memory.
 */
export async function buildQuizCards(
  subCards: Repository<SubCard>,
  decks: { id: number; title: string }[],
  options: QuizCardOptions = {},
): Promise<{ available: number; cards: QuizCard[] }> {
  const deckIds = decks.map((deck) => deck.id);
  const deckTitles = new Map(decks.map((deck) => [deck.id, deck.title]));

  const cardQuery = () => {
    const query = subCards.createQueryBuilder('card').where('card.masterCardId IN (:...deckIds)', { deckIds });
    if (options.dueForUserId !== undefined) {
      query.andWhere('card.markedForReview = true');
    }
    return query;
  };

  const available = await cardQuery().getCount();
  if (available === 0) return { available, cards: [] };

  const wanted = options.count && options.count > 0 ? options.count : available;
  const limit = Math.min(wanted, available, MAX_QUIZ_QUESTIONS);

  const pickedCards = await cardQuery()
    .select(['card.id', 'card.uuid', 'card.title', 'card.descriptions', 'card.link', 'card.wrongAnswers', 'card.masterCardId'])
    .orderBy('RANDOM()')
    .limit(limit)
    .getMany();

  const sampledAnswers = await subCards.createQueryBuilder('card')
    .select(['card.id', 'card.descriptions', 'card.masterCardId'])
    .where('card.masterCardId IN (:...deckIds)', { deckIds })
    .andWhere("card.descriptions <> ''")
    .orderBy('RANDOM()')
    .limit(QUIZ_ANSWER_POOL_SIZE)
    .getMany();

  const answerPool: AnswerOption[] = [...pickedCards, ...sampledAnswers].map((card) => ({
    answer: card.descriptions || '',
    deckId: card.masterCardId,
  }));

  return {
    available,
    cards: pickedCards.map((card) => ({
      uuid: card.uuid,
      question: card.title,
      answer: card.descriptions || '',
      link: card.link || '',
      deck: deckTitles.get(card.masterCardId) || '',
      choices: pickChoices(
        { answer: card.descriptions || '', deckId: card.masterCardId, wrongAnswers: card.wrongAnswers },
        answerPool,
      ),
    })),
  };
}
