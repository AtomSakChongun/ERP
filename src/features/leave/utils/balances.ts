import type { LeaveBalance, LeaveRequest } from "@/features/leave/types";

/** Annual allowance per leave type, in days. Unpaid leave has no allowance. */
export const ALLOWANCE: Record<string, number> = { "Annual Leave": 18, "Sick Leave": 10, "Personal Leave": 3 };

const TONE: Record<string, LeaveBalance["tone"]> = { "Annual Leave": "green", "Sick Leave": "purple", "Personal Leave": "sand" };

/** "3 days" → 3 */
export const daysOf = (r: LeaveRequest) => parseFloat(r.days) || 0;

const sumDays = (requests: LeaveRequest[], type: string, status: LeaveRequest["status"]) =>
  requests.filter((r) => r.type === type && r.status === status).reduce((sum, r) => sum + daysOf(r), 0);

/** Days left of `type` once approved and pending requests are taken into account. */
export const availableDays = (requests: LeaveRequest[], type: string) =>
  ALLOWANCE[type] === undefined ? null : ALLOWANCE[type] - sumDays(requests, type, "Approved") - sumDays(requests, type, "Submitted");

/** Balance cards, computed from the requests so they change as requests are added or cancelled. */
export function computeBalances(requests: LeaveRequest[]): LeaveBalance[] {
  const pending = requests.filter((r) => r.status === "Submitted").reduce((sum, r) => sum + daysOf(r), 0);
  return [
    ...Object.entries(ALLOWANCE).map(([type, allowance]) => ({
      label: type.replace(" Leave", " leave"),
      value: String(allowance - sumDays(requests, type, "Approved")),
      note: `of ${allowance} days`,
      tone: TONE[type],
    })),
    { label: "Awaiting approval", value: String(pending), note: "days requested", tone: "amber" as const },
  ];
}
