import type { Metadata } from "next";

import { getMonthToDate } from "@/app/(app)/month-to-date";
import { paths } from "@/config/paths";
import { getRecentActivity, getSummaryCards } from "@/features/dashboard/api/get-dashboard";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getEmployees, getMyTeam } from "@/features/employees/api/get-employees";
import { getLeaveBalances } from "@/features/leave/api/get-leave";
import { getPendingApprovals } from "@/features/team/api/get-approvals";
import { getWeekDays, getWeekSummary } from "@/features/timesheet/api/get-timesheet";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.dashboard.label };

// The app layer composes data from several features; features never import each other.
export default async function DashboardPage() {
  const [week, weekDays, allApprovals, employees, teammates, balances, { metrics, capacity }] = await Promise.all([
    getWeekSummary(),
    getWeekDays(),
    getPendingApprovals(),
    getEmployees(),
    getMyTeam(),
    getLeaveBalances(),
    getMonthToDate(),
  ]);
  const approvals = allApprovals.filter((a) => teammates.some((e) => e.name === a.person));
  const hrCards = await getSummaryCards({ week, approvals: allApprovals, leave: { remaining: "0", pending: "0" } });
  const leave = {
    remaining: balances.find((b) => b.label === "Annual leave")?.value ?? "0",
    pending: balances.find((b) => b.label === "Awaiting approval")?.value ?? "0",
  };
  const [cards, activity] = await Promise.all([getSummaryCards({ week, approvals, leave }), getRecentActivity(week)]);
  // Management doesn't log time; give them the company-wide figures from Reports instead.
  const managementCards = metrics.map((m) => ({ ...m, roles: ["Management"] as const }));

  return (
    <Authorization allowedRoles={paths.dashboard.roles}>
      <DashboardView
        cards={[...cards.map((c) => (c.live === "pending" ? { ...c, roles: ["Team Lead"] as const } : c)), ...hrCards.filter((c) => c.live === "pending").map((c) => ({ ...c, roles: ["HR / Admin"] as const })), ...managementCards]}
        activity={activity}
        week={{ range: week.range, days: weekDays }}
        approvals={approvals}
        allApprovals={allApprovals}
        teammates={teammates}
        employees={employees}
        capacity={capacity}
      />
    </Authorization>
  );
}
