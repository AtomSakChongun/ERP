// Date/time helpers for ISO date strings ("2025-05-12") and "HH:mm" times.
// Everything is computed in UTC so server and client render identical text.

const DAY_MS = 86_400_000;
const BREAK_AFTER_MIN = 6 * 60;
const BREAK_MIN = 60;

export const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, days: number) => toISO(new Date(toDate(iso).getTime() + days * DAY_MS));

/** Monday of the week containing `iso`. */
export const startOfWeek = (iso: string) => addDays(iso, -((toDate(iso).getUTCDay() + 6) % 7));
export const weekDates = (weekStart: string) => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
export const isWeekend = (iso: string) => [0, 6].includes(toDate(iso).getUTCDay());

const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
  toDate(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });

/** "Mon, May 12" */
export const formatShort = (iso: string) => format(iso, { weekday: "short", month: "short", day: "numeric" });
/** "Jan 1, 2025" */
export const formatDate = (iso: string) => format(iso, { month: "short", day: "numeric", year: "numeric" });
/** "Monday, May 12" */
export const formatLong = (iso: string) => format(iso, { weekday: "long", month: "long", day: "numeric" });
/** "Mon" */
export const formatWeekday = (iso: string) => format(iso, { weekday: "short" });
/** "12" */
export const formatDayOfMonth = (iso: string) => String(toDate(iso).getUTCDate());

/** "May 12 – 18" or "Apr 28 – May 4" */
export function formatRange(start: string, end: string) {
  const sameMonth = toDate(start).getUTCMonth() === toDate(end).getUTCMonth();
  return `${format(start, { month: "short", day: "numeric" })} – ${sameMonth ? formatDayOfMonth(end) : format(end, { month: "short", day: "numeric" })}`;
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 545 → "09:05" */
export const fromMinutes = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const spanMinutes = (start: string, end: string) => Math.max(0, toMinutes(end) - toMinutes(start));
export const hasBreak = (start: string, end: string) => spanMinutes(start, end) > BREAK_AFTER_MIN;

/** Worked minutes, with a 1h break deducted from spans longer than 6h. */
export const workedMinutes = (start: string, end: string) => spanMinutes(start, end) - (hasBreak(start, end) ? BREAK_MIN : 0);

export { formatDuration } from "@/lib/format";
/** "8.5h" */
export const formatHours = (minutes: number) => `${+(minutes / 60).toFixed(2)}h`;

// --- Months ("2025-05") ------------------------------------------------------
// A week belongs to the month that contains its Thursday (ISO-8601 rule).

export const monthOf = (iso: string) => iso.slice(0, 7);
export const monthOfWeek = (weekStart: string) => monthOf(addDays(weekStart, 3));

/** Monday of the first week that belongs to `month`. */
export function firstWeekOfMonth(month: string) {
  const monday = startOfWeek(`${month}-01`);
  return monthOfWeek(monday) === month ? monday : addDays(monday, 7);
}

/** Monday of the last week that belongs to the month of `iso`. */
export function lastWeekOfMonth(iso: string) {
  const monday = startOfWeek(iso);
  return monthOfWeek(monday) === monthOf(iso) ? monday : addDays(monday, -7);
}

/** Every month from `start` to `end` (inclusive), e.g. ["2025-01", …, "2025-06"]. */
export function monthsBetween(start: string, end: string) {
  const months: string[] = [];
  const d = toDate(`${monthOf(start)}-01`);
  while (toISO(d).slice(0, 7) <= monthOf(end)) {
    months.push(toISO(d).slice(0, 7));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return months;
}

/** "May 2025" */
export const formatMonth = (month: string) => format(`${month}-01`, { month: "long", year: "numeric" });
