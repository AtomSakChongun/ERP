"use client";

import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";
import type { ApprovalRequest, Employee } from "@/types/api";
import { formatDuration } from "@/lib/format";

/** "Friday, May 16", formatted in UTC so server and client agree. */
const formatToday = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });

export function TeamAttendance({ teammates, today }: { teammates: Employee[]; today: string }) {
  const online = teammates.filter((e) => e.availability !== "On leave").length;
  return (
    <section className="panel">
      <div className="panel-head bordered">
        <div><h2>Team attendance</h2><p>Today, {formatToday(today)}</p></div>
        <span className="attendance-total">{online} of {teammates.length} online</span>
      </div>
      <div className="team-attendance">
        {teammates.map((e) => (
          <div key={e.name}>
            <Avatar initials={e.initials} size="small" />
            <span><strong>{e.name}</strong><small>{e.availability}</small></span>
            <span className={`attendance-dot ${e.availability === "On leave" ? "away" : ""}`} aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}

const toMinutes = (hours: string) => {
  // "3h 00m" → 180
  const [, h = "0", m = "0"] = hours.match(/(\d+)h\s*(\d+)?/) ?? [];
  return Number(h) * 60 + Number(m);
};

/** What is waiting on the lead right now, computed from the queue and availability. */
export function ReviewLoad({ items, teammates }: { items: ApprovalRequest[]; teammates: Employee[] }) {
  const ot = items.filter((i) => i.type === "OT Request");
  const sheets = items.filter((i) => i.type === "Time Sheet");
  const leave = items.filter((i) => i.type === "Leave Request");
  const away = teammates.filter((e) => e.availability === "On leave").length;
  const rows = [
    { label: "Time sheets to review", value: String(sheets.length) },
    { label: "OT requests to review", value: `${ot.length} · ${formatDuration(ot.reduce((sum, i) => sum + toMinutes(i.hours), 0))}` },
    { label: "Leave requests to review", value: String(leave.length) },
    { label: "Teammates on leave today", value: `${away} of ${teammates.length}` },
  ];
  return (
    <section className="panel">
      <div className="panel-head bordered"><div><h2>Waiting on you</h2><p>From your review queue and today’s availability</p></div></div>
      <div className="health-list">
        {rows.map((r) => (
          <div key={r.label}>
            <span>{r.label}</span>
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export type AuditEntry = { status: "Approved" | "Rejected"; text: string; detail: string; time: string };

export function ApprovalAuditLog({ recent }: { recent: AuditEntry[] }) {
  return (
    <section className="panel audit-panel">
      <div className="panel-head">
        <div><h2>Recent approval activity</h2><p>Audit log of actions made by team leads</p></div>
      </div>
      {recent.map((a, i) => (
        <div className="audit-row" key={`${a.text}-${i}`}>
          <div className={`activity-icon ${a.status === "Approved" ? "approved" : "rejected"}`}><Icon name={a.status === "Approved" ? "check" : "close"} /></div>
          <span><strong>{a.text}</strong><small>{a.detail}</small></span>
          <time>{a.time}</time>
        </div>
      ))}
      {!recent.length && <p className="audit-empty">No decisions yet.</p>}
    </section>
  );
}
