"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/primitives";
import { downloadCsv } from "@/lib/csv";
import { DAILY_TARGET_MIN, reportToCsv, type DayReport, type DayState, type MonthReport } from "@/features/timesheet/utils/report";
import {
  addDays,
  formatDayOfMonth,
  formatDuration,
  formatHours,
  formatMonth,
  formatShort,
  startOfWeek,
  weekDates,
} from "@/features/timesheet/utils/time";

/** `state` is the class list for the swatch (a day state, plus a modifier). */
const LEGEND: { state: string; label: string }[] = [
  { state: "unfilled", label: "Unfilled (< 8h)" },
  { state: "unapproved", label: "Waiting for approval" },
  { state: "unapproved not-submitted", label: "Not submitted yet" },
  { state: "complete", label: "Complete" },
  { state: "off", label: "Weekend / holiday" },
  { state: "upcoming", label: "Upcoming" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  report: MonthReport;
  isLocked: (date: string) => boolean;
  onOpenDay: (date: string) => void;
  onFillIn: (date: string) => void;
};

export function IncompleteReport({ report, isLocked, onOpenDay, onFillIn }: Props) {
  const filledPct = report.evaluatedDays
    ? Math.round(((report.evaluatedDays - report.unfilled.length) / report.evaluatedDays) * 100)
    : 100;

  const cards: { label: string; value: string; note: string; icon: IconName; tone: string }[] = [
    { label: "Unfilled timesheet", value: `${report.unfilled.length} ${report.unfilled.length === 1 ? "day" : "days"}`, note: "Workdays with less than 8h", icon: "warning", tone: "red" },
    { label: "Missing hours", value: formatDuration(report.missingMin), note: "Still to be logged", icon: "clock", tone: "red" },
    { label: "Unapproved", value: `${report.unapproved.length} ${report.unapproved.length === 1 ? "day" : "days"}`, note: "Filled, week not approved yet", icon: "file", tone: "amber" },
    { label: "Filled rate", value: `${filledPct}%`, note: `${report.evaluatedDays - report.unfilled.length} of ${report.evaluatedDays} workdays to date`, icon: "check", tone: "green" },
  ];

  const attention = [...report.unfilled, ...report.unapproved].sort((a, b) => a.date.localeCompare(b.date));

  const exportCsv = () => downloadCsv(`incomplete-timesheet-${report.month}.csv`, reportToCsv(report));

  // Calendar grid: full weeks covering the month.
  const byDate = new Map(report.days.map((d) => [d.date, d]));
  const first = startOfWeek(report.days[0].date);
  const last = startOfWeek(report.days[report.days.length - 1].date);
  const weeks: string[][] = [];
  for (let w = first; w <= last; w = addDays(w, 7)) weeks.push(weekDates(w));

  return (
    <>
      <div className="report-cards">
        {cards.map((c) => (
          <div className={`report-card tone-${c.tone}`} key={c.label}>
            <span className="report-card-icon"><Icon name={c.icon} size={22} /></span>
            <div>
              <p>{c.label}</p>
              <strong>{c.value}</strong>
              <small>{c.note}</small>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head bordered">
          <div>
            <h2>Incomplete Timesheet Report</h2>
            <p>{formatMonth(report.month)} · click a day to open it in Time entries</p>
          </div>
          <button className="secondary-btn" onClick={exportCsv} disabled={!attention.length}>
            <Icon name="download" size={17} />Export CSV
          </button>
        </div>

        <div className="cal-legend">
          {LEGEND.map((l) => (
            <span key={l.state}><i className={`cal-swatch ${l.state}`} />{l.label}</span>
          ))}
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map((d) => <div className="cal-head" key={d}>{d}</div>)}
          {weeks.flat().map((date) => {
            const day = byDate.get(date);
            if (!day) return <div className="cal-day outside" key={date} />;
            return <CalendarDay key={date} day={day} onClick={() => onOpenDay(date)} />;
          })}
        </div>
      </section>

      <section className="panel attention-panel">
        <div className="panel-head bordered">
          <div>
            <h2>Days needing attention</h2>
            <p>{attention.length ? `${attention.length} ${attention.length === 1 ? "day" : "days"} in ${formatMonth(report.month)}` : "Nothing to fix"}</p>
          </div>
        </div>
        {attention.length ? (
          <div className="table-wrap">
            <table className="fit-mobile">
              <thead>
                <tr><th>Date</th><th className="col-optional">Issue</th><th className="col-optional">Logged</th><th>Missing</th><th className="col-optional">Week status</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {attention.map((d) => (
                  <tr key={d.date}>
                    <td><strong>{formatShort(d.date)}</strong><small>{d.date}</small></td>
                    <td className="col-optional"><span className={`issue-pill ${d.state}`}>{d.state === "unfilled" ? "Unfilled" : "Unapproved"}</span></td>
                    <td className="col-optional">
                      <strong>{formatDuration(d.minutes)}</strong>
                      <span className={`mini-progress ${d.minutes >= DAILY_TARGET_MIN ? "full" : ""}`}><b style={{ width: `${Math.min(100, (d.minutes / DAILY_TARGET_MIN) * 100)}%` }} /></span>
                    </td>
                    <td><strong className={d.missing ? "text-missing" : ""}>{d.missing ? formatDuration(d.missing) : "—"}</strong></td>
                    <td className="col-optional"><StatusBadge status={d.weekStatus} /></td>
                    <td className="text-right">
                      {d.state === "unfilled" && !isLocked(d.date) ? (
                        <button className="review-btn" onClick={() => onFillIn(d.date)}><Icon name="plus" size={15} />Fill in</button>
                      ) : (
                        <button className="review-btn" onClick={() => onOpenDay(d.date)}>View <Icon name="arrow" size={15} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="title-icon"><Icon name="check" /></div>
            <h3>All caught up</h3>
            <p>Every workday so far has 8 hours logged and is approved.</p>
          </div>
        )}
      </section>
    </>
  );
}

const STATE_LABEL: Record<DayState, string> = {
  unfilled: "unfilled",
  unapproved: "waiting for approval",
  complete: "complete",
  off: "day off",
  upcoming: "upcoming",
  outside: "outside the period",
};

function CalendarDay({ day, onClick }: { day: DayReport; onClick: () => void }) {
  const label =
    day.holiday ??
    (day.state === "unfilled" ? `−${formatDuration(day.missing)}` : day.state === "unapproved" ? day.weekStatus : day.state === "upcoming" ? "Upcoming" : "");
  return (
    <button
      className={`cal-day ${day.state} ${day.state === "unapproved" && day.weekStatus === "Draft" ? "not-submitted" : ""}`}
      aria-label={`${formatShort(day.date)}, ${formatDuration(day.minutes)} logged${day.holiday ? `, ${day.holiday}` : ""}, ${STATE_LABEL[day.state]}`}
      onClick={onClick} title={day.holiday ?? `${formatShort(day.date)} · ${formatDuration(day.minutes)}`}>
      <span className="cal-num">{formatDayOfMonth(day.date)}</span>
      <strong>{day.minutes ? formatHours(day.minutes) : day.state === "off" || day.state === "upcoming" ? "" : "0h"}</strong>
      <small className={day.state === "unapproved" ? `st-${day.weekStatus.toLowerCase()}` : undefined}>{label}</small>
    </button>
  );
}
