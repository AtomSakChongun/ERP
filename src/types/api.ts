// Entity types shared across features. Feature-only types live in
// `src/features/<feature>/types`.

export type Status = "Draft" | "Submitted" | "Approved" | "Rejected" | "Pending";

export type Role = "Employee" | "Team Lead" | "HR / Admin" | "Management";

/** A company login. Email is the company address; the role decides which pages it can open. */
export type Account = {
  email: string;
  name: string;
  initials: string;
  role: Role;
};

export type Availability = "Working" | "On leave" | "Remote";

export type Employee = {
  name: string;
  initials: string;
  role: string;
  department: string;
  lead: string;
  status: "Active" | "Probation";
  leave: string;
  availability: Availability;
};

export type ApprovalRequest = {
  id: number;
  person: string;
  initials: string;
  type: "OT Request" | "Time Sheet" | "Leave Request";
  period: string;
  project: string;
  hours: string;
  submitted: string;
  status: Status;
  /** Time sheets: hours per day, Monday first, so the reviewer can see short and overtime days. */
  days?: ApprovalDay[];
  /** The matching History record, so decisions show up there. */
  historyId?: string;
  /** OT and leave requests: why it is needed and what will be done. */
  reason?: string;
  details?: string;
};

export type ApprovalDay = { date: string; hours: number; holiday?: string };

export type WeekDay = {
  day: string;
  date: string;
  hours: number;
};

export type EntryTag = "Billable" | "Internal" | "Leave";

export type TimeEntry = {
  id: string;
  /** ISO date, e.g. "2025-05-12" */
  date: string;
  /** 24h "HH:mm" */
  start: string;
  end: string;
  project: string;
  task: string;
  tag: EntryTag;
  details: string;
};

export type Project = {
  name: string;
  tag: Exclude<EntryTag, "Leave">;
  tasks: string[];
};

export type Holiday = { date: string; name: string };

export type TimesheetPeriod = {
  /** First and last day that has time sheet data (inclusive, ISO). */
  start: string;
  end: string;
  /** The mock "today", used for the initial week. */
  today: string;
  holidays: Holiday[];
  /** Status per week, keyed by the Monday of that week (ISO). */
  weekStatus: Record<string, Status>;
};
