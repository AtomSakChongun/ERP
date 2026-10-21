"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { useNotifications } from "@/components/ui/notifications";
import { PageHeader } from "@/components/ui/primitives";
import { useRole } from "@/lib/authorization";
import { useDecisions } from "@/lib/decisions";
import { paths } from "@/config/paths";
import { ApprovalList, byUrgency } from "@/features/team/components/approval-list";
import { ReviewModal } from "@/features/team/components/review-modal";
import { ApprovalAuditLog, ReviewLoad, TeamAttendance, type AuditEntry } from "@/features/team/components/team-panels";
import type { ApprovalRequest, Employee } from "@/types/api";

const TYPE_LABEL: Record<ApprovalRequest["type"], string> = { "OT Request": "OT request", "Time Sheet": "time sheet", "Leave Request": "leave request" };

/** A past decision on a teammate's request. */
export type Decision = { person: string; type: string; period: string; status: "Approved" | "Rejected" };

type Props = {
  /** Requests from the user's direct reports (what a Team Lead reviews). */
  teamApprovals: ApprovalRequest[];
  /** Every waiting request (what HR / Admin reviews). */
  allApprovals: ApprovalRequest[];
  teammates: Employee[];
  decisions: Decision[];
  /** ISO dates each person has an OT request for. */
  otDates: Record<string, string[]>;
  /** ISO "today" of the mock data. */
  today: string;
};

const toAudit = (d: Decision): AuditEntry => ({
  status: d.status,
  text: `${d.person}’s ${d.type.toLowerCase()} was ${d.status.toLowerCase()}`,
  detail: d.period,
  time: "Earlier",
});

export function TeamView({ teamApprovals, allApprovals, teammates, decisions, otDates, today }: Props) {
  const { role } = useRole();
  const approvals = role === "HR / Admin" ? allApprovals : teamApprovals;
  const { notify } = useNotifications();
  const { decided: decidedIds, markDecided } = useDecisions();
  const items = byUrgency(approvals.filter((a) => !decidedIds.has(a.id)), today);
  const [review, setReview] = useState<ApprovalRequest | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [audit, setAudit] = useState<AuditEntry[]>(() => decisions.map(toAudit));
  const decided = {
    Approved: audit.filter((a) => a.status === "Approved").length,
    Rejected: audit.filter((a) => a.status === "Rejected").length,
  };

  const decide = (status: "Approved" | "Rejected", comment: string, next = false) => {
    if (!review) return;
    const following = items[items.findIndex((i) => i.id === review.id) + 1] ?? null;
    const what = `${review.person}’s ${TYPE_LABEL[review.type]}`;
    markDecided(review.id, status);
    setAudit((a) => [{ status, text: `You ${status.toLowerCase()} ${what}`, detail: `${review.period}${comment ? ` · Comment: “${comment}”` : ""}`, time: "Just now" }, ...a]);
    notify(`${what} was ${status.toLowerCase()}`);
    setReview(next ? following : null);
    if (!next || !following) setFocusToken((t) => t + 1);
  };

  // Each modal closes only itself: when "Approve & next" swaps to the next request,
  // the previous modal's unmount must not close the new one.
  const openId = useRef<number | null>(null);
  useLayoutEffect(() => {
    openId.current = review?.id ?? null;
  });
  const closeReview = (id: number) => {
    if (openId.current !== id) return;
    setReview(null);
    setFocusToken((t) => t + 1);
  };

  return (
    <>
      <PageHeader
        title="My Team"
        subtitle={role === "HR / Admin" ? "Review every waiting request; attendance and activity are for your direct reports." : "Review requests, attendance, and workload for your direct reports."}
        action={<Link className="secondary-btn" href={paths.reports.href}><Icon name="report" size={18} />Weekly summary</Link>}
      />
      <div className="approval-stats">
        <div><span className="stat-icon amber"><Icon name="clock" /></span><p>Awaiting review</p><strong>{items.length}</strong></div>
        <div><span className="stat-icon green"><Icon name="check" /></span><p>Approved</p><strong>{decided.Approved}</strong></div>
        <div><span className="stat-icon red"><Icon name="close" /></span><p>Rejected</p><strong>{decided.Rejected}</strong></div>
      </div>
      <ApprovalList items={items} onReview={setReview} focusToken={focusToken} today={today} />
      <div className="team-bottom-grid">
        <TeamAttendance teammates={teammates} today={today} />
        <ReviewLoad items={items} teammates={teammates} />
      </div>
      <ApprovalAuditLog recent={audit} />
      {review && <ReviewModal key={review.id} request={review} typeLabel={TYPE_LABEL[review.type]} hasNext={items.findIndex((i) => i.id === review.id) < items.length - 1}
          otCovered={(review.days ?? []).some((d) => otDates[review.person]?.includes(d.date))} onClose={() => closeReview(review.id)} onDecide={decide} />}
    </>
  );
}
