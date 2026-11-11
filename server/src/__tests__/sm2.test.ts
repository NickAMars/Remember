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

import { sm2, type SM2Input } from '../services/ReviewService';

const defaults: SM2Input = { easeFactor: 2.5, interval: 0, repetitions: 0 };

describe('sm2', () => {
  it('wrong answer resets repetitions and sets interval to 1', () => {
    const result = sm2({ easeFactor: 2.5, interval: 15, repetitions: 5 }, 0);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.5);
  });

  it('first correct (quality 3) sets interval to 1', () => {
    const result = sm2(defaults, 3);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.5);
  });

  it('second correct (quality 3) sets interval to 6', () => {
    const result = sm2({ easeFactor: 2.5, interval: 1, repetitions: 1 }, 3);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.easeFactor).toBe(2.5);
  });

  it('third correct (quality 3) grows interval by ease factor', () => {
    const result = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2 }, 3);
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(15); // round(6 * 2.5) = 15
    expect(result.easeFactor).toBe(2.5);
  });

  it('quality 4 (easy) increases ease factor', () => {
    const result = sm2(defaults, 4);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.6);
  });

  it('ease factor never drops below 1.3', () => {
    // Start with low ease factor
    const result = sm2({ easeFactor: 1.3, interval: 10, repetitions: 3 }, 0);
    expect(result.easeFactor).toBe(1.3);
  });

  it('after wrong, next correct restarts from rep 1', () => {
    // Wrong answer
    const afterWrong = sm2({ easeFactor: 2.5, interval: 15, repetitions: 5 }, 0);
    expect(afterWrong.repetitions).toBe(0);
    expect(afterWrong.interval).toBe(1);

    // Next correct
    const afterCorrect = sm2(afterWrong, 3);
    expect(afterCorrect.repetitions).toBe(1);
    expect(afterCorrect.interval).toBe(1);
  });

  it('repeated easy answers compound the interval', () => {
    let state: SM2Input = defaults;
    // 5 consecutive easy answers
    for (let i = 0; i < 5; i++) {
      state = sm2(state, 4);
    }
    expect(state.repetitions).toBe(5);
    expect(state.interval).toBeGreaterThan(30);
    expect(state.easeFactor).toBeCloseTo(3.0);
  });
});
