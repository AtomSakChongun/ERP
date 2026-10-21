import { getCurrentUser, getEmployees } from "@/features/employees/api/get-employees";
import { capacityByTeam, getEmployeeSummaryRows, getReportMetrics } from "@/features/reports/api/get-reports";
import { getMonthSummary } from "@/features/timesheet/api/get-timesheet";

/**
 * Month-to-date workforce figures, composed once so Reports and the Management
 * dashboard always show the same numbers. The signed-in user's row comes from
 * their real time entries; the other rows are mock data.
 */
export async function getMonthToDate() {
  const [employees, me, rows, mine] = await Promise.all([getEmployees(), getCurrentUser(), getEmployeeSummaryRows(), getMonthSummary()]);
  const summaryRows = rows.map((r) =>
    r.name === me.name
      ? { ...r, regular: mine.regularMin / 60, overtime: mine.overtimeMin / 60, leaveDays: mine.leaveDays, completion: mine.completion }
      : r,
  );
  const withTeam = summaryRows.map((r) => ({ ...r, team: employees.find((e) => e.name === r.name)?.department ?? "Other" }));
  return {
    employees,
    summaryRows,
    metrics: await getReportMetrics(summaryRows),
    capacity: capacityByTeam(withTeam, mine.workdays),
  };
}
