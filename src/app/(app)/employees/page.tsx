import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getCurrentUser, getEmployeeStats, getEmployees } from "@/features/employees/api/get-employees";
import { EmployeesView } from "@/features/employees/components/employees-view";
import { getLeaveBalances } from "@/features/leave/api/get-leave";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.employees.label };

export default async function EmployeesPage() {
  const [all, stats, me, balances] = await Promise.all([getEmployees(), getEmployeeStats(), getCurrentUser(), getLeaveBalances()]);
  // The signed-in user's annual leave is computed from their requests, as on the Leave page.
  const annual = balances.find((b) => b.label === "Annual leave")?.value;
  const employees = all.map((e) => (e.name === me.name && annual ? { ...e, leave: `${annual} days` } : e));
  return (
    <Authorization allowedRoles={paths.employees.roles}>
      <EmployeesView employees={employees} stats={stats} />
    </Authorization>
  );
}
