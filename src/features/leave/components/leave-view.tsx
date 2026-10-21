"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/modal";
import { useNotifications } from "@/components/ui/notifications";
import { PageHeader } from "@/components/ui/primitives";
import { ApplyLeaveModal } from "@/features/leave/components/apply-leave-modal";
import { LeaveRequestList } from "@/features/leave/components/leave-request-list";
import { TeamAvailability } from "@/features/leave/components/team-availability";
import { UpcomingHolidays } from "@/features/leave/components/upcoming-holidays";
import type { LeaveRequest } from "@/features/leave/types";
import { computeBalances } from "@/features/leave/utils/balances";
import type { Employee, Holiday } from "@/types/api";

type Props = {
  requests: LeaveRequest[];
  teammates: Employee[];
  /** Next public holidays (soonest first) and the reference "today". */
  holidays: Holiday[];
  /** Every public holiday, used to count working days. */
  allHolidays: Holiday[];
  today: string;
};

export function LeaveView({ requests: initialRequests, teammates, holidays, allHolidays, today }: Props) {
  const { notify } = useNotifications();
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [cancelling, setCancelling] = useState<LeaveRequest | null>(null);
  const holidayDates = new Set(allHolidays.map((h) => h.date));
  const balances = computeBalances(requests);

  return (
    <>
      <PageHeader
        title="Leave Management"
        subtitle="Manage your leave balance, requests, and team availability."
        action={<button className="primary-btn" onClick={() => setShowForm(true)}><Icon name="plus" size={18} />Apply for leave</button>}
      />
      <div className="leave-balance-grid">
        {balances.map((b) => (
          <div className="balance-card" key={b.label}>
            <p><i className={`balance-dot ${b.tone}`} aria-hidden="true" />{b.label}</p>
            <strong>{b.value}<small> {b.value === "1" ? "day" : "days"}</small></strong>
            <span>{b.note}</span>
          </div>
        ))}
      </div>
      <div className="leave-layout">
        <LeaveRequestList requests={requests} onCancel={setCancelling} />
        <aside className="side-stack">
          <TeamAvailability teammates={teammates} />
          <UpcomingHolidays holidays={holidays} today={today} />
        </aside>
      </div>
      {showForm && (
        <ApplyLeaveModal
          requests={requests}
          holidays={holidayDates}
          today={today}
          onClose={() => setShowForm(false)}
          onSubmit={(request) => {
            setRequests((r) => [request, ...r]);
            setShowForm(false);
            notify("Leave request submitted for approval");
          }}
        />
      )}
      {cancelling && (
        <ConfirmDialog
          title="Cancel leave request?"
          text={`Your ${cancelling.type.toLowerCase()} request for ${cancelling.dates} will be withdrawn and your manager will be notified.`}
          confirmLabel="Cancel request"
          cancelLabel="Keep request"
          onClose={() => setCancelling(null)}
          onConfirm={() => {
            setRequests((r) => r.filter((x) => x !== cancelling));
            setCancelling(null);
            notify("Leave request cancelled");
          }}
        />
      )}
    </>
  );
}
