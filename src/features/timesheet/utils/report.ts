import {
  addDays,
  formatDuration,
  formatShort,
  isWeekend,
  monthOf,
  startOfWeek,
  workedMinutes,
} from "@/features/timesheet/utils/time";
import type { Status, TimeEntry, TimesheetPeriod } from "@/types/api";
import { toCsv } from "@/lib/csv";

export const DAILY_TARGET_MIN = 8 * 60;

/**
 * - unfilled:   a past workday with less than 8h logged
 * - unapproved: a past workday with 8h+ logged, but its week isn't approved yet
 * - complete:   8h+ logged and the week is approved
 * - off:        weekend or public holiday
 * - upcoming:   after "today", not evaluated yet
 * - outside:    outside the time sheet period
 */
export type DayState = "unfilled" | "unapproved" | "complete" | "off" | "upcoming" | "outside";

export type DayReport = {
  date: string;
  minutes: number;
  missing: number;
  state: DayState;
  weekStatus: Status;
  holiday?: string;
};

export type MonthReport = {
  month: string;
  days: DayReport[];
  unfilled: DayReport[];
  unapproved: DayReport[];
  missingMin: number;
  evaluatedDays: number;
  completeDays: number;
};

export function buildMonthReport(
  month: string,
  entries: TimeEntry[],
  period: TimesheetPeriod,
  statuses: Record<string, Status>,
): MonthReport {
  const holidays = new Map(period.holidays.map((h) => [h.date, h.name]));
  const perDay = new Map<string, number>();
  for (const e of entries) {
    if (monthOf(e.date) === month) perDay.set(e.date, (perDay.get(e.date) ?? 0) + workedMinutes(e.start, e.end));
  }

  const days: DayReport[] = [];
  for (let date = `${month}-01`; monthOf(date) === month; date = addDays(date, 1)) {
    const minutes = perDay.get(date) ?? 0;
    const weekStatus = statuses[startOfWeek(date)] ?? "Draft";
    const holiday = holidays.get(date);
    let state: DayState;
    if (date < period.start || date > period.end) state = "outside";
    else if (isWeekend(date) || holiday) state = "off";
    // Today still counts as upcoming until its hours are complete.
    else if (date > period.today || (date === period.today && minutes < DAILY_TARGET_MIN)) state = "upcoming";
    else if (minutes < DAILY_TARGET_MIN) state = "unfilled";
    else if (weekStatus !== "Approved") state = "unapproved";
    else state = "complete";
    days.push({ date, minutes, missing: state === "unfilled" ? DAILY_TARGET_MIN - minutes : 0, state, weekStatus, holiday });
  }

  const unfilled = days.filter((d) => d.state === "unfilled");
  const unapproved = days.filter((d) => d.state === "unapproved");
  return {
    month,
    days,
    unfilled,
    unapproved,
    missingMin: unfilled.reduce((sum, d) => sum + d.missing, 0),
    evaluatedDays: days.filter((d) => ["unfilled", "unapproved", "complete"].includes(d.state)).length,
    completeDays: days.filter((d) => d.state === "complete").length,
  };
}

/** CSV of the days that need attention, for the Export button. */
export function reportToCsv(report: MonthReport) {
  const rows: string[][] = [["Date", "Issue", "Logged", "Missing", "Week status"]];
  for (const d of [...report.unfilled, ...report.unapproved].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([
      `${d.date} (${formatShort(d.date)})`,
      d.state === "unfilled" ? "Unfilled" : "Unapproved",
      formatDuration(d.minutes),
      formatDuration(d.missing),
      d.weekStatus,
    ]);
  }
  return toCsv(rows);
}
