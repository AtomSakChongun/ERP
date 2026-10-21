import { Icon, type IconName } from "@/components/ui/icon";
import { formatDuration, formatMonth } from "@/features/timesheet/utils/time";

export type MonthStats = {
  month: string;
  totalMin: number;
  targetMin: number;
  overtimeMin: number;
  leaveDays: number;
  weeks: number;
  approvedWeeks: number;
};

export function MonthSummary({ stats }: { stats: MonthStats }) {
  const pct = stats.targetMin ? Math.round((stats.totalMin / stats.targetMin) * 100) : 0;
  const cards: { label: string; value: string; note: string; icon: IconName }[] = [
    { label: "Hours this month", value: formatDuration(stats.totalMin), note: `${pct}% of ${formatDuration(stats.targetMin)} target to date`, icon: "clock" },
    { label: "Overtime", value: formatDuration(stats.overtimeMin), note: "Over 8h/day, weekends & holidays", icon: "bolt" },
    { label: "Leave taken", value: `${stats.leaveDays} ${stats.leaveDays === 1 ? "day" : "days"}`, note: formatMonth(stats.month), icon: "calendar" },
    { label: "Weeks approved", value: `${stats.approvedWeeks} / ${stats.weeks}`, note: "Weekly time sheets", icon: "check" },
  ];
  return (
    <div className="employee-summary month-summary">
      {cards.map((c) => (
        <div key={c.label}>
          <span><Icon name={c.icon} /></span>
          <p>{c.label}<strong>{c.value}</strong></p>
          <small>{c.note}</small>
        </div>
      ))}
    </div>
  );
}
