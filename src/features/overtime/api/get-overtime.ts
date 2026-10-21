import type { Status } from "@/types/api";

export type RecentOtRequest = { label: string; project: string; status: Status };

export async function getRecentOtRequests(): Promise<RecentOtRequest[]> {
  return [
    { label: "May 9 · 2h", project: "Mobile Revamp", status: "Approved" },
    { label: "Apr 25 · 3h", project: "Atlas ERP", status: "Approved" },
  ];
}

export async function getApprover() {
  return { name: "Jordan Kim", initials: "JK", title: "Engineering Manager" };
}
