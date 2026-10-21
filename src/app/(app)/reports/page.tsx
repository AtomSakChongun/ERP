import type { Metadata } from "next";

import { getMonthToDate } from "@/app/(app)/month-to-date";
import { paths } from "@/config/paths";
import { getLeaveRequests } from "@/features/leave/api/get-leave";
import { ReportsView } from "@/features/reports/components/reports-view";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.reports.label };

export default async function ReportsPage() {
  const [{ employees, summaryRows, metrics, capacity }, requests] = await Promise.all([getMonthToDate(), getLeaveRequests()]);
  const leaveByType = ["Annual Leave", "Sick Leave", "Personal Leave"].map((type) => ({
    type: type.replace(" Leave", " leave"),
    days: requests.filter((r) => r.type === type && r.status === "Approved").reduce((sum, r) => sum + (parseFloat(r.days) || 0), 0),
  }));
  return (
    <Authorization allowedRoles={paths.reports.roles}>
      <ReportsView leaveByType={leaveByType} metrics={metrics} hoursByTeam={capacity} employees={employees} summaryRows={summaryRows} />
    </Authorization>
  );
}
