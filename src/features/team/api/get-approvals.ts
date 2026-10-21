import { approvals } from "@/testing/mocks/db";
import type { ApprovalRequest } from "@/types/api";

/** Requests submitted and waiting for a lead's decision. */
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  return approvals.filter((a) => a.status === "Submitted");
}
