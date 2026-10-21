import type { IconName } from "@/components/ui/icon";
import type { Role } from "@/types/api";

export type AppPath = {
  href: string;
  label: string;
  icon: IconName;
  roles: readonly Role[];
  /** Hidden from the sidebar but still a routable page. */
  hidden?: boolean;
};

const ALL_ROLES: readonly Role[] = ["Employee", "Team Lead", "HR / Admin", "Management"];

export const paths = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: "grid", roles: ALL_ROLES },
  timesheet: { href: "/timesheet", label: "Time Sheet", icon: "clock", roles: ["Employee", "Team Lead", "HR / Admin"] },
  overtime: { href: "/overtime", label: "OT Requests", icon: "bolt", roles: ["Employee", "Team Lead", "HR / Admin"] },
  leave: { href: "/leave", label: "Leave Management", icon: "calendar", roles: ["Employee", "Team Lead", "HR / Admin"] },
  team: { href: "/team", label: "My Team", icon: "users", roles: ["Team Lead", "HR / Admin"] },
  employees: { href: "/employees", label: "Employees", icon: "employee", roles: ["HR / Admin", "Management"] },
  reports: { href: "/reports", label: "Reports", icon: "report", roles: ["Team Lead", "HR / Admin", "Management"] },
  settings: { href: "/settings", label: "Settings", icon: "settings", roles: ["HR / Admin"] },
  login: { href: "/login", label: "Sign in", icon: "logout", roles: ALL_ROLES, hidden: true },
  history: { href: "/history", label: "History", icon: "history", roles: ALL_ROLES, hidden: true },
} as const satisfies Record<string, AppPath>;

export const navItems: AppPath[] = Object.values(paths).filter((p: AppPath) => !p.hidden);
