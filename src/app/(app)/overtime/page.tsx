import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getApprover, getRecentOtRequests } from "@/features/overtime/api/get-overtime";
import { OtRequestView } from "@/features/overtime/components/ot-request-view";
import { getProjects, getTimesheetPeriod } from "@/features/timesheet/api/get-timesheet";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.overtime.label };

export default async function OvertimePage() {
  const [approver, recent, projects, period] = await Promise.all([
    getApprover(),
    getRecentOtRequests(),
    getProjects(),
    getTimesheetPeriod(),
  ]);
  return (
    <Authorization allowedRoles={paths.overtime.roles}>
      <OtRequestView approver={approver} recent={recent} projects={projects.map((p) => p.name)} today={period.today} />
    </Authorization>
  );
}
