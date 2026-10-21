// In-memory mock data. Feature `api/` functions read from here until a real
// backend exists — swap their bodies for `fetch` calls and nothing else changes.

import type { Account, ApprovalRequest, Employee, EntryTag, Project, Status, TimeEntry, TimesheetPeriod } from "@/types/api";

// ---------------------------------------------------------------------------
// Time sheet: Jan–May 2025 (May is hand-written). June is in the "future" and empty.
// Break rule: spans longer than 6h have a 1h lunch break deducted.
// ---------------------------------------------------------------------------

const isoDay = (iso: string) => new Date(`${iso}T00:00:00Z`);
const shiftDays = (iso: string, days: number) => new Date(isoDay(iso).getTime() + days * 86_400_000).toISOString().slice(0, 10);

const holidays = [
  { date: "2025-01-01", name: "New Year’s Day" },
  { date: "2025-02-12", name: "Makha Bucha Day" },
  { date: "2025-04-07", name: "Chakri Memorial Day (substitute)" },
  { date: "2025-04-14", name: "Songkran Festival" },
  { date: "2025-04-15", name: "Songkran Festival" },
  { date: "2025-04-16", name: "Songkran Festival (substitute)" },
  { date: "2025-05-01", name: "National Labour Day" },
  { date: "2025-05-05", name: "Coronation Day" },
  { date: "2025-06-03", name: "Queen Suthida’s Birthday" },
  { date: "2025-07-10", name: "Asahna Bucha Day" },
  { date: "2025-07-28", name: "King Vajiralongkorn’s Birthday" },
  { date: "2025-08-12", name: "Mother’s Day" },
];

// Weeks before May 12 are all approved, except one rejected week to test re-submission.
const weekStatus: Record<string, Status> = {};
for (let monday = "2024-12-30"; monday <= "2025-05-05"; monday = shiftDays(monday, 7)) weekStatus[monday] = "Approved";
Object.assign(weekStatus, {
  "2025-03-17": "Rejected",
  "2025-05-12": "Draft",
  "2025-05-19": "Draft",
  "2025-05-26": "Draft",
});

export const timesheetPeriod: TimesheetPeriod = {
  start: "2025-01-01",
  end: "2025-06-30",
  today: "2025-05-16",
  holidays,
  weekStatus,
};

export const projects: Project[] = [
  { name: "Atlas ERP", tag: "Billable", tasks: ["Frontend Development", "Quality Assurance", "Code Review", "Sprint Planning"] },
  { name: "Nimbus Cloud", tag: "Billable", tasks: ["API Integration", "Database Migration"] },
  { name: "Mobile Revamp", tag: "Billable", tasks: ["UI Implementation", "Bug Fixing"] },
  { name: "Internal", tag: "Internal", tasks: ["Team Meeting", "Team Workshop", "Training"] },
];

const entry = (date: string, start: string, end: string, project: string, task: string, details: string, tag: EntryTag = "Billable"): TimeEntry => ({
  id: `${date}-${start}`,
  date,
  start,
  end,
  project,
  task,
  tag,
  details,
});

