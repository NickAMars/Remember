jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));

jest.mock('typeorm', () => require('./support/typeormMock'));

import { pickChoices, shuffle } from '../services/FolderService';

describe('shuffle', () => {
  it('keeps every item and does not change the input', () => {
    const input = [1, 2, 3, 4, 5];
    const shuffled = shuffle(input);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('pickChoices', () => {
  const pool = [
    { answer: 'A', deckId: 1 },
    { answer: 'B', deckId: 1 },
    { answer: 'C', deckId: 2 },
    { answer: 'D', deckId: 2 },
    { answer: 'E', deckId: 3 },
  ];

  it('returns 4 unique options including the right answer', () => {
    const choices = pickChoices({ answer: 'A', deckId: 1 }, pool);
    expect(choices).toHaveLength(4);
    expect(choices).toContain('A');
    expect(new Set(choices).size).toBe(4);
  });

  it('prefers wrong answers from the same deck', () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      expect(pickChoices({ answer: 'A', deckId: 1 }, pool)).toContain('B');
    }
  });

  it('ignores duplicates of the right answer', () => {
    const dupes = [{ answer: 'a ', deckId: 1 }, { answer: 'B', deckId: 1 }, { answer: 'C', deckId: 1 }];
    expect(pickChoices({ answer: 'A', deckId: 1 }, dupes)).toEqual([]);
  });

  it('returns no options when there are too few other answers', () => {
    expect(pickChoices({ answer: 'A', deckId: 1 }, pool.slice(0, 3))).toEqual([]);
  });

  it('returns no options when the card has no answer', () => {
    expect(pickChoices({ answer: '  ', deckId: 1 }, pool)).toEqual([]);
  });

  it("uses the card's own wrong answers when it has 3 or more", () => {
    const savedWrongAnswers = ['W1', 'W2', 'W3', 'W4', 'W5'];
    for (let attempt = 0; attempt < 20; attempt++) {
      const choices = pickChoices({ answer: 'A', deckId: 1, wrongAnswers: savedWrongAnswers }, pool);
      expect(choices).toHaveLength(4);
      expect(choices).toContain('A');
      expect(choices.filter((choice) => choice !== 'A').every((choice) => savedWrongAnswers.includes(choice))).toBe(true);
    }
  });

  it('fills the gap from other cards when fewer than 3 wrong answers are saved', () => {
    const choices = pickChoices({ answer: 'A', deckId: 1, wrongAnswers: ['W1'] }, pool);
    expect(choices).toHaveLength(4);
    expect(choices).toEqual(expect.arrayContaining(['A', 'W1', 'B']));
  });

  it('works for a card with saved wrong answers even when the folder has no other cards', () => {
    const choices = pickChoices({ answer: 'A', deckId: 1, wrongAnswers: ['W1', 'W2', 'W3'] }, []);
    expect([...choices].sort()).toEqual(['A', 'W1', 'W2', 'W3']);
  });
});

import { FolderService } from '../services/FolderService';
import { buildQuizCards } from '../services/quiz';
import { MAX_QUIZ_QUESTIONS } from '../constants';
import { buildWith, makeQueryBuilder, makeRepository } from './support/mocks';

describe('buildQuizCards', () => {
  const decks = [{ id: 1, title: 'EC2' }];

  it('asks the database for random cards, capped at the requested count', async () => {
    const cardRepository = makeRepository();
    const pickQuery = makeQueryBuilder({ getMany: [{ id: 1, uuid: 'c-1', title: 'Q', descriptions: 'A', link: '', masterCardId: 1 }] });
    cardRepository.createQueryBuilder
      .mockReturnValueOnce(makeQueryBuilder({ getCount: 50 }))
      .mockReturnValueOnce(pickQuery)
      .mockReturnValueOnce(makeQueryBuilder({ getMany: [] }));

    const quiz = await buildQuizCards(cardRepository as any, decks, { count: 10 });

    expect(pickQuery.orderBy).toHaveBeenCalledWith('RANDOM()');
    expect(pickQuery.limit).toHaveBeenCalledWith(10);
    expect(quiz.available).toBe(50);
    expect(quiz.cards[0]).toMatchObject({ uuid: 'c-1', question: 'Q', answer: 'A', deck: 'EC2' });
  });

  it('never returns more than the maximum number of questions', async () => {
    const cardRepository = makeRepository();
    const pickQuery = makeQueryBuilder({ getMany: [] });
    cardRepository.createQueryBuilder
      .mockReturnValueOnce(makeQueryBuilder({ getCount: MAX_QUIZ_QUESTIONS * 5 }))
      .mockReturnValueOnce(pickQuery)
      .mockReturnValueOnce(makeQueryBuilder({ getMany: [] }));

    await buildQuizCards(cardRepository as any, decks);

    expect(pickQuery.limit).toHaveBeenCalledWith(MAX_QUIZ_QUESTIONS);
  });

  it('skips the extra queries when there are no cards', async () => {
    const cardRepository = makeRepository();
    cardRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getCount: 0 }));
    expect(await buildQuizCards(cardRepository as any, decks)).toEqual({ available: 0, cards: [] });
    expect(cardRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });
});

describe('FolderService', () => {
  const folderRepository = makeRepository();
  const deckRepository = makeRepository();
  const cardRepository = makeRepository();
  const userRepository = makeRepository();
  const service = buildWith(FolderService, {
    folders: folderRepository,
    masterCards: deckRepository,
    subCards: cardRepository,
    users: userRepository,
  });
  const folder = { id: 4, uuid: 'folder-4', name: 'AWS', createdAt: new Date(0), masterCards: [{ id: 3, uuid: 'deck-3', title: 'EC2' }] };

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findOne.mockResolvedValue({ id: 1 });
  });

  it("refuses to add decks the user doesn't own", async () => {
    folderRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getOne: folder }));
    deckRepository.find.mockResolvedValue([{ id: 3 }]);

    await expect(service.setDecks('folder-4', 'user-1', ['deck-3', 'someone-elses-deck']))
      .rejects.toThrow('One or more decks were not found');
    expect(folderRepository.save).not.toHaveBeenCalled();
  });

  it('gives 404 when removing a deck that is not in the folder', async () => {
    folderRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getOne: folder }));
    await expect(service.removeDeck('folder-4', 'user-1', 'deck-99')).rejects.toThrow('not in this folder');
  });

  it('gives 404 for a folder that is not the user\'s', async () => {
    folderRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getOne: null }));
    await expect(service.get('folder-x', 'user-1')).rejects.toThrow('Folder not found');
  });

  it('rejects a duplicate folder name', async () => {
    folderRepository.findOneBy.mockResolvedValue({ id: 2 });
    await expect(service.create('user-1', ' AWS ')).rejects.toThrow('already have a folder');
  });
});
