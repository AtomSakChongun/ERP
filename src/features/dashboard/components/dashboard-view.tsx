"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { Icon } from "@/components/ui/icon";
import { Avatar, PageHeader, StatusBadge } from "@/components/ui/primitives";
import { paths } from "@/config/paths";
import type { Activity, SummaryCard } from "@/features/dashboard/api/get-dashboard";
import { WeekChart } from "@/features/dashboard/components/week-chart";
import { canAccess, useRole } from "@/lib/authorization";
import { useDecisions } from "@/lib/decisions";
import type { ApprovalRequest, Employee, Role, WeekDay } from "@/types/api";

type Props = {
  cards: SummaryCard[];
  activity: Activity[];
  week: { range: string; days: WeekDay[] };
  /** Waiting requests from the user's direct reports. */
  approvals: ApprovalRequest[];
  /** Every waiting request, for HR / Admin. */
  allApprovals: ApprovalRequest[];
  /** People who share the signed-in user's lead. */
  teammates: Employee[];
  employees: Employee[];
  /** Share of capacity used per team (regular + overtime %), shown to Management. */
  capacity: { team: string; regular: number; overtime: number }[];
};

const primaryAction: Record<Role, { href: string; icon: "report" | "users" | "plus"; label: string }> = {
  Employee: { href: paths.timesheet.href, icon: "plus", label: "Log time" },
  "Team Lead": { href: paths.team.href, icon: "users", label: "Review team" },
  "HR / Admin": { href: paths.timesheet.href, icon: "plus", label: "Log time" },
  Management: { href: paths.reports.href, icon: "report", label: "View reports" },
};

export function DashboardView({ cards, activity, week, approvals: teamApprovals, allApprovals, teammates, employees, capacity }: Props) {
  const { role } = useRole();
  const { decided } = useDecisions();
  const approvals = (role === "HR / Admin" ? allApprovals : teamApprovals).filter((a) => !decided.has(a.id));
  const count = (type: ApprovalRequest["type"]) => approvals.filter((a) => a.type === type).length;
  const liveCard = (card: SummaryCard): SummaryCard =>
    card.live === "pending"
      ? { ...card, value: String(approvals.length), note: `${count("OT Request")} OT · ${count("Time Sheet")} Time Sheets · ${count("Leave Request")} Leave` }
      : card;
  const action = primaryAction[role];
  const approves = canAccess(role, paths.team.roles);
  const logsTime = canAccess(role, paths.timesheet.roles);
  // Side panel: approvals for leads/HR, availability for everyone else, linked to a page the role can open.
  const side = approves
    ? { title: "Pending approvals", text: "Items that need your attention", href: paths.team.href, link: `View all ${approvals.length} requests`, label: "Open approvals" }
    : role === "Management"
      ? { title: "Availability today", text: "Who’s working, remote or on leave", href: paths.employees.href, link: "View all employees", label: "Open employees" }
      : { title: "Team attendance", text: "Who’s available today", href: paths.leave.href, link: "View team availability", label: "Open team availability" };
  const people = role === "Management" ? employees.slice(0, 4) : teammates;
  const capacityScale = Math.max(100, ...capacity.map((t) => t.regular + t.overtime));
  const visibleCards = cards.filter((card) => canAccess(role, card.roles)).map(liveCard);

  return (
    <>
      <PageHeader
        title="Welcome back, Alex"
        subtitle={approves ? "Here’s what’s happening with your team today." : role === "Management" ? "Here’s how the company is tracking this month." : "Here’s your work summary for today."}
        action={<Link className="primary-btn" href={action.href}><Icon name={action.icon} size={18} />{action.label}</Link>}
      />

      <div className="summary-grid" style={{ "--cards": visibleCards.length } as CSSProperties}>
        {visibleCards.map((card) => (
          <div className="summary-card" key={card.label}>
            <div className={`summary-icon ${card.tone}`}><Icon name={card.icon} /></div>
            <p className="eyebrow">{card.label}</p>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
            {!!card.progress && <div className="progress"><span style={{ width: `${card.progress}%` }} /></div>}
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {logsTime ? (
          <WeekChart range={week.range} days={week.days} />
        ) : (
          <section className="panel report-chart">
            <div className="panel-head">
              <div><h2>Team capacity</h2><p>Regular and overtime hours as a share of capacity, this month</p></div>
              <Link className="text-btn" href={paths.reports.href}>View reports <Icon name="arrow" size={16} /></Link>
            </div>
            <div className="horizontal-chart">
              {capacity.map((t) => (
                <div key={t.team}>
                  <span>{t.team}</span>
                  <i role="img" aria-label={`${t.team}: ${t.regular}% regular, ${t.overtime}% overtime`}>
                    <b style={{ width: `${(t.regular / capacityScale) * 100}%` }} /><em style={{ width: `${(t.overtime / capacityScale) * 100}%` }} />
                  </i>
                  <strong>{t.regular + t.overtime}%</strong>
                </div>
              ))}
            </div>
            <div className="chart-legend report-legend">
              <span><i className="legend-green" />Regular hours</span>
              <span><i className="legend-light" />Overtime</span>
            </div>
          </section>
        )}
        <section className="panel">
          <div className="panel-head">
            <div><h2>{side.title}</h2><p>{side.text}</p></div>
            <Link className="icon-btn" href={side.href} aria-label={side.label}><Icon name="arrow" size={17} /></Link>
          </div>
          <div className="approval-mini-list">
            {approves
              ? approvals.slice(0, 3).map((item) => (
                  <div className="approval-mini" key={item.id}>
                    <Avatar initials={item.initials} size="small" />
                    <div><strong>{item.person}</strong><p>{item.type} · {item.hours}</p></div>
                    <StatusBadge status="Submitted" />
                  </div>
                ))
              : people.map((item) => (
                  <div className="approval-mini" key={item.name}>
                    <Avatar initials={item.initials} size="small" />
                    <div><strong>{item.name}</strong><p>{item.department} · {item.role}</p></div>
                    <span className={`availability ${item.availability.toLowerCase().replace(" ", "-")}`}>{item.availability}</span>
                  </div>
                ))}
          </div>
          {approves && !approvals.length && <p className="side-empty">Nothing waiting for review.</p>}
          {!(approves && !approvals.length) && <Link className="full-outline" href={side.href}>{side.link}</Link>}
        </section>
      </div>

      {logsTime && (
        <section className="panel recent-panel">
          <div className="panel-head">
            <div><h2>Recent activity</h2><p>Your latest submissions and updates</p></div>
            <Link className="text-btn" href={paths.history.href}>View history <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="activity-list">
            {activity.map((a) => (
              <div className="activity" key={a.title}>
                <div className={`activity-icon ${a.kind}`}><Icon name={a.kind === "approved" ? "check" : "file"} /></div>
                <div><strong>{a.title}</strong><p>{a.detail}</p></div>
                <StatusBadge status={a.status} />
                <time>{a.time}</time>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
