jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));

jest.mock('typeorm', () => {
  const noop = () => () => undefined;
  return {
    Entity: noop, Column: noop, PrimaryGeneratedColumn: noop, Generated: noop,
    CreateDateColumn: noop, UpdateDateColumn: noop, ManyToOne: noop, OneToMany: noop,
    ManyToMany: noop, JoinTable: noop, In: (v: unknown) => v,
    DataSource: () => undefined, Repository: () => undefined,
    IsNull: () => undefined, LessThanOrEqual: (v: unknown) => v,
  };
});

import { ReviewService } from '../services/ReviewService';

function makeMockRepo() {
  return {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: any) => ({ ...data })),
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

const mockReviews = makeMockRepo();
const mockSubCards = makeMockRepo();
const mockMasterCards = makeMockRepo();
const mockFolders = makeMockRepo();
const mockUsers = makeMockRepo();

function buildService(): ReviewService {
  const svc = Object.create(ReviewService.prototype);
  (svc as any).reviews = mockReviews;
  (svc as any).subCards = mockSubCards;
  (svc as any).masterCards = mockMasterCards;
  (svc as any).folders = mockFolders;
  (svc as any).users = mockUsers;
  return svc;
}

beforeEach(() => jest.clearAllMocks());

const user = { id: 1, uuid: 'user-1', name: 'alice' };

