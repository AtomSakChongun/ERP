"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { TimePicker } from "@/components/ui/time-picker";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Field, FieldError } from "@/components/ui/primitives";
import { paths } from "@/config/paths";
import { hasErrors, slotAfter, validateEntry, type EntryDraft, type EntryErrors, type RecentPick } from "@/features/timesheet/utils/entry";
import { formatDuration, hasBreak, isWeekend, workedMinutes } from "@/features/timesheet/utils/time";
import type { EntryTag, Project, TimeEntry } from "@/types/api";

const MAX_DETAILS = 300;

type Props = {
  projects: Project[];
  /** Values to start with. An entry with an `id` opens in edit mode. */
  initial: Partial<TimeEntry> & { date: string };
  /** Existing entries, for the overlap check. */
  entries: TimeEntry[];
  /** Recent project/task pairs, offered as one-click shortcuts when adding. */
  picks?: RecentPick[];
  minDate: string;
  maxDate: string;
  /** The period's "today", for the calendar's today ring and shortcut. */
  today: string;
  holidays: Map<string, string>;
  isLocked: (date: string) => boolean;
  onClose: () => void;
  /** `addAnother` keeps the modal open for the next entry. */
  onSave: (entry: EntryDraft, addAnother: boolean) => void;
};

export function TimeEntryModal({ projects, initial, entries, picks = [], minDate, maxDate, today, holidays, isLocked, onClose, onSave }: Props) {
  const editing = Boolean(initial.id);
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.start ?? "09:00");
  const [end, setEnd] = useState(initial.end ?? "18:00");
  const [projectName, setProjectName] = useState(initial.project ?? "");
  const [task, setTask] = useState(initial.task ?? "");
  const [tag, setTag] = useState<EntryTag>(initial.tag && initial.tag !== "Leave" ? initial.tag : "Billable");
  const [details, setDetails] = useState(initial.details ?? "");
  const [errors, setErrors] = useState<EntryErrors>({});
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  /** Set by whichever submit button was used, so Enter and "Add entry" behave the same. */
  const addAnotherRef = useRef(false);

  const project = projects.find((p) => p.name === projectName);
  const minutes = workedMinutes(start, end);
  const dayWarning = holidays.get(date) ? `${holidays.get(date)} (public holiday)` : date && isWeekend(date) ? "Weekend" : "";
  // Only point to leave on an empty workday, where it is a plausible mistake.
  const showLeavePointer = !editing && !dayWarning && !entries.some((e) => e.date === date);

  const applyPick = (pick: RecentPick) => {
    setProjectName(pick.project);
    setTask(pick.task);
    setTag(pick.tag);
    setErrors((e) => ({ ...e, project: undefined, task: undefined }));
    detailsRef.current?.focus();
  };

  const clearError = (key: keyof EntryErrors) => setErrors((e) => ({ ...e, [key]: undefined }));

  const handleSave = (addAnother: boolean) => {
    const next = validateEntry({ date, start, end, project: projectName, task, details }, { minDate, maxDate, isLocked, entries, ignoreId: initial.id });
    setErrors(next);
    if (hasErrors(next)) return;

    onSave(
      { date, start, end, project: projectName, task, tag, details: details.trim() },
      addAnother,
    );
    if (addAnother) {
      // Keep date, project and task; continue from where this entry ended.
      const slot = slotAfter(end);
      setStart(slot.start);
      setEnd(slot.end);
      setDetails("");
      detailsRef.current?.focus();
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    handleSave(addAnotherRef.current);
    addAnotherRef.current = false;
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={editing ? "Edit Time Entry" : "Add Time Entry"}
        subtitle={editing ? "Update the details of this entry." : "Record the details of your work day."}
        onClose={onClose}
      />
      <form onSubmit={submit} noValidate>
        <div className="modal-body form-grid">
          {!editing && picks.length > 0 && (
            <div className="recent-picks field-span" role="group" aria-label="Recent work">
              <span>Recent</span>
              {picks.map((p) => (
                <button
                  type="button"
                  key={`${p.project}|${p.task}`}
                  className={`pick-chip ${p.project === projectName && p.task === task ? "active" : ""}`}
                  aria-pressed={p.project === projectName && p.task === task}
                  onClick={() => applyPick(p)}
                >
                  {p.project} · {p.task}
                </button>
              ))}
            </div>
          )}
          <Field label="Project" required>
            <select
              data-autofocus={(!editing && !initial.project) || undefined}
              value={projectName}
              onChange={(e) => {
                const p = projects.find((x) => x.name === e.target.value);
                setProjectName(e.target.value);
                setTask("");
                if (p) setTag(p.tag);
                clearError("project");
              }}
            >
              <option value="" disabled>Select a project</option>
              {projects.map((p) => <option key={p.name}>{p.name}</option>)}
            </select>
            <FieldError message={errors.project} />
          </Field>
          <Field label="Task" required>
            <select value={task} disabled={!project} onChange={(e) => { setTask(e.target.value); clearError("task"); }}>
              <option value="" disabled>{project ? "Select a task" : "Select a project first"}</option>
              {project?.tasks.map((t) => <option key={t}>{t}</option>)}
            </select>
            <FieldError message={errors.task} />
          </Field>
          <Field label="Task details" required span>
            <textarea
              ref={detailsRef}
              // "Log again" arrives with project and task filled, so start at the details.
              data-autofocus={(!editing && Boolean(initial.project)) || undefined}
              value={details}
              maxLength={MAX_DETAILS}
              onChange={(e) => {
                setDetails(e.target.value);
                clearError("details");
              }}
              onKeyDown={(e) => {
                // ⌘/Ctrl + Enter saves from the one field where Enter means a new line.
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Describe the work completed, progress, or key outcomes…"
              rows={3}
            />
            <FieldError message={errors.details} />
            <small className="char-count">{details.length}/{MAX_DETAILS} characters</small>
          </Field>
          <Field label="Date" required>
            <DatePicker
              value={date}
              min={minDate}
              max={maxDate}
              today={today}
              markOf={(d) => holidays.get(d)}
              aria-label="Date"
              onChange={(d) => {
                setDate(d);
                clearError("date");
              }}
            />
            <FieldError message={errors.date} />
            {!errors.date && dayWarning && <small className="day-warning">{dayWarning}</small>}
          </Field>
          <Field label="Tag">
            <select value={tag} onChange={(e) => setTag(e.target.value as EntryTag)}>
              <option>Billable</option>
              <option>Internal</option>
            </select>
          </Field>
          <Field label="Start time" required>
            <TimePicker value={start} aria-label="Start time" onChange={(t) => { setStart(t); clearError("time"); }} />
          </Field>
          <Field label="End time" required>
            <TimePicker value={end} relativeTo={start} aria-label="End time" onChange={(t) => { setEnd(t); clearError("time"); }} />
            <FieldError message={errors.time} />
          </Field>
          <p className="hours-line field-span">
            <strong>{formatDuration(minutes)}</strong> · {hasBreak(start, end) ? "1 hour break deducted" : "no break deducted"}
          </p>
          {showLeavePointer && (
            <p className="leave-pointer">
              <Icon name="calendar" size={16} />
              Off this day? <Link href={paths.leave.href}>Request leave</Link> instead. Approved leave appears here automatically.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          {editing ? (
            <button type="submit" className="primary-btn"><Icon name="check" size={18} />Save changes</button>
          ) : (
            <>
              <button type="submit" className="secondary-btn" onClick={() => { addAnotherRef.current = true; }}>Save &amp; add another</button>
              <button type="submit" className="primary-btn" aria-keyshortcuts="Control+Enter Meta+Enter"><Icon name="plus" size={18} />Add entry</button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
