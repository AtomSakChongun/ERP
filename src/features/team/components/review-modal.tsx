"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Avatar, Field, FieldError } from "@/components/ui/primitives";
import type { ApprovalDay, ApprovalRequest } from "@/types/api";

type Props = {
  request: ApprovalRequest;
  /** Lower-case type for sentences, e.g. "OT request". */
  typeLabel: string;
  onClose: () => void;
  onDecide: (status: "Approved" | "Rejected", comment: string, next?: boolean) => void;
  /** More requests wait after this one, so offer "Approve & next". */
  hasNext: boolean;
  /** Time sheets: whether an OT request exists for any day in this week. */
  otCovered?: boolean;
};

const TARGET = 8;
const fmtDay = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...o });

export function ReviewModal({ request, typeLabel, onClose, onDecide, hasNext, otCovered = false }: Props) {
  // Overtime = hours over 8h on a workday, plus all hours on weekends and holidays.
  const offDay = (d: ApprovalDay) => Boolean(d.holiday) || [0, 6].includes(new Date(`${d.date}T00:00:00Z`).getUTCDay());
  const days = request.days ?? [];
  const shortDays = days.filter((d) => !offDay(d) && d.hours < TARGET).length;
  const overtime = days.reduce((sum, d) => sum + (offDay(d) ? d.hours : Math.max(0, d.hours - TARGET)), 0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const reject = () => {
    if (!comment.trim()) {
      setError("Add a comment so the employee knows what to fix.");
      return;
    }
    onDecide("Rejected", comment.trim());
  };

  return (
    <Modal onClose={onClose} className="review-modal">
      <ModalHeader title={`Review ${typeLabel}`} subtitle={`Submitted ${request.submitted.toLowerCase()}`} onClose={onClose} />
      <div className="review-profile">
        <Avatar initials={request.initials} />
        <div><strong>{request.person}</strong><p>{request.project} · {request.period}</p></div>
        <strong className="review-hours">{request.hours}</strong>
      </div>
      {request.days && (
        <div className="review-evidence">
          <div className="review-days">
            {request.days.map((d) => {
              const weekend = [0, 6].includes(new Date(`${d.date}T00:00:00Z`).getUTCDay());
              const state = d.holiday || weekend ? (d.hours ? "over" : "off") : d.hours < TARGET ? "short" : d.hours > TARGET ? "over" : "ok";
              return (
                <div key={d.date} className={`review-day ${state}`} title={d.holiday}>
                  <span>{fmtDay(d.date, { weekday: "short" })}</span>
                  <strong>{d.hours ? `${d.hours}h` : d.holiday ? "Hol" : "—"}</strong>
                  <small>{state === "short" ? `−${TARGET - d.hours}h` : state === "over" ? `+${d.holiday || weekend ? d.hours : d.hours - TARGET}h` : ""}</small>
                </div>
              );
            })}
          </div>
          <p>
            {shortDays === 1 ? "1 short day" : `${shortDays} short days`} · {overtime}h overtime
            {overtime > 0 && !otCovered && <strong className="review-flag"> · No OT request covers these hours</strong>}
          </p>
        </div>
      )}
      {request.reason && (
        <div className="review-details">
          <div><span>{request.type === "Leave Request" ? "Leave type" : "Reason"}</span><strong>{request.reason}</strong></div>
          <div><span>{request.type === "Leave Request" ? "Dates" : "Date"}</span><strong>{request.period}</strong></div>
          <div className="wide"><span>{request.type === "Leave Request" ? "Note from employee" : "Work to be done"}</span><p>{request.details}</p></div>
        </div>
      )}
      <div className="modal-body">
        <Field label="Manager comment">
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError(""); }}
            placeholder="Add a helpful comment for the employee (required to reject)…"
          />
          <FieldError message={error} />
        </Field>
      </div>
      <div className="modal-footer decision-footer">
        <button className="reject-btn" onClick={reject}><Icon name="close" size={18} />Reject</button>
        <div className="decision-actions">
          {hasNext && <button className="secondary-btn" onClick={() => onDecide("Approved", comment.trim(), true)}>Approve &amp; next</button>}
          <button className="primary-btn" onClick={() => onDecide("Approved", comment.trim())}><Icon name="check" size={18} />Approve</button>
        </div>
      </div>
    </Modal>
  );
}
