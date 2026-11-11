// Mock inversify decorators before any import
jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));

jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret', jwtTtl: '1h' },
}));

jest.mock('../constants', () => ({
  BCRYPT_SALT_ROUNDS: 12,
  MAX_PROGRESS_DAYS: 8,
  TOP_FIVE_LIMIT: 5,
  MILLISECONDS_PER_DAY: 86_400_000,
}));

// Suppress TypeORM decorator errors
jest.mock('typeorm', () => {
  const noop = () => () => undefined;
  const noopClass = () => undefined;
  return {
    Entity: noop,
    Column: noop,
    PrimaryGeneratedColumn: noop,
    Generated: noop,
    CreateDateColumn: noop,
    UpdateDateColumn: noop,
    ManyToOne: noop,
    OneToMany: noop,
    ManyToMany: noop,
    JoinTable: noop,
    DataSource: noopClass,
    Repository: noopClass,
  };
});

import { MasterCardService } from '../services/MasterCardService';

function makeQueryBuilder(result: any[] = [], count = 0) {
  const qb: any = {
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
    getCount: jest.fn().mockResolvedValue(count),
  };
  return qb;
}

function makeMockRepo() {
  return {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: any) => ({ ...data, id: 1, uuid: 'mc-uuid' })),
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(),
  };
}

const mockMasterCards = makeMockRepo();
const mockSubCards = makeMockRepo();
const mockProgressRepo = makeMockRepo();
const mockUsers = makeMockRepo();
const mockPoolCards = makeMockRepo();

