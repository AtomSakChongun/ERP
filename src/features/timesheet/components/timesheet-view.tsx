"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/modal";
import { useNotifications } from "@/components/ui/notifications";
import { PageHeader, StatusBadge } from "@/components/ui/primitives";
import { IncompleteReport } from "@/features/timesheet/components/incomplete-report";
import { SubmitWeekModal } from "@/features/timesheet/components/submit-week-modal";
import { TimeEntriesTable } from "@/features/timesheet/components/time-entries-table";
import { TimeEntryModal } from "@/features/timesheet/components/time-entry-modal";
import { MonthSummary, type MonthStats } from "@/features/timesheet/components/month-summary";
import { WeekStrip, type StripDay } from "@/features/timesheet/components/week-strip";
import { nextSlot, recentPicks, type EntryDraft } from "@/features/timesheet/utils/entry";
import { buildMonthReport, DAILY_TARGET_MIN } from "@/features/timesheet/utils/report";
import {
  addDays,
  firstWeekOfMonth,
  formatDuration,
  formatLong,
  formatMonth,
  formatRange,
  formatShort,
  isWeekend,
  lastWeekOfMonth,
  monthOf,
  monthOfWeek,
  monthsBetween,
  startOfWeek,
  weekDates,
  workedMinutes,
} from "@/features/timesheet/utils/time";
import type { Project, Status, TimeEntry, TimesheetPeriod } from "@/types/api";

const LOCKED: Status[] = ["Submitted", "Approved"];

type Props = {
  entries: TimeEntry[];
  projects: Project[];
  period: TimesheetPeriod;
  /** Who approves this user's time sheets. */
  approver: string;
};

