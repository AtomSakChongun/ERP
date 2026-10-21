import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getMyTeam } from "@/features/employees/api/get-employees";
import { getLeaveRequests } from "@/features/leave/api/get-leave";
import { LeaveView } from "@/features/leave/components/leave-view";
import { getTimesheetPeriod } from "@/features/timesheet/api/get-timesheet";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.leave.label };

export default async function LeavePage() {
  const [requests, teammates, period] = await Promise.all([
    getLeaveRequests(),
    getMyTeam(),
    getTimesheetPeriod(),
  ]);
  // Holidays live with the time sheet data; the app layer hands the next few to the leave feature.
  const upcoming = period.holidays.filter((h) => h.date >= period.today).slice(0, 3);
  return (
    <Authorization allowedRoles={paths.leave.roles}>
      <LeaveView requests={requests} teammates={teammates} holidays={upcoming} allHolidays={period.holidays} today={period.today} />
    </Authorization>
  );
}
