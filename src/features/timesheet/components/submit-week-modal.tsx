"use client";

import { Icon } from "@/components/ui/icon";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { formatDuration, formatShort } from "@/features/timesheet/utils/time";

type Props = {
  /** "May 12 – 18" */
  range: string;
  totalMin: number;
  targetMin: number;
  /** Workdays so far with less than the daily target. */
  shortDays: { date: string; minutes: number }[];
  dailyTargetMin: number;
  approver: string;
  onFillIn: (date: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function SubmitWeekModal({ range, totalMin, targetMin, shortDays, dailyTargetMin, approver, onFillIn, onClose, onSubmit }: Props) {
  const short = shortDays.length > 0;
  return (
    <Modal onClose={onClose} className="submit-modal">
      <ModalHeader title={`Submit ${range}?`} subtitle={`${approver} will review it. The week stays locked until it’s approved or you recall it.`} onClose={onClose} />
      <div className="modal-body submit-summary">
        <div className="submit-total">
          <span>Weekly total</span>
          <strong>{formatDuration(totalMin)}</strong>
          <small>of {formatDuration(targetMin)} target</small>
        </div>
        {short ? (
          <div className="validation-banner" role="alert">
            <Icon name="warning" size={18} />
            <div>
              <strong>{shortDays.length === 1 ? "1 day is" : `${shortDays.length} days are`} under {dailyTargetMin / 60}h</strong>
              <p>Fill them in now, or submit anyway and explain the gap to {approver}.</p>
              <ul className="short-days">
                {shortDays.map((d) => (
                  <li key={d.date}>
                    <span>{formatShort(d.date)} · {formatDuration(d.minutes)} logged</span>
                    <button className="text-btn" onClick={() => onFillIn(d.date)}>Fill in<Icon name="arrow" size={15} /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="submit-ok"><Icon name="check" size={18} />Every workday has at least {dailyTargetMin / 60}h logged.</p>
        )}
      </div>
      <div className="modal-footer">
        <button className="secondary-btn" onClick={onClose}>Keep editing</button>
        <button className={short ? "secondary-btn" : "primary-btn"} onClick={onSubmit}>
          <Icon name="check" size={18} />{short ? "Submit anyway" : "Submit for approval"}
        </button>
      </div>
    </Modal>
  );
}
