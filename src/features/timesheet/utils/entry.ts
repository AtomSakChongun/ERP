// Helpers for the time entry modal: smart defaults (next free slot, recent
// project/task pairs) and validation.

import { formatDate, fromMinutes, spanMinutes, toMinutes, workedMinutes } from "@/features/timesheet/utils/time";
import type { EntryTag, TimeEntry } from "@/types/api";

export type EntryDraft = Omit<TimeEntry, "id">;
/** A recently used project/task pair, offered as a one-click shortcut. */
export type RecentPick = { project: string; task: string; tag: EntryTag };

export type EntryErrors = Partial<Record<"date" | "time" | "project" | "task" | "details", string>>;

const DAY_START = "09:00";
const DAY_END = "18:00";
const LAST_MINUTE = 23 * 60 + 59;
/** More than this on one day is almost certainly a typo. */
const MAX_DAY_MIN = 16 * 60;

/** Start/end for the next entry: right after `lastEnd` until end of day, or a full working day. */
export function slotAfter(lastEnd?: string) {
  if (!lastEnd) return { start: DAY_START, end: DAY_END };
  const end = Math.min(Math.max(toMinutes(lastEnd) + 60, toMinutes(DAY_END)), LAST_MINUTE);
  return { start: lastEnd, end: fromMinutes(end) };
}

/** The next free slot on `date`, after the latest entry of that day. */
export const nextSlot = (entries: TimeEntry[], date: string) =>
  slotAfter(entries.filter((e) => e.date === date).map((e) => e.end).sort().pop());

type Rules = {
  minDate: string;
  maxDate: string;
  isLocked: (date: string) => boolean;
  isLeave?: boolean;
  /** Existing entries, checked for overlaps and the daily maximum. */
  entries?: TimeEntry[];
  /** The entry being edited, so it doesn't clash with itself. */
  ignoreId?: string;
};

export function validateEntry(
  draft: Pick<EntryDraft, "date" | "start" | "end" | "project" | "task" | "details">,
  { minDate, maxDate, isLocked, isLeave = false, entries = [], ignoreId }: Rules,
): EntryErrors {
  const errors: EntryErrors = {};
  if (!draft.date || draft.date < minDate || draft.date > maxDate) errors.date = `Choose a date between ${formatDate(minDate)} and ${formatDate(maxDate)}.`;
  else if (isLocked(draft.date)) errors.date = "That week has already been submitted and is locked.";
  const sameDay = entries.filter((e) => e.date === draft.date && e.id !== ignoreId);
  const clash = sameDay.find((e) => draft.start < e.end && draft.end > e.start);
  const dayTotal = sameDay.reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0) + workedMinutes(draft.start, draft.end);
  if (spanMinutes(draft.start, draft.end) <= 0) errors.time = "End time must be after start time.";
  else if (clash) errors.time = `Overlaps ${clash.project} · ${clash.task} (${clash.start}–${clash.end}).`;
  else if (dayTotal > MAX_DAY_MIN) errors.time = `That makes ${dayTotal / 60}h on one day. Check the start and end times.`;
  if (!isLeave && !draft.project) errors.project = "Select a project.";
  if (!isLeave && !draft.task) errors.task = "Select a task.";
  if (!isLeave && !draft.details.trim()) errors.details = "Please add a short description of the work completed.";
  return errors;
}

export const hasErrors = (errors: EntryErrors) => Object.values(errors).some(Boolean);

/** Up to `limit` distinct project/task pairs, most recent first. Leave is excluded. */
export function recentPicks(entries: TimeEntry[], limit = 3): RecentPick[] {
  const seen = new Set<string>();
  const picks: RecentPick[] = [];
  for (const e of [...entries].sort((a, b) => (b.date + b.end).localeCompare(a.date + a.end))) {
    const key = `${e.project}|${e.task}`;
    if (e.tag === "Leave" || seen.has(key)) continue;
    seen.add(key);
    picks.push({ project: e.project, task: e.task, tag: e.tag });
    if (picks.length === limit) break;
  }
  return picks;
}