// Jan–Apr 2025 are generated from a fixed rotation so every month has realistic data.
const rotation: [project: string, task: string, details: string][] = [
  ["Atlas ERP", "Frontend Development", "Employee directory UI"],
  ["Nimbus Cloud", "API Integration", "Notification service endpoints"],
  ["Atlas ERP", "Quality Assurance", "Leave module test cases"],
  ["Mobile Revamp", "UI Implementation", "Home screen redesign"],
  ["Nimbus Cloud", "Database Migration", "Archive legacy audit logs"],
  ["Atlas ERP", "Code Review", "Review payroll export PRs"],
  ["Mobile Revamp", "Bug Fixing", "Offline sync crashes"],
  ["Atlas ERP", "Sprint Planning", "Backlog grooming and estimates"],
];
// Leave requests are the single source of truth for leave. Approved ones become
// read-only "Leave" entries in the time sheet; nothing else creates leave hours.
export const leaveHistory = [
  { start: "2025-06-09", end: "2025-06-11", type: "Annual Leave", dates: "Jun 9 – Jun 11, 2025", days: "3 days", reason: "Family vacation", status: "Submitted" },
  { start: "2025-04-22", end: "2025-04-22", type: "Sick Leave", dates: "Apr 22, 2025", days: "1 day", reason: "Medical appointment", status: "Approved" },
  { start: "2025-04-17", end: "2025-04-18", type: "Annual Leave", dates: "Apr 17 – Apr 18, 2025", days: "2 days", reason: "Songkran trip home", status: "Approved" },
  { start: "2025-03-14", end: "2025-03-14", type: "Personal Leave", dates: "Mar 14, 2025", days: "1 day", reason: "Personal matters", status: "Approved" },
  { start: "2025-03-10", end: "2025-03-10", type: "Sick Leave", dates: "Mar 10, 2025", days: "1 day", reason: "Flu", status: "Approved" },
  { start: "2025-02-20", end: "2025-02-21", type: "Annual Leave", dates: "Feb 20 – Feb 21, 2025", days: "2 days", reason: "Long weekend", status: "Approved" },
  { start: "2025-02-03", end: "2025-02-05", type: "Annual Leave", dates: "Feb 3 – Feb 5, 2025", days: "3 days", reason: "Short break", status: "Rejected" },
  { start: "2025-01-24", end: "2025-01-24", type: "Personal Leave", dates: "Jan 24, 2025", days: "1 day", reason: "House move", status: "Approved" },
] as const;

const leaveDays: Record<string, string> = {};
for (const r of leaveHistory) {
  if (r.status !== "Approved") continue;
  for (let d: string = r.start; d <= r.end; d = shiftDays(d, 1)) leaveDays[d] = r.type;
}

// Gaps for the Incomplete Timesheet Report: days nobody logged, and short days.
const forgottenDays = new Set(["2025-01-29", "2025-02-04", "2025-03-25", "2025-04-23"]);
const shortDays: Record<string, [start: string, end: string]> = {
  "2025-01-15": ["09:00", "16:00"],
  "2025-03-06": ["10:00", "17:00"],
  "2025-04-29": ["09:00", "15:00"],
};

function generateEntries(from: string, to: string): TimeEntry[] {
  const holidaySet = new Set(holidays.map((h) => h.date));
  const result: TimeEntry[] = [];
  let workday = 0;
  for (let date = from; date <= to; date = shiftDays(date, 1)) {
    const dow = isoDay(date).getUTCDay();
    if (dow === 0 || dow === 6 || holidaySet.has(date)) continue;
    if (leaveDays[date]) {
      result.push(entry(date, "09:00", "18:00", "Leave", leaveDays[date], leaveDays[date], "Leave"));
      continue;
    }
    const [project, task, details] = rotation[workday % rotation.length];
    workday++;
    if (forgottenDays.has(date)) continue;
    if (shortDays[date]) {
      result.push(entry(date, ...shortDays[date], project, task, details));
      continue;
    }
    if (dow === 3) {
      result.push(entry(date, "09:00", "12:00", "Internal", "Team Meeting", "Weekly team sync & demo", "Internal"));
      result.push(entry(date, "13:00", "18:00", project, task, details));
    } else if (workday % 9 === 4) {
      result.push(entry(date, "09:00", "20:00", project, task, `${details} (OT)`));
    } else if (workday % 7 === 2) {
      result.push(entry(date, "08:30", "17:30", project, task, details));
    } else {
      result.push(entry(date, "09:00", "18:00", project, task, details));
    }
  }
  return result;
}

