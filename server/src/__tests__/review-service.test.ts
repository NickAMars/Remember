jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));
jest.mock('typeorm', () => require('./support/typeormMock'));

import { ReviewService, qualityFor } from '../services/ReviewService';
import { buildWith, makeQueryBuilder, makeRepository } from './support/mocks';

const reviewRepository = makeRepository();
const cardRepository = makeRepository();
const folderRepository = makeRepository();
const userRepository = makeRepository();

const service = buildWith(ReviewService, {
  reviews: reviewRepository,
  subCards: cardRepository,
  folders: folderRepository,
  users: userRepository,
});

beforeEach(() => {
  jest.resetAllMocks();
  userRepository.findOne.mockResolvedValue({ id: 1 });
  reviewRepository.create.mockImplementation((data: any) => ({ ...data }));
  reviewRepository.find.mockResolvedValue([]);
});

describe('qualityFor', () => {
  it('scores wrong as 0, multiple choice as 3 and flash card as 4', () => {
    expect(qualityFor({ correct: false, mode: 'flash' })).toBe(0);
    expect(qualityFor({ correct: true, mode: 'choice' })).toBe(3);
    expect(qualityFor({ correct: true, mode: 'flash' })).toBe(4);
  });
});

describe('ReviewService.submitResults', () => {
  it('creates review records for new cards', async () => {
    const query = makeQueryBuilder({ getMany: [{ id: 10, uuid: 'card-1' }, { id: 20, uuid: 'card-2' }] });
    cardRepository.createQueryBuilder.mockReturnValue(query);

    await service.submitResults('user-1', [
      { subCardUuid: 'card-1', correct: true, mode: 'flash' },
      { subCardUuid: 'card-2', correct: false, mode: 'choice' },
    ]);

    const saved = reviewRepository.save.mock.calls[0][0] as any[];
    expect(saved).toHaveLength(2);
    const firstReview = saved.find((review) => review.subCardId === 10);
    expect(firstReview).toMatchObject({ repetitions: 1, interval: 1 });
    expect(firstReview.easeFactor).toBeCloseTo(2.6);
    expect(saved.find((review) => review.subCardId === 20)).toMatchObject({ repetitions: 0, interval: 1 });
  });

  it("only accepts cards from the user's own decks", async () => {
    const query = makeQueryBuilder({ getMany: [] });
    cardRepository.createQueryBuilder.mockReturnValue(query);

    await service.submitResults('user-1', [{ subCardUuid: 'someone-elses-card', correct: true, mode: 'flash' }]);

    expect(query.andWhere).toHaveBeenCalledWith('deck.userId = :userId', { userId: 1 });
    expect(reviewRepository.save).not.toHaveBeenCalled();
  });

  it('updates an existing review', async () => {
    cardRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getMany: [{ id: 10, uuid: 'card-1' }] }));
    reviewRepository.find.mockResolvedValue([{
      id: 99, userId: 1, subCardId: 10, easeFactor: 2.5, interval: 6, repetitions: 2,
      nextReviewAt: new Date(), lastReviewedAt: new Date(),
    }]);

    await service.submitResults('user-1', [{ subCardUuid: 'card-1', correct: true, mode: 'choice' }]);

    const [review] = reviewRepository.save.mock.calls[0][0] as any[];
    expect(review).toMatchObject({ repetitions: 3, interval: 15, easeFactor: 2.5 });
  });

  it('saves a card answered twice in one quiz only once', async () => {
    cardRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getMany: [{ id: 10, uuid: 'card-1' }] }));

    await service.submitResults('user-1', [
      { subCardUuid: 'card-1', correct: true, mode: 'choice' },
      { subCardUuid: 'card-1', correct: true, mode: 'choice' },
    ]);

    const saved = reviewRepository.save.mock.calls[0][0] as any[];
    expect(saved).toHaveLength(1);
    expect(saved[0].repetitions).toBe(2);
  });

  it('does nothing for an empty list', async () => {
    await service.submitResults('user-1', []);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });
});

describe('ReviewService.getDueCounts', () => {
  it('returns zero without a second query when nothing is due', async () => {
    cardRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getCount: 0 }));

    expect(await service.getDueCounts('user-1')).toEqual({ total: 0, byFolder: [] });
    expect(folderRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('counts due cards in SQL, in total and per folder', async () => {
    const totalQuery = makeQueryBuilder({ getCount: 5 });
    cardRepository.createQueryBuilder.mockReturnValue(totalQuery);
    folderRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({
      getRawMany: [{ folderUuid: 'folder-1', folderName: 'AWS', count: '3' }],
    }));

    const result = await service.getDueCounts('user-1');

    expect(totalQuery.andWhere).toHaveBeenCalledWith(expect.stringContaining('review.id IS NULL'), expect.any(Object));
    expect(result).toEqual({ total: 5, byFolder: [{ folderUuid: 'folder-1', folderName: 'AWS', count: 3 }] });
  });
});

describe('ReviewService.getDueCards', () => {
  it('gives 404 for a folder that is not the user\'s', async () => {
    folderRepository.findOne.mockResolvedValue(null);
    await expect(service.getDueCards('user-1', 'folder-x')).rejects.toThrow('Folder not found');
  });

  it('builds a quiz from the due cards only', async () => {
    folderRepository.findOne.mockResolvedValue({ uuid: 'folder-1', name: 'AWS', masterCards: [{ id: 1, title: 'EC2' }] });
    const countQuery = makeQueryBuilder({ getCount: 2 });
    const pickQuery = makeQueryBuilder({ getMany: [
      { id: 10, uuid: 'card-1', title: 'Q1', descriptions: 'A1', link: '', masterCardId: 1 },
      { id: 20, uuid: 'card-2', title: 'Q2', descriptions: 'A2', link: '', masterCardId: 1 },
    ] });
    const answerQuery = makeQueryBuilder({ getMany: [] });
    cardRepository.createQueryBuilder
      .mockReturnValueOnce(countQuery)
      .mockReturnValueOnce(pickQuery)
      .mockReturnValueOnce(answerQuery);

    const quiz = await service.getDueCards('user-1', 'folder-1', 5);

    expect(countQuery.leftJoin).toHaveBeenCalled();
    expect(pickQuery.limit).toHaveBeenCalledWith(2);
    expect(quiz.folder).toEqual({ uuid: 'folder-1', name: 'AWS' });
    expect(quiz.available).toBe(2);
    expect(quiz.cards.map((card) => card.question)).toEqual(['Q1', 'Q2']);
    expect(quiz.cards[0]).toMatchObject({ answer: 'A1', deck: 'EC2' });
  });

  it('says so when nothing is due', async () => {
    folderRepository.findOne.mockResolvedValue({ uuid: 'folder-1', name: 'AWS', masterCards: [{ id: 1, title: 'EC2' }] });
    cardRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getCount: 0 }));
    await expect(service.getDueCards('user-1', 'folder-1')).rejects.toThrow('No cards are due');
  });
});
