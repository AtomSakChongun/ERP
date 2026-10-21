import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getLeavePolicies } from "@/features/settings/api/get-leave-policies";
import { SettingsView } from "@/features/settings/components/settings-view";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.settings.label };

export default async function SettingsPage() {
  const policies = await getLeavePolicies();
  return (
    <Authorization allowedRoles={paths.settings.roles}>
      <SettingsView policies={policies} />
    </Authorization>
  );
}
