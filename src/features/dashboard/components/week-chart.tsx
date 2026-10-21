import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { paths } from "@/config/paths";
import type { WeekDay } from "@/types/api";

const MAX_HOURS = 12;
const TARGET_HOURS = 8;
const pct = (hours: number) => `${(Math.min(hours, MAX_HOURS) / MAX_HOURS) * 100}%`;

export function WeekChart({ range, days }: { range: string; days: WeekDay[] }) {
  return (
    <section className="panel week-panel">
      <div className="panel-head">
        <div><h2>This week</h2><p>{range}</p></div>
        <Link className="text-btn" href={paths.timesheet.href}>View time sheet <Icon name="arrow" size={16} /></Link>
      </div>
      <div className="chart-area">
        <div className="chart-y" aria-hidden="true"><span>12h</span><span>9h</span><span>6h</span><span>3h</span><span>0h</span></div>
        <div className="bars">
          {days.map((d) => {
            const regular = Math.min(d.hours, TARGET_HOURS);
            const overtime = Math.max(0, d.hours - TARGET_HOURS);
            return (
              <div className="bar-col" key={d.day} role="img" aria-label={`${d.day} ${d.date}: ${+d.hours.toFixed(2)} hours`}>
                <div className="bar-track">
                  {d.hours > 0 && <span className="bar-value" style={{ bottom: pct(d.hours) }}>{+d.hours.toFixed(2)}h</span>}
                  {overtime > 0 && <div className="bar-ot" style={{ height: pct(overtime) }} />}
                  {regular > 0 && <div className="bar-regular" style={{ height: pct(regular) }} />}
                </div>
                <span>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chart-legend">
        <span><i className="legend-green" />Regular hours</span>
        <span><i className="legend-light" />Overtime (over 8h)</span>
      </div>
    </section>
  );
}
