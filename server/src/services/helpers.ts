import { MILLISECONDS_PER_DAY, MAX_PROGRESS_DAYS } from '../constants';

/** Midnight (local time) of the given date. */
export function currentDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Timestamps for midnight of each of the previous MAX_PROGRESS_DAYS days, oldest first. */
export function previousEight(): number[] {
  const today = currentDate(new Date());
  const previousDays: number[] = [];
  for (let daysAgo = MAX_PROGRESS_DAYS; daysAgo > 0; daysAgo--) {
    previousDays.push(Number(today) - daysAgo * MILLISECONDS_PER_DAY);
  }
  return previousDays;
}

export interface ProgressEntry {
  time: number;
  dayCreated: Date | number;
}

/**
 * Line up saved progress entries with the list of previous days.
 * Each day slot gets the saved entry that falls inside it, or a zero-time entry.
 * Returns MAX_PROGRESS_DAYS - 1 entries; today's entry is added by the caller.
 *
 * @param dayStarts   midnight timestamps, oldest first (from `previousEight`)
 * @param savedEntries the deck's saved progress, sorted by day
 */
export function mixdate(dayStarts: number[], savedEntries: ProgressEntry[]): ProgressEntry[] {
  const oldestDay = dayStarts[0];
  const recentEntries = savedEntries.filter((entry) => Number(entry.dayCreated) >= oldestDay);

  const merged: ProgressEntry[] = [];
  let entryIndex = 0;
  for (let slotIndex = 0; slotIndex < MAX_PROGRESS_DAYS - 1; slotIndex++) {
    const entry = recentEntries[entryIndex];
    const slotStart = dayStarts[slotIndex];
    const slotEnd = dayStarts[slotIndex + 1];
    if (entry && Number(entry.dayCreated) >= slotStart && Number(entry.dayCreated) <= slotEnd) {
      merged.push(entry);
      entryIndex++;
    } else {
      merged.push({ dayCreated: slotStart, time: 0 });
    }
  }
  return merged;
}

export function calculateTimeSpent(entries: ProgressEntry[]): number {
  return entries.reduce((total, entry) => total + entry.time, 0);
}

/** A deck in the Home page's "most viewed" list and chart. */
export interface TopFiveEntry {
  /** The deck's view count (the name is kept for the client). */
  maxTime: number;
  /** The deck's uuid. */
  referenceID: string;
  title: string;
  timestamp: Date;
}
