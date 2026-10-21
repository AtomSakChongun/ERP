import { DAILY_TARGET_MIN } from "@/features/timesheet/utils/report";
import { addDays, formatDayOfMonth, formatRange, formatWeekday, isWeekend, monthOf, startOfWeek, weekDates, workedMinutes } from "@/features/timesheet/utils/time";
import { projects, timeEntries, timesheetPeriod } from "@/testing/mocks/db";
import type { Project, Status, TimeEntry, TimesheetPeriod, WeekDay } from "@/types/api";

export async function getTimeEntries(): Promise<TimeEntry[]> {
  return [...timeEntries];
}

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getTimesheetPeriod(): Promise<TimesheetPeriod> {
  return timesheetPeriod;
}

/** Hours per day for one week (defaults to the current week). Used by the dashboard chart. */
export async function getWeekDays(weekStart = startOfWeek(timesheetPeriod.today)): Promise<WeekDay[]> {
  return weekDates(weekStart).map((date) => ({
    day: formatWeekday(date),
    date: formatDayOfMonth(date),
    hours:
      timeEntries
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0) / 60,
  }));
}

export type WeekSummary = {
  /** "May 12 – 18" */
  range: string;
  workedMin: number;
  targetMin: number;
  /** Minutes above the daily target on workdays, plus anything on weekends and holidays. */
  overtimeMin: number;
  status: Status;
};

/** Totals for one week (defaults to the current week), from the same entries the Time Sheet shows. */
export async function getWeekSummary(weekStart = startOfWeek(timesheetPeriod.today)): Promise<WeekSummary> {
  const holidays = new Set(timesheetPeriod.holidays.map((h) => h.date));
  const dates = weekDates(weekStart);
  let workedMin = 0;
  let overtimeMin = 0;
  let workdays = 0;
  for (const date of dates) {
    const minutes = timeEntries.filter((e) => e.date === date).reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0);
    const workday = !isWeekend(date) && !holidays.has(date);
    if (workday) workdays++;
    workedMin += minutes;
    overtimeMin += workday ? Math.max(0, minutes - DAILY_TARGET_MIN) : minutes;
  }
  return {
    range: formatRange(dates[0], dates[6]),
    workedMin,
    targetMin: workdays * DAILY_TARGET_MIN,
    overtimeMin,
    status: timesheetPeriod.weekStatus[weekStart] ?? "Draft",
  };
}

export type MonthSummary = { regularMin: number; overtimeMin: number; leaveDays: number; completion: number; workdays: number };

/**
 * Totals for `month` ("2025-05") up to today: regular and overtime minutes, leave days, and
 * completion = share of elapsed workdays that reached the daily target.
 */
export async function getMonthSummary(month = monthOf(timesheetPeriod.today)): Promise<MonthSummary> {
  const holidays = new Set(timesheetPeriod.holidays.map((h) => h.date));
  let regularMin = 0;
  let overtimeMin = 0;
  let leaveDays = 0;
  let workdays = 0;
  let complete = 0;
  for (let date = `${month}-01`; monthOf(date) === month && date <= timesheetPeriod.today; date = addDays(date, 1)) {
    const day = timeEntries.filter((e) => e.date === date);
    const minutes = day.reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0);
    const workday = !isWeekend(date) && !holidays.has(date);
    if (day.some((e) => e.tag === "Leave")) leaveDays++;
    if (workday) {
      // Today counts only once it's complete, matching the Incomplete report.
      if (date < timesheetPeriod.today || minutes >= DAILY_TARGET_MIN) {
        workdays++;
        if (minutes >= DAILY_TARGET_MIN) complete++;
      }
      regularMin += Math.min(minutes, DAILY_TARGET_MIN);
      overtimeMin += Math.max(0, minutes - DAILY_TARGET_MIN);
    } else {
      overtimeMin += minutes;
    }
  }
  return { regularMin, overtimeMin, leaveDays, completion: workdays ? Math.round((complete / workdays) * 100) : 0, workdays };
}
