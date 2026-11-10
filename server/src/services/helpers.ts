import { MILLISECONDS_PER_DAY, MAX_PROGRESS_DAYS, TOP_FIVE_LIMIT } from '../constants';

export function currentDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function previousEight(): number[] {
  const today = currentDate(new Date());
  const prevDays: number[] = [];
  for (let i = MAX_PROGRESS_DAYS; i > 0; i--) {
    prevDays.push(Number(today) - i * MILLISECONDS_PER_DAY);
  }
  return prevDays;
}

export interface ProgressEntry {
  time: number;
  dayCreated: Date | number;
}

export function mixdate(defaultArr: number[], mongoArr: ProgressEntry[]): ProgressEntry[] {
  const MAX_LENGTH = MAX_PROGRESS_DAYS;
  const furthestDay = defaultArr[0];

  const filtered = mongoArr.filter(entry => Number(entry.dayCreated) >= furthestDay);

  const merge: ProgressEntry[] = [];
  let i = 0;
  let j = 0;
  while (j < MAX_LENGTH - 1) {
    if (
      filtered.length > i &&
      Number(filtered[i].dayCreated) >= defaultArr[j] &&
      Number(filtered[i].dayCreated) <= defaultArr[j + 1]
    ) {
      merge.push(filtered[i]);
      i++;
    } else {
      merge.push({ dayCreated: defaultArr[j], time: 0 });
    }
    j++;
  }
  return merge;
}

export function calculateTimeSpent(entries: ProgressEntry[]): number {
  return entries.reduce((total, entry) => total + entry.time, 0);
}

export interface TopFiveEntry {
  maxTime: number;
  referenceID: string;
  title: string;
  timestamp: Date;
}

export function topFiveCards(cards: { views: number; uuid: string; title: string; createdAt: Date }[]): TopFiveEntry[] {
  const sorted = [...cards].sort((a, b) => b.views - a.views);
  return sorted.slice(0, TOP_FIVE_LIMIT).map(card => ({
    maxTime: card.views,
    referenceID: card.uuid,
    title: card.title,
    timestamp: card.createdAt,
  }));
}
