import type { IconName } from "@/components/ui/icon";
import type { ApprovalRequest, Role, Status } from "@/types/api";
import { formatDuration } from "@/lib/format";

export type SummaryCard = {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  tone: "green" | "blue" | "amber" | "purple" | "neutral" | "red";
  progress?: number;
  /** Roles the card is relevant to. */
  roles: readonly Role[];
  /** Cards the view recomputes live (the approval count changes as leads decide). */
  live?: "pending";
};

export type Activity = {
  title: string;
  detail: string;
  status: Status;
  time: string;
  kind: "submitted" | "approved";
};

/** What the dashboard needs to know about the current week, from the time sheet. */
export type DashboardWeek = { range: string; workedMin: number; targetMin: number; overtimeMin: number; status: Status };

/** Icon tile tone for a status, matching the status chip colours. */
const STATUS_TONE: Record<Status, SummaryCard["tone"]> = { Draft: "neutral", Submitted: "blue", Approved: "green", Rejected: "red", Pending: "amber" };

const LOGGERS: Role[] = ["Employee", "Team Lead", "HR / Admin"];
const APPROVERS: Role[] = ["Team Lead", "HR / Admin"];


export async function getSummaryCards({
  week,
  approvals,
  leave,
}: {
  week: DashboardWeek;
  approvals: ApprovalRequest[];
  leave: { remaining: string; pending: string };
}): Promise<SummaryCard[]> {
  const count = (type: ApprovalRequest["type"]) => approvals.filter((a) => a.type === type).length;
  return [
    {
      label: "Working hours",
      value: formatDuration(week.workedMin),
      note: `of ${week.targetMin / 60}h this week`,
      icon: "clock",
      tone: "green",
      progress: Math.min(100, Math.round((week.workedMin / week.targetMin) * 100)),
      roles: LOGGERS,
    },
    { label: "Overtime hours", value: formatDuration(week.overtimeMin), note: `Week of ${week.range}`, icon: "bolt", tone: "green", roles: LOGGERS },
    { label: "Leave balance", value: `${leave.remaining} days`, note: `${leave.pending} days pending approval`, icon: "calendar", tone: "green", roles: LOGGERS },
    { label: "Pending approvals", value: String(approvals.length), note: `${count("OT Request")} OT · ${count("Time Sheet")} Time Sheets · ${count("Leave Request")} Leave`, icon: "users", tone: "amber", roles: APPROVERS, live: "pending" },
    { label: "Time Sheet status", value: week.status, note: `Week of ${week.range}`, icon: "file", tone: STATUS_TONE[week.status], roles: LOGGERS },
  ];
}

export async function getRecentActivity(week: DashboardWeek): Promise<Activity[]> {
  return [
    {
      title: week.status === "Draft" ? "Time Sheet in progress" : `Time Sheet ${week.status.toLowerCase()}`,
      detail: `${week.range} · ${formatDuration(week.workedMin)} logged`,
      status: week.status,
      time: "This week",
      kind: "submitted",
    },
    { title: "OT Request approved", detail: "May 9 · Mobile Revamp · 2h 00m", status: "Approved", time: "May 10, 10:20 AM", kind: "approved" },
  ];
}
