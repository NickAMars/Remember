jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));
jest.mock('../config', () => ({ config: { jwtSecret: 'test-secret', jwtTtl: '1h' } }));
jest.mock('typeorm', () => require('./support/typeormMock'));

import { MasterCardService } from '../services/MasterCardService';
import { MAX_STUDY_SESSION_MS } from '../constants';
import { buildWith, makeDataSource, makeQueryBuilder, makeRepository } from './support/mocks';

const deckRepository = makeRepository();
const cardRepository = makeRepository();
const progressRepository = makeRepository();
const userRepository = makeRepository();
const publicDeckRepository = makeRepository();
const dataSource = makeDataSource({
  MasterCard: deckRepository,
  SubCard: cardRepository,
  Progress: progressRepository,
});

const service = buildWith(MasterCardService, {
  dataSource,
  masterCards: deckRepository,
  progressRepository,
  users: userRepository,
  poolCards: publicDeckRepository,
});

const userUuid = 'user-uuid-1';
const user = { id: 1 };

beforeEach(() => {
  jest.resetAllMocks();
  userRepository.findOne.mockResolvedValue(user);
  deckRepository.create.mockImplementation((data: any) => ({ ...data }));
  cardRepository.create.mockImplementation((data: any) => ({ ...data }));
  progressRepository.create.mockImplementation((data: any) => ({ ...data }));
  deckRepository.save.mockImplementation((entity: any) => Promise.resolve({ id: 10, uuid: 'deck-new', ...entity }));
  dataSource.transaction.mockImplementation((work: any) => work(dataSource.manager));
  dataSource.manager.getRepository.mockImplementation((entity: { name: string }) =>
    ({ MasterCard: deckRepository, SubCard: cardRepository, Progress: progressRepository } as any)[entity.name]);
});

describe('MasterCardService.getOne', () => {
  it('returns only the deck (no cards) and counts a view', async () => {
    const deck = { id: 1, uuid: 'deck-1', title: 'Test', views: 5, userId: 1 };
    deckRepository.findOneBy.mockResolvedValue(deck);

    const result = await service.getOne('deck-1', userUuid);

    expect(deckRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'deck-1', userId: 1 });
    expect(deckRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'views', 1);
    expect(result.views).toBe(6);
  });

  it('gives 404 for a deck owned by someone else', async () => {
    deckRepository.findOneBy.mockResolvedValue(null);
    await expect(service.getOne('someone-elses-deck', userUuid)).rejects.toMatchObject({ status: 404 });
  });

  it('gives 404 for an unknown user', async () => {
    userRepository.findOne.mockResolvedValue(null);
    await expect(service.getOne('deck-1', 'gone')).rejects.toThrow('User not found');
  });
});

describe('MasterCardService.getAllForUser', () => {
  it('pages in SQL and counts cards without loading them', async () => {
    const decks = [{ id: 1, uuid: 'deck-1', title: 'One', subCardCount: 3 }];
    const query = makeQueryBuilder({ getManyAndCount: [decks, 7] });
    deckRepository.createQueryBuilder.mockReturnValue(query);

    const result = await service.getAllForUser(userUuid, { page: 2, pageSize: 3 });

    expect(query.loadRelationCountAndMap).toHaveBeenCalledWith('deck.subCardCount', 'deck.subCards');
    expect(query.where).toHaveBeenCalledWith('deck.userId = :userId', { userId: 1 });
    expect(query.skip).toHaveBeenCalledWith(6);
    expect(query.take).toHaveBeenCalledWith(3);
    expect(query.leftJoinAndSelect).not.toHaveBeenCalled();
    expect(result).toEqual({ items: decks, total: 7 });
  });

  it('escapes LIKE wildcards in the search', async () => {
    const query = makeQueryBuilder({ getManyAndCount: [[], 0] });
    deckRepository.createQueryBuilder.mockReturnValue(query);

    await service.getAllForUser(userUuid, { search: '100%_AWS' });

    expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining('LIKE'), { search: '%100\\%\\_aws%' });
  });

  it('returns everything when no page is given', async () => {
    const query = makeQueryBuilder({ getManyAndCount: [[], 0] });
    deckRepository.createQueryBuilder.mockReturnValue(query);
    await service.getAllForUser(userUuid);
    expect(query.skip).not.toHaveBeenCalled();
  });
});

describe('MasterCardService.create', () => {
  it('creates the deck and its cards in one transaction and returns only the new deck', async () => {
    deckRepository.findOneBy.mockResolvedValue(null);

    const result = await service.create(userUuid, '  New  ', [
      { title: 'Q1', description: 'A1', link: 'https://example.com' },
      { title: 'Q2', description: 'A2' },
    ]);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(deckRepository.create).toHaveBeenCalledWith({ title: 'New', userId: 1 });
    expect(cardRepository.save).toHaveBeenCalledWith(
      [
        { title: 'Q1', descriptions: 'A1', link: 'https://example.com', markedForReview: false, wrongAnswers: [], masterCardId: 10 },
        { title: 'Q2', descriptions: 'A2', link: '', markedForReview: false, wrongAnswers: [], masterCardId: 10 },
      ],
      expect.objectContaining({ chunk: expect.any(Number) }),
    );
    expect(result).toMatchObject({ uuid: 'deck-new', title: 'New', subCardCount: 2 });
  });

  it('rejects a duplicate deck title', async () => {
    deckRepository.findOneBy.mockResolvedValue({ id: 1, title: 'Existing' });
    await expect(service.create(userUuid, 'Existing', [])).rejects.toThrow('You already have a deck called "Existing"');
  });

  it('rejects duplicate questions', async () => {
    deckRepository.findOneBy.mockResolvedValue(null);
    await expect(service.create(userUuid, 'Deck', [
      { title: 'Same', description: 'A1' },
      { title: 'Same', description: 'A2' },
    ])).rejects.toThrow('Duplicate questions');
  });
});

