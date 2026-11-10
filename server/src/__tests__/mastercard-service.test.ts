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
    DataSource: noopClass,
    Repository: noopClass,
  };
});

import { MasterCardService } from '../services/MasterCardService';

function makeMockRepo() {
  return {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: any) => ({ ...data, id: 1, uuid: 'mc-uuid' })),
    save: jest.fn((entity: any) => Promise.resolve(entity)),
    remove: jest.fn(),
    delete: jest.fn(),
  };
}

const mockMasterCards = makeMockRepo();
const mockSubCards = makeMockRepo();
const mockProgressRepo = makeMockRepo();
const mockUsers = makeMockRepo();

function buildService(): MasterCardService {
  const svc = Object.create(MasterCardService.prototype);
  (svc as any).masterCards = mockMasterCards;
  (svc as any).subCards = mockSubCards;
  (svc as any).progressRepo = mockProgressRepo;
  (svc as any).users = mockUsers;
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
    it('returns card with relations', async () => {
      const card = { id: 1, uuid: 'mc-1', title: 'Test', subCards: [], progress: [] };
      mockMasterCards.findOne.mockResolvedValue(card);

      const result = await svc.getOne('mc-1');

      expect(mockMasterCards.findOne).toHaveBeenCalledWith({
        where: { uuid: 'mc-1' },
        relations: ['subCards', 'progress'],
      });
      expect(result).toEqual(card);
    });

    it('throws 404 for unknown uuid', async () => {
      mockMasterCards.findOne.mockResolvedValue(null);

      await expect(svc.getOne('bad-uuid')).rejects.toThrow('Master card not found');
    });
  });

  describe('getAllForUser', () => {
    it('returns all cards for user', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const cards = [
        { id: 1, uuid: 'mc-1', title: 'Card 1' },
        { id: 2, uuid: 'mc-2', title: 'Card 2' },
      ];
      mockMasterCards.find.mockResolvedValue(cards);

      const result = await svc.getAllForUser(userUuid);

      expect(mockUsers.findOneBy).toHaveBeenCalledWith({ uuid: userUuid });
      expect(mockMasterCards.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        relations: ['subCards', 'progress'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(cards);
    });
  });

  describe('create', () => {
    it('creates mastercard with subcards', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      mockMasterCards.create.mockReturnValue({ id: 10, uuid: 'mc-new', title: 'New', userId: 1 });
      mockMasterCards.save.mockResolvedValue({ id: 10, uuid: 'mc-new', title: 'New', userId: 1 });
      mockSubCards.create.mockImplementation((data: any) => data);
      mockSubCards.save.mockResolvedValue([]);
      // getAllForUser is called at the end
      mockMasterCards.find.mockResolvedValue([{ id: 10, uuid: 'mc-new', title: 'New' }]);

      const subCards = [{ title: 'Sub1', description: 'Desc1' }];
      const result = await svc.create(userUuid, 'New', subCards);

      expect(mockMasterCards.create).toHaveBeenCalledWith({ title: 'New', userId: 1 });
      expect(mockMasterCards.save).toHaveBeenCalled();
      expect(mockSubCards.create).toHaveBeenCalledWith({
        title: 'Sub1',
        descriptions: 'Desc1',
        masterCardId: 10,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('updates title', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'Old', userId: 1 };
      mockMasterCards.findOneBy.mockResolvedValue(card);
      mockMasterCards.save.mockResolvedValue({ ...card, title: 'Updated' });

      const result = await svc.update('mc-1', userUuid, 'Updated');

      expect(card.title).toBe('Updated');
      expect(mockMasterCards.save).toHaveBeenCalledWith(card);
    });
  });

  describe('delete', () => {
    it('removes card', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const card = { id: 1, uuid: 'mc-1', title: 'ToDelete', userId: 1 };
      mockMasterCards.findOneBy.mockResolvedValue(card);

      await svc.delete('mc-1', userUuid);

      expect(mockMasterCards.remove).toHaveBeenCalledWith(card);
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
      mockMasterCards.find.mockResolvedValue([]);

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
      mockMasterCards.find.mockResolvedValue([]);

      await svc.recordTime('mc-1', userUuid, 15);

      expect(lastEntry.time).toBe(25);
      expect(mockProgressRepo.save).toHaveBeenCalledWith(lastEntry);
    });
  });

  describe('getTopFive', () => {
    it('returns top 5 by timespent', async () => {
      mockUsers.findOneBy.mockResolvedValue(user);
      const cards = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        uuid: `mc-${i}`,
        title: `Card ${i}`,
        timespent: (i + 1) * 10,
        createdAt: new Date(),
      }));
      mockMasterCards.find.mockResolvedValue(cards.slice(0, 5));

      const result = await svc.getTopFive(userUuid);

      expect(mockMasterCards.find).toHaveBeenCalledWith({
        where: { userId: user.id },
        order: { timespent: 'DESC' },
        take: 5,
      });
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('maxTime');
      expect(result[0]).toHaveProperty('referenceID');
      expect(result[0]).toHaveProperty('title');
    });
  });
});
