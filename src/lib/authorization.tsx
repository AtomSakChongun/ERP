"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import type { Role } from "@/types/api";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children, initialRole = "Team Lead" }: { children: ReactNode; initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  return <RoleContext value={{ role, setRole }}>{children}</RoleContext>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within <RoleProvider>");
  return ctx;
}

export function canAccess(role: Role, allowedRoles: readonly Role[]) {
  return allowedRoles.includes(role);
}

export function Authorization({
  allowedRoles,
  children,
  forbiddenFallback,
}: {
  allowedRoles: readonly Role[];
  children: ReactNode;
  forbiddenFallback?: ReactNode;
}) {
  const { role } = useRole();
  if (canAccess(role, allowedRoles)) return <>{children}</>;
  return (
    forbiddenFallback ?? (
      <section className="panel forbidden">
        <div className="title-icon"><Icon name="warning" /></div>
        <h2>You don’t have access to this page</h2>
        <p>Switch to a role with access ({allowedRoles.join(", ")}) to view it.</p>
      </section>
    )
  );
}