describe('MasterCardService.update', () => {
  it('renames the deck and its public copy', async () => {
    const deck = { id: 1, uuid: 'deck-1', title: 'Old', userId: 1, isDefault: false };
    deckRepository.findOneBy.mockResolvedValueOnce(deck).mockResolvedValueOnce(null);

    await service.update('deck-1', userUuid, 'Updated');

    expect(publicDeckRepository.update).toHaveBeenCalledWith({ author: userUuid, title: 'Old' }, { title: 'Updated' });
    expect(deckRepository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated' }));
  });

  it('rejects an invalid date instead of crashing in the database', async () => {
    deckRepository.findOneBy.mockResolvedValue({ id: 1, title: 'Same', userId: 1, isDefault: false });
    await expect(service.update('deck-1', userUuid, 'Same', 'not-a-date')).rejects.toThrow('Invalid date');
  });

  it('refuses to edit the tutorial deck', async () => {
    deckRepository.findOneBy.mockResolvedValue({ id: 1, title: 'Tutorial', userId: 1, isDefault: true });
    await expect(service.update('deck-1', userUuid, 'New')).rejects.toThrow('Cannot edit the default tutorial card');
  });
});

describe('MasterCardService.delete', () => {
  it('removes the deck and its public copy', async () => {
    const deck = { id: 1, uuid: 'deck-1', title: 'ToDelete', userId: 1, isDefault: false };
    deckRepository.findOneBy.mockResolvedValue(deck);

    await service.delete('deck-1', userUuid);

    expect(publicDeckRepository.delete).toHaveBeenCalledWith({ author: userUuid, title: 'ToDelete' });
    expect(deckRepository.remove).toHaveBeenCalledWith(deck);
  });

  it('refuses to delete the tutorial deck', async () => {
    deckRepository.findOneBy.mockResolvedValue({ id: 1, userId: 1, isDefault: true });
    await expect(service.delete('deck-1', userUuid)).rejects.toThrow('Cannot delete the default tutorial card');
  });
});

describe('MasterCardService.recordTime', () => {
  const deck = { id: 5, uuid: 'deck-1', userId: 1 };

  it('builds the last 8 days when there is no progress yet', async () => {
    deckRepository.findOneBy.mockResolvedValue(deck);
    progressRepository.find
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ time: 30, dayCreated: new Date() }]);

    const result = await service.recordTime('deck-1', userUuid, 30);

    const saved = progressRepository.save.mock.calls[0][0];
    expect(saved).toHaveLength(8);
    expect(saved[saved.length - 1].time).toBe(30);
    expect(progressRepository.delete).toHaveBeenCalledWith({ masterCardId: 5 });
    expect(result).toEqual({ uuid: 'deck-1', timespent: 30 });
  });

  it('adds to today when today already has an entry', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deckRepository.findOneBy.mockResolvedValue(deck);
    progressRepository.find
      .mockResolvedValueOnce([{ id: 77, time: 10, dayCreated: today }])
      .mockResolvedValueOnce([{ time: 25, dayCreated: today }]);

    const result = await service.recordTime('deck-1', userUuid, 15);

    expect(progressRepository.increment).toHaveBeenCalledWith({ id: 77 }, 'time', 15);
    expect(progressRepository.save).not.toHaveBeenCalled();
    expect(result.timespent).toBe(25);
  });

  it('caps one session at the maximum session length', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deckRepository.findOneBy.mockResolvedValue(deck);
    progressRepository.find
      .mockResolvedValueOnce([{ id: 77, time: 0, dayCreated: today }])
      .mockResolvedValueOnce([]);

    await service.recordTime('deck-1', userUuid, MAX_STUDY_SESSION_MS * 10);

    expect(progressRepository.increment).toHaveBeenCalledWith({ id: 77 }, 'time', MAX_STUDY_SESSION_MS);
  });
});

describe('MasterCardService.getAllByViews', () => {
  it('selects only the columns the Home page shows', async () => {
    deckRepository.find.mockResolvedValue([{ uuid: 'deck-1', title: 'One', views: 3, createdAt: new Date() }]);

    const result = await service.getAllByViews(userUuid);

    expect(deckRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      select: ['uuid', 'title', 'views', 'createdAt'],
      order: { views: 'DESC' },
    }));
    expect(result[0]).toMatchObject({ maxTime: 3, referenceID: 'deck-1', title: 'One' });
  });

  it('returns an empty list for an unknown user', async () => {
    userRepository.findOne.mockResolvedValue(null);
    expect(await service.getAllByViews('gone')).toEqual([]);
  });
});
