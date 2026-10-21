import { employees } from "@/testing/mocks/db";
import type { Employee } from "@/types/api";

export async function getEmployees(): Promise<Employee[]> {
  return employees;
}

/** The signed-in user (mock: the first employee). */
export async function getCurrentUser(): Promise<Employee> {
  return employees[0];
}

/** "My team": the signed-in user's direct reports. */
export async function getMyTeam(): Promise<Employee[]> {
  const me = employees[0];
  return employees.filter((e) => e.lead === me.name);
}

export async function getEmployeeStats() {
  const total = employees.length;
  const share = (n: number) => `${Math.round((n / total) * 100)}% of workforce`;
  const active = employees.filter((e) => e.status === "Active").length;
  const onLeave = employees.filter((e) => e.availability === "On leave").length;
  const probation = employees.filter((e) => e.status === "Probation").length;
  const departments = new Set(employees.map((e) => e.department)).size;
  return [
    { label: "Total employees", value: String(total), note: `Across ${departments} departments`, icon: "users" },
    { label: "Active", value: String(active), note: share(active), icon: "employee" },
    { label: "On leave today", value: String(onLeave), note: share(onLeave), icon: "calendar" },
    { label: "On probation", value: String(probation), note: share(probation), icon: "clock" },
  ] as const;
}