export function TimesheetView({ entries: initialEntries, projects, period, approver }: Props) {
  const { notify } = useNotifications();
  const [entries, setEntries] = useState(initialEntries);
  const [statuses, setStatuses] = useState(period.weekStatus);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(period.today));
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"entries" | "report">("entries");
  /** Values the entry modal opens with (an `id` means edit); null = closed. */
  const [form, setForm] = useState<(Partial<TimeEntry> & { date: string }) | null>(null);
  const [deleting, setDeleting] = useState<TimeEntry | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const firstWeek = firstWeekOfMonth(monthOf(period.start));
  const lastWeek = lastWeekOfMonth(period.end);
  const months = monthsBetween(period.start, period.end);
  const month = monthOfWeek(weekStart);
  const holidays = new Map(period.holidays.map((h) => [h.date, h.name]));
  const inPeriod = (date: string) => date >= period.start && date <= period.end;
  const statusOf = (date: string): Status => statuses[startOfWeek(date)] ?? "Draft";
  const isLocked = (date: string) => LOCKED.includes(statusOf(date));

  const dates = weekDates(weekStart);
  const weekEntries = entries
    .filter((e) => dates.includes(e.date))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const visible = selected ? weekEntries.filter((e) => e.date === selected) : weekEntries;

  const minutesOn = (date: string) =>
    weekEntries.filter((e) => e.date === date).reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0);
  const days: StripDay[] = dates.map((date) => ({
    date,
    minutes: minutesOn(date),
    holiday: holidays.get(date),
    outside: !inPeriod(date),
  }));

  const totalMin = weekEntries.reduce((sum, e) => sum + workedMinutes(e.start, e.end), 0);
  const targetMin = dates.filter((d) => inPeriod(d) && !isWeekend(d) && !holidays.has(d)).length * DAILY_TARGET_MIN;
  const status = statusOf(weekStart);
  const locked = isLocked(weekStart);

  // Overtime = hours over 8h on a workday, plus anything on weekends and holidays (same rule everywhere).
  const weekOtMin = dates.reduce((sum, d) => {
    const m = minutesOn(d);
    return sum + (isWeekend(d) || holidays.has(d) ? m : Math.max(0, m - DAILY_TARGET_MIN));
  }, 0);
  const ot = weekOtMin ? ` · ${formatDuration(weekOtMin)} OT` : "";
  const balance =
    totalMin < targetMin
      ? { text: `${formatDuration(targetMin - totalMin)} remaining${ot}`, tone: "short" }
      : { text: `Target reached${ot}`, tone: "met" };

  const goToWeek = (start: string) => {
    setWeekStart(start);
    setSelected(null);
  };

  const selectMonth = (m: string) =>
    goToWeek(m === monthOf(period.today) ? startOfWeek(period.today) : firstWeekOfMonth(m));

  const monthStats = ((): MonthStats => {
    const isWorkday = (d: string) => !isWeekend(d) && !holidays.has(d);
    const perDay = new Map<string, number>();
    const leaveDates = new Set<string>();
    for (const e of entries) {
      if (monthOf(e.date) !== month) continue;
      perDay.set(e.date, (perDay.get(e.date) ?? 0) + workedMinutes(e.start, e.end));
      if (e.tag === "Leave") leaveDates.add(e.date);
    }
    let workdays = 0;
    // Target to date, so mid-month progress isn't measured against the whole month.
    for (let d = `${month}-01`; monthOf(d) === month && d <= period.today; d = addDays(d, 1)) if (isWorkday(d)) workdays++;
    const weeks: string[] = [];
    for (let w = firstWeekOfMonth(month); monthOfWeek(w) === month; w = addDays(w, 7)) weeks.push(w);
    return {
      month,
      totalMin: [...perDay.values()].reduce((a, b) => a + b, 0),
      targetMin: workdays * DAILY_TARGET_MIN,
      overtimeMin: [...perDay].reduce((sum, [d, min]) => sum + (isWorkday(d) ? Math.max(0, min - DAILY_TARGET_MIN) : min), 0),
      leaveDays: leaveDates.size,
      weeks: weeks.length,
      approvedWeeks: weeks.filter((w) => statuses[w] === "Approved").length,
    };
  })();

  const defaultDate = selected ?? (dates.includes(period.today) ? period.today : dates.find((d) => inPeriod(d) && !isWeekend(d)) ?? weekStart);
  const report = buildMonthReport(month, entries, period, statuses);
  // No logging ahead of today: time is recorded after it is worked.
  const canAdd = inPeriod(defaultDate) && defaultDate <= period.today && !isLocked(defaultDate);

  // A week can be submitted once its last workday has arrived; short days are listed for review.
  const workdays = dates.filter((d) => inPeriod(d) && !isWeekend(d) && !holidays.has(d));
  const lastWorkday = workdays[workdays.length - 1];
  const submittable = Boolean(lastWorkday) && lastWorkday <= period.today;
  const shortDays = workdays
    .filter((d) => d <= period.today && minutesOn(d) < DAILY_TARGET_MIN)
    .map((date) => ({ date, minutes: minutesOn(date) }));

  const submitWeek = () => {
    setStatuses((s) => ({ ...s, [weekStart]: "Submitted" }));
    setReviewing(false);
    notify(`Time sheet ${formatRange(dates[0], dates[6])} submitted to ${approver}`);
  };
  const recallWeek = () => {
    setStatuses((s) => ({ ...s, [weekStart]: "Draft" }));
    notify(`Time sheet ${formatRange(dates[0], dates[6])} recalled — you can edit it again`);
  };

  const openDay = (date: string) => {
    setTab("entries");
    setWeekStart(startOfWeek(date));
    setSelected(date);
  };

  const openAdd = (date: string) => setForm({ date, ...nextSlot(entries, date) });

  // "N" opens a new entry from anywhere on the page, unless the user is typing or a dialog is open.
  const dialogOpen = Boolean(form || deleting || reviewing);
  useEffect(() => {
    if (!canAdd || dialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (target.closest("input, select, textarea, [contenteditable]")) return;
      e.preventDefault();
      setForm({ date: defaultDate, ...nextSlot(entries, defaultDate) });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [canAdd, dialogOpen, defaultDate, entries]);

  const addEntry = (entry: EntryDraft) =>
    setEntries((prev) => [...prev, { ...entry, id: `${entry.date}-${entry.start}-${Date.now()}` }]);

  const saveForm = (entry: EntryDraft, addAnother: boolean) => {
    const id = form?.id;
    if (id) {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...entry, id } : e)));
      notify("Time entry updated");
    } else {
      addEntry(entry);
      notify(addAnother ? "Entry added — ready for the next one" : "Time entry added successfully");
    }
    goToWeek(startOfWeek(entry.date));
    if (!addAnother) setForm(null);
  };

  return (
    <>
      <PageHeader
        title="Time Sheet"
        subtitle="Track your working hours and submit your weekly time sheet."
        action={
          <div className="header-actions">
            <label className="month-select">
              <Icon name="calendar" size={18} />
              <select value={month} onChange={(e) => selectMonth(e.target.value)} aria-label="Select month">
                {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
              </select>
            </label>
            {tab === "entries" && (
              <button
                className="secondary-btn"
                onClick={() => goToWeek(startOfWeek(period.today))}
                disabled={weekStart === startOfWeek(period.today)}
                title={`Showing ${formatRange(dates[0], dates[6])}`}
              >
                <Icon name="calendar" size={17} />This week
              </button>
            )}
            <button
              className="primary-btn"
              onClick={() => openAdd(defaultDate)}
              disabled={!canAdd}
              aria-keyshortcuts="N"
              title={canAdd ? "Add time entry (N)" : "This week is locked"}
            >
              <Icon name="plus" size={18} />Add time entry
            </button>
          </div>
        }
      />

      <div className="tab-bar page-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "entries"} className={tab === "entries" ? "active" : ""} onClick={() => setTab("entries")}>
          <Icon name="clock" size={16} />Time entries
        </button>
        <button role="tab" aria-selected={tab === "report"} className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>
          <Icon name="warning" size={16} />Incomplete report
          {report.unfilled.length > 0 && <span className="tab-alert">{report.unfilled.length}</span>}
        </button>
      </div>

      {tab === "report" ? (
        <IncompleteReport report={report} isLocked={isLocked} onOpenDay={openDay} onFillIn={openAdd} />
      ) : (
        <>
          <MonthSummary stats={monthStats} />

          <WeekStrip
            days={days}
            selected={selected}
            onSelect={(date) => setSelected((cur) => (cur === date ? null : date))}
            onPrev={weekStart > firstWeek ? () => goToWeek(addDays(weekStart, -7)) : undefined}
            onNext={weekStart < lastWeek ? () => goToWeek(addDays(weekStart, 7)) : undefined}
          />

          <section className="panel timesheet-panel">
            <div className="panel-head bordered">
              <div>
                <h2 className="flex items-center gap-2">Time entries <StatusBadge status={status} /></h2>
                <p>
                  {visible.length} {visible.length === 1 ? "entry" : "entries"} ·{" "}
                  {selected ? (
                    <>
                      {formatLong(selected)}{" "}
                      <button className="text-btn" onClick={() => setSelected(null)}>Show whole week</button>
                    </>
                  ) : (
                    `${formatLong(dates[0])} – ${formatLong(dates[6])}`
                  )}
                </p>
              </div>
              <div className="week-total">
                <span>Weekly total</span>
                <strong>{formatDuration(totalMin)}</strong>
                <small className={`balance-${balance.tone}`}>{balance.text}</small>
              </div>
            </div>

            <TimeEntriesTable
              entries={visible}
              locked={locked}
              onEdit={setForm}
              onReuse={(e) => setForm({ ...e, id: undefined, date: defaultDate, ...nextSlot(entries, defaultDate) })}
              onDelete={setDeleting}
            />

            <div className="table-footer">
              <div className="save-state">
                <span className={`saved-dot ${locked ? "locked" : ""}`} />
                {locked ? `Time sheet ${status.toLowerCase()} — editing is locked` : "All changes saved"}
              </div>
              <div>
                {status === "Submitted" ? (
                  <button className="secondary-btn" onClick={recallWeek}>
                    <Icon name="history" size={18} />Recall submission
                  </button>
                ) : status !== "Approved" ? (
                  <>
                    {!submittable && lastWorkday && <span className="submit-hint">You can submit from {formatShort(lastWorkday)}</span>}
                    <button className="secondary-btn" disabled={!submittable || weekEntries.length === 0} onClick={() => setReviewing(true)}>
                      <Icon name="check" size={18} />Review &amp; submit
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}

      {reviewing && (
        <SubmitWeekModal
          range={formatRange(dates[0], dates[6])}
          totalMin={totalMin}
          targetMin={targetMin}
          shortDays={shortDays}
          dailyTargetMin={DAILY_TARGET_MIN}
          approver={approver}
          onFillIn={(date) => {
            setReviewing(false);
            setSelected(date);
          }}
          onClose={() => setReviewing(false)}
          onSubmit={submitWeek}
        />
      )}

      {form && (
        <TimeEntryModal
          projects={projects}
          initial={form}
          entries={entries}
          picks={recentPicks(entries)}
          minDate={period.start}
          maxDate={period.today < period.end ? period.today : period.end}
          today={period.today}
          isLocked={isLocked}
          holidays={holidays}
          onClose={() => setForm(null)}
          onSave={saveForm}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete time entry?"
          text={`${deleting.project} · ${deleting.task} on ${formatLong(deleting.date)} will be removed.`}
          confirmLabel="Delete entry"
          cancelLabel="Keep entry"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setEntries((prev) => prev.filter((e) => e.id !== deleting.id));
            setDeleting(null);
            notify("Time entry deleted");
          }}
        />
      )}
    </>
  );
}
