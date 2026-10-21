import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getApprover } from "@/features/overtime/api/get-overtime";
import { getProjects, getTimeEntries, getTimesheetPeriod } from "@/features/timesheet/api/get-timesheet";
import { TimesheetView } from "@/features/timesheet/components/timesheet-view";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.timesheet.label };

export default async function TimesheetPage() {
  const [entries, projects, period, approver] = await Promise.all([getTimeEntries(), getProjects(), getTimesheetPeriod(), getApprover()]);
  return (
    <Authorization allowedRoles={paths.timesheet.roles}>
      <TimesheetView entries={entries} projects={projects} period={period} approver={approver.name} />
    </Authorization>
  );
}
