import type { IconName } from "@/components/ui/icon";

export type ReportMetric = { label: string; value: string; note: string; tone: "green" | "blue" | "purple" | "amber"; icon: IconName };
export type TeamHours = { team: string; regular: number; overtime: number };
export type EmployeeSummaryRow = { name: string; regular: number; overtime: number; leaveDays: number; completion: number };

/** Month-to-date figures per employee (May 1–16). The signed-in user's row is replaced with real time sheet data by the page. */
export async function getEmployeeSummaryRows(): Promise<EmployeeSummaryRow[]> {
  return [
    { name: "Alex Morgan", regular: 0, overtime: 0, leaveDays: 0, completion: 0 },
    { name: "Marcus Lee", regular: 80, overtime: 6, leaveDays: 0, completion: 100 },
    { name: "Elena Cruz", regular: 64, overtime: 0, leaveDays: 2, completion: 90 },
    { name: "Daniel Park", regular: 78, overtime: 2.5, leaveDays: 0, completion: 80 },
    { name: "Sofia Reyes", regular: 80, overtime: 1.5, leaveDays: 0, completion: 100 },
    { name: "Noah Williams", regular: 72, overtime: 0, leaveDays: 1, completion: 90 },
  ];
}

/** Headline figures, computed from the same rows the summary table shows. */
export async function getReportMetrics(rows: EmployeeSummaryRow[]): Promise<ReportMetric[]> {
  const count = rows.length || 1;
  const fullyComplete = rows.filter((r) => r.completion >= 100).length;
  const totalOt = rows.reduce((sum, r) => sum + r.overtime, 0);
  const leave = rows.reduce((sum, r) => sum + r.leaveDays, 0);
  const avgHours = rows.reduce((sum, r) => sum + r.regular + r.overtime, 0) / count;
  const avgCompletion = Math.round(rows.reduce((sum, r) => sum + r.completion, 0) / count);
  return [
    { label: "Time Sheet completion", value: `${avgCompletion}%`, note: `${fullyComplete} of ${rows.length} fully complete`, tone: "green", icon: "report" },
    { label: "Total OT hours", value: `${+totalOt.toFixed(1)}h`, note: "Month to date", tone: "green", icon: "bolt" },
    { label: "Leave used", value: `${leave} ${leave === 1 ? "day" : "days"}`, note: "Month to date", tone: "purple", icon: "calendar" },
    { label: "Avg. hours per person", value: `${+avgHours.toFixed(1)}h`, note: "Month to date", tone: "green", icon: "clock" },
  ];
}

/** Share of each team's capacity (members × workdays × 8h) used by regular and overtime hours. */
export function capacityByTeam(rows: { team: string; regular: number; overtime: number }[], workdays: number): TeamHours[] {
  const teams = [...new Set(rows.map((r) => r.team))].sort();
  return teams.map((team) => {
    const members = rows.filter((r) => r.team === team);
    const capacity = members.length * workdays * 8 || 1;
    const sum = (key: "regular" | "overtime") => members.reduce((s, r) => s + r[key], 0);
    return { team, regular: Math.round((sum("regular") / capacity) * 100), overtime: Math.round((sum("overtime") / capacity) * 100) };
  });
}
