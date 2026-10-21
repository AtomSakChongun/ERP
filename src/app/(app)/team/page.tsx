import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getMyTeam } from "@/features/employees/api/get-employees";
import { getHistory } from "@/features/history/api/get-history";
import { getPendingApprovals } from "@/features/team/api/get-approvals";
import { TeamView } from "@/features/team/components/team-view";
import { getTimesheetPeriod } from "@/features/timesheet/api/get-timesheet";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.team.label };

export default async function TeamPage() {
  const [approvals, teammates, history, period] = await Promise.all([getPendingApprovals(), getMyTeam(), getHistory(), getTimesheetPeriod()]);
  const inTeam = (name: string) => teammates.some((e) => e.name === name);
  // Past decisions on the team's requests feed the counts and the audit log.
  const decisions = history
    .filter((r) => inTeam(r.employee) && (r.status === "Approved" || r.status === "Rejected"))
    .map((r) => ({ person: r.employee, type: r.type, period: r.period, status: r.status as "Approved" | "Rejected" }));
  // ISO dates each person has an OT request for (submitted or approved), to flag unrequested overtime in reviews.
  const toIso = (label: string) => new Date(`${label} UTC`).toISOString().slice(0, 10);
  const otDates: Record<string, string[]> = {};
  for (const r of history) {
    if (r.type === "OT Request" && r.status !== "Rejected") (otDates[r.employee] ??= []).push(toIso(r.period));
  }
  return (
    <Authorization allowedRoles={paths.team.roles}>
      <TeamView teamApprovals={approvals.filter((a) => inTeam(a.person))} allApprovals={approvals} teammates={teammates} decisions={decisions} otDates={otDates} today={period.today} />
    </Authorization>
  );
}