export const timeEntries: TimeEntry[] = [
  ...generateEntries("2025-01-01", "2025-04-30"),
  // Week Apr 28 – May 4 (May 1 holiday)
  entry("2025-05-02", "09:00", "18:00", "Atlas ERP", "Sprint Planning", "Sprint 12 planning and estimation"),
  // Week May 5 – 11 (May 5 holiday)
  entry("2025-05-06", "09:00", "18:00", "Nimbus Cloud", "Database Migration", "Migrate user tables to Postgres 16"),
  entry("2025-05-07", "09:00", "12:00", "Internal", "Team Meeting", "Weekly team sync & demo", "Internal"),
  entry("2025-05-07", "13:00", "18:00", "Atlas ERP", "Frontend Development", "Leave request form"),
  entry("2025-05-08", "09:00", "18:00", "Mobile Revamp", "UI Implementation", "Onboarding screens"),
  entry("2025-05-09", "09:00", "20:00", "Mobile Revamp", "Bug Fixing", "Release 2.3 hotfixes (OT)"),
  // Week May 12 – 18 (current week)
  entry("2025-05-12", "09:00", "18:00", "Atlas ERP", "Frontend Development", "Dashboard responsive layout"),
  entry("2025-05-13", "08:30", "18:00", "Nimbus Cloud", "API Integration", "Authentication endpoints"),
  entry("2025-05-14", "09:30", "18:00", "Internal", "Team Workshop", "Quarterly security training", "Internal"),
  entry("2025-05-15", "09:00", "18:00", "Atlas ERP", "Quality Assurance", "Timesheet module testing"),
  entry("2025-05-16", "09:00", "15:00", "Atlas ERP", "Code Review", "Review OT approval pull requests"),
  // Nothing is logged after the mock “today” (May 16).
];

export const approvals: ApprovalRequest[] = [
  {
    id: 1, person: "Marcus Lee", historyId: "OT-250516", initials: "ML", type: "OT Request", period: "May 16, 2025", project: "Atlas ERP", hours: "3h 00m", submitted: "2 hours ago", status: "Submitted",
    reason: "Production deployment",
    details: "Deploy Atlas ERP 3.2 to production after business hours (18:00–21:00) and monitor the rollout.",
  },
  {
    id: 2, person: "Elena Cruz", historyId: "TS-250511", initials: "EC", type: "Time Sheet", period: "May 5 – May 11", project: "Nimbus Cloud", hours: "40h 30m", submitted: "Yesterday", status: "Submitted",
    days: [
      { date: "2025-05-05", hours: 0, holiday: "Coronation Day" },
      { date: "2025-05-06", hours: 10 },
      { date: "2025-05-07", hours: 10.5 },
      { date: "2025-05-08", hours: 10 },
      { date: "2025-05-09", hours: 10 },
      { date: "2025-05-10", hours: 0 },
      { date: "2025-05-11", hours: 0 },
    ],
  },
  {
    id: 3, person: "Daniel Park", historyId: "OT-250514", initials: "DP", type: "OT Request", period: "May 14, 2025", project: "Mobile Revamp", hours: "2h 30m", submitted: "Yesterday", status: "Submitted",
    reason: "Urgent client request",
    details: "Fix the Android checkout crash the client reported before Thursday’s store review.",
  },
  {
    id: 5, person: "Daniel Park", historyId: "LV-250526", initials: "DP", type: "Leave Request", period: "May 26 – May 27, 2025", project: "Annual Leave", hours: "2 days", submitted: "This morning", status: "Submitted",
    reason: "Annual Leave",
    details: "Family wedding in Chiang Mai. Handover notes for the checkout fix are in the sprint board.",
  },
  {
    id: 4, person: "Sofia Reyes", historyId: "TS-250511-SR", initials: "SR", type: "Time Sheet", period: "May 5 – May 11", project: "Atlas ERP", hours: "38h 00m", submitted: "2 days ago", status: "Submitted",
    days: [
      { date: "2025-05-05", hours: 0, holiday: "Coronation Day" },
      { date: "2025-05-06", hours: 8 },
      { date: "2025-05-07", hours: 8 },
      { date: "2025-05-08", hours: 6 },
      { date: "2025-05-09", hours: 8 },
      { date: "2025-05-10", hours: 8 },
      { date: "2025-05-11", hours: 0 },
    ],
  },
];

