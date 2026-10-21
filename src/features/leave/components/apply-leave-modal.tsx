"use client";

import { useState } from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Field, FieldError } from "@/components/ui/primitives";
import type { LeaveRequest } from "@/features/leave/types";
import { availableDays } from "@/features/leave/utils/balances";
import { formatDays, formatLeaveRange, nextWorkingDay, overlaps, workingDays } from "@/features/leave/utils/dates";

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Personal Leave", "Unpaid Leave"];

type Errors = Partial<Record<"dates" | "reason" | "attachment", string>>;

type Props = {
  /** Existing requests; pending and approved ones block overlapping dates. */
  requests: LeaveRequest[];
  holidays: Set<string>;
  today: string;
  onClose: () => void;
  onSubmit: (request: LeaveRequest) => void;
};

export function ApplyLeaveModal({ requests, holidays, today, onClose, onSubmit }: Props) {
  const firstDay = nextWorkingDay(today, holidays);
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(firstDay);
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const validRange = Boolean(startDate && endDate && endDate >= startDate);
  const days = validRange ? workingDays(startDate, endDate, holidays) : 0;
  const conflict = validRange
    ? requests.find((r) => r.status !== "Rejected" && overlaps(r, { start: startDate, end: endDate }))
    : undefined;
  // Approved and pending requests both count against the allowance; Unpaid leave has none.
  const available = availableDays(requests, leaveType);
  const after = available === null ? null : available - days;
  const attachmentRequired = leaveType === "Sick Leave";
  const holidayName = (d: string) => (holidays.has(d) ? "Public holiday" : undefined);

  const submit = () => {
    const next: Errors = {};
    if (!validRange) next.dates = "The end date can’t be before the start date.";
    else if (days === 0) next.dates = "These dates have no working days.";
    if (!reason.trim()) next.reason = "Add a short reason for your manager.";
    if (attachmentRequired && !file) next.attachment = "Sick leave needs a supporting document.";
    if (!next.dates && after !== null && after < 0) next.dates = `Only ${available} days of ${leaveType.toLowerCase()} left, counting pending requests. Shorten the range or choose Unpaid Leave.`;
    setErrors(next);
    if (Object.values(next).some(Boolean) || conflict) return;
    onSubmit({
      start: startDate,
      end: endDate,
      type: leaveType,
      dates: formatLeaveRange(startDate, endDate),
      days: formatDays(days),
      reason: reason.trim(),
      status: "Submitted",
    });
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Apply for leave" subtitle="Submit your leave request for manager approval." onClose={onClose} />
      <div className="modal-body form-grid">
        <Field label="Leave type" required span>
          <select value={leaveType} onChange={(e) => { setLeaveType(e.target.value); setErrors((x) => ({ ...x, attachment: undefined })); }}>
            {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Start date" required>
          <DatePicker
            value={startDate}
            min={leaveType === "Sick Leave" ? undefined : today}
            today={today}
            markOf={holidayName}
            aria-label="Start date"
            onChange={(d) => {
              setStartDate(d);
              if (d > endDate) setEndDate(d);
              setErrors((x) => ({ ...x, dates: undefined }));
            }}
          />
        </Field>
        <Field label="End date" required>
          <DatePicker value={endDate} min={startDate} today={today} markOf={holidayName} aria-label="End date" onChange={(d) => { setEndDate(d); setErrors((x) => ({ ...x, dates: undefined })); }} />
          <FieldError message={errors.dates} />
        </Field>
        {conflict && (
          <div className="validation-banner field-span" role="alert">
            <Icon name="warning" size={18} />
            <div>
              <strong>Existing request on these dates</strong>
              <p>You already have {conflict.status === "Submitted" ? "a submitted" : "an approved"} {conflict.type.toLowerCase()} request for {conflict.dates}. Choose another date range or cancel the existing request.</p>
            </div>
          </div>
        )}
        <Field label="Reason" required span>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setErrors((x) => ({ ...x, reason: undefined })); }}
            placeholder="Briefly explain the reason for your leave…"
          />
          <FieldError message={errors.reason} />
        </Field>
        <Field label={`Attachment ${attachmentRequired ? "(required)" : "(optional)"}`} span>
          <span className="upload-box">
            <Icon name="upload" />
            <strong>{file ?? "Upload supporting document"}</strong>
            <span>{file ? "Choose a different file" : "PDF, JPG or PNG up to 5 MB"}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => { setFile(e.target.files?.[0]?.name ?? null); setErrors((x) => ({ ...x, attachment: undefined })); }}
            />
          </span>
          <FieldError message={errors.attachment} />
        </Field>
        <div className="leave-summary field-span">
          <span>Requested leave<strong>{formatDays(days)}</strong></span>
          <span>Balance after approval<strong className={after !== null && after < 0 ? "text-missing" : undefined}>{after === null ? "Not deducted" : formatDays(after)}</strong></span>
        </div>
      </div>
      <div className="modal-footer">
        <button className="secondary-btn" onClick={onClose}>Cancel</button>
        <button className="primary-btn" disabled={Boolean(conflict)} onClick={submit}><Icon name="check" size={18} />Submit request</button>
      </div>
    </Modal>
  );
}
