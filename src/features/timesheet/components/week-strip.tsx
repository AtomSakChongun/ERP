import { Icon } from "@/components/ui/icon";
import { formatDayOfMonth, formatHours, formatLong, formatWeekday } from "@/features/timesheet/utils/time";

export type StripDay = {
  date: string;
  minutes: number;
  holiday?: string;
  /** Outside the time sheet period (no data). */
  outside?: boolean;
};

type Props = {
  days: StripDay[];
  selected: string | null;
  onSelect: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const describe = (d: StripDay) =>
  `${formatLong(d.date)}, ${d.holiday ? `holiday: ${d.holiday}` : d.minutes ? `${formatHours(d.minutes)} logged` : "nothing logged"}`;

export function WeekStrip({ days, selected, onSelect, onPrev, onNext }: Props) {
  return (
    <div className="week-strip">
      <button className="week-arrow" onClick={onPrev} disabled={!onPrev} aria-label="Previous week"><Icon name="arrow-left" size={20} /></button>
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onSelect(d.date)}
          title={d.holiday}
          aria-pressed={selected === d.date}
          aria-label={describe(d)}
          className={`day-cell ${selected === d.date ? "active" : ""} ${!d.minutes ? "muted" : ""} ${d.outside ? "outside" : ""}`}
        >
          <span aria-hidden="true">{formatWeekday(d.date)}</span>
          <strong aria-hidden="true">{formatDayOfMonth(d.date)}</strong>
          {d.holiday ? (
            <small className="holiday" aria-hidden="true"><span className="label-long">Holiday</span><span className="label-short">Hol</span></small>
          ) : (
            <small aria-hidden="true">{d.minutes ? formatHours(d.minutes) : "—"}</small>
          )}
        </button>
      ))}
      <button className="week-arrow" onClick={onNext} disabled={!onNext} aria-label="Next week"><Icon name="arrow" size={20} /></button>
    </div>
  );
}
