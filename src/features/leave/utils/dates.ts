// ISO date helpers for leave requests, computed in UTC so server and client agree.

const DAY_MS = 86_400_000;

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const addDays = (iso: string, days: number) => new Date(toDate(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);
const isWeekend = (iso: string) => [0, 6].includes(toDate(iso).getUTCDay());
const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
  toDate(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });

/** Weekdays from `start` to `end` (inclusive) that are not public holidays. */
export function workingDays(start: string, end: string, holidays: Set<string>) {
  let count = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) if (!isWeekend(d) && !holidays.has(d)) count++;
  return count;
}

/** The first working day after `today`. */
export function nextWorkingDay(today: string, holidays: Set<string>) {
  let d = addDays(today, 1);
  while (isWeekend(d) || holidays.has(d)) d = addDays(d, 1);
  return d;
}

export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) =>
  a.start <= b.end && a.end >= b.start;

/** "Jun 9 – Jun 11, 2025" or "Apr 22, 2025" */
export function formatLeaveRange(start: string, end: string) {
  const year = fmt(end, { year: "numeric" });
  if (start === end) return `${fmt(start, { month: "short", day: "numeric" })}, ${year}`;
  return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}, ${year}`;
}

export const formatDays = (days: number) => `${days} ${days === 1 ? "day" : "days"}`;
