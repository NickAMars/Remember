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
  };
});

import { pickChoices, shuffle } from '../services/FolderService';

describe('shuffle', () => {
  it('keeps every item and does not change the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
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
    for (let i = 0; i < 20; i++) {
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
});
