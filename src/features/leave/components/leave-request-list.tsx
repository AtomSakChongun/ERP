"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/primitives";
import type { LeaveRequest } from "@/features/leave/types";

const FILTERS = ["All requests", "Submitted", "Approved", "Rejected"] as const;

/** Icon tile colour by leave type, so the same type always looks the same. */
const TYPE_TONE: Record<string, string> = { "Sick Leave": "leave-sick", "Personal Leave": "leave-other", "Unpaid Leave": "leave-other" };

export function LeaveRequestList({ requests, onCancel }: { requests: LeaveRequest[]; onCancel: (request: LeaveRequest) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All requests");
  const visible = filter === "All requests" ? requests : requests.filter((r) => r.status === filter);

  return (
    <section className="panel">
      <div className="panel-head bordered">
        <div>
          <h2>My leave requests</h2>
          <p>Track current and previous leave applications</p>
        </div>
        <select className="compact-select" aria-label="Filter requests" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          {FILTERS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="leave-list">
        {visible.map((item) => (
          <div className="leave-row" key={`${item.start}-${item.type}-${item.status}`}>
            <div className={`leave-type-icon ${TYPE_TONE[item.type] ?? ""}`}>
              <Icon name="calendar" size={17} />
            </div>
            <div className="leave-main"><strong>{item.type}</strong><p>{item.dates} · {item.days}</p></div>
            <div className="leave-reason"><small>Reason</small><span>{item.reason}</span></div>
            <StatusBadge status={item.status} />
            {item.status === "Submitted" ? <button className="cancel-link" onClick={() => onCancel(item)}>Cancel request</button> : <span />}
          </div>
        ))}
        {!visible.length && (
          <div className="empty-state">
            <h3>No {filter === "All requests" ? "" : `${filter.toLowerCase()} `}requests</h3>
            <p>{filter === "All requests" ? "Use “Apply for leave” to request time off." : "Try another filter."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