export const historyRows = [
  { id: "TS-250518", employee: "You", type: "Time Sheet", period: "May 12 – May 18", project: "Multiple projects", hours: "38h 00m", status: "Draft" },
  { id: "OT-250516", employee: "Marcus Lee", type: "OT Request", period: "May 16, 2025", project: "Atlas ERP", hours: "3h 00m", status: "Submitted" },
  { id: "OT-250514", employee: "Daniel Park", type: "OT Request", period: "May 14, 2025", project: "Mobile Revamp", hours: "2h 30m", status: "Submitted" },
  { id: "TS-250511", employee: "Elena Cruz", type: "Time Sheet", period: "May 5 – May 11", project: "Nimbus Cloud", hours: "40h 30m", status: "Submitted" },
  { id: "TS-250511-SR", employee: "Sofia Reyes", type: "Time Sheet", period: "May 5 – May 11", project: "Atlas ERP", hours: "38h 00m", status: "Submitted" },
  { id: "OT-250509", employee: "You", type: "OT Request", period: "May 9, 2025", project: "Mobile Revamp", hours: "2h 00m", status: "Approved" },
  { id: "TS-250504", employee: "Daniel Park", type: "Time Sheet", period: "Apr 28 – May 4", project: "Multiple projects", hours: "35h 00m", status: "Rejected" },
  { id: "OT-250425", employee: "You", type: "OT Request", period: "Apr 25, 2025", project: "Atlas ERP", hours: "3h 00m", status: "Approved" },
  { id: "LV-250526", employee: "Daniel Park", type: "Leave Request", period: "May 26 – May 27, 2025", project: "Annual Leave", hours: "2 days", status: "Submitted" },
  { id: "OT-250430", employee: "Sofia Reyes", type: "OT Request", period: "Apr 30, 2025", project: "Atlas ERP", hours: "1h 30m", status: "Approved" },
] as const;

export const employees: Employee[] = [
  { name: "Alex Morgan", initials: "AM", role: "Product Designer", department: "Product", lead: "Jordan Kim", status: "Active", leave: "12.5 days", availability: "Working" },
  { name: "Marcus Lee", initials: "ML", role: "Senior Developer", department: "Engineering", lead: "Alex Morgan", status: "Active", leave: "9 days", availability: "Working" },
  { name: "Elena Cruz", initials: "EC", role: "QA Engineer", department: "Engineering", lead: "Alex Morgan", status: "Active", leave: "14 days", availability: "On leave" },
  { name: "Daniel Park", initials: "DP", role: "Frontend Developer", department: "Engineering", lead: "Alex Morgan", status: "Probation", leave: "6 days", availability: "Working" },
  { name: "Sofia Reyes", initials: "SR", role: "Project Manager", department: "Delivery", lead: "Maya Chen", status: "Active", leave: "11 days", availability: "Remote" },
  { name: "Noah Williams", initials: "NW", role: "UI Designer", department: "Product", lead: "Maya Chen", status: "Active", leave: "15 days", availability: "Working" },
];


// ---------------------------------------------------------------------------
// Sign-in: one demo account per role, all sharing one password.
export const DEMO_PASSWORD = "sirisoft";

export const accounts: Account[] = [
  { email: "daniel.park@sirisoft.co.th", name: "Daniel Park", initials: "DP", role: "Employee" },
  { email: "alex.morgan@sirisoft.co.th", name: "Alex Morgan", initials: "AM", role: "Team Lead" },
  { email: "priya.nair@sirisoft.co.th", name: "Priya Nair", initials: "PN", role: "HR / Admin" },
  { email: "jordan.kim@sirisoft.co.th", name: "Jordan Kim", initials: "JK", role: "Management" },
];
