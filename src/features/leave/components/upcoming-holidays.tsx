import { Icon } from "@/components/ui/icon";
import type { Holiday } from "@/types/api";

const DAY_MS = 86_400_000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
  toDate(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });

function countdown(date: string, today: string) {
  const days = Math.round((toDate(date).getTime() - toDate(today).getTime()) / DAY_MS);
  return days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days} days`;
}

export function UpcomingHolidays({ holidays, today }: { holidays: Holiday[]; today: string }) {
  const [next, ...later] = holidays;
  return (
    <section className="panel holiday-card">
      <div className="holiday-head">
        <p className="eyebrow">Upcoming holidays</p>
        <span className="holiday-head-icon"><Icon name="calendar" size={16} /></span>
      </div>

      {!next ? (
        <p className="holiday-empty">No upcoming public holidays.</p>
      ) : (
        <>
          <div className="holiday-next">
            <div className="holiday-date large">
              <small>{fmt(next.date, { month: "short" })}</small>
              <strong>{fmt(next.date, { day: "numeric" })}</strong>
            </div>
            <div className="holiday-info">
              <strong>{next.name}</strong>
              <span>{fmt(next.date, { weekday: "long", month: "long", day: "numeric" })}</span>
              <em>{countdown(next.date, today)}</em>
            </div>
          </div>
          {later.map((h) => (
            <div className="holiday-row" key={h.date}>
              <div className="holiday-date">
                <small>{fmt(h.date, { month: "short" })}</small>
                <strong>{fmt(h.date, { day: "numeric" })}</strong>
              </div>
              <div className="holiday-info">
                <strong>{h.name}</strong>
                <span>{fmt(h.date, { weekday: "short" })} · {countdown(h.date, today)}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
