jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));
jest.mock('typeorm', () => require('./support/typeormMock'));

import { PoolCardService } from '../services/PoolCardService';
import { MAX_PUBLIC_DECKS_PER_USER } from '../constants';
import { buildWith, makeDataSource, makeQueryBuilder, makeRepository } from './support/mocks';

const publicDeckRepository = makeRepository();
const publicCardRepository = makeRepository();
const deckRepository = makeRepository();
const cardRepository = makeRepository();
const userRepository = makeRepository();
const dataSource = makeDataSource({
  PoolCard: publicDeckRepository,
  PoolSubCard: publicCardRepository,
  MasterCard: deckRepository,
  SubCard: cardRepository,
});

const service = buildWith(PoolCardService, {
  dataSource,
  poolCards: publicDeckRepository,
  poolSubCards: publicCardRepository,
  masterCards: deckRepository,
  subCards: cardRepository,
  users: userRepository,
});

const ownDeck = { id: 3, uuid: 'deck-3', title: 'AWS', userId: 1, isDefault: false, isCopied: false };

beforeEach(() => {
  jest.clearAllMocks();
  userRepository.findOne.mockResolvedValue({ id: 1 });
  publicDeckRepository.createQueryBuilder.mockReturnValue(makeQueryBuilder({ getMany: [] }));
  publicDeckRepository.findOneBy.mockResolvedValue(null);
  publicDeckRepository.countBy.mockResolvedValue(0);
  publicDeckRepository.save.mockImplementation((entity: any) => Promise.resolve({ id: 50, ...entity }));
});

describe('PoolCardService.getAll', () => {
  it('returns light summaries with a card count, not every card', async () => {
    const query = makeQueryBuilder({ getMany: [{ uuid: 'p-1', author: 'u', title: 'AWS', createdAt: new Date(0), subCardCount: 12, subCards: [] }] });
    publicDeckRepository.createQueryBuilder.mockReturnValue(query);

    const decks = await service.getAll();

    expect(query.loadRelationCountAndMap).toHaveBeenCalledWith('publicDeck.subCardCount', 'publicDeck.subCards');
    expect(decks[0]).toEqual({ uuid: 'p-1', author: 'u', title: 'AWS', createdAt: new Date(0), subCardCount: 12 });
  });
});

describe('PoolCardService.create (share a deck)', () => {
  it("refuses to share someone else's deck", async () => {
    deckRepository.findOneBy.mockResolvedValue(null);
    await expect(service.create('other-users-deck', 'user-1')).rejects.toMatchObject({ status: 404 });
    expect(deckRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'other-users-deck', userId: 1 });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('refuses a deck that is already public', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    publicDeckRepository.findOneBy.mockResolvedValue({ id: 9 });
    await expect(service.create('deck-3', 'user-1')).rejects.toThrow('already public');
  });

  it('enforces the share limit', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    publicDeckRepository.countBy.mockResolvedValue(MAX_PUBLIC_DECKS_PER_USER);
    await expect(service.create('deck-3', 'user-1')).rejects.toThrow(`at most ${MAX_PUBLIC_DECKS_PER_USER}`);
  });

  it('refuses an empty deck', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    cardRepository.find.mockResolvedValue([]);
    await expect(service.create('deck-3', 'user-1')).rejects.toThrow('without any subcards');
  });

  it('copies the cards in one transaction', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    cardRepository.find.mockResolvedValue([{ title: 'Q', descriptions: 'A', link: '' }]);

    await service.create('deck-3', 'user-1');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(publicCardRepository.save).toHaveBeenCalledWith(
      [expect.objectContaining({ title: 'Q', poolCardId: 50 })],
      expect.any(Object),
    );
  });
});

describe('PoolCardService.remove (unshare)', () => {
  it('lets the author remove their public deck', async () => {
    const publicDeck = { id: 9, uuid: 'p-9', author: 'user-1' };
    publicDeckRepository.findOneBy.mockResolvedValue(publicDeck);
    await service.remove('p-9', 'user-1');
    expect(publicDeckRepository.remove).toHaveBeenCalledWith(publicDeck);
  });

  it("stops anyone else from removing it", async () => {
    publicDeckRepository.findOneBy.mockResolvedValue({ id: 9, uuid: 'p-9', author: 'someone-else' });
    await expect(service.remove('p-9', 'user-1')).rejects.toMatchObject({ status: 404 });
    expect(publicDeckRepository.remove).not.toHaveBeenCalled();
  });
});

describe('PoolCardService.storeToMaster (copy a public deck)', () => {
  it('refuses when the user already has a deck with that title', async () => {
    publicDeckRepository.findOne.mockResolvedValue({ id: 9, title: 'AWS', subCards: [] });
    deckRepository.findOneBy.mockResolvedValue({ id: 3 });
    await expect(service.storeToMaster('p-9', 'user-1')).rejects.toThrow('You already have a deck called "AWS"');
  });

  it('returns only the copied deck with its card count', async () => {
    publicDeckRepository.findOne.mockResolvedValue({ id: 9, title: 'AWS', subCards: [{ title: 'Q', descriptions: 'A', link: '' }] });
    deckRepository.findOneBy.mockResolvedValue(null);
    deckRepository.save.mockImplementation((entity: any) => Promise.resolve({ id: 70, uuid: 'deck-70', ...entity }));

    const copy = await service.storeToMaster('p-9', 'user-1');

    expect(copy).toMatchObject({ uuid: 'deck-70', title: 'AWS', isCopied: true, subCardCount: 1 });
  });
});
