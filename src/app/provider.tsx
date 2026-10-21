"use client";

import type { ReactNode } from "react";

import { NotificationsProvider } from "@/components/ui/notifications";
import { RoleProvider } from "@/lib/authorization";
import { DecisionsProvider } from "@/lib/decisions";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <DecisionsProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </DecisionsProvider>
    </RoleProvider>
  );
}
