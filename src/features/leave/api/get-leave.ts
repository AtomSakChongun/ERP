import type { LeaveBalance, LeaveRequest } from "@/features/leave/types";
import { computeBalances } from "@/features/leave/utils/balances";
import { leaveHistory } from "@/testing/mocks/db";

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  return [...leaveHistory];
}

export async function getLeaveBalances(): Promise<LeaveBalance[]> {
  return computeBalances([...leaveHistory]);
}
