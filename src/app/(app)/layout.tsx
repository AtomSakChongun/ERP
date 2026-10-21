import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { paths } from "@/config/paths";
import { getMyTeam } from "@/features/employees/api/get-employees";
import { getPendingApprovals } from "@/features/team/api/get-approvals";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [approvals, team] = await Promise.all([getPendingApprovals(), getMyTeam()]);
  const mine = approvals.filter((a) => team.some((e) => e.name === a.person));
  // Sidebar badges per role, keyed by route: the request ids still waiting (decided ones drop out client-side).
  // Team Leads review their direct reports; HR / Admin sees every request.
  return (
    <DashboardLayout
      badges={{
        "Team Lead": { [paths.team.href]: mine.map((a) => a.id) },
        "HR / Admin": { [paths.team.href]: approvals.map((a) => a.id) },
      }}
    >
      {children}
    </DashboardLayout>
  );
}
