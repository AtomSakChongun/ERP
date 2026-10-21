import { Icon } from "@/components/ui/icon";
import { formatDuration, formatShort, workedMinutes } from "@/features/timesheet/utils/time";
import type { TimeEntry } from "@/types/api";

type Props = {
  entries: TimeEntry[];
  locked: boolean;
  onEdit: (entry: TimeEntry) => void;
  /** Open the entry form with this entry’s project, task and details. */
  onReuse: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
};

export function TimeEntriesTable({ entries, locked, onEdit, onReuse, onDelete }: Props) {
  if (!entries.length) {
    return (
      <div className="empty-state">
        <div className="title-icon"><Icon name="clock" /></div>
        <h3>No time entries</h3>
        <p>{locked ? "Nothing was recorded for this period." : "Nothing recorded for this period yet. Use “Add time entry” to log your work."}</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="fit-mobile">
        <thead>
          <tr><th>Date & time</th><th>Project / task</th><th className="col-optional">Details</th><th className="col-optional">Tag</th><th>Hours</th><th><span className="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td><strong>{formatShort(e.date)}</strong><small>{e.start} – {e.end}</small></td>
              <td><strong>{e.project}</strong><small>{e.task}</small></td>
              <td className="col-optional">{e.details}</td>
              <td className="col-optional"><span className={`tag ${e.tag.toLowerCase()}`}>{e.tag}</span></td>
              <td><strong>{formatDuration(workedMinutes(e.start, e.end))}</strong></td>
              <td>
                {e.tag === "Leave" ? (
                  <span className="row-note">From leave request</span>
                ) : (
                <div className="row-actions">
                  <button
                    className="more-btn"
                    disabled={locked}
                    onClick={() => onEdit(e)}
                    aria-label={`Edit ${e.project} · ${e.task}`}
                    title={locked ? "Week is locked" : "Edit entry"}
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    className="more-btn"
                    disabled={locked}
                    onClick={() => onReuse(e)}
                    aria-label={`Log ${e.project} · ${e.task} again`}
                    title={locked ? "Week is locked" : "Log again"}
                  >
                    <Icon name="copy" size={18} />
                  </button>
                  <button
                    className="more-btn danger"
                    disabled={locked}
                    onClick={() => onDelete(e)}
                    aria-label={`Delete ${e.project} · ${e.task}`}
                    title={locked ? "Week is locked" : "Delete entry"}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