function buildService(): MasterCardService {
  const svc = Object.create(MasterCardService.prototype);
  (svc as any).masterCards = mockMasterCards;
  (svc as any).subCards = mockSubCards;
  (svc as any).progressRepo = mockProgressRepo;
  (svc as any).users = mockUsers;
  (svc as any).poolCards = mockPoolCards;
  return svc;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MasterCardService', () => {
  const svc = buildService();
  const userUuid = 'user-uuid-1';
  const user = { id: 1, uuid: userUuid, name: 'alice' };

  describe('getOne', () => {
    it('returns card with relations and increments views', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'Test', views: 5, subCards: [], progress: [], userId: 1 };
      mockMasterCards.findOne.mockResolvedValue(card);

      const result = await svc.getOne('mc-1', userUuid);

      expect(mockUsers.findOneBy).toHaveBeenCalledWith({ uuid: userUuid });
      expect(mockMasterCards.findOne).toHaveBeenCalledWith({
        where: { uuid: 'mc-1', userId: user.id },
        relations: ['subCards', 'progress'],
      });
      expect(mockMasterCards.increment).toHaveBeenCalledWith({ uuid: 'mc-1' }, 'views', 1);
      expect(result.views).toBe(6);
    });

    it('throws 404 for unknown uuid', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOne.mockResolvedValue(null);

      await expect(svc.getOne('bad-uuid', userUuid)).rejects.toThrow('Master card not found');
    });

    it('throws 404 for unknown user', async () => {
      mockUsers.findOneBy.mockResolvedValue(null);

      await expect(svc.getOne('mc-1', 'bad-user')).rejects.toThrow('User not found');
    });
  });

  describe('getAllForUser', () => {
    it('returns paginated cards with count', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const cards = [
        { id: 1, uuid: 'mc-1', title: 'Card 1' },
        { id: 2, uuid: 'mc-2', title: 'Card 2' },
      ];
      const qb = makeQueryBuilder(cards, 2);
      mockMasterCards.createQueryBuilder.mockReturnValue(qb);

      const result = await svc.getAllForUser(userUuid, 0, 10);

      expect(mockUsers.findOneBy).toHaveBeenCalledWith({ uuid: userUuid });
      expect(qb.loadRelationCountAndMap).toHaveBeenCalledWith('mc.subCardCount', 'mc.subCards');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('mc.progress', 'p');
      expect(qb.where).toHaveBeenCalledWith('mc.userId = :userId', { userId: user.id });
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ items: cards, total: 2 });
    });

    it('applies search filter', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const qb = makeQueryBuilder([], 0);
      mockMasterCards.createQueryBuilder.mockReturnValue(qb);

      await svc.getAllForUser(userUuid, 0, 10, 'aws');

      expect(qb.andWhere).toHaveBeenCalledWith(
        'LOWER(mc.title) LIKE :search',
        { search: '%aws%' },
      );
    });

    it('throws 404 for unknown user', async () => {
      mockUsers.findOneBy.mockResolvedValue(null);

      await expect(svc.getAllForUser('bad-user')).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('creates mastercard with subcards and returns updated list', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOneBy.mockResolvedValue(null); // no duplicate title
      mockMasterCards.create.mockReturnValue({ id: 10, uuid: 'mc-new', title: 'New', userId: 1 });
      mockMasterCards.save.mockResolvedValue({ id: 10, uuid: 'mc-new', title: 'New', userId: 1 });
      mockSubCards.create.mockImplementation((data: any) => data);
      mockSubCards.save.mockResolvedValue([]);
      // getAllForUser is called at the end
      const qb = makeQueryBuilder([{ id: 10, uuid: 'mc-new', title: 'New' }], 1);
      mockMasterCards.createQueryBuilder.mockReturnValue(qb);

      const subCards = [{ title: 'Sub1', description: 'Desc1', link: 'https://example.com' }];
      const result = await svc.create(userUuid, 'New', subCards);

      expect(mockMasterCards.create).toHaveBeenCalledWith({ title: 'New', userId: 1 });
      expect(mockMasterCards.save).toHaveBeenCalled();
      expect(mockSubCards.create).toHaveBeenCalledWith({
        title: 'Sub1',
        descriptions: 'Desc1',
        link: 'https://example.com',
        masterCardId: 10,
      });
      expect(result.items).toHaveLength(1);
    });

    it('rejects duplicate deck title', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOneBy.mockResolvedValue({ id: 1, title: 'Existing' });

      await expect(svc.create(userUuid, 'Existing', [])).rejects.toThrow('You already have a deck with this title');
    });

    it('rejects duplicate questions within cards', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOneBy.mockResolvedValue(null);

      const dupeCards = [
        { title: 'Same Q', description: 'A1' },
        { title: 'Same Q', description: 'A2' },
      ];
      await expect(svc.create(userUuid, 'Deck', dupeCards)).rejects.toThrow('Duplicate questions');
    });
  });

  describe('update', () => {
    it('updates title', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'Old', userId: 1, isDefault: false };
      mockMasterCards.findOneBy
        .mockResolvedValueOnce(card)    // find card
        .mockResolvedValueOnce(null);   // no duplicate title
      mockMasterCards.save.mockResolvedValue({ ...card, title: 'Updated' });

      const result = await svc.update('mc-1', userUuid, 'Updated');

      expect(card.title).toBe('Updated');
      expect(mockMasterCards.save).toHaveBeenCalledWith(card);
    });

    it('rejects editing default card', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOneBy.mockResolvedValue({ id: 1, uuid: 'mc-1', title: 'Default', userId: 1, isDefault: true });

      await expect(svc.update('mc-1', userUuid, 'New Title')).rejects.toThrow('Cannot edit the default tutorial card');
    });
  });

  describe('delete', () => {
    it('removes card and associated pool card', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'ToDelete', userId: 1, isDefault: false };
      mockMasterCards.findOneBy.mockResolvedValue(card);
      const poolCard = { id: 5, title: 'ToDelete', author: userUuid };
      mockPoolCards.findOneBy.mockResolvedValue(poolCard);

      await svc.delete('mc-1', userUuid);

      expect(mockPoolCards.findOneBy).toHaveBeenCalledWith({ author: userUuid, title: 'ToDelete' });
      expect(mockPoolCards.remove).toHaveBeenCalledWith(poolCard);
      expect(mockMasterCards.remove).toHaveBeenCalledWith(card);
    });

    it('removes card when no pool card exists', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'Private', userId: 1, isDefault: false };
      mockMasterCards.findOneBy.mockResolvedValue(card);
      mockPoolCards.findOneBy.mockResolvedValue(null);

      await svc.delete('mc-1', userUuid);

      expect(mockPoolCards.remove).not.toHaveBeenCalled();
      expect(mockMasterCards.remove).toHaveBeenCalledWith(card);
    });

    it('rejects deleting default card', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.findOneBy.mockResolvedValue({ id: 1, isDefault: true, userId: 1 });

      await expect(svc.delete('mc-1', userUuid)).rejects.toThrow('Cannot delete the default tutorial card');
    });
  });

  describe('recordTime', () => {
    it('adds progress entries when empty', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 5, uuid: 'mc-1', userId: 1, progress: [] };
      mockMasterCards.findOne
        .mockResolvedValueOnce(card)   // first call in recordTime
        .mockResolvedValueOnce({ ...card, progress: [{ time: 30, dayCreated: new Date() }] }); // second call for timespent

      mockProgressRepo.create.mockImplementation((data: any) => data);
      mockProgressRepo.save.mockResolvedValue([]);
      mockMasterCards.save.mockResolvedValue({});
      // getAllForUser call
      const qb = makeQueryBuilder([], 0);
      mockMasterCards.createQueryBuilder.mockReturnValue(qb);

      await svc.recordTime('mc-1', userUuid, 30);

      // 8 previous days + 1 today = 9 entries
      expect(mockProgressRepo.create).toHaveBeenCalledTimes(9);
      expect(mockProgressRepo.save).toHaveBeenCalled();
    });

    it('increments time on same day', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastEntry = { time: 10, dayCreated: today, masterCardId: 5 };
      const card = { id: 5, uuid: 'mc-1', userId: 1, progress: [lastEntry] };
      mockMasterCards.findOne
        .mockResolvedValueOnce(card)
        .mockResolvedValueOnce({ ...card, progress: [{ ...lastEntry, time: 25 }] });
      mockProgressRepo.save.mockResolvedValue(lastEntry);
      mockMasterCards.save.mockResolvedValue({});
      const qb = makeQueryBuilder([], 0);
      mockMasterCards.createQueryBuilder.mockReturnValue(qb);

      await svc.recordTime('mc-1', userUuid, 15);

      expect(lastEntry.time).toBe(25);
      expect(mockProgressRepo.save).toHaveBeenCalledWith(lastEntry);
    });
  });

  describe('getTopFive', () => {
    it('returns top 5 by views', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const cards = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        uuid: `mc-${i}`,
        title: `Card ${i}`,
        views: (i + 1) * 10,
        createdAt: new Date(),
      }));
      mockMasterCards.find.mockResolvedValue(cards.slice(0, 5));

      const result = await svc.getTopFive(userUuid);

      expect(mockMasterCards.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        order: { views: 'DESC' },
        take: 5,
      });
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('maxTime');
      expect(result[0]).toHaveProperty('referenceID');
      expect(result[0]).toHaveProperty('title');
    });

    it('returns empty for unknown user', async () => {
      mockUsers.findOneBy.mockResolvedValue(null);

      const result = await svc.getTopFive('unknown');
      expect(result).toEqual([]);
    });
  });
});