describe('ReviewService', () => {
  const svc = buildService();

  describe('submitResults', () => {
    it('creates new review records for never-reviewed cards', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockSubCards.find.mockResolvedValue([
        { id: 10, uuid: 'sc-1' },
        { id: 20, uuid: 'sc-2' },
      ]);
      // No existing reviews
      mockReviews.find.mockResolvedValue([]);
      mockReviews.create.mockImplementation((data: any) => ({ ...data }));

      await svc.submitResults('user-1', [
        { subCardUuid: 'sc-1', correct: true, mode: 'flash' },
        { subCardUuid: 'sc-2', correct: false, mode: 'choice' },
      ]);

      expect(mockReviews.save).toHaveBeenCalled();
      const saved = mockReviews.save.mock.calls[0][0] as any[];
      expect(saved).toHaveLength(2);

      // sc-1: correct flash → quality 4 → reps=1, interval=1, ease increases
      const r1 = saved.find((r: any) => r.subCardId === 10);
      expect(r1.repetitions).toBe(1);
      expect(r1.interval).toBe(1);
      expect(r1.easeFactor).toBeCloseTo(2.6);

      // sc-2: wrong → quality 0 → reps=0, interval=1
      const r2 = saved.find((r: any) => r.subCardId === 20);
      expect(r2.repetitions).toBe(0);
      expect(r2.interval).toBe(1);
    });

    it('updates existing review records', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockSubCards.find.mockResolvedValue([{ id: 10, uuid: 'sc-1' }]);

      const existingReview = {
        id: 99, userId: 1, subCardId: 10,
        easeFactor: 2.5, interval: 6, repetitions: 2,
        nextReviewAt: new Date(), lastReviewedAt: new Date(),
      };
      // reviews.find is called once in submitResults (for existing reviews by subCardId)
      mockReviews.find.mockResolvedValue([existingReview]);

      await svc.submitResults('user-1', [
        { subCardUuid: 'sc-1', correct: true, mode: 'choice' },
      ]);

      expect(mockReviews.save).toHaveBeenCalled();
      const saved = mockReviews.save.mock.calls[0][0] as any[];
      const r = saved[0];
      // quality 3 (choice correct), was rep 2 → now rep 3, interval = round(6 * 2.5) = 15
      expect(r.repetitions).toBe(3);
      expect(r.interval).toBe(15);
      expect(r.easeFactor).toBe(2.5); // quality 3 doesn't increase ease
    });

    it('does nothing for empty results', async () => {
      await svc.submitResults('user-1', []);
      expect(mockUsers.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('getDueCounts', () => {
    it('returns 0 when user has no cards', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const qb = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockSubCards.createQueryBuilder.mockReturnValue(qb);

      const result = await svc.getDueCounts('user-1');
      expect(result).toEqual({ total: 0, byFolder: [] });
    });

    it('counts due and new cards grouped by folder', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);

      // User has 3 sub cards across 2 master cards
      const qb = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 10, masterCardId: 1 },
          { id: 20, masterCardId: 1 },
          { id: 30, masterCardId: 2 },
        ]),
      };
      mockSubCards.createQueryBuilder.mockReturnValue(qb);

      // reviews.find is called twice:
      // 1st: due reviews (nextReviewAt <= now) → card 10 is due
      // 2nd: all reviews → cards 10 and 20 are reviewed (card 30 is new)
      mockReviews.find
        .mockResolvedValueOnce([{ subCardId: 10 }])
        .mockResolvedValueOnce([{ subCardId: 10 }, { subCardId: 20 }]);

      // Folders
      mockFolders.find.mockResolvedValue([
        { uuid: 'f-1', name: 'AWS', masterCards: [{ id: 1 }, { id: 2 }] },
      ]);

      const result = await svc.getDueCounts('user-1');
      // Card 10 (due) + Card 30 (new/unreviewed) = 2 due
      expect(result.total).toBe(2);
      expect(result.byFolder).toEqual([
        { folderUuid: 'f-1', folderName: 'AWS', count: 2 },
      ]);
    });
  });

  describe('getDueCards', () => {
    it('throws when folder not found', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockFolders.findOne.mockResolvedValue(null);

      await expect(svc.getDueCards('user-1', 'bad-uuid')).rejects.toThrow('Folder not found');
    });

    it('returns quiz-shaped response for due cards', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockFolders.findOne.mockResolvedValue({
        uuid: 'f-1', name: 'AWS', userId: 1,
        masterCards: [{ id: 1, uuid: 'mc-1', title: 'EC2' }],
      });

      const cards = [
        { id: 10, uuid: 'sc-1', title: 'Q1', descriptions: 'A1', link: '', masterCardId: 1 },
        { id: 20, uuid: 'sc-2', title: 'Q2', descriptions: 'A2', link: '', masterCardId: 1 },
        { id: 30, uuid: 'sc-3', title: 'Q3', descriptions: 'A3', link: '', masterCardId: 1 },
        { id: 40, uuid: 'sc-4', title: 'Q4', descriptions: 'A4', link: '', masterCardId: 1 },
      ];
      mockSubCards.find.mockResolvedValue(cards);

      // reviews.find: card 10 is due (past date), cards 20-40 have no review → new/due
      const pastDate = new Date(Date.now() - 86400000);
      mockReviews.find.mockResolvedValue([
        { subCardId: 10, nextReviewAt: pastDate },
      ]);

      const result = await svc.getDueCards('user-1', 'f-1');

      expect(result.folder).toEqual({ uuid: 'f-1', name: 'AWS' });
      expect(result.available).toBe(4); // 1 due + 3 new (no review record)
      expect(result.cards.length).toBe(4);
      expect(result.cards[0]).toHaveProperty('question');
      expect(result.cards[0]).toHaveProperty('answer');
      expect(result.cards[0]).toHaveProperty('choices');
    });

    it('respects count limit', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockFolders.findOne.mockResolvedValue({
        uuid: 'f-1', name: 'AWS', userId: 1,
        masterCards: [{ id: 1, uuid: 'mc-1', title: 'EC2' }],
      });

      const cards = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, uuid: `sc-${i}`, title: `Q${i}`, descriptions: `A${i}`, link: '', masterCardId: 1,
      }));
      mockSubCards.find.mockResolvedValue(cards);
      mockReviews.find.mockResolvedValue([]); // all new

      const result = await svc.getDueCards('user-1', 'f-1', 5);
      expect(result.cards.length).toBe(5);
      expect(result.available).toBe(20);
    });
  });
});
