"use client";

import Link from "next/link";
import { useState } from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { TimePicker } from "@/components/ui/time-picker";
import { useNotifications } from "@/components/ui/notifications";
import { Avatar, Field, FieldError, PageHeader, StatusBadge } from "@/components/ui/primitives";
import { paths } from "@/config/paths";
import type { RecentOtRequest } from "@/features/overtime/api/get-overtime";
import { formatDuration } from "@/lib/format";

type Approver = { name: string; initials: string; title: string };

type Props = {
  approver: Approver;
  recent: RecentOtRequest[];
  projects: string[];
  /** ISO date the form starts on. */
  today: string;
};

type Errors = Partial<Record<"date" | "time" | "reason" | "details", string>>;

const REASONS = ["Production deployment", "Urgent client request", "Project deadline", "System maintenance"];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
/** "May 19", formatted in UTC so server and client agree. */
const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });

export function OtRequestView({ approver, recent: initialRecent, projects, today }: Props) {
  const { notify } = useNotifications();
  const [recent, setRecent] = useState(initialRecent);
  const [date, setDate] = useState(today);
  const [project, setProject] = useState(projects[0] ?? "");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("21:00");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const minutes = Math.max(0, toMinutes(end) - toMinutes(start));

  const submit = () => {
    const next: Errors = {};
    if (date < today) next.date = "Overtime has to be requested before the work begins. Pick today or a later date.";
    if (minutes <= 0) next.time = "End time must be after start time.";
    if (!reason) next.reason = "Select a reason.";
    if (!details.trim()) next.details = "Describe the work that needs overtime.";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setRecent((r) => [{ label: `${formatDay(date)} · ${+(minutes / 60).toFixed(2)}h`, project, status: "Submitted" }, ...r]);
    setReason("");
    setDetails("");
    notify(`OT request submitted to ${approver.name}`);
  };

  return (
    <>
      <PageHeader title="OT Requests" subtitle="Request overtime work and submit it to your manager for approval." />
      <div className="form-layout">
        <section className="panel form-panel">
          <div className="form-title">
            <div className="title-icon"><Icon name="bolt" /></div>
            <div>
              <h2>New overtime request</h2>
              <p>Complete all required fields before submitting.</p>
            </div>
          </div>
          <div className="form-grid ot-grid">
            <Field label="Project" required>
              <select value={project} onChange={(e) => setProject(e.target.value)}>
                {projects.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Reason for overtime" required>
              <select value={reason} onChange={(e) => { setReason(e.target.value); setErrors((x) => ({ ...x, reason: undefined })); }}>
                <option value="" disabled>Select a reason</option>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <FieldError message={errors.reason} />
            </Field>
            <Field label="OT date" required>
              <DatePicker value={date} min={today} today={today} aria-label="OT date" onChange={(d) => { setDate(d); setErrors((x) => ({ ...x, date: undefined })); }} />
              <FieldError message={errors.date} />
            </Field>
            <Field label="Start time" required>
              <TimePicker value={start} aria-label="Start time" onChange={(t) => { setStart(t); setErrors((x) => ({ ...x, time: undefined })); }} />
            </Field>
            <Field label="End time" required>
              <TimePicker value={end} relativeTo={start} aria-label="End time" onChange={(t) => { setEnd(t); setErrors((x) => ({ ...x, time: undefined })); }} />
              <FieldError message={errors.time} />
            </Field>
            <Field label="Task details" required span>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => { setDetails(e.target.value); setErrors((x) => ({ ...x, details: undefined })); }}
                placeholder="Describe the work to be completed and why it requires overtime…"
              />
              <FieldError message={errors.details} />
            </Field>
          </div>
          <div className="form-actions">
            <p className="ot-estimate">Estimated OT <strong>{formatDuration(minutes)}</strong></p>
            <button className="primary-btn" onClick={submit}>
              <Icon name="check" size={18} />Submit for approval
            </button>
          </div>
        </section>

        <aside className="side-stack">
          <section className="panel info-card">
            <div className="info-title"><Icon name="info" /><h3>Before you submit</h3></div>
            <ul>
              <li>Submit requests before overtime work begins.</li>
              <li>Provide clear task details for faster approval.</li>
            </ul>
            <div className="info-approver">
              <Avatar initials={approver.initials} size="small" />
              <div><small>Approver · notified immediately</small><strong>{approver.name}</strong><p>{approver.title}</p></div>
            </div>
          </section>
          <section className="panel recent-ot">
            <div className="panel-head"><h3>Recent requests</h3><Link className="text-btn" href={paths.history.href}>View all</Link></div>
            {recent.map((r, i) => (
              <div className="ot-row" key={`${r.label}-${i}`}>
                <div><strong>{r.label}</strong><p>{r.project}</p></div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}
