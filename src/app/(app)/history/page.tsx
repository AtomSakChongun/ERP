import type { Metadata } from "next";

import { paths } from "@/config/paths";
import { getHistory } from "@/features/history/api/get-history";
import { HistoryView } from "@/features/history/components/history-view";
import { getPendingApprovals } from "@/features/team/api/get-approvals";
import { Authorization } from "@/lib/authorization";

export const metadata: Metadata = { title: paths.history.label };

export default async function HistoryPage() {
  const [records, approvals] = await Promise.all([getHistory(), getPendingApprovals()]);
  // Decisions made this session are applied client-side, keyed by the approval's History record.
  const approvalLinks = approvals.flatMap((a) => (a.historyId ? [{ id: a.id, historyId: a.historyId }] : []));
  return (
    <Authorization allowedRoles={paths.history.roles}>
      <HistoryView records={records} approvalLinks={approvalLinks} />
    </Authorization>
  );
}
