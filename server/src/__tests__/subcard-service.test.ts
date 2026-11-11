jest.mock('inversify', () => ({
  injectable: () => (target: Function) => target,
  inject: () => () => undefined,
}));
jest.mock('typeorm', () => require('./support/typeormMock'));

import { SubCardService } from '../services/SubCardService';
import { buildWith, makeDataSource, makeQueryBuilder, makeRepository } from './support/mocks';

const deckRepository = makeRepository();
const cardRepository = makeRepository();
const userRepository = makeRepository();
const dataSource = makeDataSource({ SubCard: cardRepository });

const service = buildWith(SubCardService, {
  dataSource,
  masterCards: deckRepository,
  subCards: cardRepository,
  users: userRepository,
});

const ownDeck = { id: 3, uuid: 'deck-3', userId: 1, isDefault: false };

beforeEach(() => {
  jest.clearAllMocks();
  userRepository.findOne.mockResolvedValue({ id: 1 });
  cardRepository.create.mockImplementation((data: any) => ({ ...data }));
});

describe('SubCardService.getForMasterCard', () => {
  it('checks deck ownership before listing cards', async () => {
    deckRepository.findOneBy.mockResolvedValue(null);
    await expect(service.getForMasterCard('other-deck', 'user-1')).rejects.toMatchObject({ status: 404 });
    expect(cardRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('pages in a stable order', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    const query = makeQueryBuilder({ getManyAndCount: [[{ uuid: 'c-1' }], 31] });
    cardRepository.createQueryBuilder.mockReturnValue(query);

    const result = await service.getForMasterCard('deck-3', 'user-1', { page: 3, pageSize: 10 });

    expect(query.orderBy).toHaveBeenCalledWith('card.createdAt', 'ASC');
    expect(query.addOrderBy).toHaveBeenCalledWith('card.id', 'ASC');
    expect(query.skip).toHaveBeenCalledWith(30);
    expect(result).toEqual({ items: [{ uuid: 'c-1' }], total: 31 });
  });
});

describe('SubCardService.add', () => {
  it('refuses to add to the tutorial deck', async () => {
    deckRepository.findOneBy.mockResolvedValue({ ...ownDeck, isDefault: true });
    await expect(service.add('deck-3', 'user-1', 'Q', 'A')).rejects.toThrow('tutorial');
  });

  it('refuses a duplicate question', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    cardRepository.findOneBy.mockResolvedValue({ id: 1 });
    await expect(service.add('deck-3', 'user-1', 'Q', 'A')).rejects.toThrow('already exists');
  });

  it('saves cleaned wrong answers with the card', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    cardRepository.findOneBy.mockResolvedValue(null);
    cardRepository.save.mockImplementation(async (card: any) => card);
    const saved = await service.add('deck-3', 'user-1', 'Q', 'Right', '', [' Wrong one ', 'right', 'Wrong one', 'Wrong two']);
    expect(saved.wrongAnswers).toEqual(['Wrong one', 'Wrong two']);
  });
});

describe('SubCardService.update and delete', () => {
  it("gives 404 for a card in someone else's deck", async () => {
    cardRepository.findOne.mockResolvedValue({ id: 5, masterCard: { id: 9, userId: 2 } });
    await expect(service.update('card-5', 'user-1', 'Q', 'A')).rejects.toMatchObject({ status: 404 });
    await expect(service.delete('card-5', 'user-1')).rejects.toMatchObject({ status: 404 });
    expect(cardRepository.save).not.toHaveBeenCalled();
    expect(cardRepository.remove).not.toHaveBeenCalled();
  });

  it('returns the updated card without its deck', async () => {
    cardRepository.findOne.mockResolvedValue({ id: 5, title: 'Q', masterCard: { id: 3, userId: 1, isDefault: false } });
    const updated = await service.update('card-5', 'user-1', 'Q', 'New answer', 'https://example.com/', ['Close but wrong']);
    expect(updated).toEqual({
      id: 5, title: 'Q', descriptions: 'New answer', link: 'https://example.com/', wrongAnswers: ['Close but wrong'],
    });
  });
});

describe('SubCardService.addBulk', () => {
  it('refuses the tutorial deck', async () => {
    deckRepository.findOneBy.mockResolvedValue({ ...ownDeck, isDefault: true });
    await expect(service.addBulk('deck-3', 'user-1', [{ title: 'Q', descriptions: 'A' }])).rejects.toThrow('tutorial');
  });

  it('updates existing questions and adds new ones, looking up only the uploaded questions', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    cardRepository.find.mockResolvedValue([{ id: 1, title: 'Old Q', descriptions: 'old', link: '' }]);

    const result = await service.addBulk('deck-3', 'user-1', [
      { title: 'Old Q', descriptions: 'new answer' },
      { title: 'New Q', descriptions: 'A' },
      { title: 'New Q', descriptions: 'A again' },
    ]);

    expect(cardRepository.find).toHaveBeenCalledWith({ where: { masterCardId: 3, title: ['Old Q', 'New Q'] } });
    expect(result).toEqual({ added: 1, updated: 1 });
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it('replaces wrong answers only when the upload has some', async () => {
    deckRepository.findOneBy.mockResolvedValue(ownDeck);
    const keptCard = { id: 1, title: 'Kept', descriptions: 'A', link: '', wrongAnswers: ['Saved wrong'] };
    const replacedCard = { id: 2, title: 'Replaced', descriptions: 'A', link: '', wrongAnswers: ['Old wrong'] };
    cardRepository.find.mockResolvedValue([keptCard, replacedCard]);

    await service.addBulk('deck-3', 'user-1', [
      { title: 'Kept', descriptions: 'A' },
      { title: 'Replaced', descriptions: 'A', wrongAnswers: ['New wrong'] },
    ]);

    expect(keptCard.wrongAnswers).toEqual(['Saved wrong']);
    expect(replacedCard.wrongAnswers).toEqual(['New wrong']);
  });
});

describe('SubCardService.incrementViews', () => {
  it("only counts views on the user's own cards, in one UPDATE", async () => {
    const query = makeQueryBuilder();
    cardRepository.createQueryBuilder.mockReturnValue(query);

    await service.incrementViews('card-5', 'user-1');

    expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining('user_id = :userId'), { userId: 1 });
    expect(query.execute).toHaveBeenCalledTimes(1);
  });
});
