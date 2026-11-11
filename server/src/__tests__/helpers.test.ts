jest.mock('../constants', () => ({
  BCRYPT_SALT_ROUNDS: 12,
  MAX_PROGRESS_DAYS: 8,
  TOP_FIVE_LIMIT: 5,
  MILLISECONDS_PER_DAY: 86_400_000,
}));

import { currentDate, previousEight, mixdate, calculateTimeSpent } from '../services/helpers';

describe('currentDate', () => {
  it('returns date with zeroed time', () => {
    const input = new Date(2024, 5, 15, 14, 30, 45, 123);
    const result = currentDate(input);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });
});

describe('previousEight', () => {
  it('returns array of 8 timestamps', () => {
    const result = previousEight();

    expect(result).toHaveLength(8);
    // Each entry should be a number (timestamp)
    result.forEach(ts => expect(typeof ts).toBe('number'));
    // Should be in ascending order
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });
});

describe('mixdate', () => {
  it('merges default and existing progress arrays', () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const DAY = 86_400_000;

    const defaultArr = Array.from({ length: 8 }, (_, i) =>
      Number(now) - (8 - i) * DAY,
    );

    const mongoArr = [
      { time: 10, dayCreated: new Date(defaultArr[2] + 100) },
      { time: 20, dayCreated: new Date(defaultArr[5] + 100) },
    ];

    const result = mixdate(defaultArr, mongoArr);

    // mixdate returns up to MAX_PROGRESS_DAYS - 1 entries (7)
    expect(result.length).toBeLessThanOrEqual(7);
    // The entries with time > 0 should be present
    const withTime = result.filter(e => e.time > 0);
    expect(withTime.length).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateTimeSpent', () => {
  it('sums all time values', () => {
    const entries = [
      { time: 10, dayCreated: new Date() },
      { time: 20, dayCreated: new Date() },
      { time: 30, dayCreated: new Date() },
    ];

    expect(calculateTimeSpent(entries)).toBe(60);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTimeSpent([])).toBe(0);
  });
});
