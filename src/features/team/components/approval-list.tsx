"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/primitives";
import type { ApprovalRequest } from "@/types/api";

const TABS = [
  { label: "All requests", match: () => true },
  { label: "OT Requests", match: (i: ApprovalRequest) => i.type === "OT Request" },
  { label: "Time Sheets", match: (i: ApprovalRequest) => i.type === "Time Sheet" },
  { label: "Leave", match: (i: ApprovalRequest) => i.type === "Leave Request" },
] as const;

type Props = {
  items: ApprovalRequest[];
  onReview: (item: ApprovalRequest) => void;
  /** Changes after each decision: focus moves to the next request (or the panel when none are left). */
  focusToken: number;
  /** ISO "today": OT that starts today is flagged and listed first. */
  today: string;
};

const isoOf = (label: string) => {
  const d = new Date(`${label.split(" – ")[0]} UTC`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

/** OT that starts today. */
export const startsToday = (i: ApprovalRequest, today: string) => i.type === "OT Request" && isoOf(i.period) === today;

/** Queue order: anything starting today first, then as submitted. Used by the list and by "Approve & next". */
export const byUrgency = (items: ApprovalRequest[], today: string) =>
  [...items].sort((a, b) => Number(startsToday(b, today)) - Number(startsToday(a, today)));

export function ApprovalList({ items, onReview, focusToken, today }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!focusToken) return;
    const next = ref.current?.querySelector<HTMLElement>(".review-btn") ?? ref.current?.querySelector<HTMLElement>("[data-empty-heading]");
    next?.focus();
  }, [focusToken]);
  const [tab, setTab] = useState<(typeof TABS)[number]["label"]>("All requests");
  const active = TABS.find((t) => t.label === tab)!;

  return (
    <section className="panel approval-panel" ref={ref}>
      <div className="tab-bar" role="tablist" aria-label="Filter requests">
        {TABS.map((t) => (
          <button key={t.label} role="tab" aria-selected={tab === t.label} onClick={() => setTab(t.label)} className={tab === t.label ? "active" : ""}>
            {t.label}<span>{items.filter(t.match).length}</span>
          </button>
        ))}
      </div>
      <div className="approval-list">
        {items.filter(active.match).map((item) => (
          <div className="approval-row" key={item.id}>
            <Avatar initials={item.initials} />
            <div className="request-person">
              <strong>{item.person}</strong>
              <p>{item.submitted}{startsToday(item, today) && <span className="urgent-chip">Starts today</span>}</p>
              <p className="request-meta">{item.type} · {item.period} · {item.hours}</p>
            </div>
            <div><small>Request type</small><strong>{item.type}</strong></div>
            <div><small>Date / period</small><strong>{item.period}</strong></div>
            <div><small>Project</small><strong>{item.project}</strong></div>
            <div className="request-hours"><small>Total hours</small><strong>{item.hours}</strong></div>
            <button className="review-btn" onClick={() => onReview(item)} aria-label={`Review ${item.person}’s ${item.type.toLowerCase()}`}>Review request <Icon name="arrow" size={16} /></button>
          </div>
        ))}
      </div>
      {!items.filter(active.match).length && (
        <div className="empty-state">
          <div className="title-icon"><Icon name="check" /></div>
          <h3 tabIndex={-1} data-empty-heading>You’re all caught up</h3>
          <p>{items.length ? `No ${tab.toLowerCase()} waiting. Other tabs still have requests.` : "There are no pending requests to review."}</p>
        </div>
      )}
    </section>
  );
}
