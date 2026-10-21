import type { Status } from "@/types/api";

export type LeaveRequest = {
  /** ISO dates, inclusive. */
  start: string;
  end: string;
  type: string;
  dates: string;
  days: string;
  reason: string;
  status: Status;
};

export type LeaveBalance = {
  label: string;
  value: string;
  note: string;
  tone: "green" | "purple" | "sand" | "amber";
};
